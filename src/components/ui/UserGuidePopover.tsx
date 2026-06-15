import { useState, useEffect, Fragment } from 'react'
import { CopyIcon, AIIcon, ExportIcon, CheckIcon } from './GuideIcons'

export interface GuideStep {
  icon: 'copy' | 'ai' | 'export'
  title: string
  shortDesc: string
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

// 图标映射
const iconMap = {
  copy: CopyIcon,
  ai: AIIcon,
  export: ExportIcon,
}

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
  const [currentStep, setCurrentStep] = useState(0)

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
      setCurrentStep(0)
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

  const step = steps[currentStep]
  const StepIcon = iconMap[step.icon]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-[35] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* 顶部装饰条 */}
        <div className="h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/70 to-[var(--accent)]/30" />

        <div className="px-4 pt-7 pb-6">
          {/* ── 大标题区 ── */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          </div>

          {/* ── 步骤内容区（图标 + 中标题 + 描述） ── */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 mb-6 min-h-[100px]">
            <div className="flex items-start gap-4">
              {/* 独立图标容器 */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <StepIcon size={26} />
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                {/* 中标题 */}
                <h3 className="text-base font-semibold text-slate-800 mb-1.5">
                  {step.title}
                </h3>
                {/* 描述 */}
                <p className="text-sm text-slate-500 leading-[1.7]">
                  {step.shortDesc}
                </p>
              </div>
            </div>
          </div>

          {/* ── 步骤指示器（简洁图标 + 连接线） ── */}
          <div className="flex items-center justify-center mb-5">
            {steps.map((s, i) => {
              const Icon = iconMap[s.icon]
              const isActive = i === currentStep
              const isCompleted = i < currentStep

              return (
                <Fragment key={i}>
                  <button
                    onClick={() => setCurrentStep(i)}
                    className="flex items-center justify-center cursor-pointer group"
                  >
                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-full
                        transition-all duration-200
                        ${isActive
                          ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20'
                          : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckIcon size={16} />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>
                  </button>

                  {/* 连接线 */}
                  {i < steps.length - 1 && (
                    <div className="w-16 h-0.5 mx-2.5">
                      <div
                        className={`h-full transition-colors duration-300 ${
                          i < currentStep ? 'bg-emerald-400' : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>

          {/* ── 简介下移 ── */}
          {subtitle && (
            <p className="text-center text-[12px] text-slate-400 mb-4 px-4 leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* ── 提示信息（可选，简洁图标） ── */}
          {tip && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-2.5 text-xs text-slate-600 leading-relaxed">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)] mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              {tip}
            </div>
          )}

          {/* ── 隐私声明（精简） ── */}
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-2.5 text-xs text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>纯前端工具，数据仅保存在本地</span>
            <a
              href="https://github.com/ZhongXiandou/markdown2view"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline ml-auto"
            >
              查看源码
            </a>
          </div>

          {/* ── 操作栏 ── */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleDismiss(true)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              不再显示
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => !isFirst && setCurrentStep((prev) => prev - 1)}
                disabled={isFirst}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-0 disabled:cursor-default"
              >
                上一步
              </button>
              {!isLast ? (
                <button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={() => handleDismiss(false)}
                  className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  开始使用
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
