import { createPortal } from 'react-dom'
import { Button } from './Button'
import { useEscapeKey } from '@/lib/useEscapeKey'

interface ConfirmDialogProps {
  open: boolean
  title: string
  /** 补充说明（如操作后果） */
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * 统一确认弹窗，替代原生 window.confirm。
 * 通过 Portal 渲染到 body：调用方可能位于带 backdrop-filter 的工具栏内，
 * 那会让 fixed 定位相对工具栏而非视口。
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确定',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEscapeKey(open, onCancel)

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-slate-100 bg-white p-6 shadow-2xl">
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        {message && <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{message}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
