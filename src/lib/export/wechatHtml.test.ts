import { describe, it, expect } from 'vitest'
import { toWechatHtmlFromDocument } from './wechatHtml'

/** 用 DOMParser 构造一份独立文档，并挂到当前 window 上以便读取计算样式 */
function renderDoc(bodyHtml: string, css = ''): { doc: Document; cleanup: () => void } {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument!
  doc.open()
  doc.write(`<!doctype html><html><head><style>${css}</style></head><body>${bodyHtml}</body></html>`)
  doc.close()
  return { doc, cleanup: () => iframe.remove() }
}

describe('toWechatHtmlFromDocument', () => {
  it('把视觉类计算样式写成内联样式，并去掉 class', () => {
    const { doc, cleanup } = renderDoc(
      '<div class="card"><p class="title">标题</p></div>',
      '.card{background-color:rgb(240,240,255);padding:16px}.title{color:rgb(200,0,0);font-weight:700}',
    )
    const html = toWechatHtmlFromDocument(doc)
    cleanup()
    expect(html).toContain('background-color: rgb(240, 240, 255)')
    expect(html).toContain('padding: 16px')
    expect(html).toContain('color: rgb(200, 0, 0)')
    expect(html).toContain('font-weight: 700')
    expect(html).not.toContain('class=')
    expect(html).toContain('data-tool="markdown2view"')
  })

  it('不输出布局类属性', () => {
    const { doc, cleanup } = renderDoc(
      '<div style="display:flex;position:absolute;width:800px;height:600px;gap:24px;color:rgb(1,2,3)">内容</div>',
    )
    const html = toWechatHtmlFromDocument(doc)
    cleanup()
    expect(html).toContain('color: rgb(1, 2, 3)')
    for (const prop of ['display', 'position', 'width', 'height', 'gap']) {
      expect(html).not.toMatch(new RegExp(`[;" ]${prop}:`))
    }
  })

  it('margin / padding 上限 48px，负外边距丢弃', () => {
    const { doc, cleanup } = renderDoc(
      '<div style="padding:120px;margin-top:-20px;margin-bottom:96px">内容</div>',
    )
    const html = toWechatHtmlFromDocument(doc)
    cleanup()
    expect(html).toContain('padding: 48px')
    expect(html).toContain('margin-bottom: 48px')
    expect(html).not.toContain('120px')
    expect(html).not.toContain('-20px')
  })

  it('跳过 display:none 的元素以及 script / style', () => {
    const { doc, cleanup } = renderDoc(
      '<p>可见</p><p style="display:none">隐藏</p><div><span style="display:none">内层隐藏</span>保留</div><script>var a = 1</script><style>p{}</style>',
    )
    const html = toWechatHtmlFromDocument(doc)
    cleanup()
    expect(html).toContain('可见')
    expect(html).toContain('保留')
    expect(html).not.toContain('隐藏')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<style')
  })
})
