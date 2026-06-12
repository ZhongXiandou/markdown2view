import type { ContentMeta } from '@/lib/render/metadata'

export type DocumentBlockKind =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'table'
  | 'code'
  | 'quote'
  | 'list'
  | 'component'
  | 'rule'
  | 'pagebreak'

export interface DocumentBlock {
  id: string
  kind: DocumentBlockKind
  markdown: string
  estimatedHeight: number
  avoidBreak: boolean
}

export interface DocumentPage {
  pageNumber: number
  blocks: DocumentBlock[]
  usedHeight: number
  oversized: boolean
  isCover?: boolean
}

export interface DocumentSettings {
  pageWidth: number
  pageHeight: number
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  headerHeight: number
  footerHeight: number
  headerLeft: string
  headerRight: string
  footerText: string
  theme: 'formal' | 'business'
  fontFamily: 'songti' | 'fangsong' | 'heiti' | 'lxgwwenkai'
  fontScale: 'small' | 'normal' | 'large'
  centerTitle: boolean
  indentParagraph: boolean
}

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  pageWidth: 794,
  pageHeight: 1123,
  marginTop: 64,
  marginRight: 72,
  marginBottom: 64,
  marginLeft: 72,
  headerHeight: 36,
  footerHeight: 34,
  headerLeft: '',
  headerRight: 'Pintley Tasia',
  footerText: '第 {page} / {total} 页',
  theme: 'business',
  fontFamily: 'songti',
  fontScale: 'normal',
  centerTitle: false,
  indentParagraph: false,
}

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g
const PAGE_BOTTOM_SAFETY_GAP = 36
const HEADING_NEAR_BOTTOM_RATIO = 0.78

function compactPlainText(text: string): string {
  return text
    .replace(/---[\s\S]*?---\s*/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#*`>[\]!|_~=:：.,，。;；\-\s]/g, '')
    .trim()
}

export function sanitizeFilename(name: string): string {
  return name.replace(INVALID_FILENAME_CHARS, '_').replace(/\s+/g, ' ').trim()
}

export function buildDocumentFilename(title: string, markdown: string): string {
  const fallback = compactPlainText(markdown).slice(0, 15) || '未命名文档'
  const basename = sanitizeFilename((title || fallback).slice(0, 60)) || '未命名文档'
  return `${basename}.pdf`
}

function estimateTextHeight(text: string, base: number, charsPerLine: number, lineHeight: number): number {
  const lines = text
    .split('\n')
    .map((line) => Math.max(1, Math.ceil(line.trim().length / charsPerLine)))
    .reduce((sum, count) => sum + count, 0)
  return base + lines * lineHeight
}

function classifyBlock(markdown: string): DocumentBlockKind {
  const text = markdown.trim()
  if (/^#{1,6}\s/.test(text) || /^<title\b/.test(text) || /^<p-title\b/.test(text)) return 'heading'
  if (/^!\[/.test(text)) return 'image'
  if (/^```/.test(text)) return 'code'
  if (/^>/.test(text)) return 'quote'
  if (/^([-*+]\s|\d+\.\s)/.test(text)) return 'list'
  if (/^---+$/.test(text)) return 'rule'
  if (/^<page-break\s*\/?>/.test(text)) return 'pagebreak'
  if (text.includes('|') && /\n\|?[\s:-]+\|/.test(text)) return 'table'
  if (/^<\w[\s\S]*<\/\w/.test(text)) return 'component'
  return 'paragraph'
}

function stripCaptionMarkup(text: string): string {
  return text
    .trim()
    .replace(/^(\*\*|__|\*|_)+/, '')
    .replace(/(\*\*|__|\*|_)+$/, '')
    .trim()
}

function isTableCaptionBlock(markdown: string): boolean {
  const line = stripCaptionMarkup(markdown)
  return /^(表|Table)\.?\s*(\d+|[一二三四五六七八九十百]+)([:：.\-\—\s]+)/i.test(line)
}

function isImageCaptionBlock(markdown: string): boolean {
  const line = stripCaptionMarkup(markdown)
  return /^(图|Fig|Figure)\.?\s*(\d+|[一二三四五六七八九十百]+)([:：.\-\—\s]+)/i.test(line)
}

function mergeCaptionBlocks(blocks: string[]): string[] {
  const merged: string[] = []

  for (let i = 0; i < blocks.length; i++) {
    const current = blocks[i]
    const next = blocks[i + 1]

    if (next && isTableCaptionBlock(current) && classifyBlock(next) === 'table') {
      merged.push(`${current}\n\n${next}`)
      i++
      continue
    }

    if (next && classifyBlock(current) === 'image' && isImageCaptionBlock(next)) {
      merged.push(`${current}\n\n${next}`)
      i++
      continue
    }

    merged.push(current)
  }

  return merged
}

function estimateBlockHeight(markdown: string, kind: DocumentBlockKind): number {
  switch (kind) {
    case 'heading':
      return estimateTextHeight(markdown, 20, 22, 28)
    case 'image':
      return 280
    case 'table': {
      const rows = markdown.split('\n').filter((line) => line.includes('|')).length
      return 48 + Math.max(1, rows) * 36
    }
    case 'code':
      return 42 + markdown.split('\n').length * 22
    case 'quote':
      return estimateTextHeight(markdown, 32, 34, 26)
    case 'list':
      return 18 + markdown.split('\n').length * 30
    case 'rule':
      return 32
    case 'pagebreak':
      return 0 // Doesn't take up space, forces a new page during pagination
    case 'component':
      return estimateTextHeight(markdown, 56, 30, 28)
    default:
      return estimateTextHeight(markdown, 10, 36, 28)
  }
}

export function splitMarkdownBlocks(markdown: string): DocumentBlock[] {
  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\s+$/g, '')
  if (!normalized.trim()) return []

  const initialBlocks: string[] = []
  const current: string[] = []
  let inFence = false
  let openTag: string | null = null

  const flush = () => {
    const block = current.join('\n').trimEnd()
    if (block.trim()) initialBlocks.push(block)
    current.length = 0
  }

  for (const line of normalized.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      inFence = !inFence
      current.push(line)
      continue
    }

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

  const rawBlocks: string[] = []
  for (const block of initialBlocks) {
    if (/^([-*+]\s|\d+\.\s)/.test(block) && !/^---+$/.test(block)) {
      const lines = block.split('\n')
      let currentItem = ''
      for (const line of lines) {
        if (/^\s*([-*+]\s|\d+\.\s)/.test(line)) {
          if (currentItem) rawBlocks.push(currentItem.trim())
          currentItem = line
        } else {
          currentItem += '\n' + line
        }
      }
      if (currentItem) rawBlocks.push(currentItem.trim())
    } else {
      rawBlocks.push(block)
    }
  }

  return mergeCaptionBlocks(rawBlocks).map((block, index) => {
    const kind = classifyBlock(block)
    return {
      id: `block-${index + 1}`,
      kind,
      markdown: block,
      estimatedHeight: estimateBlockHeight(block, kind),
      avoidBreak: kind !== 'paragraph',
    }
  })
}

export function fontScaleFactor(scale: DocumentSettings['fontScale']): number {
  switch (scale) {
    case 'small': return 0.85
    case 'large': return 1.2
    default: return 1.0
  }
}

/**
 * 判断一组块是否符合"封面页"结构：
 * 仅包含 1 个 heading + 0~1 个 table，可含 paragraph（通常是摘要文字）。
 * 用于在第一个 pagebreak 前自动识别封面页并启用等距分布布局。
 */
function isCoverPageBlocks(blocks: DocumentBlock[]): boolean {
  if (blocks.length === 0) return false
  let headingCount = 0
  let tableCount = 0
  for (const b of blocks) {
    if (b.kind === 'heading') headingCount++
    else if (b.kind === 'table') tableCount++
    else if (b.kind === 'paragraph') continue // 允许封面页含摘要段落
    else return false // 其他块类型（code、image、list 等）不算封面
  }
  return headingCount === 1 && tableCount <= 1
}

export function paginateDocumentBlocks(
  blocks: DocumentBlock[],
  settings: Pick<DocumentSettings, 'pageHeight' | 'marginTop' | 'marginBottom' | 'fontScale'>,
  actualHeights?: Record<string, number>
): DocumentPage[] {
  const scale = fontScaleFactor(settings.fontScale ?? 'normal')
  const contentHeight = settings.pageHeight - settings.marginTop - settings.marginBottom
  const effectiveHeight = Math.max(0, (contentHeight - PAGE_BOTTOM_SAFETY_GAP) / scale)
  const pages: DocumentPage[] = []
  let current: DocumentBlock[] = []
  let usedHeight = 0

  const pushPage = (oversized = false) => {
    if (!current.length) return
    pages.push({
      pageNumber: pages.length + 1,
      blocks: current,
      usedHeight,
      oversized,
    })
    current = []
    usedHeight = 0
  }

  for (const block of blocks) {
    if (block.kind === 'pagebreak') {
      // 第一个 pagebreak 触发分页时，检测是否为封面页
      if (pages.length === 0 && isCoverPageBlocks(current)) {
        const page: DocumentPage = {
          pageNumber: 1,
          blocks: current,
          usedHeight,
          oversized: false,
          isCover: true,
        }
        pages.push(page)
        current = []
        usedHeight = 0
      } else {
        pushPage()
      }
      continue // Drop the pagebreak marker itself from rendering
    }

    const height = actualHeights?.[block.id] ?? block.estimatedHeight
    const oversized = height > effectiveHeight
    const headingNearBottom =
      block.kind === 'heading' && current.length > 0 && usedHeight > effectiveHeight * HEADING_NEAR_BOTTOM_RATIO
    if (oversized) {
      pushPage()
      current = [block]
      usedHeight = height
      pushPage(true)
      continue
    }

    if (current.length && (usedHeight + height > effectiveHeight || headingNearBottom)) {
      pushPage()
    }

    current.push(block)
    usedHeight += height
  }

  pushPage()
  return pages
}

export function createDocumentModel(markdown: string, meta: ContentMeta, settings = DEFAULT_DOCUMENT_SETTINGS) {
  const blocks = splitMarkdownBlocks(meta.contentMarkdown || markdown)
  const pages = paginateDocumentBlocks(blocks, settings)
  return {
    filename: buildDocumentFilename(meta.title, meta.contentMarkdown || markdown),
    blocks,
    pages,
  }
}
