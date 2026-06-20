import { describe, it, expect } from 'vitest'
import { buildArticleAiGuide, buildDocumentAiGuide, buildCardAiGuide, buildGovDocAiGuide, buildTechDocAiGuide } from './aiGuide'

describe('AI Guide Prompts', () => {
  it('should generate WeChat Article guide with WeChat components', () => {
    const guide = buildArticleAiGuide()
    expect(guide).toContain('长图文排版 Markdown 语法指令')
    expect(guide).toContain('<steps>')
    expect(guide).toContain('<timeline>')
    expect(guide).toContain('<engage>')
  })

  it('should generate A4 Document guide with formal layout requirements', () => {
    const guide = buildDocumentAiGuide()
    expect(guide).toContain('A4 文档排版 Markdown 语法指令')
    expect(guide).toContain('正式文档')
    expect(guide).toContain('第一个、最大的一级标题')
    expect(guide).toContain('段首空格')
    expect(guide).toContain('图片题注')
    expect(guide).toContain('图片下方')
    expect(guide).toContain('表格上方')
    expect(guide).toContain('图片题注只能写在图片下方')
    expect(guide).toContain('表格题注只能写在表格上方')
    expect(guide).toContain('图 1: xxxx')
    expect(guide).toContain('表 1: xxxx')
    expect(guide).toContain('图题和表题分别独立编号')
    expect(guide).toContain('可以同时存在图 1 和表 1')
    expect(guide).toContain('**图 1: xxxx**')
    expect(guide).toContain('**表 1: xxxx**')
    expect(guide).toContain('<page-break>')
    expect(guide).toContain('导航栏主题色')
    expect(guide).toContain('附录必须另起一页')
    expect(guide).toContain('长文档建议按大章节分页')
    // 确保去除了微信花哨的社交、互动组件的详细讲解模块
    expect(guide).not.toContain('## 四、块级组件（直接以标签形式写在正文中）')
  })

  it('should generate Card guide with Xiaohongshu card platform details', () => {
    const guide = buildCardAiGuide('3:4')
    expect(guide).toContain('小红书图文卡片')
    expect(guide).toContain('YAML frontmatter')
    expect(guide).toContain('brand:')
    expect(guide).toContain('chips:')
    expect(guide).toContain('每张图只承载一个重点')
    expect(guide).toContain('分页建议')
  })
})

describe('buildGovDocAiGuide', () => {
  it('应包含公文头部标签说明', () => {
    const guide = buildGovDocAiGuide()
    expect(guide).toContain('<gov-header>')
    expect(guide).toContain('issuer')
    expect(guide).toContain('doc-no')
    expect(guide).toContain('classification')
    expect(guide).toContain('signer')
  })

  it('应包含公文排版规范', () => {
    const guide = buildGovDocAiGuide()
    expect(guide).toContain('仿宋')
    expect(guide).toContain('红头')
    expect(guide).toContain('发文字号')
  })

  it('应禁止使用社交互动组件', () => {
    const guide = buildGovDocAiGuide()
    expect(guide).toContain('<breaking>')
    expect(guide).toContain('不要使用')
  })
})

describe('buildTechDocAiGuide', () => {
  it('应包含封面页元数据字段说明', () => {
    const guide = buildTechDocAiGuide()
    expect(guide).toContain('文档编号')
    expect(guide).toContain('版本号')
    expect(guide).toContain('编写者')
    expect(guide).toContain('审核者')
    expect(guide).toContain('机密等级')
  })

  it('应包含封面生成选项说明', () => {
    const guide = buildTechDocAiGuide()
    expect(guide).toContain('封面')
    expect(guide).toContain('可选')
  })
})
