export function firstContentElement(doc: Document): HTMLElement {
  return (
    doc.querySelector<HTMLElement>('body > div')
    || doc.querySelector<HTMLElement>('body > main')
    || doc.querySelector<HTMLElement>('body > section')
    || doc.body
  )
}

export function firstPreviewPage(doc: Document): HTMLElement | null {
  const pageNodes = Array.from(doc.querySelectorAll<HTMLElement>('.page, .slide, .card'))
  return pageNodes.find((node) => node.style.display !== 'none') || pageNodes[0] || null
}

export async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

// 保存/恢复页面预览时由 useIframeScale 设置的内联样式
const PAGE_INLINE_PROPS = [
  'position', 'left', 'top', 'margin', 'transform', 'transformOrigin',
  'width', 'height', 'maxWidth', 'minWidth', 'boxSizing', 'flexShrink',
] as const

const HTML_BODY_INLINE_PROPS = [
  'position', 'margin', 'padding', 'overflow', 'width', 'height',
] as const

export async function withScaleReset<T>(doc: Document, task: () => Promise<T>): Promise<T> {
  // 保存 html/body 样式
  const htmlOld: Record<string, string> = {}
  const bodyOld: Record<string, string> = {}
  const pagesOld: Map<HTMLElement, Record<string, string>> = new Map()

  HTML_BODY_INLINE_PROPS.forEach((p) => {
    htmlOld[p] = doc.documentElement.style[p as any] || ''
    bodyOld[p] = doc.body.style[p as any] || ''
  })
  htmlOld.overflow = doc.documentElement.style.overflow || ''
  bodyOld.zoom = doc.body.style.zoom || ''

  const oldScale = doc.documentElement.style.getPropertyValue('--auto-scale')

  // 保存所有页面元素的内联样式
  const allPages = Array.from(doc.querySelectorAll<HTMLElement>('.page, .slide, .card'))
  allPages.forEach((page) => {
    const saved: Record<string, string> = {}
    PAGE_INLINE_PROPS.forEach((p) => {
      saved[p] = page.style[p as any] || ''
    })
    saved.display = page.style.display || ''
    pagesOld.set(page, saved)
  })

  try {
    // 重置缩放和定位样式
    doc.body.style.zoom = '1'
    doc.documentElement.style.setProperty('--auto-scale', '1')
    doc.documentElement.style.margin = '0'
    doc.documentElement.style.padding = '0'
    doc.documentElement.style.width = ''
    doc.documentElement.style.height = ''
    doc.documentElement.style.overflow = ''
    doc.body.style.position = ''
    doc.body.style.margin = '0'
    doc.body.style.padding = '0'
    doc.body.style.width = ''
    doc.body.style.height = ''
    doc.body.style.overflow = ''

    // 重置所有页面元素样式，让 exportImage 可以自由设置
    allPages.forEach((page) => {
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
      page.style.boxSizing = ''
      page.style.flexShrink = ''
    })

    await nextFrame()
    return await task()
  } finally {
    // 恢复 html/body 样式
    Object.entries(htmlOld).forEach(([k, v]) => {
      if (v) (doc.documentElement.style as any)[k] = v
      else (doc.documentElement.style as any)[k] = ''
    })
    Object.entries(bodyOld).forEach(([k, v]) => {
      if (v) (doc.body.style as any)[k] = v
      else (doc.body.style as any)[k] = ''
    })
    doc.body.style.zoom = bodyOld.zoom || ''

    if (oldScale) {
      doc.documentElement.style.setProperty('--auto-scale', oldScale)
    } else {
      doc.documentElement.style.removeProperty('--auto-scale')
    }

    // 恢复页面元素样式
    pagesOld.forEach((saved, page) => {
      Object.entries(saved).forEach(([k, v]) => {
        if (v) (page.style as any)[k] = v
        else (page.style as any)[k] = ''
      })
    })
  }
}

export async function withVisiblePage<T>(
  pageNodes: HTMLElement[],
  visibleIndex: number,
  task: () => Promise<T>,
): Promise<T> {
  const originalStyles = pageNodes.map((node) => node.style.display)
  pageNodes.forEach((node, index) => {
    node.style.display = index === visibleIndex ? '' : 'none'
  })
  await nextFrame()

  try {
    return await task()
  } finally {
    pageNodes.forEach((node, index) => {
      node.style.display = originalStyles[index]
    })
  }
}
