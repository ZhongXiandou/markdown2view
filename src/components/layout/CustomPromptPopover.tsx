import React, { useState, useRef, useEffect } from 'react'
import { useStore, type RenderMode } from '@/lib/store'
import { CustomInstructionEditor } from '@/modes/html/CustomInstructionEditor'
import { copyText } from '@/lib/clipboard'
import { UI_LABELS } from '@/lib/uiLabels'

interface CustomPromptPopoverProps {
  mode: RenderMode
  onToast: (msg: string) => void
}

export function CustomPromptPopover({ mode, onToast }: CustomPromptPopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 用于编辑/新增指令的状态
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const customInstructions = useStore(s => s.customInstructions)
  const removeCustomInstruction = useStore(s => s.removeCustomInstruction)

  // 过滤出当前模式下的自定义指令
  const filteredInstructions = customInstructions.filter(c => (c.mode || 'html') === mode)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleCopy = async (content: string) => {
    const ok = await copyText(content)
    onToast(ok ? '已复制指令' : '复制失败，请重试')
    setOpen(false)
  }

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(id)
    setShowEditor(true)
    setOpen(false)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('确定要删除该指令吗？')) {
      removeCustomInstruction(id)
    }
  }

  const handleAddNew = () => {
    setEditingId(null)
    setShowEditor(true)
    setOpen(false)
  }

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            open ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <span>🛠️ {UI_LABELS.promptLibrary.customTab}</span>
          {filteredInstructions.length > 0 && (
            <span className="ml-1 flex h-4 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-600">
              {filteredInstructions.length}
            </span>
          )}
        </button>

        {open && (
          <>
            {/* 移动端遮罩 */}
            <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setOpen(false)} />
            <div className="absolute right-0 md:right-0 md:top-full fixed md:absolute top-1/2 left-1/2 md:left-auto md:top-auto -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 mt-2 w-72 max-w-[calc(100vw-32px)] rounded-lg border border-slate-200 bg-white p-2 shadow-xl z-50 origin-center md:origin-top-right">
              <div className="mb-2 flex items-center justify-between px-2 pt-1">
                <span className="text-xs font-semibold text-slate-500">自定义指令管理</span>
                <button
                  onClick={handleAddNew}
                  className="text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  + 新增
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {filteredInstructions.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    暂无自定义指令
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredInstructions.map(inst => (
                      <div
                        key={inst.id}
                        className="group relative flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                        onClick={() => handleCopy(inst.content)}
                        title="点击复制"
                      >
                        <div className="flex flex-col overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: inst.accent }} />
                            <span className="truncate text-[13px] font-medium text-slate-700">{inst.name}</span>
                          </div>
                          {inst.description && (
                            <span className="mt-0.5 truncate pl-4 text-[11px] text-slate-400">{inst.description}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                            onClick={(e) => handleEdit(inst.id, e)}
                            title="修改"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            onClick={(e) => handleDelete(inst.id, e)}
                            title="删除"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowEditor(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <CustomInstructionEditor
              mode={mode}
              editingId={editingId}
              onClose={() => setShowEditor(false)}
              onToast={onToast}
            />
          </div>
        </div>
      )}
    </>
  )
}
