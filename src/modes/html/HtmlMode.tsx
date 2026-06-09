import { useEffect, useRef, useState } from 'react'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { HtmlSandbox } from '@/components/preview/HtmlSandbox'
import { downloadBlob, resolveBackground, captureElementInIframeToBlob } from '@/lib/exportImage'
import { downloadAsZip, type ZipEntry } from '@/lib/export/zipDownload'
import { copyText } from '@/lib/clipboard'
import { buildDesignPrompt, type DesignStyle } from '@/data/designPrompts'
import { PromptLibrary } from './PromptLibrary'
import { useDebounce } from '@/lib/useDebounce'
import { detectPages, type PageInfo } from '@/lib/multipage'
import { Button } from '@/components/ui/Button'

interface HtmlModeProps {
  html: string
  setHtml: (html: string) => void
  onToast: (message: string) => void
}

function firstContentElement(doc: Document): HTMLElement {
  return (
    doc.querySelector<HTMLElement>('body > div')
    || doc.querySelector<HTMLElement>('body > main')
    || doc.querySelector<HTMLElement>('body > section')
    || doc.body
  )
}

function firstPreviewPage(doc: Document): HTMLElement | null {
  const pageNodes = Array.from(doc.querySelectorAll<HTMLElement>('.page, .slide, .card'))
  return pageNodes.find((node) => node.style.display !== 'none') || pageNodes[0] || null
}

async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

async function withScaleReset<T>(doc: Document, task: () => Promise<T>): Promise<T> {
  const oldZoom = doc.body.style.zoom
  const oldScale = doc.documentElement.style.getPropertyValue('--auto-scale')

  doc.body.style.zoom = '1'
  doc.documentElement.style.setProperty('--auto-scale', '1')

  try {
    return await task()
  } finally {
    doc.body.style.zoom = oldZoom
    if (oldScale) {
      doc.documentElement.style.setProperty('--auto-scale', oldScale)
    } else {
      doc.documentElement.style.removeProperty('--auto-scale')
    }
  }
}

async function withVisiblePage<T>(
  pageNodes: HTMLElement[],
  visibleIndex: number,
  task: () => Promise<T>,
): Promise<T> {
  const originalStyles = pageNodes.map((node) => node.style.display)
  pageNodes.forEach((node, index) => {
    node.style.display = index === visibleIndex ? '' : 'none'
  })
  await nextFrame()

  try {
    return await task()
  } finally {
    pageNodes.forEach((node, index) => {
      node.style.display = originalStyles[index]
    })
  }
}

async function captureIframeElement(
  iframe: HTMLIFrameElement,
  element: HTMLElement,
): Promise<Blob> {
  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) throw new Error('预览尚未就绪')

  const bgColor = resolveBackground(doc, win)
  return captureElementInIframeToBlob(iframe, element, {
    scale: 2,
    backgroundColor: bgColor,
  })
}

// HTML 可视化模式：左侧编辑 HTML，右侧 iframe 沙箱实时渲染，支持 Prompt 指令库与导出 PNG。
export function HtmlMode({ html, setHtml, onToast }: HtmlModeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewPaneRef = useRef<HTMLElement | null>(null)
  const lastWheelFlipAtRef = useRef(0)
  const currentPageRef = useRef(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [promptOpen, setPromptOpen] = useState(false)
  const [editorReady, setEditorReady] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [allowScripts, setAllowScripts] = useState(true)

  const [localHtml, setLocalHtml] = useState(html)
  // 外部 store 变化（恢复示例 / 版本刷新）→ 同步到本地编辑器
  useEffect(() => {
    setLocalHtml(html)
  }, [html])
  const debouncedHtml = useDebounce(localHtml, 500)

  // 始终持有最新的 store 值供回写比较，避免把外部更新误判为本地编辑
  const htmlRef = useRef(html)
  useEffect(() => {
    htmlRef.current = html
  }, [html])

  // 本地编辑（防抖后）→ 回写 store。仅依赖防抖值，外部更新不会触发回写，避免回滚
  useEffect(() => {
    if (debouncedHtml !== htmlRef.current) {
      setHtml(debouncedHtml)
    }
  }, [debouncedHtml, setHtml])

  const [pages, setPages] = useState<PageInfo[]>([])
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

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
  }, [debouncedHtml, refreshKey])

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

  // 多页模式：鼠标滚轮在右侧渲染区内上下翻页。
  useEffect(() => {
    if (pages.length <= 1) return

    const flipByWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 24) return

      const now = Date.now()
      if (now - lastWheelFlipAtRef.current < 360) {
        event.preventDefault()
        return
      }

      const prev = currentPageRef.current
      const next = event.deltaY > 0
        ? Math.min(prev + 1, pages.length - 1)
        : Math.max(prev - 1, 0)

      if (next !== prev) {
        currentPageRef.current = next
        setCurrentPage(next)
        lastWheelFlipAtRef.current = now
      }
      event.preventDefault()
    }

    const pane = previewPaneRef.current
    const iframeDoc = iframeRef.current?.contentDocument
    pane?.addEventListener('wheel', flipByWheel, { passive: false })
    iframeDoc?.addEventListener('wheel', flipByWheel, { passive: false })

    return () => {
      pane?.removeEventListener('wheel', flipByWheel)
      iframeDoc?.removeEventListener('wheel', flipByWheel)
    }
  }, [pages])

  // 自动等比例缩放适应窗口大小
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let cancelled = false
    let contentObserver: ResizeObserver | null = null
    const timers: ReturnType<typeof setTimeout>[] = []

    const handleResize = () => {
      if (cancelled) return
      const doc = iframe.contentDocument
      if (!doc) return
      
      const viewW = iframe.clientWidth
      const viewH = iframe.clientHeight
      if (!viewW || !viewH) return
      
      if (pages.length > 0) {
        // 多页模式：寻找当前可见页获取真实尺寸
        const visiblePage = firstPreviewPage(doc)
        if (!visiblePage) return

        doc.body.style.zoom = '1'
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

        doc.documentElement.style.removeProperty('--auto-scale')
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

    const scheduleResize = (delay = 0) => {
      const timer = setTimeout(() => requestAnimationFrame(handleResize), delay)
      timers.push(timer)
    }

    const observeContent = () => {
      contentObserver?.disconnect()
      const doc = iframe.contentDocument
      if (!doc) return

      contentObserver = new ResizeObserver(() => scheduleResize())
      contentObserver.observe(doc.documentElement)
      contentObserver.observe(doc.body)
      const page = firstPreviewPage(doc)
      if (page) contentObserver.observe(page)

      doc.fonts?.ready.then(() => scheduleResize()).catch(() => {})
      doc.querySelectorAll('img').forEach((img) => {
        if (!img.complete) img.addEventListener('load', () => scheduleResize(), { once: true })
      })
    }

    const stabilizeScale = () => {
      observeContent()
      ;[0, 50, 150, 350, 800].forEach(scheduleResize)
    }

    stabilizeScale()

    const ro = new ResizeObserver(() => {
      scheduleResize()
    })
    
    ro.observe(iframe)

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      ro.disconnect()
      contentObserver?.disconnect()
    }
  }, [debouncedHtml, refreshKey, pages, currentPage])

  const handleExport = async () => {
    if (!iframeRef.current) {
      onToast('预览尚未就绪')
      return
    }
    setExporting(true)
    const doc = iframeRef.current.contentDocument
    if (!doc) {
      onToast('预览尚未就绪')
      setExporting(false)
      return
    }
    try {
      await withScaleReset(doc, async () => {
        const blob = await captureIframeElement(iframeRef.current!, firstContentElement(doc))
        downloadBlob(blob, `html-${Date.now()}.png`)
      })
      onToast('已导出 PNG')
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }

  const handleExportCurrentPage = async () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc || !pages.length) return
    const page = pages[currentPage]
    if (!page) return
    
    setExporting(true)
    const allNodes = pages.map(p => p.node)
    try {
      await withScaleReset(doc, async () => {
        await withVisiblePage(allNodes, currentPage, async () => {
          const blob = await captureIframeElement(iframe, page.node)
          downloadBlob(blob, `html-page-${currentPage + 1}.png`)
        })
      })
      onToast(`已导出 ${page.label}`)
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPagesZip = async () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc || !pages.length) return
    
    setExporting(true)
    const allNodes = pages.map(p => p.node)
    try {
      const entries: ZipEntry[] = []

      await withScaleReset(doc, async () => {
        for (let i = 0; i < pages.length; i++) {
          const blob = await withVisiblePage(allNodes, i, () => captureIframeElement(iframe, pages[i].node))
          entries.push({
            filename: `html-page-${String(i + 1).padStart(2, '0')}.png`,
            blob,
          })
        }
      })
      await downloadAsZip(entries, `html-pages-${Date.now()}.zip`)
      onToast(`已打包 ${pages.length} 页`)
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }
  const handleExportPdf = async () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) {
      onToast('预览尚未就绪')
      return
    }

    setExporting(true)
    try {
      await withScaleReset(doc, async () => {
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
      })
      onToast('PDF 导出成功')
    } catch (e) {
      onToast(`PDF 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
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
          <label className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowScripts}
              onChange={(e) => {
                setAllowScripts(e.target.checked)
                setRefreshKey((n) => n + 1)
              }}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            互动脚本
          </label>
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
            value={localHtml}
            onChange={setLocalHtml}
            language="html"
            onScrollerReady={(el) => {
              editorScrollerRef.current = el
              setEditorReady((n) => n + 1)
            }}
          />
        </section>
        <section ref={previewPaneRef} className="min-h-0 overflow-hidden bg-white">
          <HtmlSandbox 
            ref={iframeRef} 
            html={debouncedHtml} 
            refreshKey={refreshKey}
            allowScripts={allowScripts}
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
