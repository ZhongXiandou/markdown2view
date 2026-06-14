import type { RenderMode } from '@/lib/store'
import { THEMES } from '@engine/composables/useTheme'

/** 抽屉内功能按钮统一样式 */
function DrawerButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-colors cursor-pointer"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: RenderMode
  setMode: (mode: RenderMode) => void
  accent: string
  setTheme: (accent: string, dark: string) => void
  onTriggerGuide: () => void
  onOpenSettings: () => void
  onOpenPrivacy: () => void
  onRestoreDemo: () => void
}

const MODES: { key: RenderMode; label: string; icon: string }[] = [
  { key: 'document', label: 'A4 规范文档', icon: '📄' },
  { key: 'article', label: '长图文排版', icon: '📚' },
  { key: 'card', label: '分页图文卡', icon: '🖼️' },
  { key: 'html', label: '自由画布', icon: '🎨' },
]

export function MobileDrawer({
  isOpen,
  onClose,
  mode,
  setMode,
  accent,
  setTheme,
  onTriggerGuide,
  onOpenSettings,
  onOpenPrivacy,
  onRestoreDemo,
}: MobileDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      {/* 遮罩点击关闭 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 抽屉面板 */}
      <div className="relative w-80 max-w-full h-full bg-white shadow-2xl flex flex-col p-6 animate-slide-in-right overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="app-logo-bg flex h-6 w-6 items-center justify-center rounded-md text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>
            </div>
            <span className="font-bold text-slate-800 text-[15px]">markdown2view</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="关闭菜单"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* 模块模式切换卡片区 */}
        <div className="mb-6">
          <div className="mb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">切换场景模式</div>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => {
              const active = mode === m.key
              return (
                <button
                  key={m.key}
                  onClick={() => {
                    setMode(m.key)
                    onClose()
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    active
                      ? 'border-[var(--accent)] bg-emerald-50/30 text-[var(--accent)] font-semibold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[20px] mb-1.5">{m.icon}</span>
                  <span className="text-[12px]">{m.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 功能列表 */}
        <div className="space-y-3 mb-6 flex-1">
          <div className="mb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">系统功能</div>

          <DrawerButton
            icon="❓"
            label="查看使用帮助"
            onClick={() => { onClose(); onTriggerGuide() }}
          />
          <DrawerButton
            icon="⚙️"
            label="图床参数配置"
            onClick={() => { onClose(); onOpenSettings() }}
          />
          <DrawerButton
            icon="🔄"
            label="恢复当前示例内容"
            onClick={() => { onClose(); onRestoreDemo() }}
          />
          <DrawerButton
            icon="🛡️"
            label="隐私与安全说明"
            onClick={() => { onClose(); onOpenPrivacy() }}
          />
        </div>

        {/* 主题色切换 */}
        <div className="border-t border-slate-100 pt-5 mb-6">
          <div className="mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">切换系统主题色</div>
          <div className="flex items-center gap-3 justify-center">
            {THEMES.map((t) => (
              <button
                key={t.accent}
                title={t.accent}
                onClick={() => setTheme(t.accent, t.dark)}
                className="h-8 w-8 rounded-full border transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
                style={{
                  background: t.accent,
                  borderColor: accent === t.accent ? '#111' : 'transparent',
                  boxShadow: accent === t.accent ? '0 0 0 2px #fff, 0 0 0 4px var(--accent)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* 关于与外链 */}
        <div className="border-t border-slate-100 pt-5 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <a
              href="https://github.com/ZhongXiandou/markdown2view"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              GitHub 仓库
            </a>
            <span className="text-slate-300">|</span>
            <a
              href="https://www.beeeffy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              作者网站 BeeEffy
            </a>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            本项目为 100% 纯前端开源工具<br />所有编辑数据均存储在您的本地浏览器中 🛡️
          </div>
        </div>
      </div>
    </div>
  )
}
