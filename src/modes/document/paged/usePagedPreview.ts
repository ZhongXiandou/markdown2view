import { useCallback, useEffect, useRef, useState } from 'react'
import { buildIframeShell, collectParentStyles } from './pagedRuntime'

export type PagedStatus = 'init' | 'rendering' | 'done' | 'error'

interface UsePagedPreviewParams {
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  /** 待分页的内容 HTML（由 buildPagedContentHtml 生成） */
  contentHtml: string
  /** @page 等分页样式（由 buildPageCss 生成） */
  pageCss: string
  /** 文档标题，用于打印对话框默认文件名 */
  title: string
  /** 屏幕预览缩放（适配预览面板宽度，打印时忽略） */
  fitScale: number
  /** 重排防抖毫秒 */
  debounceMs?: number
  /** 单页可用内容高（px）= pageHeight - marginTop - marginBottom，用于 mermaid 超高缩放兜底 */
  availableHeight?: number
}

interface UsePagedPreviewResult {
  status: PagedStatus
  pageCount: number
  /** 触发浏览器打印（另存为 PDF） */
  print: () => void
}

export function usePagedPreview({
  iframeRef,
  contentHtml,
  pageCss,
  title,
  fitScale,
  debounceMs = 350,
  availableHeight,
}: UsePagedPreviewParams): UsePagedPreviewResult {
  const [status, setStatus] = useState<PagedStatus>('init')
  const [pageCount, setPageCount] = useState(0)
  const readyRef = useRef(false)

  // 用 ref 持有最新参数，避免回调闭包过期
  const latest = useRef({ contentHtml, pageCss, title, fitScale })
  latest.current = { contentHtml, pageCss, title, fitScale }

  // 分页进行中标记：期间不得改动预览缩放（见 renderNow）
  const renderingRef = useRef(false)

  const setFit = useCallback((scale: number) => {
    const doc = iframeRef.current?.contentDocument
    doc?.getElementById('m2v-pages')?.style.setProperty('--m2v-fit', String(scale))
    // transform 缩放不改变布局高度，用负的下外边距收回缩小后空出来的部分
    const pages = doc?.querySelector('.pagedjs_pages') as HTMLElement | null
    if (pages) pages.style.marginBottom = scale < 1 ? `${pages.offsetHeight * (scale - 1)}px` : ''
  }, [iframeRef])

  const applyFit = useCallback(() => {
    if (renderingRef.current) return
    setFit(latest.current.fitScale)
  }, [setFit])

  // 渲染完成后让 iframe 高度等于内容高度，使外层面板整体滚动（而非 iframe 内部滚动）。
  // 用 #m2v-pages 的 getBoundingClientRect().height 度量：它包含 setFit 里按缩放比例
  // 收回的下外边距，因此就是缩放后的可见高度。
  const resizeToContent = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!iframe || !doc) return
    const target =
      doc.getElementById('m2v-pages') ?? (doc.querySelector('.pagedjs_pages') as HTMLElement | null)
    const h = target ? target.getBoundingClientRect().height : doc.body?.scrollHeight ?? 0
    if (h > 0) iframe.style.height = `${Math.ceil(h) + 4}px`
  }, [iframeRef])

  // mermaid 超高缩放兜底：渲染完成后遍历 iframe 内 mermaid 块，若超高则设 CSS 变量缩放。
  // 说明文字（caption）行高约 36px，预留后才是图的实际可用高。
  const scaleMermaidBlocks = useCallback(() => {
    if (!availableHeight) return
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const CAPTION_LINE = 36
    const maxH = availableHeight - CAPTION_LINE
    const figures = doc.querySelectorAll<HTMLElement>(
      '.document-block[data-kind="mermaid"] .m2v-mermaid-figure',
    )
    figures.forEach((fig) => {
      const block = fig.closest('.document-block') as HTMLElement | null
      const blockH = block ? block.offsetHeight : fig.offsetHeight
      if (blockH > availableHeight) {
        const scale = Math.max(0.3, Math.min(1, maxH / fig.offsetHeight))
        fig.style.setProperty('--m2v-mermaid-scale', String(scale))
        fig.style.setProperty('--m2v-mermaid-max-height', `${maxH}px`)
      } else {
        fig.style.removeProperty('--m2v-mermaid-scale')
        fig.style.removeProperty('--m2v-mermaid-max-height')
      }
    })
  }, [iframeRef, availableHeight])

  const renderNow = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win || typeof win.__m2vRender !== 'function') return
    setStatus('rendering')
    try {
      win.document.title = latest.current.title || 'document'
    } catch {
      /* 跨域兜底，忽略 */
    }
    // 分页必须在缩放为 1 时进行，排版完成后再应用预览缩放。
    // Paged.js 0.4.3 判断溢出时把缩放后的元素坐标与未缩放的列间距相加，缩放小于 1 时
    // 落进溢出列的内容不会被识别为溢出，表现为跨页处丢失标题或若干行文字（即「跨页吞字」）。
    renderingRef.current = true
    setFit(1)
    Promise.resolve(win.__m2vRender(latest.current.contentHtml, latest.current.pageCss))
      .then((total: number) => {
        renderingRef.current = false
        setPageCount(total || 0)
        setStatus('done')
        requestAnimationFrame(() => {
          applyFit()
          scaleMermaidBlocks()
          resizeToContent()
        })
      })
      .catch(() => {
        renderingRef.current = false
        setStatus('error')
      })
  }, [iframeRef, setFit, applyFit, scaleMermaidBlocks, resizeToContent])

  // 初始化 iframe（仅一次）：写入外壳 → 轮询等待 bootstrap 就绪 → 首次渲染。
  // 采用轮询而非依赖 load 事件：兼容 React 严格模式重挂载与相同 srcdoc 不重载的情况。
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let cancelled = false
    iframe.srcdoc = buildIframeShell(collectParentStyles())

    const start = Date.now()
    const poll = () => {
      if (cancelled) return
      const win = iframeRef.current?.contentWindow
      if (win && win.__m2vReady && typeof win.__m2vRender === 'function') {
        readyRef.current = true
        renderNow()
        return
      }
      if (Date.now() - start < 15000) window.setTimeout(poll, 50)
    }
    poll()

    return () => {
      cancelled = true
      readyRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 内容 / 分页样式变化 → 防抖重排
  useEffect(() => {
    if (!readyRef.current) return
    const timer = window.setTimeout(renderNow, debounceMs)
    return () => window.clearTimeout(timer)
  }, [contentHtml, pageCss, renderNow, debounceMs])

  // 仅缩放变化 → 应用缩放并重算高度（无需整篇重排）
  useEffect(() => {
    if (!readyRef.current) return
    applyFit()
    requestAnimationFrame(resizeToContent)
  }, [fitScale, applyFit, resizeToContent])

  const print = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.focus()
    win.print()
  }, [iframeRef])

  return { status, pageCount, print }
}
