import { useRef, useEffect, useState } from 'react'
import type { RenderMode } from '@/lib/store'
import { ModeTabs } from '@/components/layout/ModeTabs'
import { ThemePicker } from '@/components/layout/ThemePicker'
import { DocLibraryMenu } from '@/components/layout/DocLibraryMenu'
import { HeaderMoreMenu } from '@/components/layout/HeaderMoreMenu'
import { Tooltip } from '@/components/ui/Tooltip'
import { Shield } from '@/components/ui/Icon'

interface AppHeaderProps {
  mode: RenderMode
  setMode: (mode: RenderMode) => void
  accent: string
  setTheme: (accent: string, dark: string) => void
  onOpenSettings: () => void
  onOpenPrivacy: () => void
  onRestoreDemo: () => void
  onTriggerGuide: () => void
  onOpenMobileMenu: () => void
  onWidthChange: (width: number) => void
  onToast: (msg: string) => void
}

export function AppHeader({
  mode,
  setMode,
  accent,
  setTheme,
  onOpenSettings,
  onOpenPrivacy,
  onRestoreDemo,
  onTriggerGuide,
  onOpenMobileMenu,
  onWidthChange,
  onToast,
}: AppHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerWidth, setHeaderWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  )

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      setHeaderWidth(rect.width)
      onWidthChange(rect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onWidthChange])

  return (
    <header
      ref={headerRef}
      className="app-header relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm"
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="app-logo-bg flex h-7 w-7 items-center justify-center rounded-md text-white shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
          </div>
          {headerWidth >= 1300 ? (
            <h1 className="text-[17px] font-bold tracking-tight text-slate-800">
              markdown<span className="app-title-accent">2</span>view
            </h1>
          ) : (
            <h1 className="text-[17px] font-bold tracking-tight text-slate-800">
              m2v
            </h1>
          )}
        </div>
        {headerWidth >= 960 && (
          <ModeTabs mode={mode} onChange={setMode} />
        )}
        {headerWidth >= 960 && <DocLibraryMenu key={mode} mode={mode} onToast={onToast} />}
      </div>

      {headerWidth >= 960 ? (
        <div className="flex items-center gap-4">
          <Tooltip position="bottom" text="完全开源的纯前端项目，数据不传输至服务器。访问 GitHub 源码仓库">
            <a
              href="https://github.com/ZhongXiandou/markdown2view"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 源码仓库"
              className="flex items-center rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
            <svg width="14" height="14" viewBox="0 0 98 96" fill="currentColor" className="shrink-0">
              <path d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252V91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 0 48.9043 0C21.8203 0 0 22.1074 0 49.1914C0 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008V83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z" />
            </svg>
            </a>
          </Tooltip>

          <Tooltip position="bottom" text="查看使用帮助">
            <button
              onClick={onTriggerGuide}
              aria-label="查看使用帮助"
              className="flex items-center rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            </button>
          </Tooltip>

          <Tooltip position="bottom" text="隐私与安全说明">
            <button
              onClick={onOpenPrivacy}
              aria-label="隐私与安全说明"
              className="flex items-center rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Shield size={14} className="shrink-0" />
            </button>
          </Tooltip>

          <div className="w-px h-4 bg-slate-200" />

          {headerWidth >= 1300 && (
            <Tooltip position="bottom" text="图床设置（配置图片上传与云存储参数）">
              <button
                onClick={onOpenSettings}
                aria-label="图床设置"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {headerWidth >= 1450 && <span>图床设置</span>}
              </button>
            </Tooltip>
          )}

          {headerWidth >= 1300 && <div className="w-px h-4 bg-slate-200" />}

          {headerWidth >= 1300 && (
            <Tooltip position="bottom" text="恢复当前模块的示例内容">
              <button
                onClick={onRestoreDemo}
                aria-label="恢复示例"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              {headerWidth >= 1450 && <span>恢复示例</span>}
              </button>
            </Tooltip>
          )}

          {headerWidth >= 1300 && <div className="w-px h-4 bg-slate-200" />}

          <ThemePicker accent={accent} setTheme={setTheme} />

          {headerWidth < 1300 && <div className="w-px h-4 bg-slate-200" />}

          {headerWidth < 1300 && (
            <HeaderMoreMenu
              onOpenSettings={onOpenSettings}
              onRestoreDemo={onRestoreDemo}
            />
          )}
        </div>
      ) : null}

      {headerWidth < 960 && (
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          title="更多菜单"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
    </header>
  )
}
