import { useEffect, useMemo, useRef, useState } from 'react'
import type { ThemeColors } from '@engine'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { useScrollSync } from '@/lib/useScrollSync'
import { renderMarkdown } from '@/lib/render/markdown'
import { useEditorDocSync } from '@/lib/useEditorDocSync'
import {
  splitMarkdownBlocks,
  buildDocumentFilename,
  type DocumentSettings,
} from './documentModel'
import { buildPagedContentHtml, type MermaidMap } from './paged/pagedContent'
import { collectMermaidDiagrams, preRenderMermaid } from '@engine'
import { buildPageCss } from './paged/pagedPageCss'
import { usePagedPreview } from './paged/usePagedPreview'
import { buildDocumentAiGuide } from '@/lib/aiGuide'
import { copyText } from '@/lib/clipboard'
import { Input } from '@/components/ui/Input'
import { FontSelect } from '@/components/ui/FontSelect'
import { UI_LABELS } from '@/lib/uiLabels'
import { PreviewToolbar, type ToolbarItem } from '@/components/layout/PreviewToolbar'
import { CustomPromptPopover } from '@/components/layout/CustomPromptPopover'
import { exportMarkdownSource } from '@/lib/exportSource'
import { exportToDocx } from '@/lib/exportDocx'
import { useExportAction } from '@/lib/useExportAction'
import { UserGuidePopover } from '@/components/ui/UserGuidePopover'
import { useStore } from '@/lib/store'
import { ModeLayout } from '@/components/layout/ModeLayout'
import { Sparkles, Download, Printer, FileText } from '@/components/ui/Icon'


interface DocumentModeProps {
  markdown: string
  setMarkdown: (markdown: string) => void
  colors: ThemeColors
  settings: DocumentSettings
  updateSettings: (patch: Partial<DocumentSettings>) => void
  onToast: (message: string) => void
}

export function DocumentMode({
  markdown,
  setMarkdown,
  colors,
  settings,
  updateSettings,
  onToast,
}: DocumentModeProps) {
  const guideTrigger = useStore((s) => s.guideTrigger.document)
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
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
  const contentMarkdown = rendered.meta.contentMarkdown || debouncedMarkdown

  const blocks = useMemo(() => splitMarkdownBlocks(contentMarkdown), [contentMarkdown])
  const filename = useMemo(
    () => buildDocumentFilename(rendered.meta.title, contentMarkdown),
    [rendered.meta.title, contentMarkdown],
  )

  // mermaid 预渲染：collectMermaidDiagrams → preRenderMermaid → 存入 state
  // contentHtml 依赖此 map，map 就绪后 mermaid 块才正确渲染（就绪前降级为代码块）
  const [mermaidMap, setMermaidMap] = useState<MermaidMap | undefined>(undefined)
  useEffect(() => {
    const diagrams = collectMermaidDiagrams(contentMarkdown)
    if (diagrams.length === 0) {
      setMermaidMap(undefined)
      return
    }
    const width = settings.pageWidth - settings.marginLeft - settings.marginRight
    let cancelled = false
    preRenderMermaid(diagrams, width).then((map) => {
      if (!cancelled) setMermaidMap(map)
    })
    return () => {
      cancelled = true
    }
  }, [contentMarkdown, settings.pageWidth, settings.marginLeft, settings.marginRight])

  // Paged.js 内容 HTML（段落/表格跨页由引擎完成；随内容与字体排版设置变化）
  const contentHtml = useMemo(
    () =>
      buildPagedContentHtml(blocks, colors, {
        fontFamily: settings.fontFamily,
        fontScale: settings.fontScale,
        centerTitle: settings.centerTitle,
        indentParagraph: settings.indentParagraph,
      }, mermaidMap, onToast),
    [blocks, colors, settings.fontFamily, settings.fontScale, settings.centerTitle, settings.indentParagraph, mermaidMap],
  )

  // @page 分页样式（随页面/页边距/页眉页脚/页码设置变化）
  // 注意：只依赖页面相关设置，避免字体微调触发整篇重排
  const pageCss = useMemo(
    () => buildPageCss(settings, rendered.meta.title),
    [settings.pageWidth, settings.pageHeight, settings.marginTop, settings.marginRight, settings.marginBottom, settings.marginLeft, settings.headerLeft, settings.headerRight, settings.footerText, rendered.meta.title],
  )

  // 屏幕预览缩放：把 A4 页宽适配到预览面板
  const fitScale = containerWidth > 0 ? Math.min(1, (containerWidth - 48) / settings.pageWidth) : 1

  // 自适应防抖：根据文档长度调整延迟（长文档延迟更大，减少重排频率）
  const adaptiveDebounceMs = useMemo(() => {
    const blockCount = blocks.length
    const markdownLength = contentMarkdown.length
    // 短文档（<10 blocks 或 <2000 字符）：350ms
    // 中等文档（10-50 blocks 或 2000-10000 字符）：600ms
    // 长文档（>50 blocks 或 >10000 字符）：1000ms
    if (blockCount < 10 && markdownLength < 2000) return 350
    if (blockCount < 50 && markdownLength < 10000) return 600
    return 1000
  }, [blocks.length, contentMarkdown.length])

  const { status, pageCount, print } = usePagedPreview({
    iframeRef,
    contentHtml,
    pageCss,
    title: filename.replace(/\.pdf$/, ''),
    fitScale,
    debounceMs: adaptiveDebounceMs,
    availableHeight: settings.pageHeight - settings.marginTop - settings.marginBottom,
  })

  const handleCopyGuide = async () => {
    const ok = await copyText(buildDocumentAiGuide())
    onToast(ok ? '已复制 A4 文档排版指令，可发给 AI 使用' : '复制失败，请重试')
  }

  const [exporting, runExport] = useExportAction(onToast)

  const toolbarActions: ToolbarItem[] = [
    {
      id: 'copyGuide',
      icon: <Sparkles size={14} />,
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
      icon: <Download size={14} />,
      label: UI_LABELS.toolbar.exportSource.label,
      tooltip: '导出为 .md 文件',
      onClick: () => exportMarkdownSource(debouncedMarkdown, filename.replace(/\.pdf$/, '.md')),
    },
    {
      id: 'exportDocx',
      icon: <FileText size={14} />,
      label: '导出 Word',
      tooltip: '实验性功能：文本样式可能与预览存在差异。建议使用 Markdown 编辑内容，用 PDF 导出进行分享和打印',
      onClick: () => runExport(async () => {
        const docxFilename = buildDocumentFilename(rendered.meta.title, contentMarkdown, '.docx')
        return exportToDocx(blocks, settings, docxFilename)
      }),
      disabled: exporting,
    },
    {
      id: 'exportPdf',
      icon: <Printer size={14} />,
      label: '导出 PDF',
      tooltip: '通过浏览器打印另存为 PDF（文字可选中、体积小）',
      onClick: print,
      disabled: status === 'rendering',
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
        value={settings.fontFamily as 'songti' | 'fangsong' | 'heiti'}
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
          className="rounded border-slate-300 accent-[var(--accent)] cursor-pointer"
        />
        标题居中
      </label>
      <label className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-900 cursor-pointer select-none shrink-0">
        <input
          type="checkbox"
          checked={settings.indentParagraph}
          onChange={(e) => updateSettings({ indentParagraph: e.target.checked })}
          className="rounded border-slate-300 accent-[var(--accent)] cursor-pointer"
        />
        首行缩进
      </label>
      <span className="text-[12px] text-slate-400 ml-1 shrink-0 flex items-center gap-1 font-mono">
        {status === 'rendering' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />}
        {status === 'rendering' ? '分页中…' : status === 'done' ? `共 ${pageCount} 页` : ''}
      </span>
    </>
  )

  return (
    <>
      <ModeLayout
        className="document-shell"
        editorClassName="document-editor-pane"
        previewClassName="document-workspace bg-slate-100"
        editor={
          <CodeEditor
            value={localMarkdown}
            onChange={setLocalMarkdown}
            externalVersion={externalVersion}
            mode="document"
            onScrollerReady={(el) => {
              editorScrollerRef.current = el
              setEditorReady((n) => n + 1)
            }}
            onToast={onToast}
          />
        }
        toolbar={<PreviewToolbar leftContent={toolbarLeftContent} actions={toolbarActions} className="document-toolbar shrink-0" />}
        preview={
          <div ref={previewScrollRef} className="document-preview-area w-full flex-1 overflow-auto px-4 py-4 relative">
            {status !== 'done' && (
              <div className="document-loading-overlay absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/70 animate-fade-in">
                <div className="document-skeleton" aria-hidden="true">
                  <div className="skeleton-title" />
                  <div className="skeleton-line w-[90%]" />
                  <div className="skeleton-line w-full" />
                  <div className="skeleton-line w-[75%]" />
                  <div className="skeleton-line w-full" />
                  <div className="skeleton-line w-[60%]" />
                </div>
                <span className="text-sm text-slate-500 mt-6">
                  {status === 'init' ? '正在加载分页引擎…' : status === 'error' ? '分页渲染出错' : '正在分页排版，请稍候…'}
                </span>
              </div>
            )}
            <iframe
              ref={iframeRef}
              title="A4 文档预览"
              className="block w-full min-h-[480px] border-0 bg-transparent"
            />
          </div>
        }
      />
      <UserGuidePopover
        guideKey="m2v-document-guide-seen"
        forceOpenTrigger={guideTrigger}
        title="A4 规范文档 使用指引"
        subtitle="利用 AI 智能排版指令，生成符合 A4 物理分页规范的专业报告/文档"
        steps={[
          {
            icon: 'copy',
            title: '复制排版指令',
            shortDesc: '点击「复制排版指令」，获取包含智能跨页、防孤立标题等规范的 AI 提示词。',
          },
          {
            icon: 'ai',
            title: '发给 AI 优化文档结构',
            shortDesc: '将指令与你的内容发给 AI，让其按物理分页与严谨格式输出 Markdown。',
          },
          {
            icon: 'export',
            title: '粘贴并无损导出 PDF',
            shortDesc: '粘贴 Markdown 到编辑器，预览分页效果后点击「导出 PDF」保存。',
          },
        ]}
      />
    </>
  )
}
