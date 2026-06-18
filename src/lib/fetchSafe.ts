// 安全的资源获取工具：限制协议、支持超时、防止 SSRF/信息泄露。
//
// 安全策略分层：
//   1. 协议白名单：仅允许 http/https
//   2. 内网地址黑名单：默认拒绝回环/链路本地/RFC1918 私有网段/云元数据地址，
//      通过 allowIntranet 选项可显式放行（企业内网部署场景）
//   3. 重定向最终 URL 校验：fetch 跟随重定向后再次校验 resp.url，防止通过 302 绕过静态黑名单
//   4. 凭证隔离：默认 credentials:'omit' + referrerPolicy:'no-referrer'，避免向第三方泄露 Cookie/Referrer

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

// 内网/危险地址黑名单：回环、链路本地、RFC1918 私有网段、云厂商元数据服务
const PRIVATE_HOSTNAMES = new Set([
  'localhost',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal', // GCP 元数据服务
])

// IPv4 私有网段（CIDR 表示）
const PRIVATE_IPV4_RANGES: readonly { start: number; end: number }[] = [
  { start: 0x00000000, end: 0x00ffffff }, // 0.0.0.0/8
  { start: 0x0a000000, end: 0x0affffff }, // 10.0.0.0/8
  { start: 0x7f000000, end: 0x7fffffff }, // 127.0.0.0/8 (loopback)
  { start: 0xa9fe0000, end: 0xa9feffff }, // 169.254.0.0/16 (link-local, 含 AWS/GCP 元数据 169.254.169.254)
  { start: 0xac100000, end: 0xac1fffff }, // 172.16.0.0/12
  { start: 0xc0a80000, end: 0xc0a8ffff }, // 192.168.0.0/16
]

export class FetchSecurityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FetchSecurityError'
  }
}

export class FetchTimeoutError extends Error {
  constructor(message = '请求超时') {
    super(message)
    this.name = 'FetchTimeoutError'
  }
}

/** 将点分十进制 IPv4 转为 32 位无符号整数；非法返回 null */
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let result = 0
  for (const part of parts) {
    const n = Number(part)
    if (!Number.isInteger(n) || n < 0 || n > 255) return null
    result = (result << 8) | n
  }
  // 转为无符号
  return result >>> 0
}

/**
 * 判断主机名是否为内网/危险地址。
 * 覆盖：回环、链路本地、RFC1918 私有网段、IPv6 本地地址、云厂商元数据服务。
 */
export function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')

  // 主机名黑名单（localhost、元数据服务等）
  if (PRIVATE_HOSTNAMES.has(host)) return true

  // IPv4 检查
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const ipInt = ipv4ToInt(host)
    if (ipInt !== null) {
      for (const range of PRIVATE_IPV4_RANGES) {
        if (ipInt >= range.start && ipInt <= range.end) return true
      }
    }
    return false
  }

  // IPv6 检查：回环 ::1、链路本地 fe80::/10、唯一本地 fc00::/7
  if (host.includes(':')) {
    if (host === '::1' || host === '::') return true
    if (host.startsWith('fe8') || host.startsWith('fe9') || host.startsWith('fea') || host.startsWith('feb')) return true
    if (host.startsWith('fc') || host.startsWith('fd')) return true
    // IPv4-mapped IPv6: ::ffff:x.x.x.x
    const v4Mapped = host.match(/:ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (v4Mapped) return isPrivateHost(v4Mapped[1])
    return false
  }

  // .local / .internal 等本地域名后缀
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.localhost')) {
    return true
  }

  return false
}

/**
 * 校验 URL 是否允许被前端直接请求。
 * 仅允许 http/https 绝对 URL，拒绝 file、javascript、data 等协议及相对路径。
 * @param allowIntranet 为 true 时放行内网地址（企业内网部署场景，默认关闭）
 */
export function assertSafeHttpUrl(url: string, allowIntranet = false): URL {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new FetchSecurityError(`无效的 URL: ${url}`)
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new FetchSecurityError(`不允许的 URL 协议: ${parsed.protocol}`)
  }

  if (!allowIntranet && isPrivateHost(parsed.hostname)) {
    throw new FetchSecurityError(
      `不允许请求内网地址: ${parsed.hostname}（如需加载内网资源，请在设置中开启"允许加载内网资源"）`,
    )
  }

  return parsed
}

/**
 * 合并多个 AbortSignal：任一 signal abort 时，返回的 signal 也会 abort。
 * 用于将调用方传入的外部 signal 与内部超时 signal 合并。
 */
function mergeSignals(...signals: (AbortSignal | null | undefined)[]): AbortSignal {
  const controller = new AbortController()
  for (const signal of signals) {
    if (!signal) continue
    if (signal.aborted) {
      controller.abort(signal.reason)
      break
    }
    signal.addEventListener(
      'abort',
      () => controller.abort(signal.reason),
      { once: true },
    )
  }
  return controller.signal
}

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number
  /** 允许请求内网地址（默认 false）。为 false 时拒绝回环/私有网段/元数据服务。 */
  allowIntranet?: boolean
}

/**
 * 带超时、协议校验与 SSRF 防护的 fetch 封装。
 *
 * 安全策略：
 * - 协议白名单：仅 http/https
 * - 内网黑名单：默认拒绝私有地址，可通过 allowIntranet 放行
 * - 重定向校验：跟随重定向后校验最终 URL（resp.url），防止通过 302 绕过黑名单
 * - signal 合并：调用方传入的 signal 与内部超时 signal 合并，任一触发即中止
 *
 * @param url 必须是 http/https 绝对 URL
 * @param options 额外的 fetch 选项，timeoutMs 指定超时时间（默认 30s）
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const { timeoutMs = 30_000, allowIntranet = false, signal: externalSignal, ...fetchOptions } = options

  // 初始 URL 校验（协议 + 内网）
  assertSafeHttpUrl(url, allowIntranet)

  // 合并外部 signal 与内部超时 signal（6.11）
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const mergedSignal = mergeSignals(externalSignal, controller.signal)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: mergedSignal,
      // 默认跟随重定向，后续校验最终 URL（H3）
      redirect: fetchOptions.redirect ?? 'follow',
    })

    // 重定向最终 URL 校验（H3）：防止通过 302 重定向到内网地址绕过静态黑名单
    if (response.redirected) {
      assertSafeHttpUrl(response.url, allowIntranet)
    }

    return response
  } catch (err) {
    // 区分超时（内部 signal）与外部 signal abort
    if (controller.signal.aborted && !(externalSignal?.aborted)) {
      throw new FetchTimeoutError(`请求超时（${timeoutMs}ms）: ${url}`)
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (externalSignal?.aborted) throw err
      throw new FetchTimeoutError(`请求超时（${timeoutMs}ms）: ${url}`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export interface FetchImageBufferOptions {
  timeoutMs?: number
  /** 允许请求内网地址（默认 false） */
  allowIntranet?: boolean
  /** 是否发送凭证（Cookie 等）。默认 'omit'，图床域名可按需传 'include'（M3） */
  credentials?: RequestCredentials
  /** 外部 AbortSignal，用于取消请求（6.11） */
  signal?: AbortSignal
}

/**
 * 获取图片二进制数据，带协议校验、SSRF 防护、超时与凭证隔离。
 *
 * 默认安全策略（M3）：
 * - credentials: 'omit' —— 不向第三方图片服务器发送 Cookie
 * - referrerPolicy: 'no-referrer' —— 不泄露页面 referrer
 * 图床域名如需凭证鉴权，通过 credentials 选项显式传 'include'。
 */
export async function fetchImageBuffer(
  url: string,
  timeoutMsOrOptions: number | FetchImageBufferOptions = 30_000,
): Promise<ArrayBuffer> {
  // 兼容旧签名 fetchImageBuffer(url, timeoutMs)
  const options: FetchImageBufferOptions =
    typeof timeoutMsOrOptions === 'number'
      ? { timeoutMs: timeoutMsOrOptions }
      : timeoutMsOrOptions

  const resp = await fetchWithTimeout(url, {
    mode: 'cors',
    timeoutMs: options.timeoutMs,
    allowIntranet: options.allowIntranet,
    signal: options.signal,
    // M3: 默认不发送凭证，避免向第三方图片服务器泄露 Cookie
    credentials: options.credentials ?? 'omit',
    // M3: 不泄露 referrer，无功能影响
    referrerPolicy: 'no-referrer',
  })

  if (!resp.ok) {
    throw new Error(`获取图片失败: HTTP ${resp.status} (${resp.statusText})`)
  }

  const contentType = resp.headers.get('content-type')
  if (contentType && !contentType.startsWith('image/')) {
    throw new Error(`响应不是图片类型: ${contentType}`)
  }

  return resp.arrayBuffer()
}
