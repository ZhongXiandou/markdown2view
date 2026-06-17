import { describe, it, expect } from 'vitest'
import { parseMarkdown, parseTableMarkdown } from './markdownParser'
import { makeColors } from '../index'

describe('parseMarkdown - Caption parsing', () => {
  const colors = makeColors('#2563eb', '#1e40af')

  it('should parse image captions correctly when an image is above', () => {
    const md = '![img](url)\n图 1: 这是图片题注'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('data-caption-kind="image"')
    expect(html).toContain('margin:8px 0px 16px')
    expect(html).toContain('这是图片题注')
  })

  it('should parse table captions correctly when a table is below', () => {
    const md = '表 2：这是表格题注\n| col1 | col2 |\n| --- | --- |\n| a | b |'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-table"')
    expect(html).toContain('data-caption-kind="table"')
    expect(html).toContain('margin:16px 0px 8px')
    expect(html).toContain('这是表格题注')
  })

  it('only treats captions as valid in the required image/table positions', () => {
    const imageCaptionAbove = '图 1: 图片题注不能写在图片上方\n![img](url)'
    const tableCaptionBelow = '| col1 | col2 |\n| --- | --- |\n| a | b |\n表 1: 表格题注不能写在表格下方'

    expect(parseMarkdown(imageCaptionAbove, colors)).not.toContain('document-caption')
    expect(parseMarkdown(tableCaptionBelow, colors)).not.toContain('document-caption')
  })

  it('should parse English captions correctly in correct contexts', () => {
    const md1 = '![img](url)\nFig. 1 - Figure caption'
    const html1 = parseMarkdown(md1, colors)
    expect(html1).toContain('class="document-caption document-caption-image"')
    expect(html1).toContain('margin:8px 0px 16px')
    
    const md2 = 'Table 10 Example table\n| col1 | col2 |\n| --- | --- |\n'
    const html2 = parseMarkdown(md2, colors)
    expect(html2).toContain('class="document-caption document-caption-table"')
    expect(html2).toContain('margin:16px 0px 8px')
  })

  it('should parse Chinese numeric captions correctly with image above', () => {
    const md = '![img](url)\n图 十一. 图片题注'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('margin:8px 0px 16px')
    expect(html).toContain('图片题注')
  })

  it('should support bold caption headers', () => {
    const md = '![img](url)\n**图 1: 这是加粗题注**'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('strong')
    expect(html).toContain('图 1: 这是加粗题注')
  })

  it('should support bold table captions above tables', () => {
    const md = '**表 1: 这是加粗表格题注**\n| col1 | col2 |\n| --- | --- |\n| a | b |'
    const html = parseMarkdown(md, colors)

    expect(html).toContain('class="document-caption document-caption-table"')
    expect(html).toContain('data-caption-kind="table"')
    expect(html).toContain('text-align:center')
    expect(html).toContain('表 1: 这是加粗表格题注')
  })

  it('allows figure and table captions to use independent numbering', () => {
    const md = [
      '![img](url)',
      '图 1: 这是图片题注',
      '',
      '表 1: 这是表格题注',
      '| col1 | col2 |',
      '| --- | --- |',
      '| a | b |',
    ].join('\n')
    const html = parseMarkdown(md, colors)

    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('class="document-caption document-caption-table"')
    expect(html).toContain('图 1: 这是图片题注')
    expect(html).toContain('表 1: 这是表格题注')
  })

  it('should not parse text describing figures/tables as captions', () => {
    // 即使上面有图，如果只是空格分隔符且包含“展现”等词，也不应误判为题注
    const md1 = '![img](url)\n图 1 展现了核心架构。'
    const html1 = parseMarkdown(md1, colors)
    expect(html1).not.toContain('document-caption')
    expect(html1).toContain('style="margin:0px 0px 24px"')
    
    // 如果没有图，直接说“图 1 展现了...”，不应被误判为题注
    const md2 = '图 1 展现了核心架构。'
    const html2 = parseMarkdown(md2, colors)
    expect(html2).not.toContain('document-caption')
    expect(html2).toContain('style="margin:0px 0px 24px"')
  })

  it('should not parse normal paragraphs as captions', () => {
    const md = '图样图森破，这是一个普通段落'
    const html = parseMarkdown(md, colors)
    expect(html).not.toContain('document-caption')
    expect(html).toContain('style="margin:0px 0px 24px"')
  })

  it('should parse blockquote with font-size 16px to match body text', () => {
    const md = '> 这是引用的文字'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('font-size:16px')
    expect(html).toContain('这是引用的文字')
  })

  it('should parse callout block with font-size 16px to match body text', () => {
    const md = '> [NOTE] 关于孩子的韧性\n> ==人不是"条件A"就必然"输出B"=='
    const html = parseMarkdown(md, colors)
    expect(html).toContain('font-size:16px')
    expect(html).toContain('关于孩子的韧性')
    expect(html).toContain('人不是"条件 A"就必然"输出 B"')
  })

  it('should parse tables with empty cells correctly', () => {
    const md = [
      '| **纯材料合计** | | | | **1.72元/m** | **1.31元/m** |',
      '| --- | --- | --- | --- | --- | --- |',
      '| 加3%损耗 | | | | 1.77元/m | 1.35元/m |',
    ].join('\n')

    const html = parseMarkdown(md, colors)
    expect(html).toContain('纯材料合计')
    expect(html).toContain('>&nbsp;</td>')
  })

  it('parseTableMarkdown should preserve empty cells and headers', () => {
    const md = [
      '| **纯材料合计** | | | | **1.72元/m** | **1.31元/m** |',
      '| --- | --- | --- | --- | --- | --- |',
      '| 加3%损耗 | | | | 1.77元/m | 1.35元/m |',
    ].join('\n')

    const result = parseTableMarkdown(md)
    expect(result).not.toBeNull()
    expect(result?.headers).toHaveLength(6)
    expect(result?.headers[1]).toBe('')
    expect(result?.headers[2]).toBe('')
    expect(result?.headers[3]).toBe('')
    expect(result?.rows[0]).toHaveLength(6)
    expect(result?.rows[0][1]).toBe('')
  })
})

import { collectMermaidDiagrams } from './markdownParser'

describe('parseMarkdown - mermaid 集成', () => {
  const colors = makeColors('#2563eb', '#1e40af')

  it('collectMermaidDiagrams 提取 mermaid 源码并按内容去重', () => {
    const md = [
      '```mermaid',
      'flowchart TD',
      '  A --> B',
      '```',
      '',
      '```mermaid',
      'flowchart TD',
      '  A --> B',
      '```',
      '',
      '```mermaid',
      'flowchart TD',
      '  C --> D',
      '```',
    ].join('\n')
    const diagrams = collectMermaidDiagrams(md)
    // 前两段内容相同 → 去重为 1；第三段不同 → 共 2 个
    expect(diagrams).toHaveLength(2)
    expect(diagrams[0].source).toContain('A --> B')
    expect(diagrams[1].source).toContain('C --> D')
  })

  it('传入 mermaidMap 时 mermaid 块替换为 data-block="mermaid"', () => {
    const source = 'flowchart TD\n  A --> B'
    const key = `m:${source}`
    const map = new Map<string, { svg: string; error?: string }>([
      [key, { svg: '<svg>fake-diagram</svg>' }],
    ])
    const md = '```mermaid\n' + source + '\n```'
    const html = parseMarkdown(md, colors, undefined, map)
    expect(html).toContain('data-block="mermaid"')
    expect(html).toContain('<svg>fake-diagram</svg>')
    expect(html).toContain('m2v-mermaid-figure')
  })

  it('不传 mermaidMap 时 mermaid 块降级为代码块', () => {
    const md = '```mermaid\nflowchart TD\n  A --> B\n```'
    const html = parseMarkdown(md, colors)
    expect(html).not.toContain('data-block="mermaid"')
    expect(html).toContain('data-block="code"')
  })

  it('mermaidMap 中有 error 时降级为错误提示 + 代码块', () => {
    const source = 'invalid syntax'
    const key = `m:${source}`
    const map = new Map<string, { svg: string; error?: string }>([
      [key, { svg: '', error: '语法错误示例' }],
    ])
    const md = '```mermaid\n' + source + '\n```'
    const html = parseMarkdown(md, colors, undefined, map)
    expect(html).toContain('data-block="mermaid-error"')
    expect(html).toContain('语法错误示例')
    expect(html).toContain('data-block="code"')
  })
})

