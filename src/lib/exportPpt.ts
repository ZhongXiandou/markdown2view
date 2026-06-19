/**
 * 图片型 PPT 导出：复用 captureElementInIframeToBlob 逐页截图，
 * 将每页截图作为全屏背景贴入 pptxgenjs 幻灯片，视觉 100% 保真。
 *
 * 与 exportPdf.ts 的逐页显隐 + 截图流程几乎 1:1 对应，
 * 只是把 jsPDF.addImage 换成 pptxgenjs slide.addImage。
 */

import { resolveBackground, captureElementInIframeToBlob, sanitizeFilename } from './exportImage'

export interface PptExportOptions {
  /** 用于中断导出；取消时 finally 仍会恢复页面原始 display 样式 */
  signal?: AbortSignal
  onProgress?: (current: number, total: number) => void
}

function throwIfAborted(signal?: AbortSignal): void {
  signal?.throwIfAborted?.()
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** 等待一帧布局生效，支持 abort 中断 */
function nextFrame(signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const id = requestAnimationFrame(() => resolve())
    signal?.addEventListener(
      'abort',
      () => {
        cancelAnimationFrame(id)
        reject(new Error(signal.reason?.toString?.() || '导出已取消'))
      },
      { once: true },
    )
  })
}

/** 将 iframe 中的多页内容导出为图片型 PPT（多页模式） */
export async function exportIframeToPptx(
  iframe: HTMLIFrameElement,
  pageNodes: HTMLElement[],
  filename: string,
  options: PptExportOptions = {},
) {
  const { signal, onProgress } = options
  const safeFilename = sanitizeFilename(filename)
  const PptxGenJS = (await import('pptxgenjs')).default
  throwIfAborted(signal)

  const doc = iframe.contentDocument
  if (!doc) throw new Error('iframe 尚未就绪')

  const originalStyles = pageNodes.map((n) => n.style.display)
  const pptx = new PptxGenJS()
  // 幻灯片尺寸（英寸），首页确定后不再变更
  const slideW = 10
  let slideH = 5.625

  try {
    for (let i = 0; i < pageNodes.length; i++) {
      throwIfAborted(signal)

      // 只显示当前页，隐藏其他页
      pageNodes.forEach((n, j) => {
        n.style.display = j === i ? '' : 'none'
      })

      await nextFrame(signal)
      throwIfAborted(signal)

      const bgColor = resolveBackground(doc, iframe.contentWindow!)
      const { blob, width, height } = await captureElementInIframeToBlob(iframe, pageNodes[i], {
        scale: 3,
        type: 'image/jpeg',
        backgroundColor: bgColor,
      })
      throwIfAborted(signal)

      const dataUrl = await blobToDataUrl(blob)
      throwIfAborted(signal)

      // 首页根据实际比例定义幻灯片布局
      if (i === 0) {
        const ratio = width / height
        slideH = +(slideW / ratio).toFixed(3)
        pptx.defineLayout({ name: 'M2V_CUSTOM', width: slideW, height: slideH })
        pptx.layout = 'M2V_CUSTOM'
      }

      const slide = pptx.addSlide()
      slide.addImage({ data: dataUrl, x: 0, y: 0, w: slideW, h: slideH })

      if (onProgress) onProgress(i + 1, pageNodes.length)
    }
  } finally {
    // 恢复所有页面的原始 display 状态（即使取消/报错也要恢复）
    pageNodes.forEach((n, i) => {
      n.style.display = originalStyles[i]
    })
  }

  throwIfAborted(signal)
  await pptx.writeFile({ fileName: `${safeFilename}.pptx` })
}

/** 将 iframe 中的单页内容导出为图片型 PPT */
export async function exportSinglePageToPptx(
  iframe: HTMLIFrameElement,
  filename: string,
  options: PptExportOptions = {},
) {
  const { signal } = options
  const safeFilename = sanitizeFilename(filename)
  const PptxGenJS = (await import('pptxgenjs')).default
  throwIfAborted(signal)

  const doc = iframe.contentDocument!
  const wrapper =
    doc.querySelector<HTMLElement>('body > div') ||
    doc.querySelector<HTMLElement>('body > main') ||
    doc.querySelector<HTMLElement>('body > section') ||
    doc.body

  const bgColor = resolveBackground(doc, iframe.contentWindow!)
  const { blob, width, height } = await captureElementInIframeToBlob(iframe, wrapper, {
    scale: 3,
    type: 'image/jpeg',
    backgroundColor: bgColor,
  })
  throwIfAborted(signal)

  const dataUrl = await blobToDataUrl(blob)
  throwIfAborted(signal)

  const pptx = new PptxGenJS()
  const ratio = width / height
  const slideW = 10
  const slideH = +(slideW / ratio).toFixed(3)
  pptx.defineLayout({ name: 'M2V_CUSTOM', width: slideW, height: slideH })
  pptx.layout = 'M2V_CUSTOM'

  const slide = pptx.addSlide()
  slide.addImage({ data: dataUrl, x: 0, y: 0, w: slideW, h: slideH })
  await pptx.writeFile({ fileName: `${safeFilename}.pptx` })
}
