import { Suspense, lazy, useEffect, useState } from 'react'
import { useStore, type DemoContents } from '@/lib/store'
import { Toast, type ToastState } from '@/components/ui/Toast'
import { ModeTabs } from '@/components/layout/ModeTabs'
import { THEMES } from '@engine/composables/useTheme'
import { SettingsModal } from '@/components/editor/SettingsModal'

import { DEMO_ARTICLE } from '@/data/demoArticle'
import { DEMO_DOCUMENT } from '@/data/demoDocument'
import { DEMO_CARD } from '@/data/demoCard'
import { DEMO_HTML } from '@/data/demoHtml'

const ArticleMode = lazy(() => import('@/modes/article/ArticleMode').then((m) => ({ default: m.ArticleMode })))
const DocumentMode = lazy(() => import('@/modes/document/DocumentMode').then((m) => ({ default: m.DocumentMode })))
const CardMode = lazy(() => import('@/modes/card/CardMode').then((m) => ({ default: m.CardMode })))
const HtmlMode = lazy(() => import('@/modes/html/HtmlMode').then((m) => ({ default: m.HtmlMode })))

function ModeLoading() {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 text-sm text-slate-400">
      正在加载工作台...
    </main>
  )
}

// 各模式最新示例内容集合（模块级常量，引用稳定），供版本同步与恢复示例使用。
const DEMOS: DemoContents = {
  article: DEMO_ARTICLE,
  document: DEMO_DOCUMENT,
  card: DEMO_CARD,
  html: DEMO_HTML,
}

// 多场景渲染工作台：长图文 / A4 文档 / 小红书卡片 / HTML 可视化。
export default function App() {
  const articleMarkdown = useStore((s) => s.articleMarkdown)
  const setArticleMarkdown = useStore((s) => s.setArticleMarkdown)
  const documentMarkdown = useStore((s) => s.documentMarkdown)
  const setDocumentMarkdown = useStore((s) => s.setDocumentMarkdown)
  const cardMarkdown = useStore((s) => s.cardMarkdown)
  const setCardMarkdown = useStore((s) => s.setCardMarkdown)
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
  const syncDemoContent = useStore((s) => s.syncDemoContent)
  const restoreDemo = useStore((s) => s.restoreDemo)

  // 图床设置弹窗状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 统一 Toast 反馈
  const [toast, setToast] = useState<ToastState | null>(null)
  const showToast = (message: string) => setToast({ message, key: Date.now() })

  // 挂载时按版本号同步示例：仅当 DEMO_VERSION 变化时，刷新用户未编辑过的字段为最新示例。
  useEffect(() => {
    syncDemoContent(DEMOS)
  }, [syncDemoContent])

  const handleRestoreDemo = () => {
    if (window.confirm('确定要恢复当前模块的示例内容吗？这将会覆盖当前编辑区内容。')) {
      restoreDemo(mode, DEMOS)
      showToast('已恢复当前模块示例')
    }
  }


  return (
    <div className="flex h-full flex-col">
      {/* 顶部导航栏 */}
      <header className="app-header relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="app-logo-bg flex h-7 w-7 items-center justify-center rounded-md text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
            </div>
            <h1 className="text-[17px] font-bold tracking-tight text-slate-800">
              markdown<span className="app-title-accent">2</span>view
            </h1>
          </div>
          {/* 多模式切换 */}
          <ModeTabs mode={mode} onChange={setMode} />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="图片上传与图床配置"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            图床设置
          </button>

          <div className="w-px h-4 bg-slate-200" />

          <button
            onClick={handleRestoreDemo}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="恢复当前模块的示例内容"
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
      <Suspense fallback={<ModeLoading />}>
        {mode === 'article' && (
          <ArticleMode
            markdown={articleMarkdown}
            setMarkdown={setArticleMarkdown}
            colors={colors}
            onToast={showToast}
          />
        )}
        {mode === 'html' && <HtmlMode html={html} setHtml={setHtml} onToast={showToast} />}
        {mode === 'document' && (
          <DocumentMode
            markdown={documentMarkdown}
            setMarkdown={setDocumentMarkdown}
            colors={colors}
            settings={documentSettings}
            updateSettings={updateDocumentSettings}
            onToast={showToast}
          />
        )}
        {mode === 'card' && (
          <CardMode
            markdown={cardMarkdown}
            setMarkdown={setCardMarkdown}
            colors={colors}
            platform={platform === 'xiaohongshu' ? platform : 'xiaohongshu'}
            setPlatform={setPlatform}
            onToast={showToast}
          />
        )}
      </Suspense>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <Toast toast={toast} />
    </div>
  )
}
