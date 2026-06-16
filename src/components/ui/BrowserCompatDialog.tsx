import { useState, useEffect } from 'react'
import { AlertTriangle, Shield } from '@/components/ui/Icon'
import { detectBrowserCompat, type BrowserCompatResult } from '@/lib/browserCompat'

/**
 * 浏览器兼容性警告弹窗
 * 检测受限环境（微信/QQ/钉钉等内置浏览器、非 Chromium 内核）并提示用户。
 * z-index 设为 55，高于 UserGuidePopover (z-35)，确保最先弹出。
 */

const DISMISS_KEY = 'm2v-browser-compat-dismissed'

export function BrowserCompatDialog() {
  const [result, setResult] = useState<BrowserCompatResult | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 如果用户已在本会话中忽略过，不再弹出
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return

    const detected = detectBrowserCompat()
    if (detected.shouldWarn) {
      setResult(detected)
    }
  }, [])

  if (!result) return null

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 降级方案：选中并提示复制
      const ta = document.createElement('textarea')
      ta.value = window.location.href
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setResult(null)
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* 顶部警告装饰条 */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />

        <div className="px-6 pt-6 pb-5">
          {/* 图标 + 标题 */}
          <div className="flex items-start gap-4 mb-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <AlertTriangle size={26} />
            </div>
            <div className="pt-0.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                浏览器兼容性提示
              </h2>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                检测到您当前使用的是
                <span className="font-semibold text-slate-700">「{result.envName}」</span>
                ，可能无法完整加载本工具的渲染引擎与高级特性。
              </p>
            </div>
          </div>

          {/* 推荐浏览器卡片 */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              推荐使用以下浏览器打开
            </p>
            <div className="flex gap-3">
              {result.recommendations.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                >
                  <BrowserIcon name={name} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 隐私声明 */}
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-2.5 text-xs text-slate-500">
            <Shield size={14} className="text-emerald-500 shrink-0" />
            <span>本工具 100% 纯前端运行，数据仅保存在您的本地浏览器中</span>
          </div>

          {/* 操作栏 */}
          <div className="flex items-center gap-3">
            {/* 次要按钮：坚持使用 */}
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
            >
              已知晓，继续使用
            </button>

            {/* 主要按钮：复制网址 */}
            <button
              onClick={handleCopyUrl}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 hover:bg-emerald-500'
                  : 'bg-[var(--accent)] hover:opacity-90'
              }`}
            >
              {copied ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  已复制
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                  复制网址，去浏览器打开
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 根据浏览器名称渲染简笔图标 */
function BrowserIcon({ name }: { name: string }) {
  if (name.includes('Chrome') || name.includes('Google')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="14" x2="4" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="14" y1="16" x2="18" y2="20" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  if (name.includes('Edge') || name.includes('Microsoft')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c4.2 0 7.8-2.6 9.3-6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M21 12c0-1.7-.7-3.2-1.8-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  if (name.includes('Safari')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    )
  }
  // 通用浏览器图标
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
