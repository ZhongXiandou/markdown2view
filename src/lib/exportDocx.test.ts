import { describe, it, expect } from 'vitest'
import { FormulaCache, preprocessFormulasSafe, protectCodeRegions, restoreCodeRegions } from './exportDocx'

describe('FormulaCache', () => {
  it('为不同公式生成不同占位符', () => {
    const cache = new FormulaCache()
    const p1 = cache.register('E=mc^2', false)
    const p2 = cache.register('E=mc^2', false)
    const p3 = cache.register('\\sum_{i=1}^n i', true)

    expect(p1).toMatch(/__INLINE_FORMULA_\d+__/)
    expect(p2).toMatch(/__INLINE_FORMULA_\d+__/)
    expect(p1).not.toBe(p2)
    expect(p3).toMatch(/__BLOCK_FORMULA_\d+__/)
  })

  it('getFormulaMap 初始为空', () => {
    const cache = new FormulaCache()
    cache.register('x', false)
    expect(cache.getFormulaMap().size).toBe(0)
  })
})

describe('protectCodeRegions / restoreCodeRegions', () => {
  it('能正确还原代码块和行内代码', () => {
    const md = '```ts\nconst x = $a$;\n```\n行内 `$b$` 代码'
    const { text, codes } = protectCodeRegions(md)
    expect(text).not.toContain('```')
    expect(text).not.toContain('`$b$`')
    expect(restoreCodeRegions(text, codes)).toBe(md)
  })
})

describe('preprocessFormulasSafe', () => {
  it('将行内和块级公式替换为占位符', () => {
    const cache = new FormulaCache()
    const md = '行内 $E=mc^2$ 公式\n\n$$\\sum_{i=1}^n i$$'
    const result = preprocessFormulasSafe(md, cache)

    expect(result).toContain('__INLINE_FORMULA_0__')
    expect(result).toContain('__BLOCK_FORMULA_0__')
    expect(result).not.toContain('$E=mc^2$')
    expect(result).not.toContain('$$')
  })

  it('不处理代码块内的公式', () => {
    const cache = new FormulaCache()
    const md = '```\n$E=mc^2$\n```'
    const result = preprocessFormulasSafe(md, cache)

    expect(result).toBe(md)
    expect(cache.getFormulaMap().size).toBe(0)
  })

  it('不处理行内代码内的公式', () => {
    const cache = new FormulaCache()
    const md = '这是 `$E=mc^2$` 行内代码'
    const result = preprocessFormulasSafe(md, cache)

    expect(result).toBe(md)
    expect(cache.getFormulaMap().size).toBe(0)
  })

  it('代码块外的公式仍被处理', () => {
    const cache = new FormulaCache()
    const md = '```\n$inside$\n```\n\n$outside$'
    const result = preprocessFormulasSafe(md, cache)

    expect(result).toContain('$inside$')
    expect(result).toContain('__INLINE_FORMULA_0__')
    expect(result).not.toContain('$outside$')
  })
})
