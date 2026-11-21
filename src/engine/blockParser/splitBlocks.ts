import { classifyBlock } from './classifyBlock'

/**
 * 将 Markdown 字符串拆分为语义块（block）。
 *
 * 职责：归一化换行 → 识别代码围栏 → 识别开标签 → 识别分页标记 → 空行 flush
 *
 * 各模式差异：
 * - A4 文档：调用后还需 mergeCaptionBlocks() 处理题注合并
 * - 卡片：直接使用拆分结果
 * - 长图文：不使用此模块（走 CodeMirror 解析）
 */
export function splitMarkdownBlocks(markdown: string): string[] {
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

    if (!inFence && /^<page-break\s*\/?>/i.test(trimmed)) {
      flush()
      initialBlocks.push(trimmed)
      continue
    }

    if (!inFence && !openTag && !trimmed) {
      flush()
      continue
    }

    current.push(line)
    if (openTag && trimmed.includes(`</${openTag}>`)) openTag = null
  }

  flush()

  // 列表项拆分：每个顶层列表项作为独立块；缩进的子项随父项留在同一块内（保留缩进即嵌套层级）
  const rawBlocks: string[] = []
  for (const block of initialBlocks) {
    if (/^([-*+]\s|\d+\.\s)/.test(block) && !/^---+$/.test(block)) {
      const lines = block.split('\n')
      let currentItem = ''
      for (const line of lines) {
        if (/^([-*+]\s|\d+\.\s)/.test(line)) {
          if (currentItem) rawBlocks.push(currentItem.trimEnd())
          currentItem = line
        } else {
          currentItem += '\n' + line
        }
      }
      if (currentItem) rawBlocks.push(currentItem.trimEnd())
    } else {
      rawBlocks.push(block)
    }
  }

  return rawBlocks
}

// === 题注合并（仅 A4 文档模式使用） ===

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

/**
 * 合并题注块与其关联的内容块（表格/图片）。
 * - 表题注（"表1: xxx"）后紧跟 table → 合并为一个块
 * - 图片块后紧跟图题注（"图1: xxx"） → 合并为一个块
 */
export function mergeCaptionBlocks(blocks: string[]): string[] {
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
