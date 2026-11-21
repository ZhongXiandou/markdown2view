import { Select } from './Select'
import { MODE_LABELS } from '@/lib/uiLabels'
import type { MaterialSource } from '@/lib/promptMaterial'

interface MaterialSelectProps {
  value: MaterialSource | ''
  options: MaterialSource[]
  onChange: (value: MaterialSource | '') => void
  className?: string
}

/** 「附带素材」下拉：复制指令时把另一模式的当前内容作为原稿一并带上 */
export function MaterialSelect({ value, options, onChange, className }: MaterialSelectProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as MaterialSource | '')}
      aria-label="复制指令时附带素材"
      className={className}
    >
      <option value="">不附带素材</option>
      {options.map((s) => (
        <option key={s} value={s}>
          附带「{MODE_LABELS[s]}」内容
        </option>
      ))}
    </Select>
  )
}
