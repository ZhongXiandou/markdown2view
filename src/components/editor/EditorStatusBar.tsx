import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorView, runScopeHandlers } from '@uiw/react-codemirror'
import { useDebounce } from '@/lib/useDebounce'
import { useEscapeKey } from '@/lib/useEscapeKey'
import { countChars, extractOutline } from '@/lib/editor/docStats'

interface EditorStatusBarProps {
  view: EditorView | null
  /** 编辑器当前内容 */
  value: string
}

const itemBtn =
  'flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:hover:bg-transparent'

/** 编辑器底部状态栏：字数与阅读时长、文档大纲（点击跳转）、查找替换入口 */
export function EditorStatusBar({ view, value }: EditorStatusBarProps) {
  // 统计不必跟随每次按键，防抖后再算，长文输入时不拖慢编辑器
  const debounced = useDebounce(value, 300)
  const stats = useMemo(() => countChars(debounced), [debounced])
  const outline = useMemo(() => extractOutline(debounced), [debounced])

  const [outlineOpen, setOutlineOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!outlineOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOutlineOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [outlineOpen])

  useEscapeKey(outlineOpen, () => setOutlineOpen(false))

  const jumpToLine = (lineNo: number) => {
    if (!view) return
    const line = view.state.doc.line(Math.min(lineNo, view.state.doc.lines))
    view.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: 'start', yMargin: 12 }),
    })
    view.focus()
    setOutlineOpen(false)
  }

  // 查找面板由 CodeMirror 的 Mod-f 快捷键打开，这里借同一条键位绑定触发，保证行为一致
  const openSearch = () => {
    if (!view) return
    view.focus()
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
    runScopeHandlers(view, new KeyboardEvent('keydown', { key: 'f', ctrlKey: !isMac, metaKey: isMac }), 'editor')
  }

  return (
    <div
      ref={containerRef}
      className="relative flex shrink-0 items-center gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-1 text-[12px] text-slate-500 select-none"
    >
      <span className="tabular-nums">
        {stats.chars} 字{stats.chars > 0 && ` · 约 ${stats.minutes} 分钟读完`}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => setOutlineOpen((o) => !o)}
          disabled={outline.length === 0}
          aria-expanded={outlineOpen}
          className={itemBtn}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          大纲{outline.length > 0 && ` ${outline.length}`}
        </button>
        <button onClick={openSearch} className={itemBtn} title="查找与替换（Ctrl/Cmd + F）">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          查找替换
        </button>
      </div>

      {outlineOpen && (
        <div
          role="menu"
          aria-label="文档大纲"
          className="absolute bottom-full right-3 z-20 mb-1 max-h-80 w-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in"
        >
          {outline.map((item) => (
            <button
              key={`${item.line}-${item.text}`}
              role="menuitem"
              onClick={() => jumpToLine(item.line)}
              className={`block w-full truncate rounded-md py-1.5 pr-2 text-left hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer ${
                item.level === 1 ? 'font-semibold text-slate-700' : 'text-slate-600'
              }`}
              style={{ paddingLeft: 8 + (item.level - 1) * 14 }}
              title={item.text}
            >
              {item.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
