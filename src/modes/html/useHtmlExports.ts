import { useCallback, RefObject } from 'react'
import { useExportAction } from '@/lib/useExportAction'
import { downloadBlob, resolveBackground, captureElementInIframeToBlob } from '@/lib/exportImage'
import { downloadAsZip, type ZipEntry } from '@/lib/export/zipDownload'
import { exportHtmlSource } from '@/lib/exportSource'
import { firstContentElement, withScaleReset, withVisiblePage } from './htmlModeUtils'
import type { PageInfo } from '@/lib/multipage'

async function captureIframeElement(iframe: HTMLIFrameElement, element: HTMLElement) {
  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) throw new Error('预览尚未就绪')
  const bgColor = resolveBackground(doc, win)
  return captureElementInIframeToBlob(iframe, element, { scale: 2, backgroundColor: bgColor })
}

/**
 * 封装 HTML 预览区的所有导出操作：PNG、当前页、ZIP、PDF、源码。
 */
export function useHtmlExports(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  pages: PageInfo[],
  currentPage: number,
  htmlTitle: string,
  localHtml: string,
  onToast: (message: string) => void,
) {
  const [exporting, , runExport] = useExportAction(onToast)

  const handleExport = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) {
      onToast('预览尚未就绪')
      return
    }
    runExport(async () => {
      await withScaleReset(doc, async () => {
        const { blob } = await captureIframeElement(iframe!, firstContentElement(doc))
        const title = htmlTitle || 'html'
        downloadBlob(blob, `${title}.png`)
      })
      return '已导出 PNG'
    })
  }, [iframeRef, htmlTitle, onToast, runExport])

  const handleExportCurrentPage = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc || !pages.length) return
    const page = pages[currentPage]
    if (!page) return

    const allNodes = pages.map(p => p.node)
    runExport(async () => {
      await withScaleReset(doc, async () => {
        await withVisiblePage(allNodes, currentPage, async () => {
          const { blob } = await captureIframeElement(iframe, page.node)
          const title = htmlTitle || 'html'
          downloadBlob(blob, `${title}-page-${currentPage + 1}.png`)
        })
      })
      return `已导出 ${page.label}`
    })
  }, [iframeRef, pages, currentPage, htmlTitle, runExport])

  const handleExportPagesZip = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc || !pages.length) return

    const allNodes = pages.map(p => p.node)
    runExport(async () => {
      const entries: ZipEntry[] = []

      await withScaleReset(doc, async () => {
        const title = htmlTitle || 'html'
        for (let i = 0; i < pages.length; i++) {
          const { blob } = await withVisiblePage(allNodes, i, () => captureIframeElement(iframe, pages[i].node))
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
  }, [iframeRef, pages, htmlTitle, runExport])

  const handleExportPdf = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) {
      onToast('预览尚未就绪')
      return
    }

    runExport(async ({ signal }) => {
      await withScaleReset(doc, async () => {
        const title = htmlTitle || 'html'
        if (pages.length > 0) {
          const { exportIframeToPdf } = await import('@/lib/exportPdf')
          await exportIframeToPdf(
            iframe,
            pages.map(p => p.node),
            `${title}.pdf`,
            { signal }
          )
        } else {
          const { exportSinglePageToPdf } = await import('@/lib/exportPdf')
          await exportSinglePageToPdf(iframe, `${title}.pdf`, { signal })
        }
      })
      return 'PDF 导出成功'
    })
  }, [iframeRef, pages, htmlTitle, onToast, runExport])

  const handleExportSource = useCallback(() => {
    const title = htmlTitle || 'html'
    exportHtmlSource(localHtml, `${title}.html`)
  }, [htmlTitle, localHtml])

  return {
    exporting,
    handleExport,
    handleExportCurrentPage,
    handleExportPagesZip,
    handleExportPdf,
    handleExportSource,
  }
}
