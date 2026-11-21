import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useEscapeKey } from '@/lib/useEscapeKey'
import { Check, ChevronDown } from '@/components/ui/Icon'

interface ToolbarPopoverProps {
  icon?: ReactNode
  label: string
  /** 弹层内容；传入函数时可拿到 close，用于点选后收起 */
  children: ReactNode | ((close: () => void) => ReactNode)
  /** 弹层与按钮的哪一侧对齐：按钮靠左放时用 left，靠右放时用 right */
  align?: 'left' | 'right'
  panelClassName?: string
}

/**
 * 工具栏上的「按钮 + 弹层」：点击展开，点外部、按 Esc 或焦点进入预览 iframe 时收起。
 */
export function ToolbarPopover({ icon, label, children, align = 'right', panelClassName = 'w-64' }: ToolbarPopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    // 点进预览 iframe 不会在父文档触发 mousedown，但会让窗口失焦
    const handleBlur = () => setOpen(false)
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('blur', handleBlur)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('blur', handleBlur)
    }
  }, [open])

  useEscapeKey(open, close)

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors cursor-pointer ${
          open ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        {icon}
        {label}
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className={`absolute top-full z-50 mt-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName}`}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}

export interface ToolbarMenuAction {
  id: string
  icon?: ReactNode
  label: string
  /** 标签下方的一行说明 */
  hint?: string
  onClick?: () => void
  disabled?: boolean
  /** 传入布尔值时该项作为开关显示勾选状态 */
  checked?: boolean
}

export type ToolbarMenuEntry = ToolbarMenuAction | 'separator'

interface ToolbarMenuProps {
  icon?: ReactNode
  label: string
  entries: ToolbarMenuEntry[]
  align?: 'left' | 'right'
  panelClassName?: string
}

/** 工具栏下拉菜单：每项为「图标 + 名称 + 一行说明」，点选后收起 */
export function ToolbarMenu({ icon, label, entries, align, panelClassName = 'w-72' }: ToolbarMenuProps) {
  return (
    <ToolbarPopover icon={icon} label={label} align={align} panelClassName={panelClassName}>
      {(close) => (
        <div role="menu" aria-label={label}>
          {entries.map((entry, idx) =>
            entry === 'separator' ? (
              <div key={`sep-${idx}`} className="my-1 h-px bg-slate-100" />
            ) : (
              <button
                key={entry.id}
                type="button"
                role={entry.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
                aria-checked={entry.checked}
                disabled={entry.disabled}
                onClick={() => {
                  close()
                  entry.onClick?.()
                }}
                className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors cursor-pointer hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {entry.icon && <span className="mt-0.5 shrink-0 text-slate-500">{entry.icon}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-slate-800">{entry.label}</span>
                  {entry.hint && <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{entry.hint}</span>}
                </span>
                {entry.checked && <Check size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />}
              </button>
            ),
          )}
        </div>
      )}
    </ToolbarPopover>
  )
}
