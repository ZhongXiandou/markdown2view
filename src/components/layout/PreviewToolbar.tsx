import React from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'

export interface ToolbarAction {
  id: string
  icon?: React.ReactNode
  label: string
  tooltip?: string
  onClick?: () => void
  variant?: 'outline' | 'primary' | 'ghost'
  disabled?: boolean
  className?: string
  /** 当单纯的按钮无法满足需求时，可传入自定义节点（如复选框） */
  node?: React.ReactNode
}

export type ToolbarItem = ToolbarAction | 'separator'

interface PreviewToolbarProps {
  /** 左侧展示区（比如：面包屑、信息提示等） */
  leftContent?: React.ReactNode
  /** 右侧操作按钮组 */
  actions: ToolbarItem[]
  className?: string
}

export function PreviewToolbar({ leftContent, actions, className = '' }: PreviewToolbarProps) {
  return (
    <div className={`preview-toolbar sticky top-0 z-10 flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-b border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur md:px-5 ${className}`}>
      {leftContent}
      {leftContent && actions.length > 0 && (
        <div className="w-px h-4 bg-slate-200 shrink-0 hidden sm:block" />
      )}
      {actions.map((action, idx) => {
        if (action === 'separator') {
          return <div key={`sep-${idx}`} className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />
        }

        if (action.node) {
          return (
            <React.Fragment key={action.id}>
              {action.tooltip ? (
                <Tooltip position="bottom" text={action.tooltip}>
                  {action.node}
                </Tooltip>
              ) : (
                action.node
              )}
            </React.Fragment>
          )
        }

        const btn = (
          <Button
            key={action.id}
            variant={action.variant || 'ghost'}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.className}
          >
            {action.icon && <span className="mr-1 flex items-center">{action.icon}</span>}
            {action.label}
          </Button>
        )

        if (action.tooltip) {
          return (
            <Tooltip key={action.id} position="bottom" text={action.tooltip}>
              {btn}
            </Tooltip>
          )
        }

        return btn
      })}
    </div>
  )
}
