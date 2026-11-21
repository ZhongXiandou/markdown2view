import { createPortal } from 'react-dom'
import type { DesignStyle } from '@/data/designPrompts'
import { buildDesignPrompt } from '@/data/designPrompts'
import { copyText } from '@/lib/clipboard'
import { UI_LABELS } from '@/lib/uiLabels'
import { useState, useEffect } from 'react'
import { generateFallbackHtml } from './StyleThumbnail'
import { useEscapeKey } from '@/lib/useEscapeKey'

interface StylePreviewModalProps {
  style: DesignStyle | null
  onClose: () => void
}

export function StylePreviewModal({ style, onClose }: StylePreviewModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCopied(false)
  }, [style])

  useEscapeKey(style !== null, onClose)

  if (!style) return null

  const handleCopy = async () => {
    const ok = await copyText(buildDesignPrompt(style))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const subCategory = style.category.includes('/') ? style.category.split('/')[1] : '常规'

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <header className="flex items-start gap-4 border-b border-slate-200 px-6 py-5">
          <span
            className="mt-1 h-4 w-4 shrink-0 rounded-full shadow-inner"
            style={{ background: style.accent }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900">{style.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">{style.outputType}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">{style.visualTone}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">{subCategory}</span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{style.description}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭预览"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </header>

        {/* 视觉预览 */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 flex items-center justify-center min-h-[300px]">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50" style={{ minHeight: 280 }}>
            <div 
              dangerouslySetInnerHTML={{ __html: style.previewHtml || generateFallbackHtml(style) }}
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }} 
            />
          </div>
        </div>

        {/* 底部操作 */}
        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <span className="mr-auto text-[12px] text-slate-400">{UI_LABELS.promptLibrary.recommendAI}</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: style.accent }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            {copied ? '已复制！' : UI_LABELS.promptLibrary.copyPrompt.label}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}
