import { useEffect, useRef, useState } from 'react'
import { useContentStore, type RenderMode } from '@/lib/store'
import { useLibraryStore, deriveDocTitle, MAX_DOCS_PER_MODE, MAX_SNAPSHOTS_PER_DOC } from '@/lib/libraryStore'
import { countChars } from '@/lib/editor/docStats'
import { useEscapeKey } from '@/lib/useEscapeKey'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FileText } from '@/components/ui/Icon'

interface DocLibraryMenuProps {
  mode: RenderMode
  onToast: (msg: string) => void
}

const formatTime = (at: number) =>
  new Date(at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

const rowBtn = 'rounded px-1.5 py-0.5 text-[12px] text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer'

/** 文档库入口：当前模式下的多篇文档（新建 / 切换 / 重命名 / 删除）与当前文档的历史版本 */
export function DocLibraryMenu({ mode, onToast }: DocLibraryMenuProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'docs' | 'history'>('docs')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const hydrated = useLibraryStore((s) => s.hasHydrated)
  const library = useLibraryStore((s) => s.libraries[mode])
  const snapshots = useLibraryStore((s) => (library ? s.snapshots[library.activeId] : undefined)) ?? []
  const store = useLibraryStore.getState

  // 当前文档的自动标题随内容实时变化
  const liveTitle = useContentStore((s) =>
    deriveDocTitle(mode, { article: s.articleMarkdown, document: s.documentMarkdown, card: s.cardMarkdown, html: s.html }[mode]),
  )
  const activeDoc = library?.docs.find((d) => d.id === library.activeId)
  const currentName = activeDoc?.name || liveTitle

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      // 删除确认弹窗渲染在 body 下，点击它不算「点到外面」
      if (pendingDeleteId !== null) return
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, pendingDeleteId])

  useEscapeKey(open, () => setOpen(false))

  const handleToggle = () => {
    if (!hydrated) return
    // 首次打开时把当前内容登记为第一篇文档
    if (!open) store().ensureLibrary(mode)
    setOpen(!open)
    setRenamingId(null)
  }

  const handleCreate = () => {
    if (store().createDoc(mode)) {
      onToast('已新建文档')
      setOpen(false)
    } else {
      onToast(`每个模式最多保存 ${MAX_DOCS_PER_MODE} 篇文档`)
    }
  }

  const commitRename = () => {
    if (renamingId) store().renameDoc(mode, renamingId, renameValue)
    setRenamingId(null)
  }

  const handleSaveSnapshot = () => {
    onToast(store().addSnapshot(mode, '手动保存') ? '已保存当前版本' : '当前内容与最近一个版本相同，无需保存')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        disabled={!hydrated}
        aria-expanded={open}
        aria-label="文档库"
        title="文档库：管理多篇文档与历史版本"
        className={`flex h-8 max-w-[220px] items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 ${
          open ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <FileText size={14} className="shrink-0" />
        <span className="truncate">{currentName}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && library && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[340px] rounded-lg border border-slate-200 bg-white shadow-xl animate-fade-in">
          <div className="flex border-b border-slate-200 text-[13px] font-semibold">
            {(['docs', 'history'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 transition-colors cursor-pointer ${
                  tab === key ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {key === 'docs' ? `文档 ${library.docs.length}` : `历史版本 ${snapshots.length}`}
              </button>
            ))}
          </div>

          {tab === 'docs' ? (
            <div className="p-1.5">
              <div className="max-h-72 overflow-y-auto">
                {library.docs.map((doc) => {
                  const active = doc.id === library.activeId
                  const name = doc.name || (active ? liveTitle : doc.title)
                  return (
                    <div key={doc.id} className={`group flex items-center gap-1 rounded-md px-2 py-1.5 ${active ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                      {renamingId === doc.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename()
                            // 只取消重命名，不让 Esc 冒泡去关闭整个面板
                            if (e.key === 'Escape') {
                              e.nativeEvent.stopImmediatePropagation()
                              setRenamingId(null)
                            }
                          }}
                          placeholder="留空则使用文档标题"
                          aria-label="文档名称"
                          className="h-7 min-w-0 flex-1 rounded border border-slate-200 px-2 text-[13px] outline-none focus:border-[var(--accent)]"
                        />
                      ) : (
                        <button
                          onClick={() => {
                            store().switchDoc(mode, doc.id)
                            setOpen(false)
                          }}
                          className={`min-w-0 flex-1 truncate text-left text-[13px] cursor-pointer ${active ? 'font-semibold text-[var(--accent)]' : 'text-slate-700'}`}
                          title={active ? '当前文档' : `切换到「${name}」`}
                        >
                          {name}
                        </button>
                      )}
                      {renamingId !== doc.id && (
                        <span className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                          <button
                            className={rowBtn}
                            onClick={() => {
                              setRenamingId(doc.id)
                              setRenameValue(doc.name || '')
                            }}
                          >
                            重命名
                          </button>
                          {library.docs.length > 1 && (
                            <button className={`${rowBtn} hover:text-red-500`} onClick={() => setPendingDeleteId(doc.id)}>
                              删除
                            </button>
                          )}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              <button
                onClick={handleCreate}
                className="mt-1 w-full rounded-md border border-dashed border-slate-300 py-2 text-[13px] font-medium text-slate-600 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                + 新建文档
              </button>
            </div>
          ) : (
            <div className="p-1.5">
              <button
                onClick={handleSaveSnapshot}
                className="mb-1 w-full rounded-md border border-slate-200 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                保存当前版本
              </button>
              <div className="max-h-72 overflow-y-auto">
                {snapshots.length === 0 && (
                  <p className="px-2 py-4 text-center text-[12px] text-slate-400">还没有历史版本</p>
                )}
                {snapshots.map((snap) => (
                  <div key={snap.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] tabular-nums text-slate-700">{formatTime(snap.at)}</div>
                      <div className="truncate text-[11px] text-slate-400">
                        {snap.reason} · {countChars(snap.content).chars} 字
                      </div>
                    </div>
                    <button
                      className={`${rowBtn} text-[var(--accent)]`}
                      onClick={() => {
                        store().restoreSnapshot(mode, snap.id)
                        onToast('已恢复到该版本（恢复前的内容也已存为一个版本）')
                        setOpen(false)
                      }}
                    >
                      恢复
                    </button>
                    <button
                      className={`${rowBtn} opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500`}
                      onClick={() => store().deleteSnapshot(library.activeId, snap.id)}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
              <p className="border-t border-slate-100 px-2 pb-1 pt-2 text-[11px] leading-relaxed text-slate-400">
                编辑过程中每 5 分钟自动保存一次；恢复示例、导入文件、套用模板前也会自动存档。每篇文档保留最近 {MAX_SNAPSHOTS_PER_DOC} 个版本。
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="删除这篇文档？"
        message="文档及其历史版本都会被删除，无法恢复。"
        confirmLabel="删除"
        onConfirm={() => {
          if (pendingDeleteId && store().deleteDoc(mode, pendingDeleteId)) onToast('已删除文档')
          setPendingDeleteId(null)
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
