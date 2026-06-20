/**
 * 组件注册中心
 *
 * 编号规则：
 *   命名规则：{组件类型}_{D}{类型字母}{样式编号}
 *     D = Default（默认组件），C = Custom（定制组件）
 *     A-Z = 同类型不同变体，01-99 = 同变体不同样式
 *     示例：Title_DA01 = 标题-默认-A型-01号样式
 *
 * 每个组件导出：
 *   id       - 编号，如 'Title_DA01'
 *   name     - 组件中文名
 *   tag      - 编辑器标签名，如 'title'
 *   attrs    - 属性定义数组 [{ key, label, default, required }]
 *   example  - 编辑器侧示例代码（Markdown/类HTML）
 *   render   - (attrs, body, theme) => HTML（内联样式，可直接粘贴公众号）
 */
import type { ThemeColors } from '@engine/composables/useTheme'

export interface ComponentDef {
  id: string
  name: string
  tag: string
  description?: string
  example?: string
  attrs?: Array<{
    key: string
    label: string
    required?: boolean
    default?: string
    options?: string[]
  }>
  render: (attrs: Record<string, string>, body: string, t: ThemeColors, ...rest: unknown[]) => string
}

import { Title_DA01 } from './Title_DA01'
import { Title_DA02 } from './Title_DA02'
import { ReadingPath_DA01 } from './ReadingPath_DA01'
import { PTitle } from './PTitle_DA01'
import { Breaking_DA01 } from './Breaking_DA01'
import { Steps_DA01 } from './Steps_DA01'
import { Steps_DA02 } from './Steps_DA02'
import { CaseFlow_DA01 } from './CaseFlow_DA01'
import { Compare_DA01 } from './Compare_DA01'
import { Compare_DA02 } from './Compare_DA02'
import { CTA_DA01 } from './Cta_DA01'
import { Badges_DA01 } from './Badges_DA01'
import { Statement_DA01 } from './Statement_DA01'
import { Lead_DA01 } from './Lead_DA01'
import { Engage_DA01 } from './Engage_DA01'
import { Engage_DA02 } from './Engage_DA02'
import { Timeline_DA01 } from './Timeline_DA01'
import { Slider_DA01 } from './Slider_DA01'
import { Img_DA01 } from './Img_DA01'
import { GovHeader_DA01 } from './GovHeader_DA01'

export const components: ComponentDef[] = [
  Title_DA01,
  Title_DA02,
  ReadingPath_DA01,
  PTitle,
  Breaking_DA01,
  Steps_DA01,
  Steps_DA02,
  CaseFlow_DA01,
  Compare_DA01,
  Compare_DA02,
  CTA_DA01,
  Badges_DA01,
  Statement_DA01,
  Lead_DA01,
  Engage_DA01,
  Engage_DA02,
  Timeline_DA01,
  Slider_DA01,
  Img_DA01,
  GovHeader_DA01,
]

/** 按 id 索引 */
export const componentMap = Object.fromEntries(components.map((c) => [c.id, c]))

/** 按 tag 索引（编辑器解析用） */
export const tagMap = Object.fromEntries(components.map((c) => [c.tag, c]))
