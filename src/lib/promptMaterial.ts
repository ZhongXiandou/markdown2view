import type { RenderMode } from '@/lib/store'
import { isModeVisible } from '@/lib/modes'

/** 可作为素材来源的模式：自由画布的内容是 HTML 源码，不适合直接当素材 */
export type MaterialSource = Exclude<RenderMode, 'html'>

const ALL_SOURCES: MaterialSource[] = ['document', 'article', 'card']

/** 当前模式下可选的素材来源（排除自己，以及已从导航下线的模式） */
export function materialSourcesFor(mode: RenderMode): MaterialSource[] {
  return ALL_SOURCES.filter((s) => s !== mode && isModeVisible(s))
}

/**
 * 在排版指令后附上另一模式的原稿，让外部 AI 把它改写成目标形态。
 *
 * 各模式对内容的要求不同（长图文重视觉节奏、卡片一页一个重点、A4 要正式克制、画布是 HTML），
 * 直接搬运内容并不匹配；现有指令本来就以「请把我提供的素材改写为…」开头，这里只是把素材一起带上。
 */
export function buildPromptWithMaterial(prompt: string, material: string, sourceLabel: string): string {
  return [
    prompt.trimEnd(),
    '',
    '---',
    '',
    '## 待改编的原稿',
    '',
    `下面是我在「${sourceLabel}」模式下写好的内容，请以它为素材，按上面的指令改写为目标形态：`,
    '',
    '- 原稿中的自定义标签、frontmatter 字段和排版标记只适用于原模式，请按上面指令允许的语法重新组织，不要照搬。',
    '- 保留原稿的事实、数据、名称和核心观点；篇幅与结构按目标形态的要求调整。',
    '',
    '<<<原稿开始>>>',
    material.trim(),
    '<<<原稿结束>>>',
    '',
  ].join('\n')
}
