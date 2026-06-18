import { Button } from './Button'
import { AlertTriangle } from './Icon'

interface MermaidImageHostDialogProps {
  isOpen: boolean
  onClose: () => void
  onDowngrade: () => void
  onConfigure: () => void
}

/**
 * 公众号复制时，未配置图床的 mermaid 图表提醒弹窗。
 * 提供两个选择：降级为代码块，或去配置图床。
 */
export function MermaidImageHostDialog({
  isOpen,
  onClose,
  onDowngrade,
  onConfigure,
}: MermaidImageHostDialogProps) {
  if (!isOpen) return null

  return (
    <div className="m2v-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="m2v-modal" style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* 图标 + 标题 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            流程图无法复制到公众号
          </h3>
        </div>

        {/* 正文 */}
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          当前未配置图床，mermaid 流程图将以 SVG 格式复制，但微信公众号编辑器对 SVG 支持不可靠，可能导致图片显示异常。
        </p>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onDowngrade()
              onClose()
            }}
            className="flex-1"
          >
            降级为代码块
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfigure()
              onClose()
            }}
            className="flex-1"
          >
            配置图床
          </Button>
        </div>
      </div>
    </div>
  )
}
