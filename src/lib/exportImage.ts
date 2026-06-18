/**
 * Portions of this file are derived from html-anything (https://github.com/nexu-io/html-anything),
 * licensed under the Apache License, Version 2.0.
 * Modified by ZhongXiandou/markdown2view contributors.
 */

import { domToBlob, waitUntilLoad } from 'modern-screenshot'

// 把 iframe（srcdoc 构建）内容渲染为 PNG Blob。
// 移植自 html-anything/next/src/lib/export/image.ts：
//   1. 截图前等待字体/图片/样式表就绪；
//   2. 临时把 iframe 撑高到内容全高，让浏览器在自然宽度下完整布局；
//   3. 用 documentElement.clientWidth 作为截图宽度，避免 1~2px 漂移导致中文标题换行；
//   4. 显式传入宽高，使 foreignObject SVG 与布局尺寸 1:1。

export type ImageOpts = {
  scale?: number
  type?: 'image/png' | 'image/jpeg' | 'image/webp'
  backgroundColor?: string
  maxHeight?: number
}

const NEXT_FRAME = (win: Window = window) =>
  new Promise<void>((r) => win.requestAnimationFrame(() => win.requestAnimationFrame(() => r())))

// 基于 MutationObserver 的 DOM 稳定性探测机制
async function waitForStability(element: HTMLElement | Document, win: Window = window, maxWaitMs = 1500): Promise<void> {
  await new Promise<void>((resolve) => {
    let timeout: ReturnType<typeof setTimeout>
    let stableTimer: ReturnType<typeof setTimeout>
    
    const target = 'body' in element ? element.body : element
    if (!target) {
      resolve()
      return
    }

    const finish = () => {
      observer.disconnect()
      clearTimeout(timeout)
      clearTimeout(stableTimer)
      resolve()
    }

    const observer = new MutationObserver(() => {
      clearTimeout(stableTimer)
      stableTimer = setTimeout(finish, 100)  // 从 150ms 减少到 100ms
    })

    observer.observe(target, { childList: true, subtree: true, attributes: true, characterData: true })
    
    stableTimer = setTimeout(finish, 100)  // 从 150ms 减少到 100ms
    timeout = setTimeout(finish, maxWaitMs)
  })

  for (let i = 0; i < 2; i++) {  // 从 3 帧减少到 2 帧
    await new Promise<void>((r) => win.requestAnimationFrame(() => r()))
  }
}

async function waitForDocumentReady(doc: Document, win: Window): Promise<void> {
  if (doc.readyState !== 'complete') {
    await new Promise<void>((res) => {
      const done = () => {
        doc.removeEventListener('readystatechange', onReadyStateChange)
        res()
      }
      const onReadyStateChange = () => {
        if (doc.readyState === 'complete') done()
      }
      doc.addEventListener('readystatechange', onReadyStateChange)
      win.addEventListener?.('load', done, { once: true })
      setTimeout(done, 3000)
    })
  }

  // 并行等待样式表、字体和图片，而不是串行等待
  const sheets = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
  const sheetsPromise = Promise.all(
    sheets.map(
      (link) =>
        new Promise<void>((res) => {
          if (link.sheet) return res()
          const done = () => res()
          link.addEventListener('load', done, { once: true })
          link.addEventListener('error', done, { once: true })
          setTimeout(done, 3000)
        }),
    ),
  )

  const fontsPromise = (async () => {
    try {
      const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts
      if (fonts?.ready) await fonts.ready
    } catch {
      /* noop */
    }
  })()

  const imgs = Array.from(doc.images)
  const imgsPromise = Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((res) => {
          if (img.complete && img.naturalWidth > 0) return res()
          const done = () => res()
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
          if ('decode' in img) img.decode().then(done, done)
          setTimeout(done, 3000)
        }),
    ),
  )

  // 并行等待所有资源
  await Promise.all([sheetsPromise, fontsPromise, imgsPromise])

  try {
    await waitUntilLoad(doc.documentElement, { timeout: 3000 })
  } catch {
    /* noop */
  }

  // Tailwind Play CDN 异步注入样式，等待 DOM 变动停止和帧渲染
  await waitForStability(doc, win, 1000)
}

export function resolveBackground(doc: Document, win: Window, override?: string): string {
  if (override) return override
  const tryColor = (c?: string | null) => {
    if (!c) return null
    const v = c.trim()
    if (!v || v === 'transparent' || v === 'rgba(0, 0, 0, 0)') return null
    return v
  }
  try {
    const bodyInline = tryColor(doc.body?.style.backgroundColor)
    if (bodyInline) return bodyInline
    const bodyComputed = tryColor(win.getComputedStyle(doc.body).backgroundColor)
    if (bodyComputed) return bodyComputed
    const htmlComputed = tryColor(win.getComputedStyle(doc.documentElement).backgroundColor)
    if (htmlComputed) return htmlComputed
  } catch {
    /* cross-origin or detached doc */
  }
  return '#ffffff'
}

export async function elementToBlob(element: HTMLElement, opts: ImageOpts = {}): Promise<Blob> {
  await waitForStability(element, element.ownerDocument.defaultView || window, 1000)

  const rect = element.getBoundingClientRect()
  const width = Math.ceil(rect.width || element.offsetWidth)
  const height = Math.ceil(rect.height || element.offsetHeight)
  if (!width || !height) throw new Error('导出节点暂无尺寸')

  const blob = await domToBlob(element, {
    scale: opts.scale ?? 2,
    type: opts.type ?? 'image/png',
    backgroundColor: opts.backgroundColor ?? '#ffffff',
    width,
    height,
    fetch: { requestInit: { cache: 'force-cache' } },
  })
  if (!blob) throw new Error('截图失败')
  return blob
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * 针对 iframe 内的某个具体 DOM 元素进行截图。
 *
 * 核心原理：
 * 1. 临时禁用全局和元素自身的缩放/自适应，测量其 natural content 宽高。
 * 2. 临时修改样式，强制 iframe 宽度/高度、html 宽高、body 宽高和目标元素宽高完全对齐，
 *    并清除 margin、padding、justify-content/align-items (flex 居中样式) 等，
 *    使得目标元素无缝填满整个 iframe document。
 * 3. 此时对 doc.documentElement 进行截图（这样能完美保留全局 variables、fonts 和样式），
 *    截出来的图像尺寸将精确契合目标元素本身，不包含任何外边距或右侧渲染区的冗余空白。
 * 4. 截图完成后，恢复所有受影响元素的原始样式。
 */
export interface CapturedBlob {
  blob: Blob
  width: number
  height: number
}

export async function captureElementInIframeToBlob(
  iframe: HTMLIFrameElement,
  element: HTMLElement,
  opts: ImageOpts = {}
): Promise<CapturedBlob> {
  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) throw new Error('iframe 尚未就绪')

  // 1. 确保 iframe 加载完成
  await waitForDocumentReady(doc, win)

  // 保存原始 iframe 属性以便后面还原
  const prevIframeWidth = iframe.style.width
  const prevIframeMaxWidth = iframe.style.maxWidth

  // 2. 临时重置缩放和自适应，并将 iframe 强行撑开到桌面端标准宽度（1200px），
  //    以此来获得在桌面端排版下的真实内容宽高，防止窄屏下响应式布局折叠/被挤压变形。
  const prevZoom = doc.body.style.zoom
  const prevScale = doc.documentElement.style.getPropertyValue('--auto-scale')
  
  doc.body.style.zoom = '1'
  doc.documentElement.style.setProperty('--auto-scale', '1')

  iframe.style.setProperty('width', '1200px', 'important')
  iframe.style.setProperty('max-width', 'none', 'important')

  // 等待布局重流以获取真正的宽度和高度
  await NEXT_FRAME()

  // 3. 计算元素的真实内容尺寸
  const w = element.offsetWidth || element.scrollWidth || doc.documentElement.clientWidth
  const h = element.offsetHeight || element.scrollHeight || doc.documentElement.scrollHeight

  const overrides: {
    element: HTMLElement | HTMLHtmlElement | HTMLBodyElement | HTMLIFrameElement
    property: string
    originalValue: string
    originalPriority: string
  }[] = []

  function setTempStyle(
    el: HTMLElement | HTMLHtmlElement | HTMLBodyElement | HTMLIFrameElement,
    property: string,
    value: string,
    priority = 'important'
  ) {
    overrides.push({
      element: el,
      property,
      originalValue: el.style.getPropertyValue(property),
      originalPriority: el.style.getPropertyPriority(property)
    })
    el.style.setProperty(property, value, priority)
  }

  try {
    // 4. 临时修改样式，将 iframe、html、body 和元素完全拉伸对齐，并消除外边距和居中布局
    setTempStyle(iframe, 'width', `${w}px`)
    setTempStyle(iframe, 'height', `${h}px`)
    setTempStyle(iframe, 'max-width', 'none')
    setTempStyle(iframe, 'max-height', 'none')

    setTempStyle(doc.documentElement, 'width', `${w}px`)
    setTempStyle(doc.documentElement, 'height', `${h}px`)
    setTempStyle(doc.documentElement, 'overflow', 'hidden')
    setTempStyle(doc.documentElement, 'margin', '0')
    setTempStyle(doc.documentElement, 'padding', '0')

    setTempStyle(doc.body, 'width', `${w}px`)
    setTempStyle(doc.body, 'height', `${h}px`)
    setTempStyle(doc.body, 'overflow', 'hidden')
    setTempStyle(doc.body, 'margin', '0')
    setTempStyle(doc.body, 'padding', '0')
    setTempStyle(doc.body, 'display', 'block')
    setTempStyle(doc.body, 'justify-content', 'unset')
    setTempStyle(doc.body, 'align-items', 'unset')
    setTempStyle(doc.body, 'min-height', '0')
    setTempStyle(doc.body, 'zoom', '1')

    setTempStyle(element, 'margin', '0')
    setTempStyle(element, 'transform', 'none')
    setTempStyle(element, 'transform-origin', 'unset')
    setTempStyle(element, 'position', 'relative')
    setTempStyle(element, 'left', '0')
    setTempStyle(element, 'top', '0')
    setTempStyle(element, 'right', 'auto')
    setTempStyle(element, 'bottom', 'auto')
    setTempStyle(element, 'width', `${w}px`)
    setTempStyle(element, 'height', `${h}px`)

    // 等待让新布局完全渲染且 DOM 稳定
    await waitForStability(doc, win, 500)  // 从 1000ms 减少到 500ms

    const scale = opts.scale ?? 2
    const backgroundColor = resolveBackground(doc, win, opts.backgroundColor)

    // 5. 对整个 html 节点进行截图，因为尺寸完全匹配，所以截图结果与元素完全重合，且保留了全局样式与 CSS 变量
    const blob = await domToBlob(doc.documentElement as unknown as HTMLElement, {
      scale,
      type: opts.type ?? 'image/png',
      backgroundColor,
      width: w,
      height: h,
      fetch: { requestInit: { cache: 'force-cache' } },
    })

    if (!blob) throw new Error('截图失败')
    return { blob, width: w, height: h }
  } finally {
    // 6. 恢复所有样式
    for (let i = overrides.length - 1; i >= 0; i--) {
      const { element: el, property, originalValue, originalPriority } = overrides[i]
      if (originalValue === '' && originalPriority === '') {
        el.style.removeProperty(property)
      } else {
        el.style.setProperty(property, originalValue, originalPriority)
      }
    }
    // 恢复缩放与 iframe 原始宽高样式
    doc.body.style.zoom = prevZoom
    doc.documentElement.style.setProperty('--auto-scale', prevScale)

    if (prevIframeWidth === '') {
      iframe.style.removeProperty('width')
    } else {
      iframe.style.setProperty('width', prevIframeWidth)
    }

    if (prevIframeMaxWidth === '') {
      iframe.style.removeProperty('max-width')
    } else {
      iframe.style.setProperty('max-width', prevIframeMaxWidth)
    }
  }
}

