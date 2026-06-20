/**
 * 可编辑 PPT 导出（实验性）。
 *
 * 解析 iframe 内每个 <section class="slide"> 的 DOM 子树，提取叶子文本容器
 * 与 <img> 元素的位置/样式，映射为 pptxgenjs 原生元素（文本框/图片）。
 *
 * 已知局限（在按钮 tooltip 中告知用户）：
 * - 渐变、毛玻璃、动画、WebGL 等复杂 CSS 效果会丢失
 * - flex/grid 布局转为绝对定位，嵌套复杂时可能有偏差
 * - 外部字体降级为系统字体
 * - 仅提取叶子文本容器，行内混合格式（如 <p>文本<strong>粗</strong></p>）会拆分
 *
 * 定位为"可编辑草稿"，供用户二次编辑，而非像素级还原。
 */

import { sanitizeFilename } from './exportImage'
import type PptxGenJS from 'pptxgenjs'

export interface PptExportOptions {
  signal?: AbortSignal
  onProgress?: (current: number, total: number) => void
}

function throwIfAborted(signal?: AbortSignal): void {
  signal?.throwIfAborted?.()
}

function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()))
}

/** 将 rgb()/rgba() 颜色转为 pptxgenjs 所需的 6 位 HEX（不含 #），无效返回 null */
export function colorToHex(color: string): string | null {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return null
  const r = parseInt(m[1]).toString(16).padStart(2, '0')
  const g = parseInt(m[2]).toString(16).padStart(2, '0')
  const b = parseInt(m[3]).toString(16).padStart(2, '0')
  return `${r}${g}${b}`
}

/** 检测文本是否包含 CJK（中日韩统一表意文字）字符 */
export function containsChinese(text: string): boolean {
  // \u4e00-\u9fa5: 中文简/繁体字
  return /[\u4e00-\u9fa5]/.test(text)
}

/**
 * 检测文本是否包含 CJK 字符（中文/日文/韩文等），
 * 用于确定在 PowerPoint 中应该使用 East Asian 主题字体还是 Latin 主题字体。
 */
export function containsCJK(text: string): boolean {
  // \u3000-\u303f: 中文标点符号
  // \u3040-\u30ff: 日文平假名/片假名
  // \u4e00-\u9fa5: 中文简/繁体字
  // \uac00-\ud7af: 韩文 Hangul
  return /[\u3000-\u303f\u3040-\u30ff\u4e00-\u9fa5\uac00-\ud7af]/.test(text)
}

/**
 * 获取适合文本内容的字体。
 *
 * 核心问题：pptxgenjs 4.x 不嵌入字体文件，只在 PPTX XML 中声明字体名。
 * 从 CSS 提取的字体名（如 "Inter"、"system-ui"）在 PowerPoint 中很可能不存在，
 * 导致字体回退失败，文本显示为方块/乱码符号。
 *
 * 解决方案：所有文本都返回空字符串（不设置 fontFace），
 * 让 PowerPoint 根据 lang 属性使用主题默认字体。
 * - 含 CJK 的文本 lang="zh-CN" → 使用主题 East Asian 字体（等线/微软雅黑/PingFang SC）
 * - 其他文本 lang="en-US" → 使用主题 Latin 字体（Calibri/Arial）
 *
 * @param _originalFontFamily 从 CSS 获取的原始字体名称（不使用）
 * @param _text 文本内容（不使用，保留函数签名以兼容旧代码）
 * @returns 空字符串，表示不设置 fontFace，使用主题默认字体
 */
export function getSuitableFontFamily(_originalFontFamily: string, _text: string): string {
  return ''
}

interface ExtractedText {
  type: 'text'
  text: string
  x: number
  y: number
  w: number
  h: number
  fontSize: number
  color: string
  bold: boolean
  align: 'left' | 'center' | 'right'
  fontFamily: string
}

interface ExtractedImage {
  type: 'image'
  data: string | null
  path: string | null
  x: number
  y: number
  w: number
  h: number
}

type ExtractedElement = ExtractedText | ExtractedImage

/** 将图片元素绘制到 canvas 转 dataURL（CORS 失败返回 null） */
function imageToDataUrl(img: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0)
    return canvas.toDataURL('image/png')
  } catch {
    // canvas 被 CORS 污染会抛 SecurityError
    return null
  }
}

/**
 * 从幻灯片 DOM 节点提取可编辑元素（纯函数，可独立测试）。
 *
 * @param slideNode 幻灯片根节点
 * @param win iframe 的 window（用于 getComputedStyle）
 * @param slideWIn 幻灯片宽度（英寸）
 * @param slideHIn 幻灯片高度（英寸）
 */
export function extractSlideElements(
  slideNode: HTMLElement,
  win: Window,
  slideWIn: number,
  slideHIn: number,
): { elements: ExtractedElement[]; background: string | null } {
  const slideRect = slideNode.getBoundingClientRect()
  // 像素 → 英寸缩放系数
  const scaleX = slideWIn / slideRect.width
  const scaleY = slideHIn / slideRect.height

  const elements: ExtractedElement[] = []

  // 提取幻灯片背景色
  const slideBg = win.getComputedStyle(slideNode).backgroundColor
  const background = colorToHex(slideBg)

  const walk = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement

    // 图片元素：提取位置与 dataURL
    if (el.tagName === 'IMG') {
      const img = el as HTMLImageElement
      const rect = img.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return
      const src = img.getAttribute('src') || ''
      const data = src.startsWith('data:') ? src : imageToDataUrl(img)
      elements.push({
        type: 'image',
        data,
        path: data ? null : src,
        x: +((rect.left - slideRect.left) * scaleX).toFixed(3),
        y: +((rect.top - slideRect.top) * scaleY).toFixed(3),
        w: +(rect.width * scaleX).toFixed(3),
        h: +(rect.height * scaleY).toFixed(3),
      })
      return // 不再遍历 img 子节点
    }

    // 直接文本内容（trim 后非空）
    const directText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent || '')
      .join('')
      .trim()

    const hasElementChildren = el.children.length > 0

    // 仅提取叶子文本容器（无子元素且有直接文本），避免父子重叠
    if (directText && !hasElementChildren) {
      const rect = el.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return
      const style = win.getComputedStyle(el)
      const fontSizePx = parseFloat(style.fontSize) || 16
      // px → pt：1 inch = 72pt，按缩放系数换算
      const fontSizePt = +(fontSizePx * scaleX * 72).toFixed(1)
      const color = colorToHex(style.color) || '000000'
      const bold = parseInt(style.fontWeight) >= 600 || style.fontWeight === 'bold'
      const align =
        style.textAlign === 'center' || style.textAlign === 'right'
          ? (style.textAlign as 'center' | 'right')
          : 'left'
      const fontFamily = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
      const suitableFont = getSuitableFontFamily(fontFamily, directText)

      elements.push({
        type: 'text',
        text: directText,
        x: +((rect.left - slideRect.left) * scaleX).toFixed(3),
        y: +((rect.top - slideRect.top) * scaleY).toFixed(3),
        w: +(rect.width * scaleX).toFixed(3),
        h: +(rect.height * scaleY).toFixed(3),
        fontSize: Math.max(8, fontSizePt),
        color,
        bold,
        align,
        fontFamily: suitableFont,
      })
      return // 叶子节点已提取，不再遍历
    }

    // 递归遍历子元素
    Array.from(el.children).forEach(walk)
  }

  walk(slideNode)
  return { elements, background }
}

/** 将提取的元素写入 pptxgenjs slide */
function writeSlide(
  pptx: PptxGenJS,
  elements: ExtractedElement[],
  background: string | null,
) {
  const slide = pptx.addSlide()
  if (background) slide.background = { color: background }

  for (const el of elements) {
    if (el.type === 'text') {
      // 关键：不设置 fontFace（使用 PowerPoint 主题默认字体），仅设置 lang。
      // - 含 CJK 的文本 lang="zh-CN" → PowerPoint 使用主题 East Asian 字体渲染
      //   （Windows: 等线/微软雅黑, macOS: PingFang SC, Linux: Noto Sans CJK）
      // - 其他文本 lang="en-US" → PowerPoint 使用主题 Latin 字体渲染（Calibri/Arial）
      // 不设置 fontFace 的原因：从 CSS 提取的字体名（如 "Inter"、"system-ui"）
      // 在 PowerPoint 中通常不存在，会导致字体回退失败，文本显示为符号。
      const lang = containsCJK(el.text) ? 'zh-CN' : 'en-US'
      slide.addText(el.text, {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fontSize: el.fontSize,
        color: el.color,
        bold: el.bold,
        align: el.align,
        fontFace: el.fontFamily,
        lang,
        valign: 'top',
      })
    } else if (el.type === 'image') {
      const opts: Record<string, unknown> = { x: el.x, y: el.y, w: el.w, h: el.h }
      if (el.data) opts.data = el.data
      else if (el.path) opts.path = el.path
      slide.addImage(opts)
    }
  }
}

/** 将 iframe 中的多页内容导出为可编辑 PPT（多页模式） */
export async function exportIframeToEditablePptx(
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
  const win = iframe.contentWindow
  if (!doc || !win) throw new Error('iframe 尚未就绪')

  const pptx = new PptxGenJS()
  const originalStyles = pageNodes.map((n) => n.style.display)

  try {
    // 先显示第一页以确定布局尺寸
    pageNodes.forEach((n, j) => {
      n.style.display = j === 0 ? '' : 'none'
    })
    await nextFrame()

    const firstRect = pageNodes[0].getBoundingClientRect()
    const ratio = firstRect.width / firstRect.height
    const slideW = 10
    const slideH = +(slideW / ratio).toFixed(3)
    pptx.defineLayout({ name: 'M2V_EDITABLE', width: slideW, height: slideH })
    pptx.layout = 'M2V_EDITABLE'

    for (let i = 0; i < pageNodes.length; i++) {
      throwIfAborted(signal)
      pageNodes.forEach((n, j) => {
        n.style.display = j === i ? '' : 'none'
      })
      await nextFrame()
      throwIfAborted(signal)

      const { elements, background } = extractSlideElements(pageNodes[i], win, slideW, slideH)
      writeSlide(pptx, elements, background)

      if (onProgress) onProgress(i + 1, pageNodes.length)
    }
  } finally {
    pageNodes.forEach((n, i) => {
      n.style.display = originalStyles[i]
    })
  }

  throwIfAborted(signal)
  await pptx.writeFile({ fileName: `${safeFilename}.pptx` })
}

/** 将 iframe 中的单页内容导出为可编辑 PPT */
export async function exportSinglePageToEditablePptx(
  iframe: HTMLIFrameElement,
  filename: string,
  options: PptExportOptions = {},
) {
  const { signal } = options
  const safeFilename = sanitizeFilename(filename)
  const PptxGenJS = (await import('pptxgenjs')).default
  throwIfAborted(signal)

  const doc = iframe.contentDocument!
  const win = iframe.contentWindow!
  const wrapper =
    doc.querySelector<HTMLElement>('body > div') ||
    doc.querySelector<HTMLElement>('body > main') ||
    doc.querySelector<HTMLElement>('body > section') ||
    doc.body

  const rect = wrapper.getBoundingClientRect()
  const ratio = rect.width / rect.height
  const slideW = 10
  const slideH = +(slideW / ratio).toFixed(3)

  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'M2V_EDITABLE', width: slideW, height: slideH })
  pptx.layout = 'M2V_EDITABLE'

  const { elements, background } = extractSlideElements(wrapper, win, slideW, slideH)
  writeSlide(pptx, elements, background)

  await pptx.writeFile({ fileName: `${safeFilename}.pptx` })
}
