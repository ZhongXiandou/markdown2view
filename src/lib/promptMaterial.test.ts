import { describe, it, expect } from 'vitest'
import { buildPromptWithMaterial, materialSourcesFor } from './promptMaterial'

describe('promptMaterial', () => {
  it('素材来源排除当前模式，且不含自由画布', () => {
    expect(materialSourcesFor('article')).toEqual(['document', 'card'])
    expect(materialSourcesFor('card')).toEqual(['document', 'article'])
    expect(materialSourcesFor('html')).toEqual(['document', 'article', 'card'])
  })

  it('指令在前、原稿在后，并用明确的起止标记包住原稿', () => {
    const out = buildPromptWithMaterial('# 指令\n要求一\n\n', '  原稿正文\n```js\ncode\n```  ', '长图文')
    expect(out.startsWith('# 指令\n要求一\n\n---')).toBe(true)
    expect(out).toContain('「长图文」模式')
    const start = out.indexOf('<<<原稿开始>>>')
    const end = out.indexOf('<<<原稿结束>>>')
    expect(start).toBeGreaterThan(out.indexOf('要求一'))
    expect(out.slice(start, end)).toContain('原稿正文\n```js\ncode\n```')
  })
})
