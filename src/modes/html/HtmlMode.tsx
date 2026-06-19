import { useEffect, useRef, useState, useMemo } from 'react'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { PreviewToolbar } from '@/components/layout/PreviewToolbar'
import { HtmlSandbox } from '@/components/preview/HtmlSandbox'
import { previewHtml } from '@/lib/extractHtml'
import { copyText } from '@/lib/clipboard'
import { buildDesignPrompt, type DesignStyle } from '@/data/designPrompts'
import { PromptLibrary } from './PromptLibrary'
import { useEditorDocSync } from '@/lib/useEditorDocSync'
import { useImageUpload } from '@/lib/useImageUpload'
import { UserGuidePopover } from '@/components/ui/UserGuidePopover'
import { useStore } from '@/lib/store'
import { ModeLayout } from '@/components/layout/ModeLayout'
import { useIframeScale } from './useIframeScale'
import { usePageNavigation } from './usePageNavigation'
import { useHtmlExports } from './useHtmlExports'
import { useHtmlToolbar } from './useHtmlToolbar'

interface HtmlModeProps {
  html: string
  setHtml: (html: string) => void
  onToast: (message: string) => void
}

// HTML 可视化模式：左侧编辑 HTML，右侧 iframe 沙箱实时渲染，支持 Prompt 指令库与导出 PNG。
export function HtmlMode({ html, setHtml, onToast }: HtmlModeProps) {
  const guideTrigger = useStore((s) => s.guideTrigger.html)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewPaneRef = useRef<HTMLDivElement | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [promptOpen, setPromptOpen] = useState(false)
  const [editorReady, setEditorReady] = useState(0)
  const [allowScripts, setAllowScripts] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  // 监听全屏状态变化，用于在全屏播放时隐藏工具栏
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === previewPaneRef.current)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // store ↔ 编辑器双向同步（防抖回写 + 外部变更信号）
  const {
    localValue: localHtml,
    debouncedValue: debouncedHtml,
    setLocalValue: setLocalHtml,
    externalVersion,
  } = useEditorDocSync(html, setHtml)

  // 合并 DOMParser 调用：一次解析同时获取页面数量和标题，避免重复解析
  // 使用 debouncedHtml 而非 localHtml，避免每次按键都执行 DOMParser
  const { expectedPageCount, htmlTitle } = useMemo(() => {
    try {
      const doc = new DOMParser().parseFromString(debouncedHtml, 'text/html')
      const pageCount = doc.querySelectorAll('.page, .slide, .card').length
      const titleText = doc.querySelector('title')?.textContent?.trim()
        || doc.querySelector('h1')?.textContent?.trim()
        || ''
      const title = titleText ? titleText.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 40) : ''
      return { expectedPageCount: pageCount, htmlTitle: title }
    } catch {
      return { expectedPageCount: 0, htmlTitle: '' }
    }
  }, [debouncedHtml])

  // 图片上传
  const { fileInputRef, uploading, triggerUpload, handleFileChange } = useImageUpload(onToast)

  // 分页与导航
  const { pages, currentPage, setCurrentPage, detect } = usePageNavigation(iframeRef, previewPaneRef)

  // 是否存在可渲染内容（空内容时由沙箱显示占位提示，无需加载动画）
  const hasContent = useMemo(() => Boolean(previewHtml(debouncedHtml)), [debouncedHtml])

  // 内容或刷新键变化 → 进入加载态；空内容则直接结束
  useEffect(() => {
    setPreviewLoading(hasContent)
  }, [debouncedHtml, refreshKey, hasContent])

  // iframe 自动缩放
  useIframeScale(iframeRef, pages, currentPage, refreshKey)

  // 导出操作
  const {
    exporting,
    handleExport,
    handleExportCurrentPage,
    handleExportPagesZip,
    handleExportPdf,
    handleExportPptx,
    handleExportPptxEditable,
    handleExportSource,
  } = useHtmlExports(iframeRef, pages, currentPage, htmlTitle, localHtml, onToast)

  // One-way scroll sync: editor → iframe
  useEffect(() => {
    const editor = editorScrollerRef.current
    const iframe = iframeRef.current
    if (!editor || !iframe) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const editorMax = editor.scrollHeight - editor.clientHeight
        if (editorMax <= 0) return
        const ratio = editor.scrollTop / editorMax
        try {
          const doc = iframe.contentDocument
          if (!doc) return
          const iframeMax = doc.documentElement.scrollHeight - iframe.clientHeight
          if (iframeMax > 0) {
            doc.documentElement.scrollTop = ratio * iframeMax
          }
        } catch { /* cross-origin */ }
      })
    }

    editor.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      editor.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [editorReady, refreshKey])

  const handleCopyPrompt = async (style: DesignStyle) => {
    const ok = await copyText(buildDesignPrompt(style))
    onToast(ok ? `已复制「${style.name}」风格指令` : '复制失败，请重试')
  }

  const toolbarActions = useHtmlToolbar({
    pages,
    currentPage,
    expectedPageCount,
    exporting,
    uploading,
    allowScripts,
    onFullscreen: () => previewPaneRef.current?.requestFullscreen?.(),
    onRefresh: () => setRefreshKey((n) => n + 1),
    onOpenPromptLibrary: () => setPromptOpen(true),
    onUploadImage: triggerUpload,
    onToggleAllowScripts: (checked) => {
      setAllowScripts(checked)
      setRefreshKey((n) => n + 1)
    },
    onChangePage: (delta) => {
      setCurrentPage((prev) => {
        const max = Math.max(pages.length - 1, 0)
        return Math.min(Math.max(prev + delta, 0), max)
      })
    },
    onExportCurrentPage: handleExportCurrentPage,
    onExportZip: handleExportPagesZip,
    onExportSource: handleExportSource,
    onExportPng: handleExport,
    onExportPdf: handleExportPdf,
    onExportPptx: handleExportPptx,
    onExportPptxEditable: handleExportPptxEditable,
  })

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" aria-label="上传图片" className="hidden" />
      <ModeLayout
        previewClassName="bg-white"
        editor={
          <CodeEditor
            value={localHtml}
            onChange={setLocalHtml}
            language="html"
            externalVersion={externalVersion}
            onScrollerReady={(el) => {
              editorScrollerRef.current = el
              setEditorReady((n) => n + 1)
            }}
            onToast={onToast}
          />
        }
        toolbar={!isFullscreen ? <PreviewToolbar actions={toolbarActions} className="shrink-0" /> : undefined}
        preview={
          <div ref={previewPaneRef} className="flex-1 min-h-0 relative">
            {previewLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/70 animate-fade-in">
                <div className="canvas-skeleton" aria-hidden="true">
                  <div className="canvas-skeleton-bar">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="canvas-skeleton-hero" />
                  <div className="canvas-skeleton-line w-[85%]" />
                  <div className="canvas-skeleton-line w-full" />
                  <div className="canvas-skeleton-line w-[60%]" />
                </div>
                <span className="text-sm text-slate-500 mt-6">正在渲染画布，请稍候…</span>
              </div>
            )}
            <HtmlSandbox
              ref={iframeRef}
              html={debouncedHtml}
              refreshKey={refreshKey}
              allowScripts={allowScripts}
              onLoad={() => {
                const iframe = iframeRef.current
                if (!iframe?.contentDocument) {
                  setPreviewLoading(false)
                  return
                }
                detect()
                setPreviewLoading(false)
              }}
            />
          </div>
        }
      />

      <PromptLibrary
        mode="html"
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onCopy={handleCopyPrompt}
        onToast={onToast}
      />
      <UserGuidePopover
        guideKey="m2v-html-guide-seen"
        forceOpenTrigger={guideTrigger}
        title="自由画布 使用指引"
        subtitle="利用 AI 提示词库快速生成精美的动态或静态 HTML 页面"
        tip="为获得最佳体验，建议在电脑浏览器中使用本功能，并将浏览器窗口宽度调整至 1920 像素以上，以充分展现画布的宽屏排版效果。"
        steps={[
          {
            icon: 'copy',
            title: '复制风格排版指令',
            shortDesc: '打开「指令库」，选择心仪风格并复制对应的 HTML 排版提示词。',
          },
          {
            icon: 'ai',
            title: '发给 AI 优化并生成 HTML',
            shortDesc: '将指令与草稿内容发给 AI，让其输出符合特定风格排版的 HTML 源码。',
          },
          {
            icon: 'export',
            title: '粘贴 HTML 实时预览与导出',
            shortDesc: '粘贴 HTML 到编辑器，右侧实时渲染后可导出 PNG 或 PDF。',
          },
        ]}
      />
    </>
  )
}
