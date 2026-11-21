import { describe, it, expect } from 'vitest'
import { scanBannedWords, BANNED_CATEGORIES } from './bannedWords'

describe('scanBannedWords', () => {
  it('内置五类词库', () => {
    expect(BANNED_CATEGORIES.map((c) => c.label)).toEqual(['极限用语', '权威背书', '医疗功效', '金融风险', '诱导互动'])
  })

  it('返回命中词的分类、行列号与上下文', () => {
    const md = '# 标题\n\n我们的产品全网第一，效果立竿见影。'
    const matches = scanBannedWords(md)
    expect(matches.map((m) => m.word)).toEqual(['全网第一', '立竿见影'])
    expect(matches[0]).toMatchObject({ categoryLabel: '极限用语', line: 3, col: 6, before: '我们的产品', after: '，效果立竿见影。' })
    expect(matches[1].categoryLabel).toBe('医疗功效')
    expect(md.slice(matches[1].offset, matches[1].offset + 4)).toBe('立竿见影')
  })

  it('跳过 front-matter、代码、标签属性与链接地址', () => {
    const md = [
      '---',
      'title: 史上最强攻略',
      '---',
      '```js',
      'const best = "最好"',
      '```',
      '行内 `绝对` 代码，<p-title title="完美方案"></p-title>',
      '[链接](https://example.com/顶级/page) 正文里的顶级才算',
    ].join('\n')
    const matches = scanBannedWords(md)
    expect(matches.map((m) => m.word)).toEqual(['顶级'])
    expect(matches[0].line).toBe(8)
  })

  it('同一位置只报告最长的那个词', () => {
    const matches = scanBannedWords('彻底根治顽疾')
    expect(matches.map((m) => m.word)).toEqual(['彻底根治'])
  })

  it('忽略列表中的词不再报告', () => {
    expect(scanBannedWords('这是完美的独家方案', ['完美']).map((m) => m.word)).toEqual(['独家'])
  })

  it('英文词不区分大小写，并保留原文写法', () => {
    expect(scanBannedWords('销量 top1 品牌').map((m) => m.word)).toEqual(['top1'])
  })
})
