import type { RenderMode } from '@/lib/appStore'

/**
 * 导航中可见的模式（顺序即顶栏标签顺序）。
 *
 * 「分页图文」（小红书卡片）模式已下线入口：代码、指令与用户已保存的卡片内容均保留，
 * 如需恢复，把 'card' 加回这个数组即可（建议放在 'article' 之后）。
 */
export const VISIBLE_MODES: RenderMode[] = ['document', 'article', 'html']

export function isModeVisible(mode: RenderMode): boolean {
  return VISIBLE_MODES.includes(mode)
}
