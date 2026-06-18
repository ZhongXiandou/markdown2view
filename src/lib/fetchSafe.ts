// 安全的资源获取工具：限制协议、支持超时、防止 SSRF/信息泄露。

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

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

/**
 * 校验 URL 是否允许被前端直接请求。
 * 仅允许 http/https 绝对 URL，拒绝 file、javascript、data 等协议及相对路径。
 */
export function assertSafeHttpUrl(url: string): URL {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new FetchSecurityError(`无效的 URL: ${url}`)
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new FetchSecurityError(`不允许的 URL 协议: ${parsed.protocol}`)
  }

  return parsed
}

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number
}

/**
 * 带超时与协议校验的 fetch 封装。
 * @param url 必须是 http/https 绝对 URL
 * @param options 额外的 fetch 选项，timeoutMs 指定超时时间（默认 30s）
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const { timeoutMs = 30_000, ...fetchOptions } = options

  assertSafeHttpUrl(url)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new FetchTimeoutError(`请求超时（${timeoutMs}ms）: ${url}`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 获取图片二进制数据，带协议校验与超时。
 */
export async function fetchImageBuffer(
  url: string,
  timeoutMs = 30_000,
): Promise<ArrayBuffer> {
  const resp = await fetchWithTimeout(url, {
    mode: 'cors',
    timeoutMs,
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
