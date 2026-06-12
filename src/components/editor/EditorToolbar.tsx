import React, { useRef, ChangeEvent } from 'react'
import { EditorView } from '@uiw/react-codemirror'
import { useStore } from '@/lib/store'
import { toolbarGroups } from '@/lib/editor/toolbarConfig'
import { Select } from '@/components/ui/Select'
import { uploadImageFile } from '@/lib/editor/imageStorage'

interface EditorToolbarProps {
  view: EditorView | null
}

export function EditorToolbar({ view }: EditorToolbarProps) {
  const imageHostConfig = useStore((s) => s.imageHostConfig)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      alert(`图片上传失败: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      e.target.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50/80 px-5 py-2.5 min-h-[52px] select-none text-slate-600">
      {toolbarGroups.map((group, groupIdx) => (
        <React.Fragment key={group.id}>
          {group.type === 'buttons' ? (
            <div className="flex flex-wrap items-center gap-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (view) item.action(view)
                  }}
                  className="flex items-center justify-center rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  title={`${item.label} ${item.shortcut ? '(' + item.shortcut + ')' : ''}`}
                >
                  <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">{item.icon}</span>
                </button>
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

      {/* 附加：图片上传功能 */}
      <div className="w-px h-4 bg-slate-300 mx-1 hidden sm:block" />
      <div className="flex items-center gap-1">
        <button
          onClick={triggerFileSelect}
          className="flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[13px] hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
          title="上传图片"
        >
          <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  )
}
