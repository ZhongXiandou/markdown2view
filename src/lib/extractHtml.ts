// 从外部 AI 的回复中提取真正的 HTML 文档。
// AI 常把输出包在 ```html ... ``` 代码块里，或在前面加一段解释文字。
// 移植自 html-anything/next/src/lib/extract-html.ts。

import { hasTailwindClasses, hasTailwindScript, generateTailwindScriptTag } from './tailwindHelper'
import { sanitizeHtml } from './htmlSanitizer'

export function extractHtml(streamed: string): string {
  if (!streamed) return ''

  // 1. 去掉 ```html 代码块围栏
  const fence = streamed.match(/```(?:html|HTML)?\s*([\s\S]*?)```/)
  if (fence) {
    const inner = fence[1].trim()
    if (inner.startsWith('<')) return inner
  }

  // 2. 查找 <!DOCTYPE html ... </html>
  const doctypeStart = streamed.search(/<!DOCTYPE\s+html/i)
  if (doctypeStart !== -1) {
    const closeIdx = streamed.lastIndexOf('</html>')
    if (closeIdx !== -1) {
      return streamed.slice(doctypeStart, closeIdx + '</html>'.length)
    }
    return streamed.slice(doctypeStart)
  }

  // 3. 查找 <html> ... </html>
  const htmlStart = streamed.search(/<html[\s>]/i)
  if (htmlStart !== -1) {
    const closeIdx = streamed.lastIndexOf('</html>')
    if (closeIdx !== -1) {
      return streamed.slice(htmlStart, closeIdx + '</html>'.length)
    }
    return streamed.slice(htmlStart)
  }

  // 4. 以 < 开头则直接信任
  if (streamed.trimStart().startsWith('<')) {
    return streamed
  }

  // 5. 兜底：包一层最小骨架（内联样式，不依赖外部 CDN）让内容可渲染
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,-apple-system,sans-serif;padding:2rem;margin:0}pre{white-space:pre-wrap;word-break:break-word;background:#f8f9fa;padding:1rem;border-radius:4px}</style></head><body><pre>${escapeHtml(
    streamed,
  )}</pre></body></html>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 【H4】根据脚本权限动态生成 CSP 元标签。
// - 默认模式：深度限制脚本、插件、嵌套 frame，放行图片/字体/style/数据 URI
// - 交互模式（allowScripts=true）：允许 unsafe-inline、unsafe-eval、connect-src 及可信 CDN
// - 可信 CDN 白名单：fonts.googleapis.com、cdn.jsdelivr.net、unpkg.com
function buildCspMeta(allowScripts: boolean): string {
  const trustedHosts = [
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ]
  const hosts = trustedHosts.join(' ')

  if (allowScripts) {
    const policy = [
      `default-src * data: ${hosts}`,
      `script-src 'unsafe-inline' 'unsafe-eval' * data: blob:`,
      `style-src 'unsafe-inline' * data:`,
      `connect-src * data:`,
      `img-src * data: blob:`,
      `font-src * data:`,
      `object-src 'none'`,
      `frame-ancestors 'none'`,
    ].join('; ')
    return `<meta http-equiv="Content-Security-Policy" content="${policy}">`
  } else {
    const policy = [
      `default-src * data: ${hosts}`,
      `script-src 'none'`,
      `style-src 'unsafe-inline' * data:`,
      `img-src * data: blob:`,
      `font-src * data:`,
      `object-src 'none'`,
      `frame-src 'none'`,
      `frame-ancestors 'none'`,
    ].join('; ')
    return `<meta http-equiv="Content-Security-Policy" content="${policy}">`
  }
}

// 保证存在闭合标签，便于 iframe 增量渲染，并注入专门供 PDF 导出使用的多页分离打印样式。
export function previewHtml(input: string, options: { allowScripts?: boolean } = {}): string {
  let html = sanitizeHtml(extractHtml(input), { allowScripts: options.allowScripts })
  if (!html) return ''

  // 【H4】注入 CSP meta 标签：纵深防御，在净化器之上再加一层限制。
  // - 默认模式（不允许脚本）：禁脚本/插件/子 frame，放行图片/样式/字体/数据 URI
  // - 交互式模式（allowScripts=true）：降低限制至 unsafe-inline/eval，以便用户主动运行脚本
  const cspMeta = buildCspMeta(!!options.allowScripts)

  // 把 CSP 注入到 <head> 最前面（若没有 head 则附加到 html 开头）
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>${cspMeta}`)
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/(<html[^>]*>)/i, `$1<head>${cspMeta}</head>`)
  } else {
    html = cspMeta + html
  }

  // 自动为所有样式表 link 标签注入 crossorigin="anonymous"，确保截图库 (modern-screenshot) 可以绕过跨域限制读取其中的 @font-face 规则进行 Base64 字体嵌入。
  html = html.replace(/<link\s+([^>]*rel=["']?stylesheet["']?[^>]*)(?=[ >])/gi, (match) => {
    if (/crossorigin/i.test(match)) return match;
    return match + ' crossorigin="anonymous"';
  });

  // 检测是否包含 Tailwind 类名但没有 Tailwind 脚本，自动注入本地版本
  if (hasTailwindClasses(html) && !hasTailwindScript(html)) {
    const tailwindTag = generateTailwindScriptTag()
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${tailwindTag}</head>`)
    } else if (/<body/i.test(html)) {
      html = html.replace(/(<body[^>]*>)/i, `${tailwindTag}$1`)
    }
  }

  // 注入打印所需的强制换页 CSS 与屏幕居中预览 CSS，以及防御性排版样式（防截图乱码/折行）
  const injectedCss = `
<style>
/* 防御性排版：防止截图渲染时因 web fonts 未能加载而导致 generic sans-serif 降级为 SimSun 衬线体 */
html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}
body {
  font-family: var(--font-cn, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif);
}

/* 防御性排版：防止常见小组件在截图/字体回退时发生奇怪的折行或垂直排版 */
.chip, .badge, .slide-num, .page-num, .tag, .button, button, .btn {
  white-space: nowrap !important;
}

@media print {
  .page, .slide, .card {
    page-break-after: always !important;
    break-after: page !important;
  }
  body { margin: 0 !important; }
}
@media screen {
  /* 多页模式：body 作为定位容器，高度撑满视口，隐藏溢出；
     当前可见页由 JS 设置 position:absolute + translate(-50%,-50%) 居中缩放 */
  body:has(.page, .slide, .card) {
    margin: 0 !important;
    padding: 0 !important;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: transparent;
  }
  html:has(.page, .slide, .card) {
    overflow: hidden;
  }
  .page, .slide, .card {
    flex-shrink: 0;
    /* transform 由 JS 在当前页上内联设置（包含 scale + translate 居中），非当前页 display:none */
  }
}
</style>
`
  
  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${injectedCss}</head>`)
  } else if (/<body/i.test(html)) {
    html = html.replace(/(<body[^>]*>)/i, `${injectedCss}$1`)
  } else {
    html = injectedCss + html
  }

  if (/<\/html>/i.test(html)) return html
  return html + '\n</body>\n</html>'
}
