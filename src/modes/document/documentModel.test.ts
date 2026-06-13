import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DOCUMENT_SETTINGS,
  buildDocumentFilename,
  paginateDocumentBlocks,
  splitMarkdownBlocks,
} from './documentModel'

describe('documentModel', () => {
  it('uses title as default document filename', () => {
    expect(buildDocumentFilename('季度经营复盘：增长与风险', '正文内容')).toBe(
      '季度经营复盘：增长与风险.pdf',
    )
  })

  it('falls back to first 15 content characters when title is missing', () => {
    expect(buildDocumentFilename('', '  这是一个没有标题但有正文内容的文档。  ')).toBe(
      '这是一个没有标题但有正文内容的.pdf',
    )
  })

  it('sanitizes filename characters that are invalid on Windows', () => {
    expect(buildDocumentFilename('A/B:C*D?E\"F<G>H|I', '')).toBe('A_B_C_D_E_F_G_H_I.pdf')
  })

  it('splits markdown into document blocks with estimated heights', () => {
    const blocks = splitMarkdownBlocks(`# 标题\n\n第一段正文。\n\n![图](https://example.com/a.png)\n\n| A | B |\n| - | - |\n| 1 | 2 |`)

    expect(blocks.map((b) => b.kind)).toEqual(['heading', 'paragraph', 'image', 'table'])
    expect(blocks.every((b) => b.estimatedHeight > 0)).toBe(true)
  })

  it('keeps fenced code blocks intact when they contain blank lines', () => {
    const blocks = splitMarkdownBlocks([
      '说明文字。',
      '',
      '```ts',
      'const first = 1',
      '',
      'const second = 2',
      '```',
      '',
      '后续文字。',
    ].join('\n'))

    expect(blocks.map((b) => b.kind)).toEqual(['paragraph', 'code', 'paragraph'])
    expect(blocks[1].markdown).toContain('const first = 1\n\nconst second = 2')
  })

  it('does not split list-like lines inside fenced code blocks', () => {
    const blocks = splitMarkdownBlocks([
      '```md',
      '- 这是一段示例代码',
      '- 不应被 A4 分页模型拆成列表项',
      '```',
    ].join('\n'))

    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe('code')
  })

  it('preserves leading spaces at the beginning of document paragraphs', () => {
    const blocks = splitMarkdownBlocks([
      '# 标题',
      '',
      '    第一段正文保留四个半角空格。',
      '',
      '　　第二段正文保留两个全角空格。',
    ].join('\n'))

    expect(blocks.map((b) => b.kind)).toEqual(['heading', 'paragraph', 'paragraph'])
    expect(blocks[1].markdown).toBe('    第一段正文保留四个半角空格。')
    expect(blocks[2].markdown).toBe('　　第二段正文保留两个全角空格。')
  })

  it('keeps a table caption with the table below even when separated by a blank line', () => {
    const blocks = splitMarkdownBlocks([
      '**表 1：A4 文档能力总览**',
      '',
      '| 能力 | 说明 |',
      '| --- | --- |',
      '| 题注 | 表题在表格上方 |',
    ].join('\n'))

    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe('table')
    expect(blocks[0].markdown).toContain('**表 1：A4 文档能力总览**')
    expect(blocks[0].markdown).toContain('| 能力 | 说明 |')
  })

  it('keeps an image caption with the image above even when separated by a blank line', () => {
    const blocks = splitMarkdownBlocks([
      '![工作流示意图](https://example.com/workflow.png)',
      '',
      '**图 1：从草稿到成品的工作流示意**',
    ].join('\n'))

    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe('image')
    expect(blocks[0].markdown).toContain('![工作流示意图]')
    expect(blocks[0].markdown).toContain('**图 1：从草稿到成品的工作流示意**')
  })

  it('paginates blocks without exceeding page content height when possible', () => {
    const blocks = [
      { id: 'a', kind: 'paragraph' as const, markdown: 'a', estimatedHeight: 300, avoidBreak: true },
      { id: 'b', kind: 'paragraph' as const, markdown: 'b', estimatedHeight: 500, avoidBreak: true },
      { id: 'c', kind: 'paragraph' as const, markdown: 'c', estimatedHeight: 500, avoidBreak: true },
    ]

    const pages = paginateDocumentBlocks(blocks, { ...DEFAULT_DOCUMENT_SETTINGS, pageHeight: 900, marginTop: 0, marginBottom: 0 })

    expect(pages).toHaveLength(2)
    expect(pages[0].blocks.map((b) => b.id)).toEqual(['a', 'b'])
    expect(pages[1].blocks.map((b) => b.id)).toEqual(['c'])
    expect(pages.every((p) => p.usedHeight <= 900)).toBe(true)
  })

  it('reserves bottom safety space so content does not collide with the footer', () => {
    const blocks = [
      { id: 'body', kind: 'paragraph' as const, markdown: 'body', estimatedHeight: 850, avoidBreak: false },
      { id: 'tail', kind: 'paragraph' as const, markdown: 'tail', estimatedHeight: 30, avoidBreak: false },
    ]

    const pages = paginateDocumentBlocks(blocks, {
      ...DEFAULT_DOCUMENT_SETTINGS,
      pageHeight: 900,
      marginTop: 0,
      marginBottom: 0,
      fontScale: 'normal',
    })

    expect(pages.map((p) => p.blocks.map((b) => b.id))).toEqual([['body'], ['tail']])
  })

  it('moves a heading to the next page when it would start too close to the bottom', () => {
    const blocks = [
      { id: 'body', kind: 'paragraph' as const, markdown: 'body', estimatedHeight: 720, avoidBreak: false },
      { id: 'heading', kind: 'heading' as const, markdown: '## 下一章', estimatedHeight: 80, avoidBreak: true },
      { id: 'content', kind: 'paragraph' as const, markdown: '正文内容', estimatedHeight: 100, avoidBreak: false },
    ]

    const pages = paginateDocumentBlocks(blocks, {
      ...DEFAULT_DOCUMENT_SETTINGS,
      pageHeight: 900,
      marginTop: 0,
      marginBottom: 0,
      fontScale: 'normal',
    })

    expect(pages.map((p) => p.blocks.map((b) => b.id))).toEqual([['body'], ['heading', 'content']])
  })

  it('places an oversized image on its own page', () => {
    const blocks = [
      { id: 'p', kind: 'paragraph' as const, markdown: 'p', estimatedHeight: 200, avoidBreak: true },
      { id: 'img', kind: 'image' as const, markdown: 'img', estimatedHeight: 1200, avoidBreak: true },
      { id: 'tail', kind: 'paragraph' as const, markdown: 'tail', estimatedHeight: 200, avoidBreak: true },
    ]

    const pages = paginateDocumentBlocks(blocks, { ...DEFAULT_DOCUMENT_SETTINGS, pageHeight: 900, marginTop: 0, marginBottom: 0 })

    expect(pages.map((p) => p.blocks.map((b) => b.id))).toEqual([['p'], ['img'], ['tail']])
    expect(pages[1].oversized).toBe(true)
  })

  describe('Table Cross-Page Pagination', () => {
    it('should split long table across pages', () => {
      // 创建一个超长表格
      const tableRows = Array.from({ length: 20 }, (_, i) => 
        `| 行${i + 1} | 数据${i + 1} | 描述${i + 1} |`
      ).join('\n')
      
      const markdown = `表 1: 测试表格\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n${tableRows}`
      
      const blocks = splitMarkdownBlocks(markdown)
      const settings = {
        pageHeight: 400, // 使用较小的页面高度强制分页
        marginTop: 50,
        marginBottom: 50,
        fontScale: 'normal' as const
      }
      
      const pages = paginateDocumentBlocks(blocks, settings)
      
      // 应该有多页
      expect(pages.length).toBeGreaterThan(1)
      
      // 每页都应该有表格内容
      pages.forEach(page => {
        const tableBlocks = page.blocks.filter(b => b.kind === 'table')
        expect(tableBlocks.length).toBeGreaterThan(0)
      })
    })

    it('should add continuation marker for split tables', () => {
      const tableRows = Array.from({ length: 15 }, (_, i) => 
        `| 行${i + 1} | 数据${i + 1} |`
      ).join('\n')
      
      const markdown = `表 1: 测试表格\n| 列1 | 列2 |\n| --- | --- |\n${tableRows}`
      
      const blocks = splitMarkdownBlocks(markdown)
      const settings = {
        pageHeight: 300,
        marginTop: 50,
        marginBottom: 50,
        fontScale: 'normal' as const
      }
      
      const pages = paginateDocumentBlocks(blocks, settings)
      
      // 第二页及之后的表格应该包含续表标记
      if (pages.length > 1) {
        const secondPage = pages[1]
        const tableBlock = secondPage.blocks.find(b => b.kind === 'table')
        expect(tableBlock?.markdown).toContain('（续表）')
      }
    })

    it('should NOT split table on the cover page', () => {
      // 封面页结构：1个 heading + 1个 table，后面跟着 pagebreak
      const markdown = [
        '# 封面标题',
        '',
        '| 属性 | 值 |',
        '| --- | --- |',
        '| 编写 | 钟私豆 |',
        '| 日期 | 2026-06-13 |',
        '| 审核 | 李四 |',
        '| 状态 | 草稿 |',
        '',
        '<page-break />',
        '',
        '# 正文第一章',
        '这里是正文内容。',
      ].join('\n')

      const blocks = splitMarkdownBlocks(markdown)
      const settings = {
        pageHeight: 300, // 非常小的页高，强迫分页
        marginTop: 50,
        marginBottom: 50,
        fontScale: 'normal' as const
      }

      const pages = paginateDocumentBlocks(blocks, settings)

      // 验证第一页是封面页，且包含完整的表格没有被拆分
      expect(pages.length).toBeGreaterThan(1)
      expect(pages[0].isCover).toBe(true)
      
      const coverTable = pages[0].blocks.find(b => b.kind === 'table')
      expect(coverTable).toBeDefined()
      // 表格不应当被拆分，所有的属性都应该在这一页的表格中
      expect(coverTable?.markdown).toContain('编写')
      expect(coverTable?.markdown).toContain('日期')
      expect(coverTable?.markdown).toContain('审核')
      expect(coverTable?.markdown).toContain('状态')
      
      // 且不能有“-part-”的分裂 id
      expect(coverTable?.id).not.toContain('part')
    })
  })
})
