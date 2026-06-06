import { useRef } from 'react'
import type { MarkdownRenderResult } from '@/lib/render/markdown'
import { copyText, copyRichText, copyHtmlSource } from '@/lib/clipboard'
import { buildAiGuide } from '@/lib/aiGuide'
import { exportLongImage } from '@/lib/export/longImage'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useStore } from '@/lib/store'
import { getFontFamilyCss } from '@/lib/fonts'

interface ArticlePreviewProps {
  rendered: MarkdownRenderResult
  // 滚动容器引用，供滚动联动使用
  scrollRef: React.RefObject<HTMLDivElement>
  // 当前 Markdown 源码，供"指令+内容"复制使用
  markdown: string
  // 统一 Toast 反馈
  onToast: (message: string) => void
}

// 长图文预览：标题/摘要作为独立可复制元信息展示，正文继续复用共享 Markdown 渲染内核。
export function ArticlePreview({ rendered, scrollRef, markdown, onToast }: ArticlePreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { html, meta } = rendered
  const articleFont = useStore((s) => s.articleFont)
  const setArticleFont = useStore((s) => s.setArticleFont)

  const handleCopyTitle = async () => {
    const ok = await copyText(meta.title)
    onToast(ok ? '已复制标题' : '没有可复制的标题')
  }

  const handleCopySummary = async () => {
    const ok = await copyText(meta.summary)
    onToast(ok ? '已复制摘要' : '没有可复制的摘要')
  }

  const handleCopyGuide = async () => {
    const ok = await copyText(buildAiGuide())
    onToast(ok ? '已复制长图文 AI 排版指令，可发给 AI 使用' : '复制失败，请重试')
  }

  const handleCopyGuideWithContent = async () => {
    const ok = await copyText(`${buildAiGuide()}\n\n---\n\n以下是待处理内容：\n\n${markdown}`)
    onToast(ok ? '已复制 AI 指令和当前 Markdown 内容' : '复制失败，请重试')
  }

  const handleCopyHtml = async () => {
    if (!contentRef.current) return
    const ok = await copyHtmlSource(contentRef.current)
    onToast(ok ? '已复制 HTML 源码（全内联样式）' : '复制失败，请重试')
  }

  const handleCopyRichText = async () => {
    if (!contentRef.current) return
    const ok = await copyRichText(contentRef.current)
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

  return (
    <div className="flex h-full flex-col">
      {/* 复制类操作工具栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-2.5 shadow-sm backdrop-blur">
        <div className="flex items-baseline gap-3 overflow-hidden pr-4">
          <div className="text-[13px] font-semibold text-slate-900 shrink-0">长图文</div>
          <div className="text-[12px] text-slate-500 truncate">
            带样式的微信公众号格式长图文排版
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={articleFont}
            onChange={(e) => setArticleFont(e.target.value as any)}
          >
            <option value="songti">宋体</option>
            <option value="fangsong">仿宋</option>
            <option value="heiti">黑体</option>
            <option value="lxgwwenkai">霞鹜文楷</option>
          </Select>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button onClick={handleCopyGuide} title="复制一段语法说明，发给 AI 让它按支持的排版语法输出长图文">
            ✨ 复制指令
          </Button>
          <Button onClick={handleCopyGuideWithContent} title="复制 AI 指令和当前编辑区 Markdown">
            ✨ 指令+内容
          </Button>
          <Button onClick={handleCopyHtml} title="复制带内联样式的 HTML 源码">
            📄 HTML源码
          </Button>
          <Button onClick={handleExportLongImage} title="将文章内容导出为长图 PNG">
            🖼️ 导出长图
          </Button>
          <Button variant="primary" onClick={handleCopyRichText} title="复制富文本，可直接粘贴到公众号等长图文编辑器，排版不丢失">
            📋 复制富文本
          </Button>
        </div>
      </div>

      {/* 可滚动预览区域 */}
      <div ref={scrollRef} className="preview-scroll flex-1 overflow-y-auto p-4 bg-slate-50">
        {(meta.title || meta.summary) && (
          <section className="mx-auto mb-2 grid w-full max-w-[700px] gap-2">
            {meta.title && (
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">标题</span>
                  <button
                    onClick={handleCopyTitle}
                    className="rounded px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    复制
                  </button>
                </div>
                <div className="mt-0.5 text-sm font-semibold leading-5 text-gray-900">{meta.title}</div>
              </div>
            )}
            {meta.summary && (
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">摘要</span>
                  <button
                    onClick={handleCopySummary}
                    className="rounded px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    复制
                  </button>
                </div>
                <div className="mt-0.5 text-xs leading-5 text-gray-600">{meta.summary}</div>
              </div>
            )}
          </section>
        )}

        <div
          className="phone-frame mx-auto"
          style={{
            width: '100%',
            maxWidth: 700,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          <div
            ref={contentRef}
            style={{
              padding: '20px 20px',
              color: '#333',
              fontSize: 15,
              lineHeight: 1.8,
              fontFamily: getFontFamilyCss(articleFont),
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              backgroundColor: '#fff',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}
