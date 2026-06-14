import { useEffect, useRef, useState, useMemo } from 'react'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { PreviewToolbar, type ToolbarItem } from '@/components/layout/PreviewToolbar'
import { HtmlSandbox } from '@/components/preview/HtmlSandbox'
import { downloadBlob, resolveBackground, captureElementInIframeToBlob } from '@/lib/exportImage'
import { downloadAsZip, type ZipEntry } from '@/lib/export/zipDownload'
import { copyText } from '@/lib/clipboard'
import { buildDesignPrompt, type DesignStyle } from '@/data/designPrompts'
import { PromptLibrary } from './PromptLibrary'
import { useEditorDocSync } from '@/lib/useEditorDocSync'
import { detectPages, type PageInfo } from '@/lib/multipage'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { useImageUpload } from '@/lib/useImageUpload'
import { exportHtmlSource } from '@/lib/exportSource'
import { UI_LABELS } from '@/lib/uiLabels'
import { UserGuidePopover } from '@/components/ui/UserGuidePopover'
import { useStore } from '@/lib/store'
import { useExportAction } from '@/lib/useExportAction'

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
  const guideTrigger = useStore((s) => s.guideTrigger.html)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewPaneRef = useRef<HTMLElement | null>(null)
  const lastWheelFlipAtRef = useRef(0)
  const currentPageRef = useRef(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [promptOpen, setPromptOpen] = useState(false)
  const [editorReady, setEditorReady] = useState(0)
  const [exporting, runExport] = useExportAction(onToast)
  const [allowScripts, setAllowScripts] = useState(false)
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 监听全屏状态变化，用于在全屏播放时隐藏工具栏
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === previewPaneRef.current)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])
  
  // 提前通过 DOMParser 检测预期的页面数量，避免 iframe 加载完成前后工具栏发生抖动闪烁（即所谓的"加载两次"视觉效果）
  const expectedPageCount = useMemo(() => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.querySelectorAll('.page, .slide, .card').length
  }, [html])

  // store ↔ 编辑器双向同步（防抖回写 + 外部变更信号）
  const {
    localValue: localHtml,
    debouncedValue: debouncedHtml,
    setLocalValue: setLocalHtml,
    externalVersion,
  } = useEditorDocSync(html, setHtml)

  const htmlTitle = useMemo(() => {
    try {
      const doc = new DOMParser().parseFromString(localHtml, 'text/html')
      const titleText = doc.querySelector('title')?.textContent?.trim()
        || doc.querySelector('h1')?.textContent?.trim()
        || ''
      return titleText ? titleText.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 40) : ''
    } catch {
      return ''
    }
  }, [localHtml])

  // 图片上传
  const { fileInputRef, uploading, triggerUpload, handleFileChange } = useImageUpload(onToast)

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

  const handleExport = () => {
    if (!iframeRef.current) {
      onToast('预览尚未就绪')
      return
    }
    const doc = iframeRef.current.contentDocument
    if (!doc) {
      onToast('预览尚未就绪')
      return
    }
    runExport(async () => {
      await withScaleReset(doc, async () => {
        const blob = await captureIframeElement(iframeRef.current!, firstContentElement(doc))
        const title = htmlTitle || 'html'
        downloadBlob(blob, `${title}.png`)
      })
      return '已导出 PNG'
    })
  }

  const handleExportCurrentPage = () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc || !pages.length) return
    const page = pages[currentPage]
    if (!page) return
    
    const allNodes = pages.map(p => p.node)
    runExport(async () => {
      await withScaleReset(doc, async () => {
        await withVisiblePage(allNodes, currentPage, async () => {
          const blob = await captureIframeElement(iframe, page.node)
          const title = htmlTitle || 'html'
          downloadBlob(blob, `${title}-page-${currentPage + 1}.png`)
        })
      })
      return `已导出 ${page.label}`
    })
  }

  const handleExportPagesZip = () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc || !pages.length) return
    
    const allNodes = pages.map(p => p.node)
    runExport(async () => {
      const entries: ZipEntry[] = []

      await withScaleReset(doc, async () => {
        const title = htmlTitle || 'html'
        for (let i = 0; i < pages.length; i++) {
          const blob = await withVisiblePage(allNodes, i, () => captureIframeElement(iframe, pages[i].node))
          entries.push({
            filename: `${title}-page-${String(i + 1).padStart(2, '0')}.png`,
            blob,
          })
        }
      })
      const title = htmlTitle || 'html'
      await downloadAsZip(entries, `${title}-pages.zip`)
      return `已打包 ${pages.length} 页`
    })
  }
  const handleExportPdf = () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) {
      onToast('预览尚未就绪')
      return
    }

    runExport(async () => {
      await withScaleReset(doc, async () => {
        const title = htmlTitle || 'html'
        if (pages.length > 0) {
          // 多页模式：在 iframe 内逐页截图，保留完整样式
          const { exportIframeToPdf } = await import('@/lib/exportPdf')
          await exportIframeToPdf(
            iframe,
            pages.map(p => p.node),
            `${title}.pdf`
          )
        } else {
          // 单页模式：直接截取 iframe 全部内容
          const { exportSinglePageToPdf } = await import('@/lib/exportPdf')
          await exportSinglePageToPdf(iframe, `${title}.pdf`)
        }
      })
      return 'PDF 导出成功'
    })
  }



  const handleCopyPrompt = async (style: DesignStyle) => {
    const ok = await copyText(buildDesignPrompt(style))
    onToast(ok ? `已复制「${style.name}」风格指令` : '复制失败，请重试')
  }

  const toolbarActions: ToolbarItem[] = [
    {
      id: 'fullscreen',
      icon: '📺',
      label: UI_LABELS.toolbar.fullscreen.label,
      tooltip: UI_LABELS.toolbar.fullscreen.tooltip,
      onClick: () => previewPaneRef.current?.requestFullscreen?.(),
    },
    {
      id: 'refresh',
      icon: '🔄',
      label: UI_LABELS.toolbar.refresh.label,
      tooltip: UI_LABELS.toolbar.refresh.tooltip,
      onClick: () => setRefreshKey((n) => n + 1),
    },
    ...(pages.length > 1 || expectedPageCount > 1
      ? [
          {
            id: 'pagination',
            label: '分页控制',
            node: (
              <div className="flex items-center gap-0.5 px-1">
                <Button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="px-2">◀</Button>
                <span className="text-[12px] text-slate-500 font-medium px-1.5 tabular-nums">
                  {currentPage + 1} / {Math.max(pages.length, expectedPageCount)}
                </span>
                <Button onClick={() => setCurrentPage(Math.min(currentPage + 1, pages.length - 1))} disabled={currentPage >= Math.max(pages.length, expectedPageCount) - 1 || pages.length === 0} className="px-2">▶</Button>
              </div>
            ),
          } as ToolbarItem,
        ]
      : []),
    'separator',
    {
      id: 'promptLibrary',
      icon: '📚',
      label: UI_LABELS.toolbar.promptLibrary.label,
      tooltip: UI_LABELS.toolbar.promptLibrary.tooltip,
      onClick: () => setPromptOpen(true),
      variant: 'primary',
      className: 'shadow-sm',
    },
    'separator',
    {
      id: 'uploadImage',
      icon: '🖼️',
      label: uploading ? '上传中…' : UI_LABELS.toolbar.uploadImage.label,
      tooltip: UI_LABELS.toolbar.uploadImage.tooltip,
      onClick: triggerUpload,
      disabled: uploading,
    },
    {
      id: 'allowScripts',
      label: '互动脚本控制',
      tooltip: UI_LABELS.toolbar.allowScripts.tooltip,
      node: (
        <label className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-900 cursor-pointer select-none px-1">
          <input
            type="checkbox"
            checked={allowScripts}
            onChange={(e) => {
              setAllowScripts(e.target.checked)
              setRefreshKey((n) => n + 1)
            }}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          {UI_LABELS.toolbar.allowScripts.label}
        </label>
      ),
    },
    'separator',
  ]

  if (pages.length > 0 || expectedPageCount > 1) {
    toolbarActions.push({
      id: 'exportCurrentPage',
      icon: '🖼️',
      label: UI_LABELS.toolbar.exportCurrentPage.label,
      tooltip: UI_LABELS.toolbar.exportCurrentPage.tooltip,
      onClick: handleExportCurrentPage,
      disabled: exporting || pages.length === 0,
    })
    toolbarActions.push({
      id: 'exportZip',
      icon: '📦',
      label: exporting ? '打包中…' : UI_LABELS.toolbar.exportZip.label,
      tooltip: UI_LABELS.toolbar.exportZip.tooltip,
      onClick: handleExportPagesZip,
      disabled: exporting || pages.length === 0,
    })
  }

  toolbarActions.push({
    id: 'exportSource',
    icon: '💾',
    label: UI_LABELS.toolbar.exportSource.label,
    tooltip: UI_LABELS.toolbar.exportSource.tooltip,
    onClick: () => {
      const title = htmlTitle || 'html'
      exportHtmlSource(localHtml, `${title}.html`)
    },
  })

  if (pages.length === 0 && expectedPageCount <= 1) {
    toolbarActions.push({
      id: 'exportPng',
      icon: '🖼️',
      label: exporting ? '导出中…' : UI_LABELS.toolbar.exportPng.label,
      tooltip: UI_LABELS.toolbar.exportPng.tooltip,
      onClick: handleExport,
      disabled: exporting,
    })
  }

  toolbarActions.push({
    id: 'exportPdf',
    icon: '🖨️',
    label: UI_LABELS.toolbar.exportPdf.label,
    tooltip: UI_LABELS.toolbar.exportPdf.tooltip,
    onClick: handleExportPdf,
    disabled: exporting,
    variant: 'primary',
    className: 'shadow-sm',
  })

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

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* 左右分栏 */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
        <section className={`min-h-0 overflow-hidden bg-white flex flex-col ${activeView === 'edit' ? 'flex' : 'hidden md:flex'}`}>
          <CodeEditor
            value={localHtml}
            onChange={setLocalHtml}
            language="html"
            externalVersion={externalVersion}
            onScrollerReady={(el) => {
              editorScrollerRef.current = el
              setEditorReady((n) => n + 1)
            }}
          />
        </section>
        <section ref={previewPaneRef} className={`min-h-0 overflow-hidden bg-white flex flex-col relative ${activeView === 'preview' ? 'flex' : 'hidden md:flex'}`}>
          {!isFullscreen && <PreviewToolbar actions={toolbarActions} className="shrink-0" />}
          <div className="flex-1 min-h-0 relative">
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
          </div>
        </section>
      </div>

      <PromptLibrary
        mode="html"
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onCopy={handleCopyPrompt}
        onToast={onToast}
      />
      <UserGuidePopover
        guideKey="m2v-html-guide-seen"
        forceOpenTrigger={guideTrigger}
        title="自由画布 快速开始"
        subtitle="利用 AI 提示词库快速生成精美的动态或静态 HTML 页面"
        tip="为获得最佳体验，建议在电脑浏览器中使用本功能，并将浏览器窗口宽度调整至 1920 像素以上，以充分展现画布的宽屏排版效果。"
        steps={[
          {
            icon: '📚',
            title: '复制风格排版指令',
            desc: '在上方工具栏打开「指令库」，选择心仪的组件风格，点击「复制提示词」复制对应的排版规则。',
          },
          {
            icon: '🤖',
            title: '发给 AI 优化并生成 HTML',
            desc: '将复制的指令与你的原始草稿内容一起发给 AI，让其输出符合特定风格排版的 HTML 源码。',
          },
          {
            icon: '📋',
            title: '粘贴 HTML 实时预览与导出',
            desc: '将 AI 返回的 HTML 代码粘贴到左侧编辑器，右侧即可实时加载并渲染，支持一键打包下载。',
          },
        ]}
      />
    </main>
  )
}
