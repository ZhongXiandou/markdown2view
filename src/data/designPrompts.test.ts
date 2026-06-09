import { describe, expect, it } from 'vitest'
import { DESIGN_STYLES, buildDesignPrompt } from './designPrompts'

const EXPECTED_SERIES = [
  '演示汇报',
  '科技产品',
  '设计创意',
  '媒体内容',
  '数据分析',
  '文档知识',
]

describe('Design Prompt Library', () => {
  it('keeps styles grouped into the planned series', () => {
    const series = new Set(DESIGN_STYLES.map((style) => style.category.split('/')[0]))

    expect(Array.from(series).sort()).toEqual([...EXPECTED_SERIES].sort())
    for (const style of DESIGN_STYLES) {
      expect(EXPECTED_SERIES).toContain(style.category.split('/')[0])
      expect(style.category.split('/')[1]).toBeTruthy()
    }
  })

  it('includes expanded styles for each requested series', () => {
    const ids = new Set(DESIGN_STYLES.map((style) => style.id))

    const expandedIds = [
      'keynote-cinematic',
      'consulting-deck',
      'startup-pitch',
      'neon-tech-launch',
      'growth-review',
      'developer-conf',
      'project-kickoff-rally',
      'roadmap-planning',
      'project-retro',
      'annual-story-review',
      'proposal-lab',
      'workshop-canvas',
      'ai-console',
      'blueprint-tech',
      'swiss-grid',
      'bauhaus-composition',
      'newsroom-feature',
      'documentary-scroll',
      'data-command-center',
      'data-journalism',
      'academic-paper',
      'product-spec',
    ]

    for (const id of expandedIds) {
      expect(ids).toContain(id)
    }
  })

  it('provides a richer presentation series', () => {
    const presentationStyles = DESIGN_STYLES.filter((style) => style.category.startsWith('演示汇报/'))

    expect(presentationStyles.length).toBeGreaterThanOrEqual(12)
    expect(presentationStyles.map((style) => style.id)).toEqual(expect.arrayContaining([
      'startup-pitch',
      'neon-tech-launch',
      'growth-review',
      'developer-conf',
      'project-kickoff-rally',
      'roadmap-planning',
      'project-retro',
      'annual-story-review',
      'proposal-lab',
      'workshop-canvas',
    ]))
  })

  it('builds prompts with content-first and style-lock constraints', () => {
    const prompt = buildDesignPrompt(DESIGN_STYLES[0])

    expect(prompt).toContain('先理解内容，再设计')
    expect(prompt).toContain('严格执行所选风格')
    expect(prompt).toContain('强制分页')
    expect(prompt).toContain('不要以 ```html 包装代码块')
  })
})
