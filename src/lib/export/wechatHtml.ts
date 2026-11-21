/**
 * 把已渲染的 HTML 文档转换为可粘贴到公众号编辑器的富文本。
 *
 * 移植自 html-anything（Apache-2.0）next/src/lib/export/wechat.ts 的 toWechatHtmlFromDocument
 * （提交 ce50359）。做法是遍历真实 DOM，把 getComputedStyle 的「视觉类」属性写成内联样式：
 * 画布里的样式多由 Tailwind CDN 等在运行时生成，只读源码拿不到，必须从渲染结果里取。
 *
 * 刻意舍弃布局类属性（position / display / flex / grid / width / height / gap）：
 * 海报级的网格在公众号约 375–540px 的正文栏里必然崩坏，让内容按单列顺序重排才是合理结果。
 */

/** margin / padding 上限：海报常用的 80–120px 留白放进手机正文栏会过大 */
const MAX_FLOW_SPACING_PX = 48

const STYLE_PROPS = [
  'color',
  'background-color',
  'background-image',
  'background-position',
  'background-size',
  'background-repeat',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-decoration',
  'text-transform',
  'white-space',
  'word-break',
  'overflow-wrap',
  'list-style-type',
  'list-style-position',
  'border-collapse',
  'box-shadow',
  'text-shadow',
  'opacity',
] as const

/** 仅在存在背景图时才有意义的属性 */
const BG_IMAGE_ONLY_PROPS = new Set<string>(['background-position', 'background-size', 'background-repeat'])

/** 不属于正文内容、粘贴后也无意义的元素 */
const DROP_SELECTOR = 'script, style, link, noscript, template'

const TOOL_ATTR = 'data-tool'
const TOOL_NAME = 'markdown2view'

export function toWechatHtmlFromDocument(renderedDoc: Document): string {
  const body = renderedDoc.body
  if (!body) return ''

  const view = renderedDoc.defaultView ?? window
  const wrap = document.createElement('div')
  for (const child of Array.from(body.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element
      if (element.matches(DROP_SELECTOR) || isComputedHidden(element, view)) continue
    }
    const clone = child.cloneNode(true)
    if (child.nodeType === Node.ELEMENT_NODE && clone.nodeType === Node.ELEMENT_NODE) {
      inlineComputedTree(child as Element, clone as Element, view)
      ;(clone as Element).setAttribute(TOOL_ATTR, TOOL_NAME)
    }
    wrap.appendChild(clone)
  }
  wrap.querySelectorAll(DROP_SELECTOR).forEach((el) => el.remove())

  const section = document.createElement('section')
  section.setAttribute(TOOL_ATTR, TOOL_NAME)
  const bodyStyle = computedStyleText(body, view, { skipMargin: true })
  if (bodyStyle) section.setAttribute('style', bodyStyle)
  section.innerHTML = wrap.innerHTML
  return section.outerHTML
}

function inlineComputedTree(source: Element, clone: Element, view: Window): void {
  if (isComputedHidden(source, view)) {
    clone.remove()
    return
  }
  const styleText = computedStyleText(source, view)
  if (styleText) clone.setAttribute('style', styleText)
  else clone.removeAttribute('style')
  // class 依赖的样式表不会随粘贴带走，留着只会增大体积
  clone.removeAttribute('class')
  materializePseudos(source, clone, view)

  // 伪元素只物化在克隆树里，两棵树的子元素下标不再一一对应：
  // 逐层按真实子元素配对，配对时跳过物化出来的伪元素节点。
  const sourceChildren = Array.from(source.children)
  const cloneChildren = Array.from(clone.children).filter((child) => !child.hasAttribute('data-pseudo'))
  for (let i = 0; i < sourceChildren.length; i++) {
    const cloneChild = cloneChildren[i]
    if (cloneChild) inlineComputedTree(sourceChildren[i], cloneChild, view)
  }
}

function isComputedHidden(element: Element, view: Window): boolean {
  try {
    return view.getComputedStyle(element).display === 'none'
  } catch {
    return false
  }
}

/**
 * 公众号会整体丢弃伪元素。把 ::before / ::after 的文本内容物化成真实的 <span>，
 * 这样对勾、角标之类靠伪元素呈现的内容才能保留。
 */
function materializePseudos(source: Element, clone: Element, view: Window): void {
  const before = buildPseudoNode(source, view, '::before')
  if (before) clone.insertBefore(before, clone.firstChild)
  const after = buildPseudoNode(source, view, '::after')
  if (after) clone.appendChild(after)
}

function buildPseudoNode(source: Element, view: Window, pseudo: '::before' | '::after'): HTMLElement | null {
  let computed: CSSStyleDeclaration
  try {
    computed = view.getComputedStyle(source, pseudo)
  } catch {
    return null
  }
  const text = unquoteContent(computed.getPropertyValue('content').trim())
  if (text === null) return null

  const span = document.createElement('span')
  span.setAttribute('data-pseudo', pseudo)
  if (text) span.textContent = text
  const style = computedStyleText(source, view, { pseudoComputed: computed })
  if (style) span.setAttribute('style', style)
  return span
}

/**
 * computed 的 content 是 CSS 记号：带引号的字符串、none / normal，或 attr() / counter() / url() 等函数。
 * 只物化字符串字面量，其余一律跳过。
 */
function unquoteContent(value: string): string | null {
  if (!value || value === 'none' || value === 'normal') return null
  const match = value.match(/^"((?:[^"\\]|\\.)*)"$/) ?? value.match(/^'((?:[^'\\]|\\.)*)'$/)
  if (!match) return null
  return match[1].replace(/\\(.)/g, '$1')
}

function computedStyleText(
  el: Element,
  view: Window,
  opts?: { skipMargin?: boolean; pseudoComputed?: CSSStyleDeclaration },
): string {
  let computed: CSSStyleDeclaration
  if (opts?.pseudoComputed) {
    computed = opts.pseudoComputed
  } else {
    try {
      computed = view.getComputedStyle(el)
    } catch {
      // 跨域 frame 或已脱离文档的节点会抛错：跳过该节点而不是中断整个导出
      return ''
    }
  }
  const styles: string[] = []

  addBox(styles, computed, 'margin', opts?.skipMargin)
  addBox(styles, computed, 'padding')
  addBorder(styles, computed)
  addBox(styles, computed, 'border-radius')

  // 没有背景图时，position / size / repeat 只是默认值，逐个元素输出会让粘贴内容平白变大
  const hasBgImage = computed.getPropertyValue('background-image').trim() !== 'none'
  for (const prop of STYLE_PROPS) {
    if (!hasBgImage && BG_IMAGE_ONLY_PROPS.has(prop)) continue
    const value = computed.getPropertyValue(prop).trim()
    if (shouldKeep(prop, value)) styles.push(`${prop}: ${value}`)
  }

  return styles.join('; ')
}

function addBox(
  styles: string[],
  computed: CSSStyleDeclaration,
  prefix: 'margin' | 'padding' | 'border-radius',
  skip = false,
): void {
  if (skip) return
  const keys =
    prefix === 'border-radius'
      ? ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((x) => `border-${x}-radius`)
      : ['top', 'right', 'bottom', 'left'].map((x) => `${prefix}-${x}`)
  const values = keys.map((key) => normalizeBoxValue(prefix, computed.getPropertyValue(key).trim()))
  if (values.every((value) => !shouldKeep(prefix, value))) return
  if (values.every((value) => value === values[0])) {
    styles.push(`${prefix}: ${values[0]}`)
    return
  }
  keys.forEach((key, idx) => {
    if (shouldKeep(prefix, values[idx])) styles.push(`${key}: ${values[idx]}`)
  })
}

function addBorder(styles: string[], computed: CSSStyleDeclaration): void {
  for (const side of ['top', 'right', 'bottom', 'left']) {
    const width = computed.getPropertyValue(`border-${side}-width`).trim()
    const style = computed.getPropertyValue(`border-${side}-style`).trim()
    const color = computed.getPropertyValue(`border-${side}-color`).trim()
    if (!shouldKeep('border-width', width) || style === 'none' || !style) continue
    styles.push(`border-${side}: ${width} ${style} ${color}`)
  }
}

function shouldKeep(prop: string, value: string): boolean {
  if (!value) return false
  if (value === 'initial' || value === 'inherit' || value === 'unset') return false
  if (prop.includes('color') && (value === 'rgba(0, 0, 0, 0)' || value === 'transparent')) return false
  if (prop === 'opacity' && (value === '1' || value === '1.0')) return false
  if (prop.includes('shadow') && value === 'none') return false
  if (prop.includes('image') && value === 'none') return false
  if (prop.includes('radius') && isZero(value)) return false
  if ((prop === 'margin' || prop === 'padding') && isZero(value)) return false
  if (prop.startsWith('border') && isZero(value)) return false
  return true
}

function normalizeBoxValue(prefix: 'margin' | 'padding' | 'border-radius', value: string): string {
  // 负外边距在单列重排后只会造成重叠，直接丢弃
  if (prefix === 'margin' && value.startsWith('-')) return ''
  if (prefix !== 'margin' && prefix !== 'padding') return value

  const px = value.match(/^(-?\d+(?:\.\d+)?)px$/)
  if (!px) return value
  return Number(px[1]) > MAX_FLOW_SPACING_PX ? `${MAX_FLOW_SPACING_PX}px` : value
}

function isZero(value: string): boolean {
  return /^0(?:px|em|rem|%)?(?:\s+0(?:px|em|rem|%)?){0,3}$/.test(value)
}
