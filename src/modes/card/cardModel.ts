import { extractXhs, type XhsAspect, type XhsMeta } from '@/engine/utils/xhsCards'

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

function splitMarkdownBlocks(markdown: string): string[] {
  const normalized = markdown.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const blocks: string[] = []
  const current: string[] = []
  let inFence = false
  let openTag: string | null = null

  const flush = () => {
    const block = current.join('\n').trim()
    if (block) blocks.push(block)
    current.length = 0
  }

  for (const line of normalized.split('\n')) {
    const trimmed = line.trim()
    const fence = trimmed.startsWith('```')
    if (fence) inFence = !inFence

    if (!inFence && !openTag) {
      const open = trimmed.match(/^<([a-z][\w-]*)\b[^>]*>/i)
      if (open && !trimmed.includes(`</${open[1]}>`) && !trimmed.endsWith('/>')) {
        openTag = open[1]
      }
    }

    if (!inFence && !openTag && !trimmed) {
      flush()
      continue
    }

    current.push(line)
    if (openTag && trimmed.includes(`</${openTag}>`)) openTag = null
  }

  flush()
  return blocks
}

function classify(block: string) {
  const text = block.trim()
  if (/^#{1,6}\s/.test(text) || /^<title\b/.test(text) || /^<p-title\b/.test(text)) return 'heading'
  if (/^```/.test(text)) return 'code'
  if (/^!\[/.test(text)) return 'image'
  if (/^>/.test(text)) return 'quote'
  if (/^([-*+]\s|\d+\.\s)/.test(text)) return 'list'
  if (text.includes('|') && /\n\|?[\s:-]+\|/.test(text)) return 'table'
  if (/^<\w[\s\S]*<\/\w/.test(text)) return 'component'
  return 'paragraph'
}

function estimateBlockUnits(block: string): number {
  const kind = classify(block)
  const chars = stripInline(block).length
  const lines = block.split('\n').length

  switch (kind) {
    case 'heading':
      return Math.max(3.5, Math.ceil(chars / 12) * 2.4)
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
    const isHeading = classify(block) === 'heading'
    // actualHeights 存在时使用像素高度；否则使用粗略内容单位估算。
    const height = actualHeights ? (actualHeights[`block-${index}`] || 0) : estimateBlockUnits(block)
    const headingNearBottom = isHeading && (actualHeights ? used > budget * 0.75 : used > budget * 0.72)

    if (current.length && (used + height > budget || headingNearBottom)) push()

    current.push(block)
    used += height

    const next = blocks[index + 1]
    if (next && classify(next) === 'heading' && (actualHeights ? used > budget * 0.75 : used > budget * 0.72)) push()
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
