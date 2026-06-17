import { extractXhs, type XhsAspect, type XhsMeta } from '@/engine/utils/xhsCards'

// === 从 blockParser 导入的公共逻辑 ===
import { splitMarkdownBlocks, classifyBlock } from '@/engine/blockParser'

export type CardPlatform = 'xiaohongshu'

export interface CardContentPage {
  id: string
  markdown: string
  estimatedUnits: number
}

export interface CardModel {
  meta: XhsMeta
  contentMarkdown: string
  caption: string
  pages: CardContentPage[]
  rawBlocks?: string[]
}

const PAGE_BUDGET: Record<XhsAspect, number> = {
  '3:4': 22,
  '9:16': 32,
  '1:1': 16,
}

function stripInline(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#*`>[\]!|_~=:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function estimateBlockUnits(block: string): number {
  const kind = classifyBlock(block)
  if (kind === 'pagebreak') return 0
  const chars = stripInline(block).length
  const lines = block.split('\n').length

  switch (kind) {
    case 'heading':
      return Math.max(3.5, Math.ceil(chars / 12) * 2.4)
    case 'mermaid':
      return 12 // 卡片中一个流程图约占用 12 个内容单位（约半页）
    case 'code':
      return 4 + lines * 1.25
    case 'image':
      return 10
    case 'quote':
      return 3 + Math.ceil(chars / 24) * 1.7
    case 'list':
      return 2 + lines * 2.1
    case 'table':
      return 4 + lines * 1.8
    case 'component':
      return 7 + Math.ceil(chars / 30) * 1.4 + lines * 0.8
    default:
      return 1.5 + Math.ceil(chars / 28) * 1.8
  }
}

function paginateBlocks(
  blocks: string[],
  aspect: XhsAspect,
  actualHeights?: Record<string, number>,
  budgetOverride?: number,
): CardContentPage[] {
  const budget = budgetOverride ?? PAGE_BUDGET[aspect]
  const pages: CardContentPage[] = []
  let current: string[] = []
  let used = 0

  const push = () => {
    if (!current.length) return
    pages.push({
      id: `content-${pages.length + 1}`,
      markdown: current.join('\n\n'),
      estimatedUnits: used,
    })
    current = []
    used = 0
  }

  blocks.forEach((block, index) => {
    const kind = classifyBlock(block)
    if (kind === 'pagebreak') {
      push()
      return
    }

    const isHeading = kind === 'heading'
    // actualHeights 存在时使用像素高度；否则使用粗略内容单位估算。
    const height = actualHeights ? (actualHeights[`block-${index}`] || 0) : estimateBlockUnits(block)
    const headingNearBottom = isHeading && (actualHeights ? used > budget * 0.75 : used > budget * 0.72)

    if (current.length && (used + height > budget || headingNearBottom)) push()

    current.push(block)
    used += height

    const next = blocks[index + 1]
    if (next && classifyBlock(next) === 'heading' && (actualHeights ? used > budget * 0.75 : used > budget * 0.72)) push()
  })

  push()
  return pages
}

export function buildCardCaption(meta: XhsMeta, platform: CardPlatform): string {
  const platformTag = '小红书'
  const parts = [meta.title, meta.summary].filter(Boolean)
  const chips = Array.from(new Set([platformTag, ...meta.chips]))
    .map((chip) => `#${chip}`)
    .join(' ')

  return [parts.join('\n\n'), chips].filter(Boolean).join('\n\n')
}

export function createCardModel(
  markdown: string,
  aspect: XhsAspect,
  platform: CardPlatform,
  actualHeights?: Record<string, number>,
  pixelBudget?: number
): CardModel {
  let { meta, contentMd } = extractXhs(markdown)
  
  // 强制将列表项拆分为独立 Block，以允许分页逻辑在长列表内部打断
  contentMd = contentMd.replace(/\n([-*+]\s|\d+\.\s)/g, '\n\n$1')

  const blocks = splitMarkdownBlocks(contentMd)
  
  const pages = paginateBlocks(blocks, aspect, actualHeights, pixelBudget)

  return {
    meta,
    contentMarkdown: contentMd,
    caption: buildCardCaption(meta, platform),
    pages,
    rawBlocks: blocks, // Add this so UI can render the hidden blocks
  }
}
