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
  headerRight: '',
  footerText: '第 {page} / {total} 页',
  theme: 'business',
  fontFamily: 'songti',
  fontScale: 'normal',
}

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g

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
  if (/^>\s/.test(text)) return 'quote'
  if (/^([-*+]\s|\d+\.\s)/.test(text)) return 'list'
  if (/^---+$/.test(text)) return 'rule'
  if (/^<page-break\s*\/?>/.test(text)) return 'pagebreak'
  if (text.includes('|') && /\n\|?[\s:-]+\|/.test(text)) return 'table'
  if (/^<\w[\s\S]*<\/\w/.test(text)) return 'component'
  return 'paragraph'
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
  const normalized = markdown.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const initialBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

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

  return rawBlocks.map((block, index) => {
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

export function paginateDocumentBlocks(
  blocks: DocumentBlock[],
  settings: Pick<DocumentSettings, 'pageHeight' | 'marginTop' | 'marginBottom' | 'fontScale'>,
  actualHeights?: Record<string, number>
): DocumentPage[] {
  const scale = fontScaleFactor(settings.fontScale ?? 'normal')
  const contentHeight = settings.pageHeight - settings.marginTop - settings.marginBottom
  const effectiveHeight = contentHeight / scale
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
      pushPage()
      continue // Drop the pagebreak marker itself from rendering
    }

    const height = actualHeights?.[block.id] ?? block.estimatedHeight
    const oversized = height > effectiveHeight
    if (oversized) {
      pushPage()
      current = [block]
      usedHeight = height
      pushPage(true)
      continue
    }

    if (current.length && usedHeight + height > effectiveHeight) {
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
