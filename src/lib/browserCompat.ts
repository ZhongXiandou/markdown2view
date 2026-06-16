/**
 * 浏览器兼容性检测
 * 识别受限环境（微信/QQ/百度等内置浏览器）和非 Chromium 内核浏览器，
 * 提示用户获得最佳体验。
 */

export interface BrowserCompatResult {
  /** 是否需要弹窗警告 */
  shouldWarn: boolean
  /** 环境描述 */
  envName: string
  /** 推荐浏览器列表 */
  recommendations: string[]
}

/** 检测受限浏览器环境（内置 WebView / 非主流内核） */
export function detectBrowserCompat(): BrowserCompatResult {
  if (typeof navigator === 'undefined') {
    return { shouldWarn: false, envName: '未知', recommendations: [] }
  }

  const ua = navigator.userAgent

  // ── 1. 内置浏览器 / 受限 WebView ──
  const restrictedBrowsers: [RegExp, string][] = [
    [/MicroMessenger/i, '微信内置浏览器'],
    [/QQ\/[\d.]/i, 'QQ 内置浏览器'],
    [/QQLite/i, 'QQ 轻聊版浏览器'],
    [/Weibo/i, '微博内置浏览器'],
    [/DingTalk/i, '钉钉内置浏览器'],
    [/baidubrowser/i, '百度浏览器'],
    [/UCBrowser/i, 'UC 浏览器'],
    [/Quark/i, '夸克浏览器'],
    [/SogouMobileBrowser/i, '搜狗浏览器'],
    [/360 Aphone|360browser/i, '360 浏览器'],
    [/SamsungBrowser/i, '三星浏览器'],
  ]

  for (const [pattern, name] of restrictedBrowsers) {
    if (pattern.test(ua)) {
      return {
        shouldWarn: true,
        envName: name,
        recommendations: ['Google Chrome', 'Microsoft Edge'],
      }
    }
  }

  // ── 2. 非 Chromium 内核的独立浏览器 ──
  // Firefox（排除基于 Chromium 的 Firefox 变体——目前没有，但安全起见检查）
  if (/Firefox/i.test(ua) && !/Chrome/i.test(ua)) {
    return {
      shouldWarn: true,
      envName: 'Firefox 浏览器',
      recommendations: ['Google Chrome', 'Microsoft Edge'],
    }
  }

  // Safari（macOS/iOS 原生 Safari，排除 Chrome/Edge 等套壳）
  if (/Safari/i.test(ua) && !/Chrome|CriOS|EdgiOS|OPiOS/i.test(ua)) {
    return {
      shouldWarn: true,
      envName: 'Safari 浏览器',
      recommendations: ['Google Chrome', 'Microsoft Edge'],
    }
  }

  // ── 3. iOS 系统 WebView（非 Safari 的 iOS 应用内嵌页面） ──
  // iOS 上所有浏览器都使用 WebKit，但 Chrome/Edge 等有自己的标识
  if (
    /iPhone|iPad|iPod/i.test(ua) &&
    !/Chrome|CriOS|EdgiOS|OPiOS|Firefox|FxiOS/i.test(ua) &&
    !/Safari/i.test(ua)
  ) {
    return {
      shouldWarn: true,
      envName: 'iOS 应用内嵌浏览器',
      recommendations: ['Safari（iOS 推荐）', 'Google Chrome'],
    }
  }

  // ── 4. 通过：主流 Chromium 内核 ──
  // Chrome, Edge, Brave, Opera, Vivaldi, Arc, 以及移动端 Chrome(CriOS)/Edge(EdgiOS) 等
  return { shouldWarn: false, envName: '', recommendations: [] }
}
