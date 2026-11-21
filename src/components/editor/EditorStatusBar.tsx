import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorView, runScopeHandlers } from '@uiw/react-codemirror'
import { useStore } from '@/lib/store'
import { useDebounce } from '@/lib/useDebounce'
import { useEscapeKey } from '@/lib/useEscapeKey'
import { countChars, extractOutline } from '@/lib/editor/docStats'
import { scanBannedWords, MAX_MATCHES } from '@/lib/editor/bannedWords'

interface EditorStatusBarProps {
  view: EditorView | null
  /** 编辑器当前内容 */
  value: string
}

const itemBtn =
  'flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:hover:bg-transparent'

const panelCls =
  'absolute bottom-full right-3 z-20 mb-1 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in'

/** 编辑器底部状态栏：字数与阅读时长、文档大纲（点击跳转）、违禁词检测、查找替换入口 */
export function EditorStatusBar({ view, value }: EditorStatusBarProps) {
  // 统计不必跟随每次按键，防抖后再算，长文输入时不拖慢编辑器
  const debounced = useDebounce(value, 300)
  const stats = useMemo(() => countChars(debounced), [debounced])
  const outline = useMemo(() => extractOutline(debounced), [debounced])

  // 同一时间只展开一个面板
  const [panel, setPanel] = useState<'outline' | 'banned' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const ignoredWords = useStore((s) => s.bannedIgnoredWords)
  const addIgnoredWord = useStore((s) => s.addBannedIgnoredWord)
  const clearIgnoredWords = useStore((s) => s.clearBannedIgnoredWords)
  // 违禁词只在面板打开时扫描，平时不占用输入时的计算
  const banned = useMemo(
    () => (panel === 'banned' ? scanBannedWords(debounced, ignoredWords) : []),
    [panel, debounced, ignoredWords],
  )

  useEffect(() => {
    if (!panel) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setPanel(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [panel])

  useEscapeKey(panel !== null, () => setPanel(null))

  const jumpToLine = (lineNo: number) => {
    if (!view) return
    const line = view.state.doc.line(Math.min(lineNo, view.state.doc.lines))
    view.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: 'start', yMargin: 12 }),
    })
    view.focus()
    setPanel(null)
  }

  // 跳到命中词并选中它；面板保持打开，方便逐个处理
  const jumpToMatch = (offset: number, length: number) => {
    if (!view) return
    const from = Math.min(offset, view.state.doc.length)
    const to = Math.min(offset + length, view.state.doc.length)
    view.dispatch({
      selection: { anchor: from, head: to },
      effects: EditorView.scrollIntoView(from, { y: 'center' }),
    })
    view.focus()
  }

  // 查找面板由 CodeMirror 的 Mod-f 快捷键打开，这里借同一条键位绑定触发，保证行为一致
  const openSearch = () => {
    if (!view) return
    view.focus()
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
    runScopeHandlers(view, new KeyboardEvent('keydown', { key: 'f', ctrlKey: !isMac, metaKey: isMac }), 'editor')
  }

  const toggle = (name: 'outline' | 'banned') => setPanel((p) => (p === name ? null : name))

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
          onClick={() => toggle('outline')}
          disabled={outline.length === 0}
          aria-expanded={panel === 'outline'}
          className={itemBtn}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          大纲{outline.length > 0 && ` ${outline.length}`}
        </button>
        <button
          onClick={() => toggle('banned')}
          aria-expanded={panel === 'banned'}
          className={itemBtn}
          title="按内置词库检查广告法极限词、医疗功效、诱导互动等高风险用语"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          违禁词检测
        </button>
        <button onClick={openSearch} className={itemBtn} title="查找与替换（Ctrl/Cmd + F）">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          查找替换
        </button>
      </div>

      {panel === 'outline' && (
        <div role="menu" aria-label="文档大纲" className={`${panelCls} w-72`}>
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

      {panel === 'banned' && (
        <div role="dialog" aria-label="违禁词检测结果" className={`${panelCls} w-96 select-text`}>
          <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
            <span className="font-semibold text-slate-700">
              {banned.length === 0
                ? '未发现词库中的高风险用语'
                : `命中 ${banned.length >= MAX_MATCHES ? `${MAX_MATCHES}+` : banned.length} 处`}
            </span>
            {ignoredWords.length > 0 && (
              <button onClick={clearIgnoredWords} className="text-[var(--accent)] hover:underline cursor-pointer">
                恢复已忽略的 {ignoredWords.length} 个词
              </button>
            )}
          </div>
          {banned.map((m) => (
            <div key={m.offset} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
              <button
                onClick={() => jumpToMatch(m.offset, m.word.length)}
                className="min-w-0 flex-1 truncate text-left text-slate-600 cursor-pointer"
                title={`第 ${m.line} 行，点击定位`}
              >
                <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">{m.categoryLabel}</span>
                {m.before}
                <mark className="rounded bg-amber-100 px-0.5 font-semibold text-amber-900">{m.word}</mark>
                {m.after}
              </button>
              <span className="shrink-0 tabular-nums text-slate-400">{m.line} 行</span>
              <button
                onClick={() => addIgnoredWord(m.word)}
                className="shrink-0 rounded px-1 text-slate-400 opacity-0 hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title={`以后不再提示「${m.word}」`}
              >
                忽略
              </button>
            </div>
          ))}
          <p className="border-t border-slate-100 px-2 pb-1 pt-2 text-[11px] leading-relaxed text-slate-400">
            内置词库覆盖极限用语、权威背书、医疗功效、金融风险、诱导互动五类，仅作提示，不代表平台的实际审核结论。
          </p>
        </div>
      )}
    </div>
  )
}
