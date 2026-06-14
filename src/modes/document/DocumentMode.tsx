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
import { buildPagedContentHtml } from './paged/pagedContent'
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
import { UserGuidePopover } from '@/components/ui/UserGuidePopover'
import { useStore } from '@/lib/store'


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
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit')

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

  // Paged.js 内容 HTML（段落/表格跨页由引擎完成；随内容与排版设置变化）
  const contentHtml = useMemo(
    () =>
      buildPagedContentHtml(blocks, colors, {
        fontFamily: settings.fontFamily,
        fontScale: settings.fontScale,
        centerTitle: settings.centerTitle,
        indentParagraph: settings.indentParagraph,
      }),
    [blocks, colors, settings.fontFamily, settings.fontScale, settings.centerTitle, settings.indentParagraph],
  )

  // @page 分页样式（随页面/页边距/页眉页脚/页码设置变化）
  const pageCss = useMemo(() => buildPageCss(settings, rendered.meta.title), [settings, rendered.meta.title])

  // 屏幕预览缩放：把 A4 页宽适配到预览面板
  const fitScale = containerWidth > 0 ? Math.min(1, (containerWidth - 48) / settings.pageWidth) : 1

  const { status, pageCount, print } = usePagedPreview({
    iframeRef,
    contentHtml,
    pageCss,
    title: filename.replace(/\.pdf$/, ''),
    fitScale,
  })

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
      onClick: () => exportMarkdownSource(debouncedMarkdown, filename.replace(/\.pdf$/, '.md')),
    },
    {
      id: 'exportPdf',
      icon: '🖨️',
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
      <span className="text-[12px] text-slate-400 ml-1 shrink-0">
        {status === 'rendering' ? '分页中…' : status === 'done' ? `共 ${pageCount} 页` : ''}
      </span>
    </>
  )

  return (
    <main className="document-shell flex flex-col min-h-0 flex-1 bg-gray-200">
      {/* 移动端视图切换 Tab */}
      <div className="flex shrink-0 border-b border-slate-200 bg-white md:hidden">
        <button
          onClick={() => setActiveView('edit')}
          className={`flex-1 py-3 text-center text-[13px] font-bold transition-all cursor-pointer ${
            activeView === 'edit'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-slate-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          编辑内容
        </button>
        <button
          onClick={() => setActiveView('preview')}
          className={`flex-1 py-3 text-center text-[13px] font-bold transition-all cursor-pointer ${
            activeView === 'preview'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-slate-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          实时预览
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
        <section className={`document-editor-pane min-h-0 overflow-hidden bg-white flex flex-col ${activeView === 'edit' ? 'flex' : 'hidden md:flex'}`}>
          <CodeEditor
            value={localMarkdown}
            onChange={setLocalMarkdown}
            externalVersion={externalVersion}
            mode="document"
            onScrollerReady={(el) => {
              editorScrollerRef.current = el
              setEditorReady((n) => n + 1)
            }}
          />
        </section>

        <section className={`document-workspace min-h-0 overflow-hidden bg-slate-100 flex flex-col ${activeView === 'preview' ? 'flex' : 'hidden md:flex'}`}>
          <PreviewToolbar leftContent={toolbarLeftContent} actions={toolbarActions} className="document-toolbar shrink-0" />

          <div ref={previewScrollRef} className="document-preview-area w-full flex-1 overflow-auto px-4 py-4">
            <iframe
              ref={iframeRef}
              title="A4 文档预览"
              className="block w-full min-h-[480px] border-0 bg-transparent"
            />
          </div>
        </section>
      </div>
      <UserGuidePopover
        guideKey="m2v-document-guide-seen"
        forceOpenTrigger={guideTrigger}
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
