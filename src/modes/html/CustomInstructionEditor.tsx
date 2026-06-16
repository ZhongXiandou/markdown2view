import { useState } from 'react'
import type { CustomInstruction, RenderMode } from '@/lib/store'
import { useStore } from '@/lib/store'
import { OUTPUT_TYPES, VISUAL_TONES, type OutputType, type VisualTone, type DesignStyle } from '@/data/designPrompts'

interface CustomInstructionEditorProps {
  mode: RenderMode
  /** 编辑已有指令时传入 id */
  editingId?: string | null
  /** 从内置风格克隆时传入 */
  cloneFromStyle?: DesignStyle | null
  onClose: () => void
  onToast: (msg: string) => void
}

export function CustomInstructionEditor({ mode, editingId, cloneFromStyle, onClose, onToast }: CustomInstructionEditorProps) {
  const customInstructions = useStore((s) => s.customInstructions)
  const addInstruction = useStore((s) => s.addCustomInstruction)
  const updateInstruction = useStore((s) => s.updateCustomInstruction)

  const existing = editingId ? customInstructions.find((i) => i.id === editingId) : null

  const [name, setName] = useState(existing?.name ?? cloneFromStyle?.name ?? '')
  const [content, setContent] = useState(existing?.content ?? cloneFromStyle?.style ?? '')
  const [accent, setAccent] = useState(existing?.accent ?? cloneFromStyle?.accent ?? '#6366f1')
  const [description, setDescription] = useState(existing?.description ?? cloneFromStyle?.description ?? '')
  const [outputType, setOutputType] = useState<OutputType>(existing?.outputType ?? cloneFromStyle?.outputType ?? '长页')
  const [visualTone, setVisualTone] = useState<VisualTone>(existing?.visualTone ?? cloneFromStyle?.visualTone ?? '极简')

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return
    const data = { name: name.trim(), content: content.trim(), accent, description: description.trim(), outputType, visualTone, mode }

    if (editingId && existing) {
      updateInstruction(editingId, data)
      onClose()
    } else {
      const ok = addInstruction(data)
      if (ok) {
        onClose()
      } else {
        onToast('自定义指令已达上限 (50条)，请先删除部分旧指令再保存。')
      }
    }
  }

  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(accent)

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-[15px] font-bold text-slate-800">
        {editingId ? '编辑自定义指令' : '新增自定义指令'}
      </h3>

      {/* 名称 */}
      <div>
        <label className="mb-1 block text-[12px] font-semibold text-slate-500">指令名称 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如：科技蓝色商务风"
          maxLength={50}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
        />
      </div>

      {/* 简短描述 */}
      <div>
        <label className="mb-1 block text-[12px] font-semibold text-slate-500">简短描述</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="一句话描述这个风格的特点"
          maxLength={100}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
        />
      </div>

      {/* 强调色 + 输出类型 + 视觉气质 */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-slate-500">强调色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={isValidHex ? accent : '#6366f1'}
              onChange={(e) => setAccent(e.target.value)}
              aria-label="强调色选择器"
              className="h-9 w-9 cursor-pointer rounded border border-slate-200"
            />
            <input
              type="text"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              aria-label="强调色十六进制值"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[13px] font-mono text-slate-700 focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-slate-500">输出类型</label>
          <select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as OutputType)}
            aria-label="输出类型"
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[13px] text-slate-700 focus:border-[var(--accent)] focus:outline-none"
          >
            {OUTPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-slate-500">视觉气质</label>
          <select
            value={visualTone}
            onChange={(e) => setVisualTone(e.target.value as VisualTone)}
            aria-label="视觉气质"
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[13px] text-slate-700 focus:border-[var(--accent)] focus:outline-none"
          >
            {VISUAL_TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* 指令内容 */}
      <div>
        <label className="mb-1 block text-[12px] font-semibold text-slate-500">
          指令内容 * <span className="font-normal text-slate-400">（设计系统令牌描述，最多 5000 字符）</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 5000))}
          rows={10}
          placeholder="在此输入你的设计系统令牌描述，如：&#10;【视觉主题】...&#10;【色彩系统】...&#10;【排版规则】..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-800 font-mono placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 resize-y"
        />
        <div className="mt-1 text-right text-[11px] text-slate-400">{content.length} / 5000</div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || !content.trim()}
          className="rounded-lg px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {editingId ? '保存修改' : '保存指令'}
        </button>
      </div>
    </div>
  )
}
