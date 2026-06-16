import { useState, useRef, useEffect } from 'react'
import { Rocket, Settings, RotateCcw } from '@/components/ui/Icon'

interface HeaderMoreMenuProps {
  onOpenSettings: () => void
  onRestoreDemo: () => void
}

export function HeaderMoreMenu({ onOpenSettings, onRestoreDemo }: HeaderMoreMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors cursor-pointer ${
          open ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-100 hover:text-slate-800'
        }`}
        title="更多操作"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>

      {open && (
        <>
          {/* 背景遮罩 */}
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpen(false)} />
          
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl z-50 origin-top-right animate-fade-in">
            <a
              href="https://www.beeeffy.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Rocket size={14} />
              <span>访问 BeeEffy</span>
            </a>
            
            <button
              onClick={() => {
                setOpen(false)
                onOpenSettings()
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Settings size={14} />
              <span>图床设置</span>
            </button>

            <button
              onClick={() => {
                setOpen(false)
                onRestoreDemo()
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>恢复示例</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
