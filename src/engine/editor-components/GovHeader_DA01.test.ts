import { describe, it, expect } from 'vitest'
import { GovHeader_DA01 } from './GovHeader_DA01'
import type { ThemeColors } from '@engine/composables/useTheme'

const mockTheme: ThemeColors = {
  accent: '#c0202c',
  bg: '#ffffff',
  border: '#e5e7eb',
  text: '#000000',
  textSecondary: '#64748b',
  surface: '#ffffff',
} as unknown as ThemeColors

describe('GovHeader_DA01', () => {
  it('应渲染发文机关名称为红色加粗居中', () => {
    const html = GovHeader_DA01.render(
      { issuer: 'XX市人民政府办公厅', docNo: '市政发〔2026〕第1号' },
      '',
      mockTheme,
    )
    expect(html).toContain('XX市人民政府办公厅')
    expect(html).toContain('#c0202c')
    expect(html).toContain('text-align:center')
  })

  it('应渲染发文字号', () => {
    const html = GovHeader_DA01.render(
      { issuer: '测试机关', docNo: '测试〔2026〕1号' },
      '',
      mockTheme,
    )
    expect(html).toContain('测试〔2026〕1号')
  })

  it('应渲染密级标注（左上角红色）', () => {
    const html = GovHeader_DA01.render(
      { issuer: '测试机关', classification: '绝密' },
      '',
      mockTheme,
    )
    expect(html).toContain('绝密')
    expect(html).toContain('保密期限')
  })

  it('应渲染签发人（右上角）', () => {
    const html = GovHeader_DA01.render(
      { issuer: '测试机关', signer: '张三' },
      '',
      mockTheme,
    )
    expect(html).toContain('签发人')
    expect(html).toContain('张三')
  })

  it('应渲染紧急程度', () => {
    const html = GovHeader_DA01.render(
      { issuer: '测试机关', urgency: '特急' },
      '',
      mockTheme,
    )
    expect(html).toContain('特急')
  })

  it('应渲染红色分隔线', () => {
    const html = GovHeader_DA01.render(
      { issuer: '测试机关', docNo: '测试〔2026〕1号' },
      '',
      mockTheme,
    )
    expect(html).toMatch(/background:#c0202c|background-color:#c0202c/)
  })

  it('缺少可选属性时不应崩溃', () => {
    const html = GovHeader_DA01.render({ issuer: '测试机关' }, '', mockTheme)
    expect(html).toContain('测试机关')
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('null')
  })
})
