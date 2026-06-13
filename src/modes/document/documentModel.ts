import type { ContentMeta } from '@/lib/render/metadata'
import { parseTableMarkdown, estimateTableRowHeight, estimateTableHeight, type TableData } from '@/engine/utils/markdownParser'

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
  headerLeft: 'markdown2view',
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
      const tableData = parseTableMarkdown(markdown)
      if (tableData) {
        return estimateTableHeight(tableData)
      }
      // 回退到简单估算
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

interface SplitTableResult {
  pages: Array<{
    tableMarkdown: string
    isContinuation: boolean
    height: number
  }>
}

function splitTableByHeight(
  tableMarkdown: string,
  availableHeight: number,
  effectiveHeight: number,
  settings: { marginTop: number; marginBottom: number },
  actualTableHeight?: number
): SplitTableResult | null {
  const tableData = parseTableMarkdown(tableMarkdown)
  if (!tableData) return null
  
  let heightRatio = 1.0
  let baseCaptionHeight = 0
  if (tableData.caption) {
    // text height + bottom margin 8px
    baseCaptionHeight = Math.ceil(tableData.caption.length / 30) * 18 + 8
  }
  
  if (actualTableHeight) {
    // actualTableHeight (offsetHeight) does NOT include collapsed margins (top 16px, bottom 30px).
    // It only includes the physical text height of caption and table.
    const estimatedTotal = estimateTableHeight(tableData) + baseCaptionHeight
    heightRatio = actualTableHeight / estimatedTotal
  }
  
  const pages: SplitTableResult['pages'] = []
  let currentPageRows: string[][] = []
  let currentHeight = 0
  const headerHeight = estimateTableRowHeight(tableData.headers, true, tableData.colChars) * heightRatio
  const containerPadding = 46 // 顶部 16px 底部 30px 外边距
  const safetyBuffer = 30 // 安全缓冲
  
  const captionHeight = tableData.caption ? baseCaptionHeight * heightRatio : 0
  const continuationCaptionHeight = tableData.caption ? captionHeight : 30 * heightRatio
  
  // 计算第一页可用高度
  const firstPageAvailable = availableHeight - containerPadding - headerHeight - captionHeight - safetyBuffer
  
  // 计算后续页可用高度
  const continuationPageAvailable = effectiveHeight - containerPadding - headerHeight - continuationCaptionHeight - safetyBuffer
  
  for (let i = 0; i < tableData.rows.length; i++) {
    const row = tableData.rows[i]
    const rowHeight = estimateTableRowHeight(row, false, tableData.colChars) * heightRatio
    
    const isFirstPage = pages.length === 0
    const currentAvailable = isFirstPage ? firstPageAvailable : continuationPageAvailable
    
    if (currentHeight + rowHeight > currentAvailable && currentPageRows.length > 0) {
      // 当前页已满，生成页面
      const caption = tableData.caption
      const isCont = pages.length > 0
      const currentCapHeight = isCont ? continuationCaptionHeight : captionHeight
      const pageMarkdown = buildTableMarkdown(tableData.headers, currentPageRows, isCont, caption)
      pages.push({
        tableMarkdown: pageMarkdown,
        isContinuation: isCont,
        height: currentHeight + containerPadding + headerHeight + currentCapHeight
      })
      
      // 开始新页
      currentPageRows = [row]
      currentHeight = rowHeight
    } else {
      // 添加到当前页
      currentPageRows.push(row)
      currentHeight += rowHeight
    }
  }
  
  // 处理最后一页
  if (currentPageRows.length > 0) {
    const caption = tableData.caption
    const isCont = pages.length > 0
    const currentCapHeight = isCont ? continuationCaptionHeight : captionHeight
    const pageMarkdown = buildTableMarkdown(tableData.headers, currentPageRows, isCont, caption)
    pages.push({
      tableMarkdown: pageMarkdown,
      isContinuation: isCont,
      height: currentHeight + containerPadding + headerHeight + currentCapHeight
    })
  }
  
  return { pages }
}

function buildTableMarkdown(headers: string[], rows: string[][], isContinuation: boolean, caption?: string): string {
  let markdown = ''
  
  if (caption) {
    if (isContinuation) {
      markdown += caption.trim() + '（续表）\n\n'
    } else {
      markdown += caption.trim() + '\n\n'
    }
  } else if (isContinuation) {
    // 如果没有原标题，则使用普通加粗文字表示续表
    markdown += '**（续表）**\n\n'
  }
  
  // 表头
  markdown += '| ' + headers.join(' | ') + ' |\n'
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
  
  // 数据行
  for (const row of rows) {
    markdown += '| ' + row.join(' | ') + ' |\n'
  }
  
  return markdown.trim()
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

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
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

    // 处理表格跨页
    if (block.kind === 'table') {
      const tableData = parseTableMarkdown(block.markdown)
      if (tableData) {
        let availableHeight = effectiveHeight - usedHeight
        
        // 如果当前页剩余高度连表格的开头（包含头部和一行内容）都放不下，直接整体推到下一页
        if (availableHeight < 160 && current.length > 0) {
          pushPage()
          availableHeight = effectiveHeight
        }
        
        const actualTableHeight = actualHeights?.[block.id]
        const splitResult = splitTableByHeight(block.markdown, availableHeight, effectiveHeight, settings, actualTableHeight)
        
        if (splitResult && splitResult.pages.length > 1) {
          // 表格需要跨页
          for (let k = 0; k < splitResult.pages.length; k++) {
            const page = splitResult.pages[k]
            
            if (k === 0) {
              // 第一页：添加到当前页
              const tableBlock: DocumentBlock = {
                id: `${block.id}-part-${k}`,
                kind: 'table',
                markdown: page.tableMarkdown,
                estimatedHeight: page.height,
                avoidBreak: false,
              }
              current.push(tableBlock)
              usedHeight += page.height
              pushPage()
            } else {
              // 后续页：新页面开始
              const tableBlock: DocumentBlock = {
                id: `${block.id}-part-${k}`,
                kind: 'table',
                markdown: page.tableMarkdown,
                estimatedHeight: page.height,
                avoidBreak: false,
              }
              current = [tableBlock]
              usedHeight = page.height
              
              if (k < splitResult.pages.length - 1) {
                pushPage()
              }
            }
          }
          continue
        }
      }
    }

    const height = actualHeights?.[block.id] ?? block.estimatedHeight
    const oversized = height > effectiveHeight
    
    let headingNearBottom = false
    if (block.kind === 'heading' && current.length > 0) {
      // 智能防孤立标题算法：向后看，确保标题能和紧随其后的正文留在同一页
      let contentHeightToKeep = 0
      for (let j = i + 1; j < blocks.length; j++) {
        const nb = blocks[j]
        const nh = actualHeights?.[nb.id] ?? nb.estimatedHeight
        contentHeightToKeep += nh
        if (nb.kind !== 'heading') break // 只绑定紧随其后的首个非标题块
      }
      
      const canFitOnEmptyPage = height + contentHeightToKeep <= effectiveHeight
      // 如果标题和它的内容可以完整放在新的一页，那就要求当前页必须能容纳它们俩，否则把标题推到下一页
      // 如果内容实在太长（连新的一页都放不下），退而求其次，只要当前页能容纳标题 + 120px 的前奏内容就不换页
      const nextContentRequirement = canFitOnEmptyPage ? contentHeightToKeep : Math.min(contentHeightToKeep, 120)
      
      if (usedHeight + height + nextContentRequirement > effectiveHeight) {
        headingNearBottom = true
      }
    }

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
