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
    const timers: ReturnType<typeof setTimeout>[] = []

    const handleResize = () => {
      if (cancelled) return
      const doc = iframe.contentDocument
      if (!doc) return

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
      ;[0, 100, 400].forEach(scheduleResize)
    }

    stabilizeScale()

    // M15: iframe 首次挂载时 contentDocument 可能为 null，
    // 监听 load 事件确保内容就绪后重新计算缩放
    const onIframeLoad = () => scheduleResize(0)
    iframe.addEventListener('load', onIframeLoad)

    const ro = new ResizeObserver(() => scheduleResize())
    ro.observe(iframe)

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      ro.disconnect()
      contentObserver?.disconnect()
      iframe.removeEventListener('load', onIframeLoad)
    }
  }, [iframeRef, pages, currentPage, refreshKey])
}
