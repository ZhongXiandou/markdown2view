// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { renderMermaidDiagram, ensureMermaid } from './mermaidRenderer'

describe('renderMermaidDiagram', () => {
  beforeEach(() => {
    // 确保每次测试 document.body 干净（offscreen 容器不留残余）
    document.body.innerHTML = ''

    // jsdom 未实现 SVG 测量 API，mermaid 内部依赖这些做布局
    // 为测试 mock 最小可用版本
    if (!(SVGElement.prototype as any).getBBox) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', {
        value: () => ({ x: 0, y: 0, width: 100, height: 30 }),
        configurable: true,
      })
    }
    if (!(SVGElement.prototype as any).getComputedTextLength) {
      Object.defineProperty(SVGElement.prototype, 'getComputedTextLength', {
        value: () => 80,
        configurable: true,
      })
    }
  })

  it('合法 flowchart 渲染出含 svg 的字符串', async () => {
    const { svg, error } = await renderMermaidDiagram(
      'flowchart TD\n  A --> B',
      600,
    )
    expect(error).toBeUndefined()
    expect(svg).toContain('<svg')
  })

  it('合法 sequenceDiagram 渲染出含 svg 的字符串', async () => {
    const { svg, error } = await renderMermaidDiagram(
      'sequenceDiagram\n  Alice->>Bob: Hi',
      600,
    )
    expect(error).toBeUndefined()
    expect(svg).toContain('<svg')
  })

  it('非法语法返回 error 且 svg 为空', async () => {
    const { svg, error } = await renderMermaidDiagram(
      'this is not valid mermaid at all !!!',
      600,
    )
    expect(svg).toBe('')
    expect(error).toBeTruthy()
    expect(typeof error).toBe('string')
  })

  it('offscreen 容器渲染后被移除（DOM 干净）', async () => {
    await renderMermaidDiagram('flowchart TD\n  A --> B', 600)
    // 渲染器内部 host.remove() 后，body 不应残留 mermaid 临时元素
    expect(document.body.querySelector('[id^="m2v-mermaid-"]')).toBeNull()
  })

  it('ensureMermaid 幂等（多次调用返回同一 Promise）', async () => {
    const p1 = ensureMermaid()
    const p2 = ensureMermaid()
    expect(p1).toBe(p2)
    await p1
  })
})
