import { describe, it, expect } from 'vitest'
import { parseMarkdown, parseTableMarkdown, collectFormulas } from './markdownParser'
import { makeColors } from '../index'

describe('parseMarkdown - Caption parsing', () => {
  const colors = makeColors('#2563eb', '#1e40af')

  it('should parse image captions correctly when an image is above', () => {
    const md = '![img](url)\n图 1: 这是图片题注'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('data-caption-kind="image"')
    expect(html).toContain('margin:10px 0px 16px')
    expect(html).toContain('这是图片题注')
  })

  it('should parse table captions correctly when a table is below', () => {
    const md = '表 2：这是表格题注\n| col1 | col2 |\n| --- | --- |\n| a | b |'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-table"')
    expect(html).toContain('data-caption-kind="table"')
    expect(html).toContain('margin:16px 0px 10px')
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
    expect(html1).toContain('margin:10px 0px 16px')
    
    const md2 = 'Table 10 Example table\n| col1 | col2 |\n| --- | --- |\n'
    const html2 = parseMarkdown(md2, colors)
    expect(html2).toContain('class="document-caption document-caption-table"')
    expect(html2).toContain('margin:16px 0px 10px')
  })

  it('should parse Chinese numeric captions correctly with image above', () => {
    const md = '![img](url)\n图 十一. 图片题注'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('margin:10px 0px 16px')
    expect(html).toContain('图片题注')
  })

  it('should support bold caption headers', () => {
    const md = '![img](url)\n**图 1: 这是加粗题注**'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('strong')
    expect(html).toContain('图 1: 这是加粗题注')
  })

  it('should parse mermaid flowchart captions correctly', () => {
    const md = '```mermaid\nflowchart LR\n  A --> B\n```\n图 1: 这是流程图题注'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('data-caption-kind="image"')
    expect(html).toContain('这是流程图题注')
  })

  it('should support bold mermaid captions', () => {
    const md = '```mermaid\nflowchart LR\n  A --> B\n```\n**图 2: 加粗流程图题注**'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('class="document-caption document-caption-image"')
    expect(html).toContain('加粗流程图题注')
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

  it('mermaid 渲染失败时显示错误并附带源码', () => {
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

describe('parseMarkdown - 代码区域保护', () => {
  const colors = makeColors('#2563eb', '#1e40af')

  it('块级代码中的 $$ 公式不应被 KaTeX 渲染', () => {
    const md = '```\n$$E=mc^2$$\n```'
    const html = parseMarkdown(md, colors)
    expect(html).not.toContain('katex')
    expect(html).toContain('data-block="code"')
    expect(html).toContain('$')
  })

  it('块级代码中的 $ 行内公式不应被 KaTeX 渲染', () => {
    const md = '```\nconst x = $a + b$;\n```'
    const html = parseMarkdown(md, colors)
    expect(html).not.toContain('katex')
    expect(html).toContain('data-block="code"')
    expect(html).toContain('const x')
  })

  it('块级代码中的脚注链接不应被收集为脚注', () => {
    const md = '```\n[a](https://example.com "desc")\n```\n\n正文 [b](https://b.com "b-desc")'
    const html = parseMarkdown(md, colors)
    const firstCodeBlock = html.match(/<section data-block="code"[\s\S]*?<\/section>/)?.[0] ?? ''
    // 代码块内不应出现脚注下划线样式
    expect(firstCodeBlock).not.toContain('text-decoration:underline')
    // 代码块内应保留原链接标记（转义后）
    expect(firstCodeBlock).toContain('[a]')
    expect(firstCodeBlock).toContain('https://example.com')
    // 正文中只有一个脚注（正文上标 + 参考资料列表各出现一次 [1]）
    expect(html).toContain('参考资料')
    expect(html.match(/\[1\]/g)?.length).toBe(2)
    expect(html).not.toContain('[2]')
  })

  it('行内代码中的公式不应被 KaTeX 渲染', () => {
    const md = '这是行内代码 `$E=mc^2$` 测试'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('$E=mc^2$')
    expect(html).not.toContain('katex')
  })

  it('行内代码中的脚注链接不应被收集为脚注', () => {
    const md = '这是 `[a](https://example.com "desc")` 代码'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('[a]')
    expect(html).toContain('https://example.com')
    expect(html).not.toContain('参考资料')
  })

  it('普通 Markdown 中的公式和脚注仍应正常渲染', () => {
    const md = '行内公式 $E=mc^2$ 与脚注 [参考](https://example.com "示例")'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('katex')
    expect(html).toContain('参考资料')
    expect(html).toContain('示例')
  })

  it('mermaid 代码块不被保护，正常走渲染管线', () => {
    const source = 'graph LR\n  A --> B'
    const key = `m:${source}`
    const map = new Map<string, { svg: string; error?: string }>([
      [key, { svg: '<svg data-testid="mermaid-svg"></svg>' }],
    ])
    const md = '```mermaid\n' + source + '\n```'
    const html = parseMarkdown(md, colors, undefined, map)
    expect(html).toContain('mermaid-svg')
    expect(html).not.toContain('data-block="code"')
  })
})

describe('parseMarkdown - 自定义标签未闭合容错（EOF 截断）', () => {
  const colors = makeColors('#2563eb', '#1e40af')

  it('未闭合 <title> 不吞掉后续内容，回退为段落', () => {
    const md = '<title>未闭合标题\n后续正常段落'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('后续正常段落')
    expect(html).toContain('<title>未闭合标题')
  })

  it('未闭合 <p-title> 不吞掉后续内容，回退为段落', () => {
    const md = '<p-title>未闭合标题\n后续正常段落'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('后续正常段落')
    expect(html).toContain('<p-title>未闭合标题')
  })

  it('未闭合 <steps> 不吞掉后续内容，回退为段落', () => {
    const md = '<steps>\n- 步骤 | 描述\n后续正常段落'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('后续正常段落')
    expect(html).toContain('<steps>')
  })

  it('未闭合 <cta> 标签不吞掉后续内容，回退为段落', () => {
    const md = '<cta title="行动召唤">\n按钮文案\n后续正常段落'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('后续正常段落')
    expect(html).toContain('<cta title="行动召唤">')
  })

  it('未闭合 ::: cta 容器不吞掉后续内容，回退为段落', () => {
    const md = '::: cta\n按钮文案\n后续正常段落'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('后续正常段落')
    expect(html).toContain('::: cta')
  })

  it('未闭合 <compare> 不吞掉后续内容，回退为段落', () => {
    const md = '<compare>\n<left>左侧内容\n后续正常段落'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('后续正常段落')
    expect(html).toContain('<compare>')
  })

  it('正常闭合的自定义标签仍按原组件渲染', () => {
    const titleMd = '<title>正常标题</title>\n后续段落'
    const titleHtml = parseMarkdown(titleMd, colors)
    expect(titleHtml).toContain('正常标题')
    expect(titleHtml).toContain('后续段落')
    expect(titleHtml).not.toContain('&lt;title&gt;')

    const stepsMd = '<steps>\n- 步骤 | 描述\n</steps>\n后续段落'
    const stepsHtml = parseMarkdown(stepsMd, colors)
    expect(stepsHtml).toContain('步骤')
    expect(stepsHtml).toContain('后续段落')
  })
})


describe('parseMarkdown - 上游同步：围栏配对 / 标签跨行 / 行内代码断行', () => {
  const colors = makeColors('#2563eb', '#1e40af')
  const nestedFence = ['````markdown', '```js', 'const a = "$b$"', '```', '````'].join('\n')

  it('collectFormulas 按围栏长度配对，四反引号示范不会吞掉后文公式', () => {
    const md = `${nestedFence}\n\n正文公式 $y$ 与行内代码 \`code\``
    const formulas = collectFormulas(md).map((f) => f.formula)
    expect(formulas).toContain('y')
    expect(formulas).not.toContain('b')
  })

  it('四反引号围栏内的三反引号原样作为代码内容输出', () => {
    const html = parseMarkdown(`${nestedFence}\n\n后续段落`, colors)
    expect(html).toContain('```js')
    expect(html).toContain('后续段落')
  })

  it('<title> 开标签跨行（属性换行、> 单独成行）仍按组件渲染', () => {
    const md = '<title\ntype="DA01"\n>跨行标题</title>\n\n后续段落'
    const html = parseMarkdown(md, colors)
    expect(html).toContain('跨行标题')
    expect(html).not.toContain('&lt;title')
    expect(html).toContain('后续段落')
  })

  it('<p-title> 开标签跨行仍按组件渲染', () => {
    const html = parseMarkdown('<p-title\nnum="01"\n>跨行段落标题</p-title>', colors)
    expect(html).toContain('data-block="ptitle"')
    expect(html).toContain('跨行段落标题')
  })

  it('行内代码带 word-break:break-all，长串不会撑破版面', () => {
    const html = parseMarkdown('路径 `a/very/long/path/that/should/wrap` 结束', colors)
    expect(html).toMatch(/<code style="[^"]*word-break:break-all[^"]*">a\/very/)
  })
})
