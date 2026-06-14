import { useRef, useEffect, useState } from 'react'
import type { RenderMode } from '@/lib/store'
import { ModeTabs } from '@/components/layout/ModeTabs'
import { THEMES } from '@engine/composables/useTheme'
import { HeaderMoreMenu } from '@/components/layout/HeaderMoreMenu'

interface AppHeaderProps {
  mode: RenderMode
  setMode: (mode: RenderMode) => void
  accent: string
  setTheme: (accent: string, dark: string) => void
  onOpenSettings: () => void
  onRestoreDemo: () => void
  onTriggerGuide: () => void
  onOpenMobileMenu: () => void
  onWidthChange: (width: number) => void
}

export function AppHeader({
  mode,
  setMode,
  accent,
  setTheme,
  onOpenSettings,
  onRestoreDemo,
  onTriggerGuide,
  onOpenMobileMenu,
  onWidthChange,
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
      </div>

      {headerWidth >= 960 ? (
        <div className="flex items-center gap-4">
          {headerWidth >= 1300 && (
            <a
              href="https://www.beeeffy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="作者的另一个项目：BeeEffy——个人AI待办与复盘成长系统"
            >
              <svg width="48" height="14" viewBox="0 0 77.63 21.69" fill="none" stroke="currentColor" className="shrink-0">
                <circle cx="10.84" cy="10.84" r="10.84" fill="currentColor" stroke="none" />
                <circle cx="35.1" cy="10.84" r="10.84" fill="currentColor" stroke="none" opacity="0.45" />
                <circle cx="66.79" cy="10.84" r="10.84" fill="currentColor" stroke="none" opacity="0.45" />
                <path d="M50.74 1.97 L62.55 10.84 L50.74 19.72" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M64.32 1.97 L76.13 10.84 L64.32 19.72" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
              </svg>
              {headerWidth >= 1450 && <span>BeeEffy</span>}
            </a>
          )}

          {headerWidth >= 1300 && <div className="w-px h-4 bg-slate-200" />}

          <a
            href="https://github.com/ZhongXiandou/markdown2view"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="完全开源的纯前端项目，数据不传输至服务器。访问 GitHub 源码仓库"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>

          <button
            onClick={onTriggerGuide}
            className="flex items-center rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="查看使用帮助"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </button>

          <div className="w-px h-4 bg-slate-200" />

          {headerWidth >= 1300 && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="图床设置 (配置图片上传与云存储参数)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              {headerWidth >= 1450 && <span>图床设置</span>}
            </button>
          )}

          {headerWidth >= 1300 && <div className="w-px h-4 bg-slate-200" />}

          {headerWidth >= 1300 && (
            <button
              onClick={onRestoreDemo}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="恢复当前模块的示例内容"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              {headerWidth >= 1450 && <span>恢复示例</span>}
            </button>
          )}

          {headerWidth >= 1300 && <div className="w-px h-4 bg-slate-200" />}

          <div className="flex items-center gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.accent}
                title={t.accent}
                onClick={() => setTheme(t.accent, t.dark)}
                className="h-5 w-5 rounded-full border transition-transform hover:scale-110 cursor-pointer"
                style={{
                  background: t.accent,
                  borderColor: accent === t.accent ? '#111' : 'transparent',
                  outline: accent === t.accent ? '2px solid #1118' : 'none',
                }}
              />
            ))}
          </div>

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
