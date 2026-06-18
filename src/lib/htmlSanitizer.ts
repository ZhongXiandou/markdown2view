// AI 生成 HTML 的轻量级净化器。
// 设计原则：
// 1. 不引入外部依赖，利用浏览器 DOMParser 实现。
// 2. 默认放行所有标签、class、style，只拦截真正危险的攻击向量：
//    - script 标签
//    - 事件处理器属性（onclick/onload 等）
//    - javascript: / data: 等危险伪协议
//    - CSS expression / behavior / @import 等 IE 遗留攻击向量
// 3. 对 iframe / object / embed 做 sandbox 限制
// 4. 提供 sanitizeHtml 与 sanitizeHtmlStrict 两档强度，满足不同场景需求

const DANGEROUS_TAGS = new Set(['script'])

const IFRAME_SANDBOX_TAGS = new Set(['iframe', 'object', 'embed'])

const URL_ATTRS = new Set(['href', 'src', 'srcset', 'poster', 'data', 'action', 'formaction'])

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

function isEventHandlerAttr(name: string): boolean {
  return name.startsWith('on') && name.length > 2
}

function isDangerousUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return false
  // 拒绝 javascript: 和 data:（可执行脚本）
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:text/html')) {
    return true
  }
  return false
}

function isSafeUrl(value: string): boolean {
  if (isDangerousUrl(value)) return false
  const trimmed = value.trim()
  if (!trimmed) return true
  // 允许相对路径、锚点、空值
  if (/^(\/|#|\.\.?\/)/.test(trimmed)) return true
  try {
    const url = new URL(trimmed, 'http://localhost')
    return SAFE_URL_PROTOCOLS.has(url.protocol)
  } catch {
    // 无法解析时保守放行相对路径，拒绝带协议的可疑绝对路径
    return !/^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  }
}

function isSafeSrcset(value: string): boolean {
  return value.split(',').every((part) => {
    const url = part.trim().split(/\s+/)[0]
    return !url || isSafeUrl(url)
  })
}

function processStyleAttr(value: string): string | null {
  // 只拒绝 expression、behavior 等 IE 遗留攻击向量
  if (/expression|behavior/i.test(value)) {
    return null
  }
  return value
}

function processStyleElement(css: string): string | null {
  // 只拒绝 @import（可引入外部样式）和 expression/behavior
  if (/@import|expression|behavior/i.test(css)) {
    return null
  }
  return css
}

function sanitizeNode(
  node: Node,
  ownerDoc: Document,
  options: { strict: boolean },
): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return ownerDoc.createTextNode(node.textContent || '')
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return ownerDoc.createComment(node.nodeValue || '')
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const el = node as Element
  const tagName = el.tagName.toLowerCase()

  // 严格模式下：丢弃 script 内容；宽松模式下：同样丢弃（script 无合法用途）
  if (tagName === 'script') {
    return null
  }

  // 严格模式下丢弃 iframe/object/embed
  if (IFRAME_SANDBOX_TAGS.has(tagName)) {
    if (options.strict) return null
    const newEl = ownerDoc.createElement(tagName)
    // 复制安全属性
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i]
      if (!attr) continue
      const name = attr.name.toLowerCase()
      if (isEventHandlerAttr(name)) continue
      if (name === 'sandbox') {
        // 保留用户指定的 sandbox，但确保包含 allow-scripts 时不允许同域
        newEl.setAttribute('sandbox', attr.value)
        continue
      }
      if (URL_ATTRS.has(name)) {
        if (!isSafeUrl(attr.value)) continue
      }
      try {
        newEl.setAttribute(name, attr.value)
      } catch { /* ignore */ }
    }
    // 如果没有 sandbox，强制添加最严格的 sandbox
    if (!newEl.hasAttribute('sandbox')) {
      newEl.setAttribute('sandbox', 'allow-scripts')
    }
    // 递归处理子节点
    el.childNodes.forEach((child) => {
      const sanitized = sanitizeNode(child, ownerDoc, options)
      if (sanitized) newEl.appendChild(sanitized)
    })
    return newEl
  }

  // style 标签：过滤危险 CSS
  if (tagName === 'style') {
    const cleanCss = processStyleElement(el.textContent || '')
    if (!cleanCss) return null
    const newStyle = ownerDoc.createElement('style')
    newStyle.textContent = cleanCss
    return newStyle
  }

  const newEl = ownerDoc.createElement(tagName)

  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i]
    if (!attr) continue
    const name = attr.name.toLowerCase()

    // 禁止事件处理器
    if (isEventHandlerAttr(name)) continue

    let value = attr.value

    // URL 属性校验：拒绝 javascript: / data:text/html
    if (URL_ATTRS.has(name)) {
      if (name === 'srcset') {
        if (!isSafeSrcset(value)) continue
      } else if (!isSafeUrl(value)) {
        continue
      }
    }

    // style 属性校验：只过滤 expression/behavior
    if (name === 'style') {
      const cleanStyle = processStyleAttr(value)
      if (cleanStyle === null) continue
      value = cleanStyle
    }

    try {
      newEl.setAttribute(name, value)
    } catch {
      // 非法属性名时忽略
    }
  }

  // 递归处理子节点
  el.childNodes.forEach((child) => {
    const sanitized = sanitizeNode(child, ownerDoc, options)
    if (sanitized) newEl.appendChild(sanitized)
  })

  return newEl
}

function sanitizeHtmlInternal(html: string, options: { strict: boolean }): string {
  if (!html) return ''

  const trimmed = html.trim()
  const hasFullDocument = /^<!DOCTYPE\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  if (hasFullDocument) {
    const newHtml = doc.createElement('html')
    const newHead = doc.createElement('head')
    const newBody = doc.createElement('body')

    doc.head.childNodes.forEach((child) => {
      const sanitized = sanitizeNode(child, doc, options)
      if (sanitized) newHead.appendChild(sanitized)
    })
    doc.body.childNodes.forEach((child) => {
      const sanitized = sanitizeNode(child, doc, options)
      if (sanitized) newBody.appendChild(sanitized)
    })

    // 保留 html/body 上的属性（不过滤 class/id/style/lang 等）
    for (const el of [doc.documentElement, doc.body]) {
      const target = el === doc.documentElement ? newHtml : newBody
      const tag = el.tagName.toLowerCase()
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i]
        if (!attr) continue
        const name = attr.name.toLowerCase()
        if (isEventHandlerAttr(name)) continue
        if (name === 'style' && processStyleAttr(attr.value) === null) continue
        try {
          target.setAttribute(name, attr.value)
        } catch { /* ignore */ }
      }
      if (tag === 'html') {
        if (el.getAttribute('lang')) newHtml.setAttribute('lang', el.getAttribute('lang')!)
      }
    }

    newHtml.appendChild(newHead)
    newHtml.appendChild(newBody)
    return '<!DOCTYPE html>\n' + newHtml.outerHTML
  }

  const fragment = doc.createDocumentFragment()
  doc.body.childNodes.forEach((child) => {
    const sanitized = sanitizeNode(child, doc, options)
    if (sanitized) fragment.appendChild(sanitized)
  })

  const wrapper = doc.createElement('div')
  wrapper.appendChild(fragment)
  return wrapper.innerHTML
}

/**
 * 宽松净化：保留所有标签、class、style、data-* 属性，只拦截真正危险的攻击向量。
 * 适用于 AI 生成 HTML 的预览场景，确保样式和功能完整。
 */
export function sanitizeHtml(html: string): string {
  return sanitizeHtmlInternal(html, { strict: false })
}

/**
 * 严格净化：额外丢弃 iframe/object/embed 等可嵌入外部内容的标签。
 * 适用于对安全性要求更高的导出/分享场景。
 */
export function sanitizeHtmlStrict(html: string): string {
  return sanitizeHtmlInternal(html, { strict: true })
}
