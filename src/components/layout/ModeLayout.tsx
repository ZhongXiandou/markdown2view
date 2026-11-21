import { useRef, useState, type ReactNode, type PointerEvent, type KeyboardEvent } from 'react'
import { useStore } from '@/lib/store'
import { clampEditorSplit, EDITOR_SPLIT_MAX, EDITOR_SPLIT_MIN } from '@/lib/appStore'

export type MobileView = 'edit' | 'preview'

interface ModeLayoutProps {
  /** 编辑器区域 */
  editor: ReactNode
  /** 预览区域 */
  preview: ReactNode
  /** 可选：预览区顶部工具栏 */
  toolbar?: ReactNode
  /** 外层容器额外 className */
  className?: string
  /** 编辑器区域额外 className */
  editorClassName?: string
  /** 预览区域额外 className */
  previewClassName?: string
  /** 受控的移动端当前视图；不传则内部管理 */
  activeView?: MobileView
  /** 受控时的切换回调 */
  onActiveViewChange?: (view: MobileView) => void
  /** Tab 按钮文案 */
  editLabel?: string
  previewLabel?: string
}

/**
 * 通用模式布局：移动端「编辑/预览」Tab + 桌面端左右分栏。
 *
 * 统一处理响应式布局与视图切换，各模式组件只需关注编辑器、预览内容与工具栏。
 */
export function ModeLayout({
  editor,
  preview,
  toolbar,
  className = '',
  editorClassName = '',
  previewClassName = '',
  activeView: controlledView,
  onActiveViewChange,
  editLabel = '编辑内容',
  previewLabel = '实时预览',
}: ModeLayoutProps) {
  const [internalView, setInternalView] = useState<MobileView>('edit')
  const activeView = controlledView ?? internalView
  const setActiveView = onActiveViewChange ?? setInternalView

  // 桌面端分栏比例：拖拽过程中只改本地状态，松手后写入 store 持久化
  const storedSplit = useStore((s) => s.editorSplit)
  const setStoredSplit = useStore((s) => s.setEditorSplit)
  const [dragSplit, setDragSplit] = useState<number | null>(null)
  const split = dragSplit ?? storedSplit
  const gridRef = useRef<HTMLDivElement>(null)

  const ratioFromPointer = (clientX: number) => {
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return storedSplit
    return clampEditorSplit((clientX - rect.left) / rect.width)
  }

  const handleDividerPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    // 捕获指针：拖到预览区的 iframe 上方时事件仍然发给分隔条
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragSplit(ratioFromPointer(e.clientX))
  }
  const handleDividerPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragSplit === null) return
    setDragSplit(ratioFromPointer(e.clientX))
  }
  const handleDividerPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragSplit === null) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    setStoredSplit(dragSplit)
    setDragSplit(null)
  }
  const handleDividerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') setStoredSplit(storedSplit - 0.02)
    else if (e.key === 'ArrowRight') setStoredSplit(storedSplit + 0.02)
    else if (e.key === 'Home') setStoredSplit(0.5)
    else return
    e.preventDefault()
  }

  return (
    <main className={`flex flex-col min-h-0 flex-1 bg-slate-200 ${className}`}>
      {/* 移动端视图切换 Tab */}
      <div className="flex shrink-0 border-b border-slate-200 bg-white md:hidden">
        <button
          type="button"
          onClick={() => setActiveView('edit')}
          className={`flex-1 py-3 text-center text-[13px] font-bold transition-all cursor-pointer ${
            activeView === 'edit'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-slate-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {editLabel}
        </button>
        <button
          type="button"
          onClick={() => setActiveView('preview')}
          className={`flex-1 py-3 text-center text-[13px] font-bold transition-all cursor-pointer ${
            activeView === 'preview'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-slate-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {previewLabel}
        </button>
      </div>

      <div
        ref={gridRef}
        className={`mode-split-grid grid min-h-0 flex-1 grid-cols-1 bg-slate-200 ${dragSplit !== null ? 'select-none' : ''}`}
        style={{ '--m2v-split': `${(split * 100).toFixed(2)}%` } as React.CSSProperties}
      >
        <section
          className={`min-h-0 overflow-hidden bg-white flex flex-col ${editorClassName} ${
            activeView === 'edit' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {editor}
        </section>
        {/* 分隔条：拖拽调整左右宽度，双击恢复均分；仅桌面端显示 */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调整编辑区与预览区宽度"
          aria-valuemin={Math.round(EDITOR_SPLIT_MIN * 100)}
          aria-valuemax={Math.round(EDITOR_SPLIT_MAX * 100)}
          aria-valuenow={Math.round(split * 100)}
          tabIndex={0}
          title="拖拽调整宽度，双击恢复均分"
          onPointerDown={handleDividerPointerDown}
          onPointerMove={handleDividerPointerMove}
          onPointerUp={handleDividerPointerUp}
          onPointerCancel={handleDividerPointerUp}
          onDoubleClick={() => setStoredSplit(0.5)}
          onKeyDown={handleDividerKeyDown}
          className={`mode-split-divider hidden md:block cursor-col-resize touch-none outline-none transition-colors hover:bg-[var(--accent)] focus-visible:bg-[var(--accent)] ${
            dragSplit !== null ? 'bg-[var(--accent)]' : 'bg-slate-200'
          }`}
        />
        <section
          className={`min-h-0 overflow-hidden flex flex-col relative ${previewClassName} ${
            activeView === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {toolbar}
          {preview}
        </section>
      </div>
    </main>
  )
}
