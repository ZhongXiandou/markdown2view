import type { DocumentBlockKind } from './types'

/**
 * 根据 block 内容判断其类型（heading/image/table/code/...）。
 *
 * 正则模式统一，各模式共享。返回 DocumentBlockKind 类型标签。
 */
export function classifyBlock(markdown: string): DocumentBlockKind {
  const text = markdown.trim()
  if (/^<page-break\s*\/?>/i.test(text)) return 'pagebreak'
  if (/^#{1,6}\s/.test(text) || /^<title\b/.test(text) || /^<p-title\b/.test(text)) return 'heading'
  // mermaid 代码块优先于普通 code 判定（同样是围栏，但语义不同）
  if (/^```mermaid\b/.test(text)) return 'mermaid'
  if (/^```/.test(text)) return 'code'
  if (/^!\[/.test(text)) return 'image'
  if (/^>/.test(text)) return 'quote'
  if (/^([-*+]\s|\d+\.\s)/.test(text)) return 'list'
  if (/^---+$/.test(text)) return 'rule'
  if (text.includes('|') && /\n\|?[\s:-]+\|/.test(text)) return 'table'
  if (/^<\w[\s\S]*<\/\w/.test(text)) return 'component'
  return 'paragraph'
}
