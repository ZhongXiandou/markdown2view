import { useEffect, useRef, useState } from 'react'
import { useContentStore, type RenderMode } from '@/lib/store'
import { MODE_LABELS } from '@/lib/uiLabels'
import { buildPromptWithMaterial, materialSourcesFor, type MaterialSource } from '@/lib/promptMaterial'
import { countChars } from '@/lib/editor/docStats'
import { copyText } from '@/lib/clipboard'
import { useEscapeKey } from '@/lib/useEscapeKey'
import { Package } from '@/components/ui/Icon'

interface MaterialCopyMenuProps {
  /** 当前模式（素材来源会排除它） */
  mode: RenderMode
  /** 生成当前模式的排版指令 */
  buildPrompt: () => string
  onToast: (msg: string) => void
}

function readMaterial(source: MaterialSource): string {
  const s = useContentStore.getState()
  return { article: s.articleMarkdown, document: s.documentMarkdown, card: s.cardMarkdown }[source]
}

/**
 * 「指令 + 素材」菜单：把另一模式的当前内容作为原稿附在排版指令后面一起复制。
 *
 * 与「复制排版指令」分开成两个入口，且不记忆上次的选择——附带哪份内容必须每次明确点选，
 * 避免用户只想复制指令时，不知不觉把别的模式的稿子也带了出去。
 */
export function MaterialCopyMenu({ mode, buildPrompt, onToast }: MaterialCopyMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sources = materialSourcesFor(mode)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEscapeKey(open, () => setOpen(false))

  if (sources.length === 0) return null

  const handlePick = async (source: MaterialSource) => {
    const content = readMaterial(source)
    setOpen(false)
    if (!content.trim()) {
      onToast(`「${MODE_LABELS[source]}」当前没有内容，无法附带`)
      return
    }
    const ok = await copyText(buildPromptWithMaterial(buildPrompt(), content, MODE_LABELS[source]))
    onToast(
      ok
        ? `已复制指令，并附带「${MODE_LABELS[source]}」原稿（${countChars(content).chars} 字）`
        : '复制失败，请重试',
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors cursor-pointer ${
          open ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Package size={14} />
        指令 + 素材
      </button>

      {open && (
        <div
          role="menu"
          aria-label="选择要附带的素材"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-fade-in"
        >
          <p className="px-2 pb-2 pt-1 text-[12px] leading-relaxed text-slate-500">
            把另一模式里已写好的内容作为原稿，附在排版指令后面一起复制，让 AI 改写为「{MODE_LABELS[mode]}」。
            请选择要附带的内容：
          </p>
          {sources.map((source) => {
            const chars = countChars(readMaterial(source)).chars
            return (
              <button
                key={source}
                role="menuitem"
                onClick={() => handlePick(source)}
                disabled={chars === 0}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <span className="font-medium">「{MODE_LABELS[source]}」的当前内容</span>
                <span className="text-[12px] tabular-nums text-slate-400">{chars === 0 ? '暂无内容' : `${chars} 字`}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
