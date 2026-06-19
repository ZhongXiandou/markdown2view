import { useEffect, RefObject } from 'react'
import { firstPreviewPage } from './htmlModeUtils'
import type { PageInfo } from '@/lib/multipage'

/**
 * 自动等比例缩放 iframe 内容，使其适应预览窗口。
 * - 多页模式：使用 CSS 变量 --auto-scale 缩放当前可见页
 * - 单页模式：使用 body.style.zoom 按宽度适配
 */
export function useIframeScale(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  pages: PageInfo[],
  currentPage: number,
  refreshKey: number,
) {
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let cancelled = false
    let contentObserver: ResizeObserver | null = null
    let iframeObserver: ResizeObserver | null = null
    // 统一用一个 debounce timer + 一个 RAF handle，避免多次调用时堆积
    let debounceTimer: number | null = null
    let rafHandle: number | null = null

    const handleResize = () => {
      if (cancelled) return
      rafHandle = null
      const doc = iframe.contentDocument
      if (!doc || !doc.body) return

      const viewW = iframe.clientWidth
      const viewH = iframe.clientHeight
      if (!viewW || !viewH) return

      if (pages.length > 0) {
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

    // 防抖调度：每次新调用会取消上一次尚未执行的 timer/RAF，
    // 防止加载期间尺寸抖动造成的队列堆积，避免阻塞点击事件。
    const scheduleResize = (delay = 0) => {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      if (rafHandle !== null) {
        cancelAnimationFrame(rafHandle)
        rafHandle = null
      }
      debounceTimer = window.setTimeout(() => {
        if (cancelled) return
        if (rafHandle !== null) return
        rafHandle = requestAnimationFrame(handleResize)
      }, delay)
    }

    const observeContent = () => {
      contentObserver?.disconnect()
      const doc = iframe.contentDocument
      if (!doc || !doc.body) return

      contentObserver = new ResizeObserver(() => scheduleResize(50))
      contentObserver.observe(doc.documentElement)
      contentObserver.observe(doc.body)
      const page = firstPreviewPage(doc)
      if (page) contentObserver.observe(page)

      doc.fonts?.ready.then(() => scheduleResize(100)).catch(() => {})
      doc.querySelectorAll('img').forEach((img) => {
        if (!img.complete) img.addEventListener('load', () => scheduleResize(100), { once: true })
      })
    }

    observeContent()
    ;[0, 100, 400].forEach(scheduleResize)

    // M15: iframe 首次挂载时 contentDocument 可能为 null，
    // 监听 load 事件确保内容就绪后重新计算缩放。
    // 若 iframe 在 effect 运行前已加载完成（如 StrictMode），立即补一次重算。
    const onIframeLoad = () => {
      observeContent()
      scheduleResize(0)
    }
    iframe.addEventListener('load', onIframeLoad)
    if (iframe.contentDocument?.readyState === 'complete') {
      scheduleResize(0)
    }

    iframeObserver = new ResizeObserver(() => scheduleResize(20))
    iframeObserver.observe(iframe)

    return () => {
      cancelled = true
      if (debounceTimer !== null) clearTimeout(debounceTimer)
      if (rafHandle !== null) cancelAnimationFrame(rafHandle)
      iframeObserver?.disconnect()
      contentObserver?.disconnect()
      iframe.removeEventListener('load', onIframeLoad)
    }
  }, [iframeRef, pages, currentPage, refreshKey])
}
