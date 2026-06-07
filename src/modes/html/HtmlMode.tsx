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

  // 多页模式：只显示当前页，隐藏其他页
  useEffect(() => {
    if (pages.length === 0) return
    pages.forEach((p, i) => {
      p.node.style.display = i === currentPage ? '' : 'none'
    })
  }, [pages, currentPage])

  // 键盘翻页支持
  useEffect(() => {
    if (pages.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免输入框冲突
      const active = document.activeElement
      if (active?.tagName === 'TEXTAREA' || active?.tagName === 'INPUT' || active?.closest('.cm-editor')) {
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentPage((prev) => {
          const next = Math.min(prev + 1, pages.length - 1)
          if (next !== prev) e.preventDefault()
          return next
        })
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentPage((prev) => {
          const next = Math.max(prev - 1, 0)
          if (next !== prev) e.preventDefault()
          return next
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const iframeDoc = iframeRef.current?.contentDocument
    if (iframeDoc) {
      iframeDoc.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (iframeDoc) {
        iframeDoc.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [pages])

  // 自动等比例缩放适应窗口大小
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleResize = () => {
      const doc = iframe.contentDocument
      if (!doc) return
      
      const viewW = iframe.clientWidth
      const viewH = iframe.clientHeight
      
      if (pages.length > 0) {
        // 多页模式：寻找当前可见页获取真实尺寸
        const pagesEls = Array.from(doc.querySelectorAll('.page, .slide, .card')) as HTMLElement[]
        const visiblePage = pagesEls.find(el => el.style.display !== 'none') || pagesEls[0]
        if (!visiblePage) return

        const rawW = visiblePage.offsetWidth
        const rawH = visiblePage.offsetHeight
        
        if (rawW && rawH) {
          const scale = Math.min(viewW / rawW, viewH / rawH)
          doc.documentElement.style.setProperty('--auto-scale', scale.toString())
        }
      } else {
        // 单页模式：适应宽度
        const wrapper = doc.querySelector('body > div') as HTMLElement
          || doc.querySelector('body > main') as HTMLElement
          || doc.querySelector('body > section') as HTMLElement
          || doc.body

        const oldZoom = doc.body.style.zoom
        doc.body.style.zoom = '1'
        const rawW = wrapper.offsetWidth
        if (rawW) {
          const scale = viewW / rawW
          doc.body.style.zoom = scale.toString()
        } else {
          doc.body.style.zoom = oldZoom
        }
      }
    }

    setTimeout(handleResize, 100)

    const ro = new ResizeObserver(() => {
      handleResize()
    })
    
    ro.observe(iframe)

    return () => {
      ro.disconnect()
    }
  }, [pages])

  const handleExport = async () => {
    if (!iframeRef.current) {
      onToast('预览尚未就绪')
      return
    }
    setExporting(true)
    const doc = iframeRef.current.contentDocument
    const oldZoom = doc?.body.style.zoom
    const oldScale = doc?.documentElement.style.getPropertyValue('--auto-scale')
    if (doc) {
      doc.body.style.zoom = '1'
      doc.documentElement.style.setProperty('--auto-scale', '1')
    }
    try {
      await downloadIframeAsImage(iframeRef.current, 'html')
      onToast('已导出 PNG')
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      if (doc) {
        doc.body.style.zoom = oldZoom || ''
        if (oldScale) doc.documentElement.style.setProperty('--auto-scale', oldScale)
      }
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
    const doc = iframe.contentDocument
    const oldZoom = doc?.body.style.zoom
    const oldScale = doc?.documentElement.style.getPropertyValue('--auto-scale')
    if (doc) {
      doc.body.style.zoom = '1'
      doc.documentElement.style.setProperty('--auto-scale', '1')
    }
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
      if (doc) {
        doc.body.style.zoom = oldZoom || ''
        if (oldScale) doc.documentElement.style.setProperty('--auto-scale', oldScale)
      }
      setExporting(false)
    }
  }

  const handleExportAllPages = async () => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument || !pages.length) return
    
    setExporting(true)
    const allNodes = pages.map(p => p.node)
    const originalStyles = allNodes.map(n => n.style.display)
    const doc = iframe.contentDocument
    const oldZoom = doc?.body.style.zoom
    const oldScale = doc?.documentElement.style.getPropertyValue('--auto-scale')
    if (doc) {
      doc.body.style.zoom = '1'
      doc.documentElement.style.setProperty('--auto-scale', '1')
    }
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
      if (doc) {
        doc.body.style.zoom = oldZoom || ''
        if (oldScale) doc.documentElement.style.setProperty('--auto-scale', oldScale)
      }
      setExporting(false)
    }
  }

  const handleExportPagesZip = async () => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument || !pages.length) return
    
    setExporting(true)
    const allNodes = pages.map(p => p.node)
    const originalStyles = allNodes.map(n => n.style.display)
    const doc = iframe.contentDocument
    const oldZoom = doc?.body.style.zoom
    const oldScale = doc?.documentElement.style.getPropertyValue('--auto-scale')
    if (doc) {
      doc.body.style.zoom = '1'
      doc.documentElement.style.setProperty('--auto-scale', '1')
    }
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
      if (doc) {
        doc.body.style.zoom = oldZoom || ''
        if (oldScale) doc.documentElement.style.setProperty('--auto-scale', oldScale)
      }
      setExporting(false)
    }
  }

  const handleExportPdf = async () => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) {
      onToast('预览尚未就绪')
      return
    }

    setExporting(true)
    const doc = iframe.contentDocument
    const oldZoom = doc?.body.style.zoom
    const oldScale = doc?.documentElement.style.getPropertyValue('--auto-scale')
    if (doc) {
      doc.body.style.zoom = '1'
      doc.documentElement.style.setProperty('--auto-scale', '1')
    }
    try {
      if (pages.length > 0) {
        // 多页模式：在 iframe 内逐页截图，保留完整样式
        const { exportIframeToPdf } = await import('@/lib/exportPdf')
        await exportIframeToPdf(
          iframe,
          pages.map(p => p.node),
          `html-${Date.now()}.pdf`
        )
      } else {
        // 单页模式：直接截取 iframe 全部内容
        const { exportSinglePageToPdf } = await import('@/lib/exportPdf')
        await exportSinglePageToPdf(iframe, `html-${Date.now()}.pdf`)
      }
      onToast('PDF 导出成功')
    } catch (e) {
      onToast(`PDF 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      if (doc) {
        doc.body.style.zoom = oldZoom || ''
        if (oldScale) doc.documentElement.style.setProperty('--auto-scale', oldScale)
      }
      setExporting(false)
    }
  }

  // 浏览器原生打印（文字可选可搜索）
  const handleBrowserPrint = () => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow || !iframe.contentDocument) {
      onToast('预览尚未就绪')
      return
    }

    const doc = iframe.contentDocument

    // 临时重置缩放
    const oldZoom = doc.body.style.zoom
    const oldScale = doc.documentElement.style.getPropertyValue('--auto-scale')
    doc.body.style.zoom = '1'
    doc.documentElement.style.setProperty('--auto-scale', '1')

    // 多页模式：打印前显示所有页面（@media print 的 break-after 会自动分页）
    const originalDisplays: string[] = []
    if (pages.length > 0) {
      pages.forEach((p, i) => {
        originalDisplays[i] = p.node.style.display
        p.node.style.display = ''
      })
    }

    // 监听 afterprint 事件恢复状态
    const restore = () => {
      if (pages.length > 0) {
        pages.forEach((p, i) => {
          p.node.style.display = originalDisplays[i]
        })
      }
      doc.body.style.zoom = oldZoom || ''
      if (oldScale) doc.documentElement.style.setProperty('--auto-scale', oldScale)
      iframe.contentWindow?.removeEventListener('afterprint', restore)
    }
    iframe.contentWindow.addEventListener('afterprint', restore)

    // 触发 iframe 内的打印
    iframe.contentWindow.print()
  }

  const handleCopyPrompt = async (style: DesignStyle) => {
    const ok = await copyText(buildDesignPrompt(style))
    onToast(ok ? `已复制「${style.name}」风格指令` : '复制失败，请重试')
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      {/* 工具栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-end border-b border-slate-200 bg-white/95 px-5 py-2.5 shadow-sm backdrop-blur">
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
                }}
                disabled={currentPage === 0}
                className="px-2"
              >
                ◀
              </Button>
              <Button
                onClick={() => {
                  const next = Math.min(currentPage + 1, pages.length - 1)
                  setCurrentPage(next)
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
          <Button onClick={() => iframeRef.current?.requestFullscreen?.()} title="全屏查看展示区内容">
            📺 全屏
          </Button>
          <Button onClick={handleExportPdf} disabled={exporting} title="截图式高保真导出，视觉完全一致">
            🖨️ 高保真 PDF
          </Button>
          <Button onClick={handleBrowserPrint} title="浏览器打印，文字可选可搜索">
            📄 可选文字 PDF
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
