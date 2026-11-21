import React, { useRef, ChangeEvent } from 'react'
import { EditorView } from '@uiw/react-codemirror'
import { useStore } from '@/lib/store'
import { toolbarGroups } from '@/lib/editor/toolbarConfig'
import { Select } from '@/components/ui/Select'
import { Tooltip } from '@/components/ui/Tooltip'
import { uploadImageFile } from '@/lib/editor/imageStorage'
import { formatMarkdown, describeFormatStats } from '@/lib/editor/formatMarkdown'
import { snapshotBeforeOverwrite } from '@/lib/libraryStore'

interface EditorToolbarProps {
  view: EditorView | null
  mode?: 'article' | 'document' | 'card' | 'html'
  onToast: (msg: string) => void
}

export function EditorToolbar({ view, mode, onToast }: EditorToolbarProps) {
  const imageHostConfig = useStore((s) => s.imageHostConfig)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  // 导入文档处理
  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !view) return

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const allowedMd = ['md', 'txt', 'markdown', 'text']
    const allowedHtml = [...allowedMd, 'html', 'htm']
    const allowed = mode === 'html' ? allowedHtml : allowedMd

    if (!allowed.includes(ext)) {
      const types = mode === 'html' ? '.md, .txt, .html' : '.md, .txt'
      onToast(`不支持的文件类型 .${ext}，请导入 ${types} 格式的文件`)
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      onToast('文件过大，请导入 5MB 以内的文件')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const content = String(reader.result ?? '')
        if (!content.trim()) {
          onToast('文件内容为空，无法导入')
          return
        }
        const doc = view.state.doc.toString()
        // 导入会覆盖全文，先为当前内容存档
        if (mode) snapshotBeforeOverwrite(mode, '导入文件前')
        view.dispatch({ changes: { from: 0, to: doc.length, insert: content } })
        view.focus()
        onToast(`已导入: ${file.name}`)
      } catch {
        onToast('文件解析失败，请检查文件格式是否正确')
      }
    }
    reader.onerror = () => {
      onToast('文件读取失败，请重试')
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  // 格式化文档：只做不改变语义的整理，整体作为一次编辑写回，可用 Ctrl+Z 撤销
  const handleFormat = () => {
    if (!view) return
    const doc = view.state.doc.toString()
    const { text, stats, changed } = formatMarkdown(doc)
    if (!changed) {
      onToast('文档格式已规范，无需调整')
      return
    }
    view.dispatch({ changes: { from: 0, to: doc.length, insert: text } })
    view.focus()
    onToast(`已格式化：${describeFormatStats(stats) || '整理首尾空行'}（可按 Ctrl+Z 撤销）`)
  }

  // 快捷插入分页标识
  const handleInsertPageBreak = () => {
    if (!view) return
    const insertText = '\n<page-break/>\n'
    const { from, to } = view.state.selection.main
    view.dispatch({
      changes: { from, to, insert: insertText },
      selection: { anchor: from + insertText.length },
    })
    view.focus()
  }

  // 处理图片选择与上传流程
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !view) return

    try {
      const url = await uploadImageFile(file, imageHostConfig)

      // 插入 Markdown 语法
      const before = `![${file.name.split('.')[0]}](${url})`
      const { from, to } = view.state.selection.main
      view.dispatch({
        changes: { from, to, insert: before },
        selection: { anchor: from + before.length },
      })
    } catch (err) {
      console.error(err)
      onToast(`图片上传失败: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      e.target.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50/80 px-5 py-2.5 min-h-[52px] select-none text-slate-600">
      {/* 导入文档按钮（最左侧） */}
      <Tooltip position="bottom" text="导入文档">
        <button
          onClick={() => importInputRef.current?.click()}
          aria-label="导入文档"
          className="flex items-center justify-center rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer text-slate-600"
        >
          <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <polyline points="9 15 12 12 15 15"/>
            </svg>
          </span>
        </button>
      </Tooltip>
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportFile}
        accept={mode === 'html' ? '.md,.txt,.html,.htm' : '.md,.txt,.markdown,.text'}
        className="hidden"
        aria-label="导入文档"
      />

      <div className="w-px h-4 bg-slate-300 mx-1 hidden sm:block" />

      {toolbarGroups.map((group, groupIdx) => (
        <React.Fragment key={group.id}>
          {group.type === 'buttons' ? (
            <div className="flex flex-wrap items-center gap-1">
              {group.items.map((item) => (
                <Tooltip key={item.id} position="bottom" text={`${item.label} ${item.shortcut ? '(' + item.shortcut + ')' : ''}`}>
                  <button
                    onClick={() => {
                      if (view) item.action(view)
                    }}
                    aria-label={item.label}
                    className="flex items-center justify-center rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">{item.icon}</span>
                  </button>
                </Tooltip>
              ))}
            </div>
          ) : (
            <Select
              className="w-32"
              value=""
              onChange={(e) => {
                const val = e.target.value
                const item = group.items.find((i) => i.id === val)
                if (item && view) {
                  item.action(view)
                  // focus after execution
                  view.focus()
                }
                // 恢复默认选中空状态
                e.target.value = ''
              }}
              title={group.name}
            >
              <option value="" disabled className="text-slate-400">
                {group.name}
              </option>
              {group.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} {item.shortcut ? `(${item.shortcut})` : ''}
                </option>
              ))}
            </Select>
          )}

          {/* 分隔线 */}
          {groupIdx < toolbarGroups.length - 1 && group.type === 'buttons' && (
            <div className="w-px h-4 bg-slate-300 mx-1 hidden sm:block" />
          )}
        </React.Fragment>
      ))}

      {/* 附加：图片与分页操作 */}
      <div className="w-px h-4 bg-slate-300 mx-1 hidden sm:block" />
      <div className="flex items-center gap-1">
        {(mode === 'document' || mode === 'card') && (
          <Tooltip position="bottom" text="插入分页标识 <page-break/>">
            <button
              onClick={handleInsertPageBreak}
              aria-label="插入分页标识"
              className="flex items-center justify-center rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer text-slate-600"
            >
              <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="3" y1="14" x2="21" y2="14" strokeDasharray="3 3"></line>
                </svg>
              </span>
            </button>
          </Tooltip>
        )}

        <Tooltip position="bottom" text="格式化文档：组件标签去缩进、整理空行与行尾空白、补全未闭合的代码块">
          <button
            onClick={handleFormat}
            aria-label="格式化文档"
            className="flex items-center justify-center rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer text-slate-600"
          >
            <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="15" y1="12" x2="3" y2="12"></line>
                <line x1="17" y1="18" x2="3" y2="18"></line>
              </svg>
            </span>
          </button>
        </Tooltip>

        <Tooltip position="bottom" text="上传图片">
          <button
            onClick={triggerFileSelect}
            aria-label="上传图片"
            className="flex items-center justify-center rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer text-slate-600"
          >
            <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </span>
          </button>
        </Tooltip>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          aria-label="上传图片"
        />
      </div>
    </div>
  )
}
