import { useEffect, useRef, useState } from 'react'
import { THEMES, darkenHex } from '@engine/composables/useTheme'
import { Tooltip } from '@/components/ui/Tooltip'
import { useEscapeKey } from '@/lib/useEscapeKey'

interface ThemeProps {
  accent: string
  setTheme: (accent: string, dark: string) => void
}

/** 选中态：双层投影（见 DESIGN.md §5.8） */
const selectedRing = '0 0 0 2px #fff, 0 0 0 4px var(--accent)'

/**
 * 主题色板：预设色网格 + 自定义取色。
 * 桌面端放在 ThemePicker 弹层里，移动端抽屉直接内嵌。
 */
export function ThemeSwatches({ accent, setTheme, large = false }: ThemeProps & { large?: boolean }) {
  const isCustom = !THEMES.some((t) => t.accent.toLowerCase() === accent.toLowerCase())
  const dot = large ? 'h-8 w-8' : 'h-6 w-6'

  // 取色器拖动时会连续触发 onChange，而每次换色都会让预览整体重渲染，这里做一次防抖。
  // draft 让取色器在防抖期间保持受控显示，避免主题色回写时打断正在进行的拖动。
  const [draft, setDraft] = useState(accent)
  useEffect(() => setDraft(accent), [accent])
  const timerRef = useRef<number>()
  useEffect(() => () => window.clearTimeout(timerRef.current), [])
  const handleCustomChange = (hex: string) => {
    setDraft(hex)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setTheme(hex, darkenHex(hex, 0.15)), 200)
  }

  return (
    <div>
      <div className={`grid grid-cols-5 justify-items-center ${large ? 'gap-3' : 'gap-2.5'}`}>
        {THEMES.map((t) => (
          <button
            key={t.accent}
            onClick={() => setTheme(t.accent, t.dark)}
            aria-label={`主题色 ${t.accent}`}
            aria-pressed={accent === t.accent}
            title={t.accent}
            className={`${dot} rounded-full transition-transform hover:scale-110 cursor-pointer`}
            style={{ background: t.accent, boxShadow: accent === t.accent ? selectedRing : 'none' }}
          />
        ))}
      </div>
      <label className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[12px] font-medium text-slate-600 cursor-pointer">
        <span>自定义颜色</span>
        <span
          className={`${dot} relative overflow-hidden rounded-full border border-slate-200`}
          style={{ background: draft, boxShadow: isCustom ? selectedRing : 'none' }}
        >
          <input
            type="color"
            value={draft}
            onChange={(e) => handleCustomChange(e.target.value)}
            aria-label="自定义主题色"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </span>
      </label>
    </div>
  )
}

/** 顶栏主题色入口：一个显示当前主题色的圆点，点击展开色板弹层。 */
export function ThemePicker({ accent, setTheme }: ThemeProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEscapeKey(open, () => setOpen(false))

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <Tooltip position="bottom" text="切换主题色" disabled={open}>
        <button
          onClick={() => setOpen(!open)}
          aria-label="切换主题色"
          aria-expanded={open}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="h-5 w-5 rounded-full shadow-sm" style={{ background: accent }} />
        </button>
      </Tooltip>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[196px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl animate-fade-in">
          <ThemeSwatches accent={accent} setTheme={setTheme} />
        </div>
      )}
    </div>
  )
}
