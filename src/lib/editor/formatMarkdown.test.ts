import { describe, it, expect } from 'vitest'
import { formatMarkdown, describeFormatStats } from './formatMarkdown'

describe('formatMarkdown', () => {
  it('组件标签行去缩进，内部条目保持不动', () => {
    const md = ['  <steps title="流程">', '  - 写作 | 完成正文', '  </steps>'].join('\n')
    const r = formatMarkdown(md)
    expect(r.text).toBe('<steps title="流程">\n  - 写作 | 完成正文\n</steps>\n')
    expect(r.stats.deindented).toBe(2)
  })

  it('对比卡的 <left>/<right> 与分页符同样去缩进', () => {
    const md = ['<compare>', '  <left>', '甲', '  </left>', '  <right>', '乙', '  </right>', '</compare>', '   <page-break/>'].join('\n')
    const r = formatMarkdown(md)
    expect(r.text).toContain('\n<left>\n甲\n</left>\n<right>\n乙\n</right>\n</compare>\n\n<page-break/>\n')
  })

  it('顶层块级组件前后补空行，组件内部空行原样保留', () => {
    const md = ['前文', '<timeline>', '- 2026 | 起步', '', '', '- 2027 | 上线', '</timeline>', '后文'].join('\n')
    const r = formatMarkdown(md)
    expect(r.text).toBe('前文\n\n<timeline>\n- 2026 | 起步\n\n\n- 2027 | 上线\n</timeline>\n\n后文\n')
    expect(r.stats.blankInserted).toBe(2)
  })

  it('单行闭合的组件前后也补空行', () => {
    const r = formatMarkdown('前文\n<p-title num="01" title="标题"></p-title>\n后文')
    expect(r.text).toBe('前文\n\n<p-title num="01" title="标题"></p-title>\n\n后文\n')
  })

  it('清行尾空白、收敛连续空行，但保留段首空格和空引用行的空格', () => {
    const md = ['  段首空格保留   ', '', '', '', '> 第一行', '> ', '> 第二行'].join('\n')
    const r = formatMarkdown(md)
    expect(r.text).toBe('  段首空格保留\n\n> 第一行\n> \n> 第二行\n')
    expect(r.stats.trailingSpaces).toBe(1)
    expect(r.stats.blankCollapsed).toBe(2)
  })

  it('代码围栏内部原样保留，未闭合时补上闭合行', () => {
    const md = ['```js', '  <steps>   ', '', '', 'const a = 1'].join('\n')
    const r = formatMarkdown(md)
    expect(r.text).toBe('```js\n  <steps>   \n\n\nconst a = 1\n```\n')
    expect(r.stats.fencesClosed).toBe(1)
    expect(r.stats.deindented).toBe(0)
  })

  it('不改标题与列表的写法', () => {
    const md = '#话题标签不是标题\n\n* 星号列表\n+ 加号列表\n'
    expect(formatMarkdown(md).changed).toBe(false)
  })

  it('幂等：格式化结果再格式化不再变化', () => {
    const md = ['  <steps>', '- a | b', '  </steps>', '', '', '文字   ', '<page-break/>', '```', 'x'].join('\n')
    const once = formatMarkdown(md)
    const twice = formatMarkdown(once.text)
    expect(once.changed).toBe(true)
    expect(twice.changed).toBe(false)
    expect(twice.text).toBe(once.text)
  })

  it('describeFormatStats 只列出实际发生的改动', () => {
    expect(describeFormatStats(formatMarkdown('a\n').stats)).toBe('')
    expect(describeFormatStats(formatMarkdown('a  \n\n\n\nb').stats)).toBe('收敛空行 2 · 清行尾空白 1')
  })
})

describe('formatMarkdown - 内置示例回归', () => {
  it('格式化内置示例不改变渲染结果', async () => {
    const { parseMarkdown, makeColors } = await import('@engine')
    const { DEMO_ARTICLE } = await import('@/data/demoArticle')
    const { DEMO_DOCUMENT } = await import('@/data/demoDocument')
    const colors = makeColors('#2563eb', '#1e40af')
    for (const demo of [DEMO_ARTICLE, DEMO_DOCUMENT]) {
      const formatted = formatMarkdown(demo).text
      expect(parseMarkdown(formatted, colors)).toBe(parseMarkdown(demo, colors))
      expect(formatMarkdown(formatted).changed).toBe(false)
    }
  })
})
