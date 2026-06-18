import { describe, it, expect } from 'vitest'
import { sanitizeHtml, sanitizeHtmlStrict } from './htmlSanitizer'

describe('sanitizeHtml (宽松模式)', () => {
  it('保留常见排版标签与 class', () => {
    const html = '<div class="page"><h1>标题</h1><p>正文</p></div>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('保留 style 标签与内联样式', () => {
    const html = '<style>.red{color:red}</style><div style="color:red">x</div>'
    const result = sanitizeHtml(html)
    // DOMParser 会把 <style> 放入 <head>，非完整文档时 body 中不会保留
    expect(result).toContain('<div style="color:red">x</div>')
  })

  it('保留完整文档中的 style 标签', () => {
    const html = `<!DOCTYPE html>
<html><head><style>.red{color:red}</style></head><body><div style="color:red">x</div></body></html>`
    const result = sanitizeHtml(html)
    expect(result).toContain('<style>.red{color:red}</style>')
    expect(result).toContain('<div style="color:red">x</div>')
  })

  it('保留 data-* 属性', () => {
    const html = '<div data-id="123" data-action="click">x</div>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('保留自定义标签', () => {
    const html = '<custom-element data-foo="bar">content</custom-element>'
    expect(sanitizeHtml(html)).toBe('<custom-element data-foo="bar">content</custom-element>')
  })

  it('保留 SVG', () => {
    const html = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<svg width="100" height="100">')
    expect(result).toContain('cx="50"')
    expect(result).toContain('fill="red"')
  })

  it('保留 iframe（添加 sandbox）', () => {
    const html = '<iframe src="https://example.com"></iframe>'
    expect(sanitizeHtml(html)).toBe('<iframe src="https://example.com" sandbox="allow-scripts"></iframe>')
  })

  it('移除 script 标签', () => {
    const html = '<p>正文</p><script>alert(1)</script>'
    expect(sanitizeHtml(html)).toBe('<p>正文</p>')
  })

  it('移除事件处理器属性', () => {
    const html = '<button onclick="alert(1)">点击</button>'
    expect(sanitizeHtml(html)).toBe('<button>点击</button>')
  })

  it('移除 javascript: 链接', () => {
    const html = '<a href="javascript:alert(1)">link</a>'
    expect(sanitizeHtml(html)).toBe('<a>link</a>')
  })

  it('保留 http/https 链接', () => {
    const html = '<a href="https://example.com" target="_blank">link</a>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('保留相对路径链接', () => {
    const html = '<a href="/path/to/page">link</a>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('移除危险 style 属性（expression）', () => {
    const html = '<div style="width:expression(alert(1))">x</div>'
    expect(sanitizeHtml(html)).toBe('<div>x</div>')
  })

  it('保留安全 style 属性（含 url()）', () => {
    const html = '<div style="background:url(/img.png)">x</div>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('移除 style 标签中的 @import', () => {
    const html = '<style>@import url("//evil.com"); .a{color:red}</style><p>x</p>'
    expect(sanitizeHtml(html)).toBe('<p>x</p>')
  })

  it('保留完整文档结构', () => {
    const html = '<!DOCTYPE html><html lang="zh"><head><title>t</title></head><body><p>x</p></body></html>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<html')
    expect(result).toContain('<body>')
    expect(result).toContain('<p>x</p>')
  })

  it('保留复杂示例 HTML 的样式', () => {
    // 模拟 DEMO_HTML 中的关键结构
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<style>
:root{--paper:#f0e8db}
.slide{width:min(100vw - 32px, 960px)}
</style>
</head>
<body>
<section class="slide s1">
  <div class="header-strip" style="background:#c0a060;height:3px;"></div>
  <div class="s1-bg"></div>
</section>
</body>
</html>`
    const result = sanitizeHtml(html)
    expect(result).toContain('class="slide s1"')
    expect(result).toContain('style="background:#c0a060;height:3px;"')
    expect(result).toContain(':root{--paper:#f0e8db}')
    expect(result).toContain('.slide{width:min(100vw - 32px, 960px)}')
  })
})

describe('sanitizeHtmlStrict (严格模式)', () => {
  it('丢弃 iframe', () => {
    const html = '<p>正文</p><iframe src="https://example.com"></iframe>'
    expect(sanitizeHtmlStrict(html)).toBe('<p>正文</p>')
  })

  it('仍保留样式', () => {
    const html = '<div class="page" style="color:red">正文</div>'
    expect(sanitizeHtmlStrict(html)).toBe(html)
  })
})
