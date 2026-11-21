import React from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { ToolbarMenu, type ToolbarMenuEntry } from './ToolbarPopover'

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

/** 下拉菜单项：把一组次要操作收进一个按钮 */
export interface ToolbarMenuItem {
  id: string
  icon?: React.ReactNode
  label: string
  menu: ToolbarMenuEntry[]
}

export type ToolbarItem = ToolbarAction | ToolbarMenuItem | 'separator'

interface PreviewToolbarProps {
  /** 左侧操作组（准备类：指令、视图控制） */
  leftActions?: ToolbarItem[]
  /** 左侧自定义内容（比如：版式设置、状态提示），排在 leftActions 之后 */
  leftContent?: React.ReactNode
  /** 右侧操作组（输出类：导出、复制） */
  actions: ToolbarItem[]
  className?: string
}

function renderItem(action: ToolbarItem, idx: number, align: 'left' | 'right') {
  if (action === 'separator') {
    return <div key={`sep-${idx}`} className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />
  }

  if ('menu' in action) {
    return <ToolbarMenu key={action.id} icon={action.icon} label={action.label} entries={action.menu} align={align} />
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
      className={`shrink-0 ${action.className ?? ''}`}
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
}

/**
 * 预览区工具栏：左侧放准备类操作，右侧放输出类操作，正常宽度下保持单行。
 */
export function PreviewToolbar({ leftActions, leftContent, actions, className = '' }: PreviewToolbarProps) {
  const hasLeft = Boolean(leftContent) || Boolean(leftActions?.length)
  return (
    <div className={`preview-toolbar sticky top-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur ${className}`}>
      {hasLeft && (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {leftActions?.map((action, idx) => renderItem(action, idx, 'left'))}
          {leftContent}
        </div>
      )}
      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-1 gap-y-2">
        {actions.map((action, idx) => renderItem(action, idx, 'right'))}
      </div>
    </div>
  )
}
