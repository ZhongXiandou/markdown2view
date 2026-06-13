import { useEffect, useMemo, useRef, useState } from 'react'
import type { ThemeColors } from '@engine'
import { parseMarkdown } from '@engine'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { useScrollSync } from '@/lib/useScrollSync'
import { renderMarkdown } from '@/lib/render/markdown'
import { useEditorDocSync } from '@/lib/useEditorDocSync'
import {
  DEFAULT_DOCUMENT_SETTINGS,
  createDocumentModel,
  paginateDocumentBlocks,
  type DocumentSettings,
} from './documentModel'
import { buildDocumentAiGuide } from '@/lib/aiGuide'
import { copyText } from '@/lib/clipboard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FontSelect } from '@/components/ui/FontSelect'
import { DOCUMENT_TITLE_STYLE_VARS } from './documentStyles'
import { UI_LABELS } from '@/lib/uiLabels'
import { PreviewToolbar, type ToolbarItem } from '@/components/layout/PreviewToolbar'
import { CustomPromptPopover } from '@/components/layout/CustomPromptPopover'
import { exportMarkdownSource } from '@/lib/exportSource'
import { useBlockHeights } from '@/lib/useBlockHeights'
import { useExportAction } from '@/lib/useExportAction'
import { getFontFamilyCss } from '@/lib/fonts'
import { UserGuidePopover } from '@/components/ui/UserGuidePopover'


interface DocumentModeProps {
  markdown: string
  setMarkdown: (markdown: string) => void
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
  colors,
  settings,
  updateSettings,
  onToast,
}: DocumentModeProps) {
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(0)

  useScrollSync(editorScrollerRef, previewScrollRef, [editorReady])

  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = previewScrollRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      setContainerWidth(rect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // store ↔ 编辑器双向同步（防抖回写 + 外部变更信号）
  const {
    localValue: localMarkdown,
    debouncedValue: debouncedMarkdown,
    setLocalValue: setLocalMarkdown,
    externalVersion,
  } = useEditorDocSync(markdown, setMarkdown)

  const rendered = useMemo(() => renderMarkdown(debouncedMarkdown, colors), [debouncedMarkdown, colors])
  const model = useMemo(
    () => createDocumentModel(debouncedMarkdown, rendered.meta, settings),
    [debouncedMarkdown, rendered.meta.title, rendered.meta.contentMarkdown, settings],
  )
  const firstHeadingId = model.blocks.find((block) => block.kind === 'heading')?.id

  const measuringRef = useRef<HTMLDivElement>(null)
  const [actualHeights] = useBlockHeights(measuringRef, [
    model.blocks,
    settings.pageWidth,
    settings.fontScale,
    settings.fontFamily,
    colors,
  ])

  const pages = useMemo(() => {
    return paginateDocumentBlocks(model.blocks, settings, actualHeights)
  }, [model.blocks, settings, actualHeights])

  const printAreaScale = containerWidth > 0 
    ? Math.min(1, (containerWidth - 48) / settings.pageWidth) 
    : 1

  const [exportProgress, setExportProgress] = useState('')
  const [exporting, runExport] = useExportAction(onToast)

  const handleExportPdf = () => {
    const container = document.querySelector('.document-print-area') as HTMLElement
    if (!container) return
    const elements = Array.from(container.querySelectorAll('article.document-page')) as HTMLElement[]
    if (elements.length === 0) return

    runExport(async () => {
      const prevZoom = container.style.zoom
      container.style.zoom = '1'
      try {
        const { exportElementsToPdf } = await import('@/lib/exportPdf')
        await exportElementsToPdf(
          elements,
          model.filename,
          { width: settings.pageWidth, height: settings.pageHeight },
          (current, total) => setExportProgress(`(${current}/${total})`)
        )
        return 'PDF 导出成功'
      } finally {
        container.style.zoom = prevZoom
        setExportProgress('')
      }
    })
  }

  const handleCopyGuide = async () => {
    const ok = await copyText(buildDocumentAiGuide())
    onToast(ok ? '已复制 A4 文档排版指令，可发给 AI 使用' : '复制失败，请重试')
  }

  const toolbarActions: ToolbarItem[] = [
    {
      id: 'copyGuide',
      icon: '✨',
      label: '复制排版指令',
      tooltip: '复制 A4 文档排版 AI 指令',
      onClick: handleCopyGuide,
    },
    {
      id: 'customPrompt',
      label: '自定义指令',
      node: <CustomPromptPopover mode="document" onToast={onToast} />
    },
    'separator',
    {
      id: 'exportSource',
      icon: '💾',
      label: UI_LABELS.toolbar.exportSource.label,
      tooltip: '导出为 .md 文件',
      onClick: () => exportMarkdownSource(debouncedMarkdown),
    },
    {
      id: 'exportPdf',
      icon: '🖨️',
      label: exporting ? `导出 ${exportProgress}` : UI_LABELS.toolbar.exportPdf.label,
      tooltip: UI_LABELS.toolbar.exportPdf.tooltip,
      onClick: handleExportPdf,
      disabled: exporting,
      variant: 'primary',
      className: 'shadow-sm',
    },
  ]

  const toolbarLeftContent = (
    <>
      <label className="flex items-center gap-1.5 text-[12px] text-slate-500 shrink-0">
        左页眉
        <Input
          value={settings.headerLeft}
          onChange={(e) => updateSettings({ headerLeft: e.target.value })}
          className="w-24"
        />
      </label>
      <label className="flex items-center gap-1.5 text-[12px] text-slate-500 ml-1 border-r border-slate-200 pr-3 shrink-0">
        右页眉
        <Input
          value={settings.headerRight}
          onChange={(e) => updateSettings({ headerRight: e.target.value })}
          className="w-24"
        />
      </label>
      <FontSelect
        value={settings.fontFamily as 'songti' | 'fangsong' | 'heiti' | 'lxgwwenkai'}
        onChange={(v) => updateSettings({ fontFamily: v })}
      />
      <div className="flex items-center gap-0.5 border border-slate-200 rounded-md p-0.5 bg-slate-50 mr-1 shrink-0">
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
      <div className="w-px h-4 bg-slate-200 mx-1 shrink-0" />
      <label className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-900 cursor-pointer select-none shrink-0">
        <input
          type="checkbox"
          checked={settings.centerTitle}
          onChange={(e) => updateSettings({ centerTitle: e.target.checked })}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        标题居中
      </label>
      <label className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-900 cursor-pointer select-none shrink-0">
        <input
          type="checkbox"
          checked={settings.indentParagraph}
          onChange={(e) => updateSettings({ indentParagraph: e.target.checked })}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        首行缩进
      </label>
    </>
  )

  return (
    <main className="document-shell grid min-h-0 flex-1 grid-cols-2 gap-px bg-gray-200">
      <section className="document-editor-pane min-h-0 overflow-hidden bg-white">
        <CodeEditor
          value={localMarkdown}
          onChange={setLocalMarkdown}
          externalVersion={externalVersion}
          onScrollerReady={(el) => {
            editorScrollerRef.current = el
            setEditorReady((n) => n + 1)
          }}
        />
      </section>

      <section ref={previewScrollRef} className="document-workspace min-h-0 overflow-y-auto bg-slate-100">
        <PreviewToolbar leftContent={toolbarLeftContent} actions={toolbarActions} className="document-toolbar" />

        <div 
          className="document-print-area mx-auto flex w-full flex-col items-center gap-6 px-6 py-6"
          style={{
            zoom: printAreaScale < 1 ? printAreaScale : undefined,
          }}
        >
          {/* 隐藏测量容器，包裹在 0x0 隐藏外壳中，防止撑开滚动区域 */}
          <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', visibility: 'hidden', pointerEvents: 'none' }}>
            <div
              ref={measuringRef}
              className={`document-page document-content document-fontscale-${settings.fontScale} ${settings.centerTitle ? 'document-center-title' : ''} ${settings.indentParagraph ? 'document-indent-paragraph' : ''}`}
              style={{
                ...DOCUMENT_TITLE_STYLE_VARS,
                width: settings.pageWidth - settings.marginLeft - settings.marginRight,
                fontFamily: getFontFamilyCss(settings.fontFamily),
              }}
            >
              {model.blocks.map((block) => (
                <section
                  key={block.id}
                  data-block-id={block.id}
                  className={`document-block ${block.id === firstHeadingId ? 'document-title-block' : ''}`}
                  data-kind={block.kind}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(block.markdown, colors) }}
                />
              ))}
            </div>
          </div>

          {pages.map((page) => (
            <article
              key={page.pageNumber}
              className={`document-page document-fontscale-${settings.fontScale} ${settings.centerTitle ? 'document-center-title' : ''} ${settings.indentParagraph ? 'document-indent-paragraph' : ''}`}
              style={{
                ...DOCUMENT_TITLE_STYLE_VARS,
                width: settings.pageWidth,
                height: settings.pageHeight,
                position: 'relative',
                fontFamily: getFontFamilyCss(settings.fontFamily),
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
                  ...(page.isCover ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' } : {}),
                }}
              >
                {page.blocks.map((block) => (
                  <section
                    key={block.id}
                    className={`document-block ${block.id === firstHeadingId ? 'document-title-block' : ''}`}
                    data-kind={block.kind}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(block.markdown, colors) }}
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
      <UserGuidePopover
        guideKey="m2v-document-guide-seen"
        title="A4 规范文档 快速开始"
        subtitle="利用 AI 智能排版指令，生成符合 A4 物理分页规范的专业报告/文档"
        steps={[
          {
            icon: '📚',
            title: '复制排版指令',
            desc: '点击右上角「复制排版指令」，获取包含智能跨页、防孤立标题、封面表格等排版规范的 AI 提示词。',
          },
          {
            icon: '🤖',
            title: '发给 AI 优化文档结构',
            desc: '将复制的指令与你的报告大纲或草稿内容发给 AI，让其按物理分页与严谨格式输出 Markdown 结构。',
          },
          {
            icon: '🖨️',
            title: '粘贴并无损导出 PDF',
            desc: '将 AI 输出的 Markdown 粘贴到左侧，右侧将呈现完美分页预览，在顶部栏微调字体页眉后，点击「导出 PDF」保存即可。',
          },
        ]}
      />
    </main>
  )
}
