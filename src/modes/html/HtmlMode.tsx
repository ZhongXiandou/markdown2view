import { useEffect, useRef, useState } from 'react'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { HtmlSandbox } from '@/components/preview/HtmlSandbox'
import { downloadIframeAsImage, iframeToBlob, downloadBlob } from '@/lib/exportImage'
import { downloadAsZip, type ZipEntry } from '@/lib/export/zipDownload'
import { copyText } from '@/lib/clipboard'
import { buildDesignPrompt, type DesignStyle } from '@/data/designPrompts'
import { PromptLibrary } from './PromptLibrary'
import { detectPages, scrollToPage, type PageInfo } from '@/lib/multipage'
import { Button } from '@/components/ui/Button'

interface HtmlModeProps {
  html: string
  setHtml: (html: string) => void
  onToast: (message: string) => void
}

// HTML 可视化模式：左侧编辑 HTML，右侧 iframe 沙箱实时渲染，支持 Prompt 指令库与导出 PNG。
export function HtmlMode({ html, setHtml, onToast }: HtmlModeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [promptOpen, setPromptOpen] = useState(false)
  const [editorReady, setEditorReady] = useState(0)
  const [exporting, setExporting] = useState(false)

  const [pages, setPages] = useState<PageInfo[]>([])
  const [currentPage, setCurrentPage] = useState(0)

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

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const check = () => {
      if (iframe.contentDocument) {
        setTimeout(() => {
          const detected = detectPages(iframe.contentDocument!)
          setPages(detected)
          setCurrentPage(0)
        }, 500)
      }
    }
    iframe.addEventListener('load', check)
    check()
    return () => iframe.removeEventListener('load', check)
  }, [html, refreshKey])

  const handleExport = async () => {
    if (!iframeRef.current) {
      onToast('预览尚未就绪')
      return
    }
    setExporting(true)
    try {
      await downloadIframeAsImage(iframeRef.current, 'html')
      onToast('已导出 PNG')
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }

  const handleExportCurrentPage = async () => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument || !pages.length) return
    const page = pages[currentPage]
    if (!page) return
    
    setExporting(true)
    const allNodes = pages.map(p => p.node)
    const originalStyles = allNodes.map(n => n.style.display)
    try {
      // Hide all other pages
      allNodes.forEach((n, i) => {
        if (i !== currentPage) n.style.display = 'none'
      })
      
      const blob = await iframeToBlob(iframe, { scale: 2 })
      downloadBlob(blob, `html-page-${currentPage + 1}.png`)
      onToast(`已导出 ${page.label}`)
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      allNodes.forEach((n, i) => {
        n.style.display = originalStyles[i]
      })
      setExporting(false)
    }
  }

  const handleExportAllPages = async () => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument || !pages.length) return
    
    setExporting(true)
    const allNodes = pages.map(p => p.node)
    const originalStyles = allNodes.map(n => n.style.display)
    try {
      for (let i = 0; i < pages.length; i++) {
        // Hide all except current
        allNodes.forEach((n, j) => {
          n.style.display = j === i ? '' : 'none'
        })
        
        // Wait a frame for layout
        await new Promise(r => requestAnimationFrame(r))
        
        const blob = await iframeToBlob(iframe, { scale: 2 })
        downloadBlob(blob, `html-page-${i + 1}.png`)
      }

      onToast(`已导出 ${pages.length} 页`)
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      allNodes.forEach((n, i) => {
        n.style.display = originalStyles[i]
      })
      setExporting(false)
    }
  }

  const handleExportPagesZip = async () => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument || !pages.length) return
    
    setExporting(true)
    const allNodes = pages.map(p => p.node)
    const originalStyles = allNodes.map(n => n.style.display)
    try {
      const entries: ZipEntry[] = []
      
      for (let i = 0; i < pages.length; i++) {
        allNodes.forEach((n, j) => {
          n.style.display = j === i ? '' : 'none'
        })
        
        await new Promise(r => requestAnimationFrame(r))
        
        const blob = await iframeToBlob(iframe, { scale: 2 })
        entries.push({
          filename: `html-page-${String(i + 1).padStart(2, '0')}.png`,
          blob,
        })
      }
      await downloadAsZip(entries, `html-pages-${Date.now()}.zip`)
      onToast(`已打包 ${pages.length} 页`)
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      allNodes.forEach((n, i) => {
        n.style.display = originalStyles[i]
      })
      setExporting(false)
    }
  }

  const handleCopyPrompt = async (style: DesignStyle) => {
    const ok = await copyText(buildDesignPrompt(style))
    onToast(ok ? `已复制「${style.name}」风格指令` : '复制失败，请重试')
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      {/* 工具栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-2.5 shadow-sm backdrop-blur">
        <div className="flex items-baseline gap-3 overflow-hidden pr-4">
          <div className="text-[13px] font-semibold text-slate-900 shrink-0">HTML 可视化</div>
          <div className="text-[12px] text-slate-500 truncate flex items-center gap-1.5">
            <span className="rounded bg-blue-50 px-1.5 text-blue-700 font-semibold flex items-center gap-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>玩法</span>
            <span>选风格 → 发给 AI → 贴回代码</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pages.length > 0 && (
            <div className="flex items-center gap-1 mr-2">
              <span className="text-[12px] text-slate-500 font-medium px-1">
                {currentPage + 1} / {pages.length}
              </span>
              <Button
                onClick={() => {
                  const prev = Math.max(0, currentPage - 1)
                  setCurrentPage(prev)
                  if (iframeRef.current?.contentDocument) scrollToPage(iframeRef.current.contentDocument, prev)
                }}
                disabled={currentPage === 0}
                className="px-2"
              >
                ◀
              </Button>
              <Button
                onClick={() => {
                  const next = Math.min(pages.length - 1, currentPage + 1)
                  setCurrentPage(next)
                  if (iframeRef.current?.contentDocument) scrollToPage(iframeRef.current.contentDocument, next)
                }}
                disabled={currentPage === pages.length - 1}
                className="px-2"
              >
                ▶
              </Button>
            </div>
          )}

          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button onClick={() => setPromptOpen(true)}>
            📚 指令库
          </Button>
          <Button onClick={() => setRefreshKey((n) => n + 1)} title="重新渲染预览">
            🔄 刷新
          </Button>
          <Button onClick={() => iframeRef.current?.contentWindow?.print()}>
            🖨️ 导出 PDF
          </Button>
          {pages.length > 0 ? (
            <>
              <Button onClick={handleExportCurrentPage} disabled={exporting}>
                🖼️ 导出当前页
              </Button>
              <Button variant="primary" onClick={handleExportPagesZip} disabled={exporting}>
                {exporting ? '打包中…' : '📦 打包 ZIP'}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleExport} disabled={exporting}>
              {exporting ? '导出中…' : '🖼️ 导出 PNG'}
            </Button>
          )}
        </div>
      </div>

      {/* 左右分栏 */}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-px bg-gray-200">
        <section className="min-h-0 overflow-hidden bg-white">
          <CodeEditor
            value={html}
            onChange={setHtml}
            language="html"
            onScrollerReady={(el) => {
              editorScrollerRef.current = el
              setEditorReady((n) => n + 1)
            }}
          />
        </section>
        <section className="min-h-0 overflow-hidden bg-white">
          <HtmlSandbox 
            ref={iframeRef} 
            html={html} 
            refreshKey={refreshKey}
            onLoad={() => {
              const iframe = iframeRef.current
              if (!iframe?.contentDocument) return
              setTimeout(() => {
                const detected = detectPages(iframe.contentDocument!)
                setPages(detected)
                setCurrentPage(0)
              }, 500)
            }}
          />
        </section>
      </div>

      <PromptLibrary
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onCopy={handleCopyPrompt}
      />
    </main>
  )
}
