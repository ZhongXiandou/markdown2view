/**
 * Markdown 块类型与共享接口。
 *
 * A4 文档和卡片模式共用此类型定义，长图文模式不使用（走 CodeMirror 解析）。
 */
export type DocumentBlockKind =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'table'
  | 'code'
  | 'mermaid'
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
