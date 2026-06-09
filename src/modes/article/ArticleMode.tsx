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
  
  useEffect(() => {
    setLocalMarkdown(markdown)
  }, [markdown])

  const debouncedMarkdown = useDebounce(localMarkdown, 500)

  useEffect(() => {
    if (debouncedMarkdown !== markdown) {
      setMarkdown(debouncedMarkdown)
    }
  }, [debouncedMarkdown, markdown, setMarkdown])

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
