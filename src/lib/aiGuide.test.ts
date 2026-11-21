import { describe, it, expect } from 'vitest'
import { buildArticleAiGuide, buildDocumentAiGuide, buildCardAiGuide, buildGovDocAiGuide, buildTechDocAiGuide, type DocCoverMetadata, type GovDocMetadata } from './aiGuide'

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

describe('buildDocumentAiGuide with metadata', () => {
  it('默认调用（无元数据）应保持原有行为', () => {
    const guide = buildDocumentAiGuide()
    expect(guide).toContain('封面页参考格式')
    expect(guide).not.toContain('用户已确认')
  })

  it('关闭封面时应替换封面章节为"不需要封面页"', () => {
    const guide = buildDocumentAiGuide({ enabled: false })
    expect(guide).toContain('本文档不需要封面页')
    expect(guide).not.toContain('封面页参考格式')
    expect(guide).not.toContain('封面元数据（用户已确认')
  })

  it('填写元数据时应追加封面元数据章节并包含字段值', () => {
    const meta: DocCoverMetadata = {
      enabled: true,
      docNo: 'PRD-2026-001',
      version: 'V1.0',
      author: '张三',
      authorDate: '2026-06-20',
      reviewer: '李四',
      reviewDate: '2026-06-21',
      status: '草稿',
      classification: '内部公开',
    }
    const guide = buildDocumentAiGuide(meta)
    expect(guide).toContain('封面元数据（用户已确认')
    expect(guide).toContain('PRD-2026-001')
    expect(guide).toContain('V1.0')
    expect(guide).toContain('张三')
    expect(guide).toContain('2026-06-20')
    expect(guide).toContain('李四')
    expect(guide).toContain('2026-06-21')
    expect(guide).toContain('草稿')
    expect(guide).toContain('内部公开')
    // 应保留封面格式说明
    expect(guide).toContain('封面页参考格式')
  })

  it('部分填写元数据时只输出有值的行', () => {
    const guide = buildDocumentAiGuide({ enabled: true, docNo: 'DOC-001', version: 'V2.0' })
    expect(guide).toContain('DOC-001')
    expect(guide).toContain('V2.0')
    // 未填写的字段不应出现特定值
    expect(guide).not.toContain('| 编写 |  | 编写日期 |  |')
  })
})

describe('buildTechDocAiGuide with metadata', () => {
  it('关闭封面时应替换封面章节', () => {
    const guide = buildTechDocAiGuide({ enabled: false })
    expect(guide).toContain('本文档不需要封面页')
    expect(guide).not.toContain('技术文档可选择是否需要封面页')
  })

  it('填写元数据时应追加封面元数据章节', () => {
    const guide = buildTechDocAiGuide({ enabled: true, docNo: 'TECH-001', author: '王五' })
    expect(guide).toContain('封面元数据（用户已确认')
    expect(guide).toContain('TECH-001')
    expect(guide).toContain('王五')
  })
})

describe('buildGovDocAiGuide with metadata', () => {
  it('默认调用（无元数据）应保持原有行为', () => {
    const guide = buildGovDocAiGuide()
    expect(guide).toContain('<gov-header>')
    expect(guide).not.toContain('公文元数据（用户已确认')
  })

  it('填写公文元数据时应追加公文元数据章节', () => {
    const meta: GovDocMetadata = {
      issuer: 'XX市人民政府办公厅',
      docNo: '市政发〔2026〕第1号',
      classification: '机密',
      signer: '张三',
      recipient: '各区人民政府，市政府各委、办、局',
      publishDate: '2026-06-20',
    }
    const guide = buildGovDocAiGuide(meta)
    expect(guide).toContain('公文元数据（用户已确认')
    expect(guide).toContain('issuer="XX市人民政府办公厅"')
    expect(guide).toContain('doc-no="市政发〔2026〕第1号"')
    expect(guide).toContain('classification="机密"')
    expect(guide).toContain('signer="张三"')
    expect(guide).toContain('主送机关：各区人民政府，市政府各委、办、局')
    expect(guide).toContain('成文日期：2026-06-20')
  })

  it('部分填写公文元数据时只输出有值的属性', () => {
    const guide = buildGovDocAiGuide({ issuer: '测试机关', docNo: '测试〔2026〕1号' })
    expect(guide).toContain('issuer="测试机关"')
    expect(guide).toContain('doc-no="测试〔2026〕1号"')
    // 元数据章节中的 <gov-header> 标签不应包含未填写的属性
    const metaSection = guide.split('## 六、公文元数据')[1] || ''
    expect(metaSection).toContain('<gov-header issuer="测试机关" doc-no="测试〔2026〕1号"></gov-header>')
    expect(metaSection).not.toContain('classification=')
    expect(metaSection).not.toContain('signer=')
  })
})

describe('AI 指令 - 嵌套列表规则同步', () => {
  it('长图文、A4 文档（含公文/技术）、卡片指令都说明了嵌套列表写法', () => {
    for (const guide of [
      buildArticleAiGuide(),
      buildDocumentAiGuide(),
      buildTechDocAiGuide(),
      buildGovDocAiGuide(),
      buildCardAiGuide('3:4'),
    ]) {
      expect(guide).toContain('多级嵌套')
      expect(guide).toContain('多缩进 2 个空格')
    }
  })
})
