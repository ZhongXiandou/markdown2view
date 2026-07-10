import { useEffect, RefObject } from 'react'
import { firstPreviewPage } from './htmlModeUtils'
import type { PageInfo } from '@/lib/multipage'

/**
 * 自动等比例缩放 iframe 内容，使其适应预览窗口。
 * - 多页模式：固定页面为设计尺寸，用 transform:scale() 等比缩放并绝对定位居中
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
    let debounceTimer: number | null = null
    let rafHandle: number | null = null

    // 用于多页模式：临时撑开 iframe 以测量内容的真实（桌面端）设计尺寸
    const DESKTOP_PROBE_WIDTH = 1920

    // 记录上一次设置了内联样式的页面元素，用于清理
    let lastStyledPage: HTMLElement | null = null

    const clearPageStyles = (page: HTMLElement | null) => {
      if (!page) return
      page.style.position = ''
      page.style.left = ''
      page.style.top = ''
      page.style.margin = ''
      page.style.transform = ''
      page.style.transformOrigin = ''
      page.style.width = ''
      page.style.height = ''
      page.style.maxWidth = ''
      page.style.minWidth = ''
      page.style.aspectRatio = ''
      page.style.boxSizing = ''
      page.style.flexShrink = ''
    }

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

        // 先清理上一次对旧页面设置的样式
        if (lastStyledPage && lastStyledPage !== visiblePage) {
          clearPageStyles(lastStyledPage)
        }
        lastStyledPage = visiblePage

        // 保存 iframe 原始宽度（需要在 finally 中恢复，避免影响后续测量）
        const prevIframeWidth = iframe.style.width
        const prevIframeMaxWidth = iframe.style.maxWidth

        try {
          // 1. 重置缩放和布局
          doc.body.style.zoom = '1'
          doc.documentElement.style.setProperty('--auto-scale', '1')

          // 2. 临时撑开 iframe 到桌面端宽度，让响应式内容（vw / max-width / min()）展开到设计尺寸
          iframe.style.setProperty('width', `${DESKTOP_PROBE_WIDTH}px`, 'important')
          iframe.style.setProperty('max-width', 'none', 'important')

          // 3. 强制同步布局后读取真实设计尺寸
          void iframe.offsetWidth // 强制 reflow
          const rawW = visiblePage.offsetWidth
          const rawH = visiblePage.offsetHeight

          if (!rawW || !rawH) return

          // 4. 在恢复 iframe 宽度之前，先给页面固定设计尺寸（box-sizing:border-box），
          //    防止恢复窄宽度后响应式 CSS（如 width:min(100vw,960px)）重新压缩页面
          visiblePage.style.boxSizing = 'border-box'
          visiblePage.style.width = `${rawW}px`
          visiblePage.style.height = `${rawH}px`
          visiblePage.style.maxWidth = 'none'
          visiblePage.style.minWidth = 'unset'
          visiblePage.style.margin = '0'
          visiblePage.style.flexShrink = '0'

          // 5. 恢复 iframe 宽度（页面尺寸已固定，不再受视口宽度影响）
          if (prevIframeWidth) {
            iframe.style.width = prevIframeWidth
          } else {
            iframe.style.removeProperty('width')
          }
          if (prevIframeMaxWidth) {
            iframe.style.maxWidth = prevIframeMaxWidth
          } else {
            iframe.style.removeProperty('max-width')
          }

          // 6. 等待布局更新后计算缩放比例
          void iframe.offsetWidth // 强制 reflow
          const scale = Math.min(viewW / rawW, viewH / rawH)

          // 7. 设置 html/body 为定位容器，占满视口，隐藏溢出，清除内外边距
          doc.documentElement.style.margin = '0'
          doc.documentElement.style.padding = '0'
          doc.documentElement.style.width = '100%'
          doc.documentElement.style.height = '100%'
          doc.documentElement.style.overflow = 'hidden'

          doc.body.style.position = 'relative'
          doc.body.style.margin = '0'
          doc.body.style.padding = '0'
          doc.body.style.width = '100%'
          doc.body.style.height = '100%'
          doc.body.style.overflow = 'hidden'

          // 8. 当前页绝对定位居中，应用缩放
          visiblePage.style.position = 'absolute'
          visiblePage.style.left = '50%'
          visiblePage.style.top = '50%'
          visiblePage.style.transformOrigin = 'center center'
          visiblePage.style.transform = `translate(-50%, -50%) scale(${scale})`
        } finally {
          // 确保 iframe 宽度被恢复
          if (prevIframeWidth) {
            iframe.style.width = prevIframeWidth
          } else {
            iframe.style.removeProperty('width')
          }
          if (prevIframeMaxWidth) {
            iframe.style.maxWidth = prevIframeMaxWidth
          } else {
            iframe.style.removeProperty('max-width')
          }
        }
      } else {
        // 单页/自由画布模式：按宽度 zoom 适配
        // 清理多页模式残留样式
        if (lastStyledPage) {
          clearPageStyles(lastStyledPage)
          lastStyledPage = null
        }
        doc.body.style.position = ''
        doc.body.style.margin = ''
        doc.body.style.padding = ''
        doc.body.style.overflow = ''
        doc.body.style.width = ''
        doc.body.style.height = ''
        doc.documentElement.style.overflow = ''
        doc.documentElement.style.margin = ''
        doc.documentElement.style.padding = ''
        doc.documentElement.style.width = ''
        doc.documentElement.style.height = ''

        // 清理所有页面元素的内联样式
        doc.querySelectorAll<HTMLElement>('.page, .slide, .card').forEach((el) => {
          el.style.position = ''
          el.style.left = ''
          el.style.top = ''
          el.style.margin = ''
          el.style.transform = ''
          el.style.transformOrigin = ''
          el.style.width = ''
          el.style.height = ''
          el.style.maxWidth = ''
          el.style.minWidth = ''
          el.style.boxSizing = ''
          el.style.flexShrink = ''
        })

        const wrapper = doc.querySelector('body > div') as HTMLElement
          || doc.querySelector('body > main') as HTMLElement
          || doc.querySelector('body > section') as HTMLElement
          || doc.body

        doc.documentElement.style.removeProperty('--auto-scale')
        const oldZoom = doc.body.style.zoom
        doc.body.style.zoom = '1'
        void doc.body.offsetWidth // 强制 reflow
        const rawW = wrapper.offsetWidth
        if (rawW) {
          const scale = viewW / rawW
          doc.body.style.zoom = scale.toString()
        } else {
          doc.body.style.zoom = oldZoom
        }
      }
    }

    // 防抖调度
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

    const onIframeLoad = () => {
      lastStyledPage = null
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
      if (lastStyledPage) {
        clearPageStyles(lastStyledPage)
      }
    }
  }, [iframeRef, pages, currentPage, refreshKey])
}
