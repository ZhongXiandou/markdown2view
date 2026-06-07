// 从外部 AI 的回复中提取真正的 HTML 文档。
// AI 常把输出包在 ```html ... ``` 代码块里，或在前面加一段解释文字。
// 移植自 html-anything/next/src/lib/extract-html.ts。

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

  // 5. 兜底：包一层最小骨架（含 Tailwind CDN）让内容可渲染
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="p-8 font-sans"><pre class="whitespace-pre-wrap">${escapeHtml(
    streamed,
  )}</pre></body></html>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 保证存在闭合标签，便于 iframe 增量渲染，并注入专门供 PDF 导出使用的多页分离打印样式。
export function previewHtml(input: string): string {
  let html = extractHtml(input)
  if (!html) return ''
  
  // 注入打印所需的强制换页 CSS 与屏幕居中预览 CSS
  const injectedCss = `
<style>
@media print {
  .page, .slide, .card {
    page-break-after: always !important;
    break-after: page !important;
  }
  body { margin: 0 !important; }
}
@media screen {
  body:has(.page, .slide, .card) {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden; /* 防止拉伸后的轻微滚动条 */
  }
  .page, .slide, .card {
    margin: auto !important;
    transform: scale(var(--auto-scale, 1));
    transform-origin: center center;
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
