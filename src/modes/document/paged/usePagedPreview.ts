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
}: UsePagedPreviewParams): UsePagedPreviewResult {
  const [status, setStatus] = useState<PagedStatus>('init')
  const [pageCount, setPageCount] = useState(0)
  const readyRef = useRef(false)

  // 用 ref 持有最新参数，避免回调闭包过期
  const latest = useRef({ contentHtml, pageCss, title, fitScale })
  latest.current = { contentHtml, pageCss, title, fitScale }

  const applyFit = useCallback(() => {
    const el = iframeRef.current?.contentDocument?.getElementById('m2v-pages')
    el?.style.setProperty('--m2v-fit', String(latest.current.fitScale))
  }, [iframeRef])

  // 渲染完成后让 iframe 高度等于内容高度，使外层面板整体滚动（而非 iframe 内部滚动）。
  // 用 getBoundingClientRect().height 度量：页面通过 zoom 缩放，scrollHeight 在 Chrome 下
  // 对含 zoom 子元素的祖先会返回未缩放高度，导致高度偏大、末页下方留大片空白。
  const resizeToContent = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!iframe || !doc) return
    const target =
      doc.getElementById('m2v-pages') ?? (doc.querySelector('.pagedjs_pages') as HTMLElement | null)
    const h = target ? target.getBoundingClientRect().height : doc.body?.scrollHeight ?? 0
    if (h > 0) iframe.style.height = `${Math.ceil(h) + 4}px`
  }, [iframeRef])

  const renderNow = useCallback(() => {
    const win = iframeRef.current?.contentWindow as
      | (Window & { __m2vRender?: (html: string, css: string) => Promise<number> })
      | null
    if (!win || typeof win.__m2vRender !== 'function') return
    setStatus('rendering')
    try {
      win.document.title = latest.current.title || 'document'
    } catch {
      /* 跨域兜底，忽略 */
    }
    applyFit()
    Promise.resolve(win.__m2vRender(latest.current.contentHtml, latest.current.pageCss))
      .then((total: number) => {
        setPageCount(total || 0)
        setStatus('done')
        requestAnimationFrame(() => {
          applyFit()
          resizeToContent()
        })
      })
      .catch(() => setStatus('error'))
  }, [iframeRef, applyFit, resizeToContent])

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
      const win = iframeRef.current?.contentWindow as
        | (Window & { __m2vReady?: boolean; __m2vRender?: unknown })
        | null
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

  // 仅缩放变化 → 应用 zoom 并重算高度（无需整篇重排）
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
