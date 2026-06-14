import { useMemo, useRef, useState } from 'react'
import type { ThemeColors } from '@engine'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { useScrollSync } from '@/lib/useScrollSync'
import { renderMarkdown } from '@/lib/render/markdown'
import { ArticlePreview } from './ArticlePreview'
import { useEditorDocSync } from '@/lib/useEditorDocSync'
import { UserGuidePopover } from '@/components/ui/UserGuidePopover'
import { useStore } from '@/lib/store'

interface ArticleModeProps {
  markdown: string
  setMarkdown: (markdown: string) => void
  colors: ThemeColors
  onToast: (message: string) => void
}

export function ArticleMode({ markdown, setMarkdown, colors, onToast }: ArticleModeProps) {
  const guideTrigger = useStore((s) => s.guideTrigger.article)
  // store ↔ 编辑器双向同步（防抖回写 + 外部变更信号）
  const {
    localValue: localMarkdown,
    debouncedValue: debouncedMarkdown,
    setLocalValue: setLocalMarkdown,
    externalVersion,
  } = useEditorDocSync(markdown, setMarkdown)

  const rendered = useMemo(() => renderMarkdown(debouncedMarkdown, colors), [debouncedMarkdown, colors])
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(0)
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit')

  useScrollSync(editorScrollerRef, previewScrollRef, [editorReady])

  return (
    <main className="flex flex-col min-h-0 flex-1 bg-gray-200">
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
        <section className={`min-h-0 overflow-hidden bg-white flex flex-col ${activeView === 'edit' ? 'flex' : 'hidden md:flex'}`}>
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
        <section className={`min-h-0 overflow-hidden bg-gray-50 flex flex-col ${activeView === 'preview' ? 'flex' : 'hidden md:flex'}`}>
          <ArticlePreview
            rendered={rendered}
            markdown={debouncedMarkdown}
            scrollRef={previewScrollRef}
            onToast={onToast}
          />
        </section>
      </div>
      <UserGuidePopover
        guideKey="m2v-article-guide-seen"
        forceOpenTrigger={guideTrigger}
        title="长图文排版 快速开始"
        subtitle="利用 AI 提示词与公众号排版引擎，轻松渲染出专业的内容设计"
        steps={[
          {
            icon: '📚',
            title: '复制排版指令',
            desc: '点击上方预览区「复制排版指令」按钮，将专为本公众号排版引擎设计的 AI 提示词复制到剪贴板。',
          },
          {
            icon: '🤖',
            title: '发给 AI 优化文章内容',
            desc: '将复制的指令连同你的文章草稿一起发给 AI，让其输出符合特定组件排版规则（如 steps 步骤条、compare 对比卡等）的 Markdown。',
          },
          {
            icon: '📋',
            title: '回填内容并一键复制',
            desc: '将 AI 输出的 Markdown 粘贴到左侧编辑器，右侧将实时渲染排版；确认无误后点击「复制富文本」即可无损粘贴到微信公众号后台。',
          },
        ]}
      />
    </main>
  )
}
