import { useCallback, RefObject } from 'react'
import { useExportAction } from '@/lib/useExportAction'
import { downloadBlob, resolveBackground, captureElementInIframeToBlob } from '@/lib/exportImage'
import { downloadAsZip, type ZipEntry } from '@/lib/export/zipDownload'
import { exportHtmlSource } from '@/lib/exportSource'
import { firstContentElement, nextFrame, withScaleReset, withVisiblePage } from './htmlModeUtils'
import { writeRichClipboard } from '@/lib/clipboard'
import { toWechatHtmlFromDocument } from '@/lib/export/wechatHtml'
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

  const handleExportPptx = useCallback(() => {
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
          const { exportIframeToPptx } = await import('@/lib/exportPpt')
          await exportIframeToPptx(
            iframe,
            pages.map(p => p.node),
            title,
            { signal }
          )
        } else {
          const { exportSinglePageToPptx } = await import('@/lib/exportPpt')
          await exportSinglePageToPptx(iframe, title, { signal })
        }
      })
      return 'PPT 导出成功'
    })
  }, [iframeRef, pages, htmlTitle, onToast, runExport])

  const handleExportPptxEditable = useCallback(() => {
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
          const { exportIframeToEditablePptx } = await import('@/lib/exportPptEditable')
          await exportIframeToEditablePptx(
            iframe,
            pages.map(p => p.node),
            title,
            { signal }
          )
        } else {
          const { exportSinglePageToEditablePptx } = await import('@/lib/exportPptEditable')
          await exportSinglePageToEditablePptx(iframe, title, { signal })
        }
      })
      return '可编辑 PPT 导出成功'
    })
  }, [iframeRef, pages, htmlTitle, onToast, runExport])

  // 复制到公众号：从渲染后的 iframe 文档读取计算样式并内联
  const handleCopyWechat = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) {
      onToast('预览尚未就绪')
      return
    }
    runExport(async () => {
      const ok = await withScaleReset(doc, async () => {
        // 多页模式下非当前页是 display:none，复制时需要全部显示（withScaleReset 结束时会恢复）
        pages.forEach((p) => {
          p.node.style.display = ''
        })
        await nextFrame()
        const html = toWechatHtmlFromDocument(doc)
        return writeRichClipboard(html, doc.body.innerText)
      })
      if (!ok) throw new Error('浏览器拒绝写入剪贴板')
      return '已复制，可粘贴到公众号编辑器（布局按单列重排）'
    })
  }, [iframeRef, pages, onToast, runExport])

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
    handleExportPptx,
    handleExportPptxEditable,
    handleExportSource,
    handleCopyWechat,
  }
}
