import type { RenderMode } from '@/lib/store'
import { MODE_LABELS } from '@/lib/uiLabels'

interface ModeItem {
  key: RenderMode
  label: string
}

const MODES: ModeItem[] = [
  { key: 'document', label: MODE_LABELS.document },
  { key: 'article', label: MODE_LABELS.article },
  { key: 'card', label: MODE_LABELS.card },
  { key: 'html', label: MODE_LABELS.html },
]

export function ModeTabs({
  mode,
  onChange,
}: {
  mode: RenderMode
  onChange: (m: RenderMode) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200/60">
      {MODES.map((m) => {
        const active = mode === m.key
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            title={m.label}
            className={`relative rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
              active ? 'bg-white text-[var(--accent)] shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
