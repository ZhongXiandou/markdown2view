/**
 * Portions of this file are derived from html-anything (https://github.com/nexu-io/open-design),
 * licensed under the Apache License, Version 2.0.
 * Modified by ZhongXiandou/markdown2view contributors.
 */

import { resolveBackground, captureElementInIframeToBlob } from './exportImage'

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
  onProgress?: (current: number, total: number) => void
) {
  const { jsPDF } = await import('jspdf')

  const doc = iframe.contentDocument
  if (!doc) throw new Error('iframe 尚未就绪')

  // 保存所有页面的原始 display 状态
  const originalStyles = pageNodes.map(n => n.style.display)

  let pdf: InstanceType<typeof jsPDF> | null = null

  try {
    for (let i = 0; i < pageNodes.length; i++) {
      if (onProgress) onProgress(i + 1, pageNodes.length)

      // 只显示当前页，隐藏其他页
      pageNodes.forEach((n, j) => {
        n.style.display = j === i ? '' : 'none'
      })

      // 等待一帧让布局生效
      await new Promise(r => requestAnimationFrame(r))

      // 提取背景色，因为如果背景色写在 body 上，单独截图 pageNode 会变成透明/白色
      const bgColor = resolveBackground(doc, iframe.contentWindow!)

      // 仅对当前可见的页面节点进行截图，避免截取外层的 margin 和空白区域
      const blob = await captureElementInIframeToBlob(iframe, pageNodes[i], { 
        scale: 3, 
        type: 'image/jpeg',
        backgroundColor: bgColor
      })

      // 读取当前可见页的实际尺寸
      const w = pageNodes[i].offsetWidth || pageNodes[i].scrollWidth
      const h = pageNodes[i].offsetHeight || pageNodes[i].scrollHeight

      // 将 Blob 转为 data URL
      const dataUrl = await blobToDataUrl(blob)

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
    }
  } finally {
    // 恢复所有页面的原始 display 状态
    pageNodes.forEach((n, i) => {
      n.style.display = originalStyles[i]
    })
  }

  if (pdf) {
    pdf.save(filename)
  }
}

/** 将 iframe 中的单页内容导出为 PDF */
export async function exportSinglePageToPdf(
  iframe: HTMLIFrameElement,
  filename: string
) {
  const { jsPDF } = await import('jspdf')
  const doc = iframe.contentDocument!

  // 单页模式：尝试找到内部第一层包裹器，如果没有就用 body
  const wrapper = doc.querySelector('body > div') || doc.querySelector('body > main') || doc.querySelector('body > section') || doc.body

  // 提取背景色，防止 wrapper 本身透明导致背景丢失
  const bgColor = resolveBackground(doc, iframe.contentWindow!)

  // 仅截取实际内容区域，避免截取外层的留白
  const blob = await captureElementInIframeToBlob(iframe, wrapper as HTMLElement, { 
    scale: 3, 
    type: 'image/jpeg',
    backgroundColor: bgColor
  })

  // 读取实际内容尺寸
  const w = (wrapper as HTMLElement).offsetWidth || doc.documentElement.clientWidth
  const h = (wrapper as HTMLElement).offsetHeight || doc.documentElement.scrollHeight

  const dataUrl = await blobToDataUrl(blob)

  const pdf = new jsPDF({
    orientation: w > h ? 'landscape' : 'portrait',
    unit: 'px',
    format: [w, h],
    compress: true,
  })

  pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h)
  pdf.save(filename)
}


/** 保留旧的 exportElementsToPdf 供非 iframe 场景（如 A4 文档模式）使用 */
export async function exportElementsToPdf(
  elements: HTMLElement[],
  filename: string,
  opts?: { width: number; height: number },
  onProgress?: (current: number, total: number) => void
) {
  const { jsPDF } = await import('jspdf')
  const { domToJpeg } = await import('modern-screenshot')

  let pdf: InstanceType<typeof jsPDF> | null = null

  for (let i = 0; i < elements.length; i++) {
    if (onProgress) onProgress(i + 1, elements.length)
    
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
    } finally {
      if (originalDisplay === 'none') {
        el.style.display = 'none'
      }
    }
  }
  
  if (pdf) {
    pdf.save(filename)
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
