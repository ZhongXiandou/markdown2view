import { useState, useMemo } from 'react'
import { DOC_TEMPLATES, fillTemplateSkeleton, type DocTemplate, type TemplateField } from './docTemplates'
import { copyText } from '@/lib/clipboard'
import { useEscapeKey } from '@/lib/useEscapeKey'

interface DocTemplateDialogProps {
  open: boolean
  onClose: () => void
  onApply: (markdown: string) => void
  onToast?: (msg: string) => void
}

export function DocTemplateDialog({ open, onClose, onApply, onToast }: DocTemplateDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  const filledMarkdown = useMemo(() => {
    if (!selectedTemplate) return ''
    return fillTemplateSkeleton(selectedTemplate, fieldValues)
  }, [selectedTemplate, fieldValues])

  const handleSelectTemplate = (template: DocTemplate) => {
    setSelectedTemplate(template)
    const defaults: Record<string, string> = {}
    template.fields.forEach((f) => {
      if (f.defaultValue) defaults[f.key] = f.defaultValue
    })
    setFieldValues(defaults)
  }

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApply(filledMarkdown)
    onClose()
    onToast?.('已应用模板到编辑器')
  }

  const handleCopy = async () => {
    const ok = await copyText(filledMarkdown)
    onToast?.(ok ? '已复制模板内容' : '复制失败，请重试')
  }

  useEscapeKey(open, onClose)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-[90vw] max-w-[800px] flex-col rounded-xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">文档模板</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 shrink-0 border-r border-slate-200 bg-slate-50 p-3 overflow-y-auto">
            <div className="mb-2 text-xs font-semibold text-slate-400">选择模板</div>
            {DOC_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`mb-2 w-full rounded-lg p-3 text-left transition-colors ${
                  selectedTemplate?.id === t.id
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm font-semibold">{t.name}</div>
                <div className={`mt-1 text-xs ${selectedTemplate?.id === t.id ? 'text-white/80' : 'text-slate-500'}`}>
                  {t.category}
                </div>
              </button>
            ))}
          </div>

          {selectedTemplate ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b border-slate-200 p-4 overflow-y-auto" style={{ maxHeight: '40vh' }}>
                <div className="mb-3 text-sm font-semibold text-slate-700">{selectedTemplate.description}</div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedTemplate.fields.map((field) => (
                    <FieldInput
                      key={field.key}
                      field={field}
                      value={fieldValues[field.key] ?? ''}
                      onChange={(v) => handleFieldChange(field.key, v)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-slate-50 p-4">
                <div className="mb-2 text-xs font-semibold text-slate-400">Markdown 预览</div>
                <pre className="rounded-lg bg-white p-3 text-xs text-slate-700 whitespace-pre-wrap border border-slate-200">
                  {filledMarkdown}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-400">
              <p className="text-sm">请从左侧选择一个模板</p>
            </div>
          )}
        </div>

        {selectedTemplate && (
          <footer className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3">
            <button
              onClick={handleCopy}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              复制内容
            </button>
            <button
              onClick={handleApply}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              应用到编辑器
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}

function FieldInput({ field, value, onChange }: { field: TemplateField; value: string; onChange: (v: string) => void }) {
  const baseClass = 'w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none'

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {field.type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt || '（不填）'}</option>
          ))}
        </select>
      ) : field.type === 'date' ? (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      ) : field.type === 'boolean' ? (
        <label className="flex items-center gap-2 py-1.5">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            className="rounded border-slate-300 accent-[var(--accent)]"
          />
          <span className="text-sm text-slate-600">是</span>
        </label>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )}
    </label>
  )
}
