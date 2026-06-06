import { useMemo, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { useScrollSync } from '@/lib/useScrollSync'
import { renderMarkdown } from '@/lib/render/markdown'
import { Toast, type ToastState } from '@/components/ui/Toast'
import { ModeTabs } from '@/components/layout/ModeTabs'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { ArticlePreview } from '@/modes/article/ArticlePreview'
import { DocumentMode } from '@/modes/document/DocumentMode'
import { CardMode } from '@/modes/card/CardMode'
import { HtmlMode } from '@/modes/html/HtmlMode'
import { THEMES } from '@engine'

// 多场景渲染工作台：长图文 / HTML 可视化 / 其余待实现。
export default function App() {
  const markdown = useStore((s) => s.markdown)
  const setMarkdown = useStore((s) => s.setMarkdown)
  const html = useStore((s) => s.html)
  const setHtml = useStore((s) => s.setHtml)
  const colors = useStore((s) => s.colors)
  const accent = useStore((s) => s.accent)
  const setTheme = useStore((s) => s.setTheme)
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const platform = useStore((s) => s.platform)
  const setPlatform = useStore((s) => s.setPlatform)
  const documentSettings = useStore((s) => s.documentSettings)
  const updateDocumentSettings = useStore((s) => s.updateDocumentSettings)
  const renderedMarkdown = useMemo(() => renderMarkdown(markdown, colors), [markdown, colors])

  // 滚动联动：编辑器滚动容器与预览滚动容器按比例同步
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(0)
  useScrollSync(editorScrollerRef, previewScrollRef, [editorReady])

  // 统一 Toast 反馈
  const [toast, setToast] = useState<ToastState | null>(null)
  const showToast = (message: string) => setToast({ message, key: Date.now() })

  const handleRestoreDemo = () => {
    if (window.confirm('确定要恢复示例文件吗？这将会覆盖你当前所有的输入内容。')) {
      import('@/data/demoContent').then(({ DEMO_CONTENT }) => {
        setMarkdown(DEMO_CONTENT)
        showToast('已恢复示例文件')
      })
    }
  }


  return (
    <div className="flex h-full flex-col">
      {/* 顶部导航栏 */}
      <header className="app-header relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md text-white shadow-sm" style={{ background: 'var(--accent)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
            </div>
            <h1 className="text-[17px] font-bold tracking-tight text-slate-800">
              markdown<span style={{ color: 'var(--accent)' }}>2</span>view
            </h1>
          </div>
          {/* 多模式切换 */}
          <ModeTabs mode={mode} onChange={setMode} />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRestoreDemo}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="恢复默认的示例文件"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            恢复示例
          </button>
          
          <div className="w-px h-4 bg-slate-200" />

          {/* 主题色切换 */}
          <div className="flex items-center gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.accent}
                title={t.accent}
                onClick={() => setTheme(t.accent, t.dark)}
                className="h-5 w-5 rounded-full border transition-transform hover:scale-110"
                style={{
                  background: t.accent,
                  borderColor: accent === t.accent ? '#111' : 'transparent',
                  outline: accent === t.accent ? '2px solid #1118' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* 主体：按模式渲染 */}
      {mode === 'article' && (
        <main className="grid min-h-0 flex-1 grid-cols-2 gap-px bg-gray-200">
          <section className="min-h-0 overflow-hidden bg-white">
            <CodeEditor
              value={markdown}
              onChange={setMarkdown}
              onScrollerReady={(el) => {
                editorScrollerRef.current = el
                setEditorReady((n) => n + 1)
              }}
            />
          </section>
          <section className="min-h-0 overflow-hidden bg-gray-50">
            <ArticlePreview
              rendered={renderedMarkdown}
              scrollRef={previewScrollRef}
              markdown={markdown}
              onToast={showToast}
            />
          </section>
        </main>
      )}
      {mode === 'html' && <HtmlMode html={html} setHtml={setHtml} onToast={showToast} />}
      {mode === 'document' && (
        <DocumentMode
          markdown={markdown}
          setMarkdown={setMarkdown}
          rendered={renderedMarkdown}
          colors={colors}
          settings={documentSettings}
          updateSettings={updateDocumentSettings}
          onToast={showToast}
        />
      )}
      {mode === 'card' && (
        <CardMode
          markdown={markdown}
          setMarkdown={setMarkdown}
          colors={colors}
          platform={'xiaohongshu'}
          setPlatform={setPlatform}
          onToast={showToast}
        />
      )}

      <Toast toast={toast} />
    </div>
  )
}
