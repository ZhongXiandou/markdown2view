import { describe, expect, it } from 'vitest'
import { DESIGN_STYLES, PREVIEW_CANVAS_MARKER, buildDesignPrompt } from './designPrompts'

const EXPECTED_SERIES = [
  '演示汇报',
  '科技产品',
  '设计创意',
  '媒体内容',
  '数据分析',
  '文档知识',
]

describe('Design Prompt Library', () => {
  it('requires every design style to declare selection metadata', () => {
    for (const style of DESIGN_STYLES) {
      expect(style.outputType).toBeTruthy()
      expect(style.visualTone).toBeTruthy()
      expect(style.family).toBeTruthy()
      expect(['primary', 'basic']).toContain(style.displayLevel)
    }
  })

  it('keeps known duplicate-prone styles in explicit families', () => {
    const byId = Object.fromEntries(DESIGN_STYLES.map((style) => [style.id, style]))

    expect(byId['terminal'].family).toBe('developer-code')
    expect(byId['supabase'].family).toBe('developer-code')
    expect(byId['developer-conf'].family).toBe('developer-code')

    expect(byId['linear'].family).toBe('product-tool')
    expect(byId['ai-console'].family).toBe('ai-console')
    expect(byId['data-command-center'].family).toBe('data-screen')
    expect(byId['neon-tech-launch'].family).toBe('launch-event')

    expect(byId['ppt-slide'].displayLevel).toBe('basic')
  })

  it('keeps rewritten styles away from dated high-risk visual tropes', () => {
    const rewrittenIds = new Set([
      'terminal',
      'workshop-canvas',
      'startup-pitch',
      'neon-tech-launch',
    ])
    const highRiskWords = ['霓虹', '毛玻璃', '拟物玻璃', '夸张渐变', 'Emoji', '极致动效']

    for (const style of DESIGN_STYLES.filter((item) => rewrittenIds.has(item.id))) {
      for (const word of highRiskWords) {
        expect(`${style.name}\n${style.description}\n${style.style}`).not.toContain(word)
      }
    }
  })

  it('exports output types and visual tones used by the prompt library', async () => {
    const mod = await import('./designPrompts')

    expect(mod.OUTPUT_TYPES).toEqual(['幻灯片', '长页', '卡片', '报告', '仪表盘', '文档'])
    expect(mod.VISUAL_TONES).toEqual(['极简', '编辑', '科技', '数据', '温暖', '代码'])
  })

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
      'editorial-ink-deck',
      'swiss-presentation-system',
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
      'editorial-ink-deck',
      'swiss-presentation-system',
    ]))
  })

  it('builds prompts with content-first and style-lock constraints', () => {
    const prompt = buildDesignPrompt(DESIGN_STYLES[0])

    expect(prompt).toContain('先理解内容，再设计')
    expect(prompt).toContain('严格执行所选风格')
    expect(prompt).toContain('强制分页')
    expect(prompt).toContain('不要以 ```html 包装代码块')
  })

  it('includes guizang-inspired presentation styles and production lessons', () => {
    const byId = Object.fromEntries(DESIGN_STYLES.map((style) => [style.id, style]))

    expect(byId['editorial-ink-deck'].style).toContain('电子杂志')
    expect(byId['editorial-ink-deck'].style).toContain('主题节奏')
    expect(byId['swiss-presentation-system'].style).toContain('瑞士国际主义')
    expect(byId['swiss-presentation-system'].style).toContain('单一锚点色')

    const prompt = buildDesignPrompt(byId['swiss-presentation-system'])
    expect(prompt).toContain('先列出版式节奏')
    expect(prompt).toContain('标准比例')
    expect(prompt).toContain('低性能')
  })
  it('keeps every built-in style at the shared thumbnail and spec standard', () => {
    const requiredSections = ['【视觉主题】', '【色彩系统】', '【字体与字号】', '【组件特征】', '【禁忌】', '【布局原则】']

    for (const style of DESIGN_STYLES) {
      // 缩略图统一画在 previewKit 的固定画布上
      expect(style.previewHtml?.startsWith(`<div ${PREVIEW_CANVAS_MARKER}`), style.id).toBe(true)
      // 设计说明是完整规范，而不是几行概述
      expect(style.style.length, style.id).toBeGreaterThanOrEqual(600)
      for (const section of requiredSections) {
        expect(style.style, style.id).toContain(section)
      }
      // 自由画布只认标准 HTML：不得引用 Markdown 引擎专用的自定义标签
      expect(style.style, style.id).not.toContain('<gov-header')
    }
  })
})
