import { Select, type SelectProps } from './Select'
import type { FontFamilyOption } from '@/lib/fonts'

const FONT_OPTIONS: { value: FontFamilyOption; label: string }[] = [
  { value: 'songti', label: '宋体' },
  { value: 'fangsong', label: '仿宋' },
  { value: 'heiti', label: '黑体' },
  { value: 'lxgwwenkai', label: '霞鹜文楷' },
]

interface FontSelectProps extends Omit<SelectProps, 'children' | 'value' | 'onChange'> {
  value: FontFamilyOption
  onChange: (value: FontFamilyOption) => void
}

/**
 * 字体族选择下拉框：宋体 / 仿宋 / 黑体 / 霞鹜文楷。
 * 供 ArticleMode、DocumentMode、CardMode 共用。
 */
export function FontSelect({ value, onChange, ...rest }: FontSelectProps) {
  return (
    <Select
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value as FontFamilyOption)}
    >
      {FONT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  )
}
