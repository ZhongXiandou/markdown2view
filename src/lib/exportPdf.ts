import { iframeToBlob } from './exportImage'

/**
 * 基于 iframe 截图的 PDF 导出。
 * 
 * 核心思路：逐页让 iframe 只显示一页内容 → 用 iframeToBlob 在 iframe 原生
 * 样式上下文中截取完整渲染（含字体、渐变、背景）→ 贴入 jsPDF 页面。
 *
 * 与之前 domToJpeg 方案的区别：domToJpeg 是在主页面上下文克隆 DOM 节点，
 * 会丢失 iframe 内的 <style>、<link>、Google Fonts 等样式引用，导致背景
 * 丢失、字号不一致。iframeToBlob 则直接在 iframe 内部完成截图，样式完整。
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

  let pdf: any = null

  try {
    for (let i = 0; i < pageNodes.length; i++) {
      if (onProgress) onProgress(i + 1, pageNodes.length)

      // 只显示当前页，隐藏其他页
      pageNodes.forEach((n, j) => {
        n.style.display = j === i ? '' : 'none'
      })

      // 等待一帧让布局生效
      await new Promise(r => requestAnimationFrame(r))

      // 在 iframe 原生上下文中截图，保留所有样式
      const blob = await iframeToBlob(iframe, { scale: 3, type: 'image/jpeg' })

      // 读取当前可见页的实际尺寸
      const w = pageNodes[i].offsetWidth
      const h = pageNodes[i].offsetHeight

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

  // 在 iframe 原生上下文中截图
  const blob = await iframeToBlob(iframe, { scale: 3, type: 'image/jpeg' })

  const doc = iframe.contentDocument!
  const w = doc.documentElement.clientWidth || iframe.clientWidth
  const h = doc.documentElement.scrollHeight || iframe.clientHeight

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

  let pdf: any = null

  for (let i = 0; i < elements.length; i++) {
    if (onProgress) onProgress(i + 1, elements.length)
    
    const el = elements[i]
    
    const originalDisplay = el.style.display
    if (originalDisplay === 'none') {
      el.style.display = ''
    }

    const w = opts?.width || el.offsetWidth
    const h = opts?.height || el.offsetHeight

    // 使用 3x 缩放确保文字极其清晰
    const dataUrl = await domToJpeg(el, {
      scale: 3,
      backgroundColor: '#ffffff',
    })
    
    if (originalDisplay === 'none') {
      el.style.display = 'none'
    }

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
