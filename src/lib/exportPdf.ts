/**
 * Portions of this file are derived from html-anything (https://github.com/nexu-io/html-anything),
 * licensed under the Apache License, Version 2.0.
 * Modified by ZhongXiandou/markdown2view contributors.
 */

import { resolveBackground, captureElementInIframeToBlob, sanitizeFilename } from './exportImage'

export interface PdfExportOptions {
  /** 用于中断导出；取消时 finally 仍会恢复页面原始 display 样式 */
  signal?: AbortSignal
  onProgress?: (current: number, total: number) => void
}

function throwIfAborted(signal?: AbortSignal): void {
  signal?.throwIfAborted?.()
}

/**
 * 基于 iframe 截图的 PDF 导出。
 * 
 * 核心思路：逐页让 iframe 只显示一页内容 → 用 captureElementInIframeToBlob 在 iframe 原生
 * 样式上下文中截取单页完整渲染（含字体、背景）→ 贴入 jsPDF 页面。
 *
 * 与之前 domToJpeg 方案的区别：domToJpeg 是在主页面上下文克隆 DOM 节点，
 * 会丢失 iframe 内的 <style>、<link>、Google Fonts 等样式引用。
 * captureElementInIframeToBlob 传入 iframe 内的节点，并临时调整尺寸，能保留所有样式并消除留白。
 */

/** 将 iframe 中的多页内容导出为 PDF（多页模式） */
export async function exportIframeToPdf(
  iframe: HTMLIFrameElement,
  pageNodes: HTMLElement[],
  filename: string,
  options: PdfExportOptions = {},
) {
  const { signal, onProgress } = options
  const safeFilename = sanitizeFilename(filename)
  const { jsPDF } = await import('jspdf')
  throwIfAborted(signal)

  const doc = iframe.contentDocument
  if (!doc) throw new Error('iframe 尚未就绪')

  // 保存所有页面的原始 display 状态
  const originalStyles = pageNodes.map(n => n.style.display)

  let pdf: InstanceType<typeof jsPDF> | null = null

  try {
    for (let i = 0; i < pageNodes.length; i++) {
      throwIfAborted(signal)

      // 只显示当前页，隐藏其他页
      pageNodes.forEach((n, j) => {
        n.style.display = j === i ? '' : 'none'
      })

      // 等待一帧让布局生效
      await new Promise<void>((resolve, reject) => {
        const id = requestAnimationFrame(() => resolve())
        signal?.addEventListener('abort', () => {
          cancelAnimationFrame(id)
          reject(new Error(signal.reason?.toString?.() || '导出已取消'))
        }, { once: true })
      })
      throwIfAborted(signal)

      // 提取背景色，因为如果背景色写在 body 上，单独截图 pageNode 会变成透明/白色
      const bgColor = resolveBackground(doc, iframe.contentWindow!)

      // 仅对当前可见的页面节点进行截图，避免截取外层的 margin 和空白区域
      // captureElementInIframeToBlob 在截图时已完成尺寸对齐，返回的 width/height 与截图 1:1
      const { blob, width, height } = await captureElementInIframeToBlob(iframe, pageNodes[i], {
        scale: 3,
        type: 'image/jpeg',
        backgroundColor: bgColor
      })
      throwIfAborted(signal)
      const w = width
      const h = height

      // 将 Blob 转为 data URL
      const dataUrl = await blobToDataUrl(blob)
      throwIfAborted(signal)

      if (!pdf) {
        pdf = new jsPDF({
          orientation: w > h ? 'landscape' : 'portrait',
          unit: 'px',
          format: [w, h],
          compress: true,
        })
      } else {
        pdf.addPage([w, h], w > h ? 'landscape' : 'portrait')
      }

      pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h)

      // 6.15: 在当前页成功写入 PDF 后才报告进度，避免失败时仍显示 100%
      if (onProgress) onProgress(i + 1, pageNodes.length)
    }
  } finally {
    // 恢复所有页面的原始 display 状态（即使取消/报错也要恢复）
    pageNodes.forEach((n, i) => {
      n.style.display = originalStyles[i]
    })
  }

  throwIfAborted(signal)
  if (pdf) {
    pdf.save(safeFilename)
  }
}

/** 将 iframe 中的单页内容导出为 PDF */
export async function exportSinglePageToPdf(
  iframe: HTMLIFrameElement,
  filename: string,
  options: PdfExportOptions = {},
) {
  const { signal } = options
  const safeFilename = sanitizeFilename(filename)
  const { jsPDF } = await import('jspdf')
  throwIfAborted(signal)

  const doc = iframe.contentDocument!

  // 单页模式：尝试找到内部第一层包裹器，如果没有就用 body
  const wrapper = doc.querySelector('body > div') || doc.querySelector('body > main') || doc.querySelector('body > section') || doc.body

  // 提取背景色，防止 wrapper 本身透明导致背景丢失
  const bgColor = resolveBackground(doc, iframe.contentWindow!)

  // 仅截取实际内容区域，避免截取外层的留白
  // captureElementInIframeToBlob 返回与截图 1:1 对齐的尺寸
  const { blob, width, height } = await captureElementInIframeToBlob(iframe, wrapper as HTMLElement, {
    scale: 3,
    type: 'image/jpeg',
    backgroundColor: bgColor
  })
  throwIfAborted(signal)
  const w = width
  const h = height

  const dataUrl = await blobToDataUrl(blob)
  throwIfAborted(signal)

  const pdf = new jsPDF({
    orientation: w > h ? 'landscape' : 'portrait',
    unit: 'px',
    format: [w, h],
    compress: true,
  })

  pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h)
  pdf.save(safeFilename)
}


/** 保留旧的 exportElementsToPdf 供非 iframe 场景（如 A4 文档模式）使用 */
export async function exportElementsToPdf(
  elements: HTMLElement[],
  filename: string,
  opts?: { width: number; height: number; signal?: AbortSignal; onProgress?: (current: number, total: number) => void },
) {
  const safeFilename = sanitizeFilename(filename)
  const { jsPDF } = await import('jspdf')
  const { domToJpeg } = await import('modern-screenshot')
  const signal = opts?.signal
  const onProgress = opts?.onProgress

  let pdf: InstanceType<typeof jsPDF> | null = null

  for (let i = 0; i < elements.length; i++) {
    throwIfAborted(signal)

    const el = elements[i]

    const originalDisplay = el.style.display
    if (originalDisplay === 'none') {
      el.style.display = ''
    }

    try {
      const w = opts?.width || el.offsetWidth
      const h = opts?.height || el.offsetHeight

      // 使用 3x 缩放确保文字极其清晰
      const dataUrl = await domToJpeg(el, {
        scale: 3,
        backgroundColor: '#ffffff',
      })
      throwIfAborted(signal)

      if (!pdf) {
        pdf = new jsPDF({
          orientation: w > h ? 'landscape' : 'portrait',
          unit: 'px',
          format: [w, h],
          compress: true,
        })
      } else {
        pdf.addPage([w, h], w > h ? 'landscape' : 'portrait')
      }

      pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h)

      // 6.15: 在当前页成功写入 PDF 后才报告进度
      if (onProgress) onProgress(i + 1, elements.length)
    } finally {
      if (originalDisplay === 'none') {
        el.style.display = 'none'
      }
    }
  }

  throwIfAborted(signal)
  if (pdf) {
    pdf.save(safeFilename)
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
