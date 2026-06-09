import { useMemo } from 'react'
import { DESIGN_STYLES, type DesignStyle } from '@/data/designPrompts'

interface PromptLibraryProps {
  open: boolean
  onClose: () => void
  onCopy: (style: DesignStyle) => void
}

export function PromptLibrary({ open, onClose, onCopy }: PromptLibraryProps) {
  const groupedStyles = useMemo(() => {
    const groups: Record<string, typeof DESIGN_STYLES> = {}
    DESIGN_STYLES.forEach((s) => {
      const mainCategory = s.category.split('/')[0] || '其他'
      if (!groups[mainCategory]) groups[mainCategory] = []
      groups[mainCategory].push(s)
    })

    // 推荐展示顺序：用更少的风格系列收拢品牌/用途标签。
    const order = ['演示汇报', '科技产品', '设计创意', '媒体内容', '数据分析', '文档知识']

    return Object.entries(groups).sort((a, b) => {
      const idxA = order.indexOf(a[0])
      const idxB = order.indexOf(b[0])
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a[0].localeCompare(b[0], 'zh-CN')
    })
  }, [])

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[85vw] max-w-[1000px] flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <div className="text-lg font-bold text-slate-900">📚 风格指令库</div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500">
              <span className="rounded bg-blue-50 px-1.5 text-blue-700 font-semibold flex items-center gap-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>工作流</span>
              <span>1. 选一个喜欢的风格</span>
              <span className="text-slate-300">→</span>
              <span>2. 复制提示词发给 AI</span>
              <span className="text-slate-300">→</span>
              <span>3. 将生成的 HTML 贴回系统渲染</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto space-y-10">
            {groupedStyles.map(([groupName, styles]) => (
              <section key={groupName}>
                <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-base font-bold text-slate-800">
                  <span className="h-4 w-1 rounded-full bg-[var(--accent)]"></span>
                  {groupName}系列
                  <span className="text-[13px] font-normal text-slate-400">({styles.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {styles.map((s) => {
                    const subCategory = s.category.includes('/') ? s.category.split('/')[1] : '常规'
                    return (
                      <div
                        key={s.id}
                        className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full shadow-inner"
                            style={{ background: s.accent }}
                          />
                          <span className="font-semibold text-slate-900 truncate">{s.name}</span>
                          <span className="ml-auto shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                            {subCategory}
                          </span>
                        </div>
                        <p className="mb-4 flex-1 text-[13px] leading-relaxed text-slate-600">
                          {s.description}
                        </p>
                        <button
                          onClick={() => onCopy(s)}
                          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium text-white opacity-90 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
                          style={{ background: 'var(--accent)' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          复制提示词
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
