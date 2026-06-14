import { useState, useEffect } from 'react'

export interface GuideStep {
  icon: string
  title: string
  desc: string
}

export interface UserGuidePopoverProps {
  guideKey: string
  title?: string
  subtitle?: string
  steps: GuideStep[]
  delay?: number
  forceOpenTrigger?: number
  /** 可选的额外提示，显示在步骤与隐私声明之间 */
  tip?: string
}

// 内存中记录在当前页面运行周期（刷新即重置）中已关闭的引导 Key
const sessionSeenKeys = new Set<string>()

export function UserGuidePopover({
  guideKey,
  title = '快速开始',
  subtitle,
  steps,
  delay = 800,
  forceOpenTrigger,
  tip,
}: UserGuidePopoverProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    const isPermanentSeen = localStorage.getItem(guideKey) === '1'
    const isSessionSeen = sessionSeenKeys.has(guideKey)

    if (!isPermanentSeen && !isSessionSeen) {
      const t = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(t)
    }
  }, [guideKey, delay])

  useEffect(() => {
    if (forceOpenTrigger !== undefined && forceOpenTrigger > 0) {
      setVisible(true)
    }
  }, [forceOpenTrigger])

  if (!visible) return null

  const handleDismiss = (permanent: boolean) => {
    if (permanent) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(guideKey, '1')
      }
    } else {
      sessionSeenKeys.add(guideKey)
    }
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[35] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-[17px] font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mb-5 text-[13px] text-slate-500">{subtitle}</p>}

        <div className="space-y-4 mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[16px]">
                {step.icon}
              </span>
              <div>
                <div className="text-[14px] font-semibold text-slate-800">
                  <span className="mr-1.5 text-[var(--accent)]">{i + 1}.</span>
                  {step.title}
                </div>
                <div className="mt-0.5 text-[13px] text-slate-500 leading-relaxed">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 可选的使用提示 */}
        {tip && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-[12px] text-amber-900 leading-relaxed flex items-start gap-2.5">
            <span className="text-[15px] shrink-0 leading-none">💡</span>
            <div>{tip}</div>
          </div>
        )}

        {/* 隐私与开源声明小卡片 */}
        <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 text-[12px] text-emerald-800 leading-relaxed flex items-start gap-2.5">
          <span className="text-[15px] shrink-0 leading-none">🛡️</span>
          <div>
            <strong>隐私与开源声明：</strong>本项目为 100% 纯前端开源工具，无任何后台服务器。您的所有编辑内容、图床配置与排版设置均保存在浏览器本地，绝对不会传输至任何服务器，保障您的隐私安全。
            <a
              href="https://github.com/ZhongXiandou/markdown2view"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-emerald-950 ml-1 font-semibold"
            >
              访问 GitHub 源码仓库
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => handleDismiss(true)}
            className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            不再显示
          </button>
          <button
            onClick={() => handleDismiss(false)}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            开始使用
          </button>
        </div>
      </div>
    </div>
  )
}
