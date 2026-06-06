import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { MarkdownRenderResult } from '@/lib/render/markdown'
import type { ThemeColors } from '@engine'
import { parseMarkdown, makeColors } from '@engine'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { useScrollSync } from '@/lib/useScrollSync'
import {
  DEFAULT_DOCUMENT_SETTINGS,
  createDocumentModel,
  paginateDocumentBlocks,
  type DocumentSettings,
} from './documentModel'
import { buildAiGuide } from '@/lib/aiGuide'
import { copyText } from '@/lib/clipboard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface DocumentModeProps {
  markdown: string
  setMarkdown: (markdown: string) => void
  rendered: MarkdownRenderResult
  colors: ThemeColors
  settings: DocumentSettings
  updateSettings: (patch: Partial<DocumentSettings>) => void
  onToast: (message: string) => void
}

function footerText(template: string, page: number, total: number) {
  return template.replace('{page}', String(page)).replace('{total}', String(total))
}

export function DocumentMode({
  markdown,
  setMarkdown,
  rendered,
  colors,
  settings,
  updateSettings,
  onToast,
}: DocumentModeProps) {
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(0)

  useScrollSync(editorScrollerRef, previewScrollRef, [editorReady])

  const model = useMemo(
    () => createDocumentModel(markdown, rendered.meta, settings),
    [markdown, rendered.meta.title, rendered.meta.contentMarkdown, settings],
  )

  const [actualHeights, setActualHeights] = useState<Record<string, number>>({})
  const measuringRef = useRef<HTMLDivElement>(null)

  // 测量隐藏 DOM 中的所有块的高度
  useLayoutEffect(() => {
    if (!measuringRef.current) return
    const newHeights: Record<string, number> = {}
    let changed = false
    const elements = measuringRef.current.children
    
    let lastBottom = 0
    let isFirst = true

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement
      const id = el.getAttribute('data-block-id')
      if (id) {
        if (isFirst) {
          lastBottom = el.offsetTop
          isFirst = false
        }
        
        const bottom = el.offsetTop + el.offsetHeight
        const h = bottom - lastBottom
        lastBottom = bottom

        if (actualHeights[id] !== h) {
          changed = true
        }
        newHeights[id] = h
      }
    }
    if (changed) {
      setActualHeights(newHeights)
    }
  }, [model.blocks, settings.pageWidth, settings.fontScale, settings.fontFamily])

  const pages = useMemo(() => {
    return paginateDocumentBlocks(model.blocks, settings, actualHeights)
  }, [model.blocks, settings, actualHeights])

  const docColors = useMemo(() => {
    if (settings.theme === 'business') {
      return makeColors('#2563eb', '#1e40af') // 商务蓝
    } else {
      return makeColors('#111827', '#000000') // 黑色正式
    }
  }, [settings.theme])

  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState('')

  const handleExportPdf = async () => {
    const container = document.querySelector('.document-print-area')
    if (!container) return
    const elements = Array.from(container.querySelectorAll('article.document-page')) as HTMLElement[]
    if (elements.length === 0) return

    setExporting(true)
    try {
      const { exportElementsToPdf } = await import('@/lib/exportPdf')
      await exportElementsToPdf(
        elements,
        model.filename,
        { width: settings.pageWidth, height: settings.pageHeight },
        (current, total) => setExportProgress(`(${current}/${total})`)
      )
      onToast('PDF 导出成功')
    } catch (err) {
      onToast('PDF 导出失败: ' + err)
    } finally {
      setExporting(false)
      setExportProgress('')
    }
  }

  const copyGuide = async () => {
    const ok = await copyText(`${buildAiGuide()}\n\n---\n\n以下是待处理内容：\n\n${markdown}`)
    onToast(ok ? '已复制指令和当前 Markdown 内容' : '复制失败，请重试')
  }

  return (
    <main className="document-shell grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(620px,1.08fr)] gap-px bg-gray-200">
      <section className="document-editor-pane min-h-0 overflow-hidden bg-white">
        <CodeEditor
          value={markdown}
          onChange={setMarkdown}
          onScrollerReady={(el) => {
            editorScrollerRef.current = el
            setEditorReady((n) => n + 1)
          }}
        />
      </section>

      <section ref={previewScrollRef} className="document-workspace min-h-0 overflow-y-auto bg-slate-100">
        <div className="document-toolbar sticky top-0 z-10 flex items-center justify-end border-b border-slate-200 bg-white/95 px-5 py-2.5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-1.5 text-[12px] text-slate-500">
                左页眉
                <Input
                  value={settings.headerLeft}
                  onChange={(e) => updateSettings({ headerLeft: e.target.value })}
                  className="w-24"
                />
              </label>
              <label className="flex items-center gap-1.5 text-[12px] text-slate-500 ml-1 border-r border-slate-200 pr-3">
                右页眉
                <Input
                  value={settings.headerRight}
                  onChange={(e) => updateSettings({ headerRight: e.target.value })}
                  className="w-24"
                />
              </label>
              <Select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as DocumentSettings['theme'] })}
              >
                <option value="business">蓝色商务</option>
                <option value="formal">黑白正式</option>
              </Select>
              <Select
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value as DocumentSettings['fontFamily'] })}
              >
                <option value="songti">宋体</option>
                <option value="fangsong">仿宋</option>
                <option value="heiti">黑体</option>
                <option value="lxgwwenkai">霞鹜文楷</option>
              </Select>
              <div className="flex items-center gap-0.5 border border-slate-200 rounded-md p-0.5 bg-slate-50 mr-1">
                {(['small', 'normal', 'large'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSettings({ fontScale: s })}
                    className={`rounded text-[11px] px-2 py-1 transition-colors ${
                      settings.fontScale === s
                        ? 'bg-white text-slate-900 shadow-sm font-medium'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {{ small: '小', normal: '标准', large: '大' }[s]}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <Button onClick={copyGuide} title="复制 AI 指令">
                ✨ 复制指令
              </Button>
              <Button variant="primary" onClick={handleExportPdf} disabled={exporting}>
                {exporting ? `导出 ${exportProgress}` : '🖨️ 导出 PDF'}
              </Button>
            </div>
        </div>

        <div className="document-print-area mx-auto flex w-full flex-col items-center gap-6 px-6 py-6">
          {/* 隐藏测量容器 */}
          <div
            ref={measuringRef}
            className={`document-page document-content document-theme-${settings.theme} document-font-${settings.fontFamily} document-fontscale-${settings.fontScale}`}
            style={{
              position: 'absolute',
              visibility: 'hidden',
              top: -9999,
              width: settings.pageWidth - settings.marginLeft - settings.marginRight,
            }}
          >
            {model.blocks.map((block) => (
              <section
                key={block.id}
                data-block-id={block.id}
                className="document-block"
                data-kind={block.kind}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(block.markdown, docColors) }}
              />
            ))}
          </div>

          {pages.map((page) => (
            <article
              key={page.pageNumber}
              className={`document-page document-theme-${settings.theme} document-font-${settings.fontFamily} document-fontscale-${settings.fontScale}`}
              style={{
                width: settings.pageWidth,
                height: settings.pageHeight,
                position: 'relative',
              }}
            >
              {/* Header - absolute positioned at top */}
              <header
                className="document-header"
                style={{
                  position: 'absolute',
                  top: settings.marginTop - settings.headerHeight,
                  left: settings.marginLeft,
                  right: settings.marginRight,
                  height: settings.headerHeight,
                }}
              >
                <span>{settings.headerLeft || rendered.meta.title || 'markdown2view'}</span>
                <span>{settings.headerRight}</span>
              </header>

              {/* Content area */}
              <section
                className="document-content"
                style={{
                  position: 'absolute',
                  top: settings.marginTop,
                  left: settings.marginLeft,
                  right: settings.marginRight,
                  bottom: settings.marginBottom,
                  overflow: 'hidden',
                }}
              >
                {page.blocks.map((block) => (
                  <section
                    key={block.id}
                    className="document-block"
                    data-kind={block.kind}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(block.markdown, docColors) }}
                  />
                ))}
              </section>

              {/* Footer - absolute positioned at bottom */}
              <footer
                className="document-footer"
                style={{
                  position: 'absolute',
                  bottom: settings.marginBottom - settings.footerHeight,
                  left: settings.marginLeft,
                  right: settings.marginRight,
                  height: settings.footerHeight,
                }}
              >
                {footerText(
                  settings.footerText || DEFAULT_DOCUMENT_SETTINGS.footerText,
                  page.pageNumber,
                  pages.length,
                )}
              </footer>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
