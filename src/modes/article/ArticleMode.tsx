import { useMemo, useRef, useState, useEffect } from 'react'
import type { ThemeColors } from '@engine'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { useScrollSync } from '@/lib/useScrollSync'
import { renderMarkdown } from '@/lib/render/markdown'
import { ArticlePreview } from './ArticlePreview'
import { useDebounce } from '@/lib/useDebounce'

interface ArticleModeProps {
  markdown: string
  setMarkdown: (markdown: string) => void
  colors: ThemeColors
  onToast: (message: string) => void
}

export function ArticleMode({ markdown, setMarkdown, colors, onToast }: ArticleModeProps) {
  const [localMarkdown, setLocalMarkdown] = useState(markdown)

  // 外部 store 变化（恢复示例 / 版本刷新）→ 同步到本地编辑器
  useEffect(() => {
    setLocalMarkdown(markdown)
  }, [markdown])

  const debouncedMarkdown = useDebounce(localMarkdown, 500)

  // 始终持有最新的 store 值供回写比较，避免把外部更新误判为本地编辑
  const markdownRef = useRef(markdown)
  useEffect(() => {
    markdownRef.current = markdown
  }, [markdown])

  // 本地编辑（防抖后）→ 回写 store。仅依赖防抖值，外部更新不会触发回写，避免回滚
  useEffect(() => {
    if (debouncedMarkdown !== markdownRef.current) {
      setMarkdown(debouncedMarkdown)
    }
  }, [debouncedMarkdown, setMarkdown])

  const rendered = useMemo(() => renderMarkdown(debouncedMarkdown, colors), [debouncedMarkdown, colors])
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(0)

  useScrollSync(editorScrollerRef, previewScrollRef, [editorReady])

  return (
    <main className="grid min-h-0 flex-1 grid-cols-2 gap-px bg-gray-200">
      <section className="min-h-0 overflow-hidden bg-white">
        <CodeEditor
          value={localMarkdown}
          onChange={setLocalMarkdown}
          onScrollerReady={(el) => {
            editorScrollerRef.current = el
            setEditorReady((n) => n + 1)
          }}
        />
      </section>
      <section className="min-h-0 overflow-hidden bg-gray-50">
        <ArticlePreview
          rendered={rendered}
          scrollRef={previewScrollRef}
          onToast={onToast}
        />
      </section>
    </main>
  )
}
