import { parseMarkdown, type ThemeColors } from '@engine'
import { getFontFamilyCss } from '@/lib/fonts'
import { DOCUMENT_TITLE_LINE_HEIGHT, DOCUMENT_TITLE_MARGIN } from '../documentStyles'
import type { DocumentBlock, DocumentSettings } from '../documentModel'

export type MermaidMap = Map<string, { svg: string; error?: string }>

/** 代码块小于该行数时整体不拆（决策：<10 行原子，≥10 行可按行拆） */
const CODE_ATOMIC_MAX_LINES = 10

/**
 * 判断一组块是否符合「封面页」结构：1 个标题 + 0~1 个表格，可含段落。
 * 与 documentModel.isCoverPageBlocks 等价（此处本地实现，避免修改既有模块）。
 */
function isCoverBlocks(blocks: DocumentBlock[]): boolean {
  if (blocks.length === 0) return false
  let headingCount = 0
  let tableCount = 0
  for (const b of blocks) {
    if (b.kind === 'heading') headingCount++
    else if (b.kind === 'table') tableCount++
    else if (b.kind === 'paragraph') continue
    else return false
  }
  return headingCount === 1 && tableCount <= 1
}

/**
 * 把引擎输出的「装饰卡片表格」规整为可被 Paged.js 按行分片的裸 <table>。
 * 引擎结构：<section flex><section overflow:hidden;width:max-content><section padding>
 *           <section.tableWrapper><table>…</table></…>。
 * overflow:hidden + flex + max-content 会阻断按行跨页，这里仅保留 <table>，
 * 同时保留表格前的 caption 段落。
 */
function normalizeTableHtml(html: string): string {
  if (typeof document === 'undefined') return html
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const table = tmp.querySelector('table')
  if (table) {
    // 找到 table 在 tmp 下的最外层卡片祖先，用裸 table 替换它（保留 caption 等兄弟节点）
    let cardRoot: HTMLElement = table
    while (cardRoot.parentElement && cardRoot.parentElement !== tmp) {
      cardRoot = cardRoot.parentElement
    }
    if (cardRoot !== table) cardRoot.replaceWith(table)
  }
  return tmp.innerHTML
}

export interface PagedContentSettings {
  fontFamily: DocumentSettings['fontFamily']
  fontScale: DocumentSettings['fontScale']
  centerTitle: boolean
  indentParagraph: boolean
}

/**
 * 将文档块渲染为喂给 Paged.js 的连续 HTML。
 * 根容器携带 .document-content + 字号/居中/缩进类与标题 CSS 变量，
 * Paged.js 跨页拆分时会保留这些类与内联样式。
 */
export function buildPagedContentHtml(
  blocks: DocumentBlock[],
  colors: ThemeColors,
  settings: PagedContentSettings,
  mermaidMap?: MermaidMap,
  onWarning?: (warning: string) => void,
): string {
  const firstHeadingId = blocks.find((b) => b.kind === 'heading')?.id

  const firstPagebreak = blocks.findIndex((b) => b.kind === 'pagebreak')
  const coverBlocks = firstPagebreak !== -1 ? blocks.slice(0, firstPagebreak) : []
  const hasCover = firstPagebreak !== -1 && isCoverBlocks(coverBlocks)

  const renderBlock = (block: DocumentBlock): string => {
    let inner = parseMarkdown(block.markdown, colors, undefined, mermaidMap, onWarning)
    if (block.kind === 'table') inner = normalizeTableHtml(inner)

    const classes = ['document-block']
    if (block.id === firstHeadingId) classes.push('document-title-block')
    if (block.kind === 'code' && block.markdown.split('\n').length < CODE_ATOMIC_MAX_LINES) {
      classes.push('document-code-atomic')
    }
    return `<section class="${classes.join(' ')}" data-kind="${block.kind}">${inner}</section>`
  }

  const bodyParts: string[] = []
  let startIndex = 0

  if (hasCover) {
    bodyParts.push(`<section class="document-cover">${coverBlocks.map(renderBlock).join('')}</section>`)
    startIndex = firstPagebreak + 1 // 跳过封面块与其后的第一个 pagebreak（由封面 break-after 承担）
  }

  for (let i = startIndex; i < blocks.length; i++) {
    const block = blocks[i]
    if (block.kind === 'pagebreak') {
      bodyParts.push('<div class="document-pagebreak"></div>')
      continue
    }
    bodyParts.push(renderBlock(block))
  }

  const rootClasses = [
    'document-content',
    `document-fontscale-${settings.fontScale}`,
  ]
  if (settings.centerTitle) rootClasses.push('document-center-title')
  if (settings.indentParagraph) rootClasses.push('document-indent-paragraph')

  const rootStyle = [
    `font-family:${getFontFamilyCss(settings.fontFamily)}`,
    `--document-title-line-height:${DOCUMENT_TITLE_LINE_HEIGHT}`,
    `--document-title-margin:${DOCUMENT_TITLE_MARGIN}`,
  ].join(';')

  return `<div class="${rootClasses.join(' ')}" style="${rootStyle}">${bodyParts.join('')}</div>`
}
