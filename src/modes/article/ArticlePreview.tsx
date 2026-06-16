import { useState, useRef } from 'react'
import type { MarkdownRenderResult } from '@/lib/render/markdown'
import { copyText, copyRichText, copyHtmlSource } from '@/lib/clipboard'
import { exportMarkdownSource } from '@/lib/exportSource'
import { exportLongImage } from '@/lib/export/longImage'
import { PreviewToolbar, type ToolbarItem } from '@/components/layout/PreviewToolbar'
import { CustomPromptPopover } from '@/components/layout/CustomPromptPopover'
import { buildArticleAiGuide } from '@/lib/aiGuide'
import { useStore } from '@/lib/store'
import { UI_LABELS } from '@/lib/uiLabels'
import { getFontFamilyCss } from '@/lib/fonts'
import { Sparkles, Download, Clipboard, Image, Rocket } from '@/components/ui/Icon'

/** 长图文模式固定使用黑体系统字体栈，确保复制到微信公众号时字体一致 */
const ARTICLE_FONT = getFontFamilyCss('heiti')

interface ArticlePreviewProps {
  rendered: MarkdownRenderResult
  markdown: string
  // 滚动容器引用，供滚动联动使用
  scrollRef: React.RefObject<HTMLDivElement>
  // 统一 Toast 反馈
  onToast: (message: string) => void
}

// 长图文预览：标题/摘要作为独立可复制元信息展示，正文继续复用共享 Markdown 渲染内核。
export function ArticlePreview({ rendered, markdown, scrollRef, onToast }: ArticlePreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { html, meta } = rendered
  const imageHostConfig = useStore((s) => s.imageHostConfig)

  const hasLocalImages = html.includes('blob:') || html.includes('img://') || meta.contentMarkdown.includes('img://')

  const handleCopyTitle = async () => {
    const ok = await copyText(meta.title)
    onToast(ok ? '已复制标题' : '没有可复制的标题')
  }

  const handleCopySummary = async () => {
    const ok = await copyText(meta.summary)
    onToast(ok ? '已复制摘要' : '没有可复制的摘要')
  }

  const handleCopyGuide = async () => {
    const ok = await copyText(buildArticleAiGuide())
    onToast(ok ? '已复制长图文 AI 排版指令，可发给 AI 使用' : '复制失败，请重试')
  }

  const handleCopyHtml = async () => {
    if (!contentRef.current) return
    const ok = await copyHtmlSource(contentRef.current)
    onToast(ok ? '已复制 HTML 源码（全内联样式）' : '复制失败，请重试')
  }

  const handleCopyRichText = async () => {
    if (!contentRef.current) return
    const ok = await copyRichText(contentRef.current, ARTICLE_FONT)
    onToast(ok ? '已复制富文本，可粘贴到长图文编辑器' : '复制失败，请重试')
  }

  const handleExportLongImage = async () => {
    if (!contentRef.current) return
    try {
      await exportLongImage(contentRef.current, {
        filename: meta.title || 'article',
      })
      onToast('已导出长图')
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  const toolbarActions: ToolbarItem[] = [
    {
      id: 'copyGuide',
      icon: <Sparkles size={14} />,
      label: '复制排版指令',
      tooltip: '复制长图文排版 AI 指令',
      onClick: handleCopyGuide,
    },
    {
      id: 'customPrompt',
      label: '自定义指令',
      node: <CustomPromptPopover mode="article" onToast={onToast} />
    },
    'separator',
    {
      id: 'exportSource',
      icon: <Download size={14} />,
      label: UI_LABELS.toolbar.exportSource.label,
      tooltip: '导出为 .md 文件',
      onClick: () => {
        const title = (meta.title || 'article').replace(/[\\/:*?"<>|]/g, '_').slice(0, 40)
        exportMarkdownSource(markdown, `${title}.md`)
      },
    },
    {
      id: 'copyHtml',
      icon: <Clipboard size={14} />,
      label: '复制源码',
      tooltip: '复制渲染后的完整 HTML 源码（含内联样式）',
      onClick: handleCopyHtml,
    },
    {
      id: 'exportImage',
      icon: <Image size={14} />,
      label: UI_LABELS.toolbar.exportLongImage.label,
      tooltip: UI_LABELS.toolbar.exportLongImage.tooltip,
      onClick: handleExportLongImage,
    },
    {
      id: 'copyRichText',
      icon: <Rocket size={14} />,
      label: UI_LABELS.toolbar.copyRichText.label,
      tooltip: UI_LABELS.toolbar.copyRichText.tooltip,
      onClick: handleCopyRichText,
      variant: 'primary',
      className: 'shadow-sm',
    },
  ]

  return (
    <section className="flex h-full flex-col">
      {/* 操作工具栏 */}
      <PreviewToolbar actions={toolbarActions} />

      {/* 公众号本地图片裂图警告 */}
      {hasLocalImages && imageHostConfig.activeType === 'local' && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-700 flex items-center gap-2">
          <svg className="shrink-0 text-amber-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>
            检测到本地存储的图片。直接复制到微信公众号会导致<strong>图片失效（裂图）</strong>。建议在顶部配置第三方云图床，或手动在微信后台重新上传这些图片。
          </span>
        </div>
      )}

      {/* 可滚动预览区域 */}
      <div ref={scrollRef} className="preview-scroll flex-1 overflow-y-auto p-4 bg-slate-50">
        {(meta.title || meta.summary) && (
          <section className="mx-auto mb-2 grid w-full max-w-[700px] gap-2">
            {meta.title && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">标题</span>
                  <button
                    onClick={handleCopyTitle}
                    className="rounded px-2 py-0.5 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    复制
                  </button>
                </div>
                <div className="mt-0.5 text-sm font-semibold leading-5 text-slate-900">{meta.title}</div>
              </div>
            )}
            {meta.summary && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">摘要</span>
                  <button
                    onClick={handleCopySummary}
                    className="rounded px-2 py-0.5 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    复制
                  </button>
                </div>
                <div className="mt-0.5 text-xs leading-5 text-slate-600">{meta.summary}</div>
              </div>
            )}
          </section>
        )}

        <div className="phone-frame mx-auto">
          <div
            ref={contentRef}
            style={{
              padding: '20px 20px',
              color: '#333',
              fontSize: 15,
              lineHeight: 1.8,
              fontFamily: ARTICLE_FONT,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              backgroundColor: '#fff',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  )
}
