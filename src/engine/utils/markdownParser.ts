import type { ThemeColors } from '../composables/useTheme'
import { leaf, esc, parseAttrs } from './helpers'
import { extractMath, restoreMath } from './math'
import { protectCode, restoreCode } from './codeProtect'
import { renderMath } from './mathRenderer'
import { renderMermaidDiagram } from './mermaidRenderer'
import { renderFrontMatter } from './components'
import { createDefaultBlockRenderers, type BlockRenderContext } from './blockRenderRegistry'
import { color, fontSize, fontWeight, lineHeight, spacing } from '../tokens'

/**
 * 收集 md 中所有公式（去重），按 inline/block 分类返回，用于预渲染。
 */
export function collectFormulas(md: string): Array<{ formula: string; display: boolean }> {
  const seen = new Set<string>()
  const result: Array<{ formula: string; display: boolean }> = []

  // 删除代码块（围栏 + 行内），避免其中的 $ / $$ 被误判为公式分隔符
  const cleaned = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')

  // 行内公式 $...$
  const inlineRe = /(?<!\$)(?<!\d)\$(?!\d)([^\$]+?)\$(?!\$|[\w])/g
  let m: RegExpExecArray | null
  while ((m = inlineRe.exec(cleaned)) !== null) {
    const f = m[1].trim()
    const key = `i:${f}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push({ formula: f, display: false })
    }
  }

  // 块级公式 $$...$$ （单行和多行）
  const blockRe = /\$\$([\s\S]+?)\$\$/g
  while ((m = blockRe.exec(cleaned)) !== null) {
    // 跳过空行 $$ $$ 前面的 $$
    if (m[0] === '$$') continue
    const f = m[1].trim()
    if (!f) continue
    const key = `b:${f}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push({ formula: f, display: true })
    }
  }

  return result
}

/**
 * 批量预渲染公式为 SVG。
 */
export async function preRenderFormulas(
  formulas: Array<{ formula: string; display: boolean }>,
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const results = await Promise.all(
    formulas.map(async (f) => {
      const prefix = f.display ? 'b' : 'i'
      const svg = await renderMath(f.formula, f.display)
      return { key: `${prefix}:${f.formula}`, svg }
    }),
  )
  for (const { key, svg } of results) {
    map.set(key, svg)
  }
  return map
}

/**
 * 收集 md 中所有 mermaid 代码块源码（按内容去重），用于预渲染。
 * 与 collectFormulas 同构。key 格式：`m:${source}`。
 */
export function collectMermaidDiagrams(md: string): Array<{ key: string; source: string }> {
  const seen = new Set<string>()
  const result: Array<{ key: string; source: string }> = []
  // 匹配 ```mermaid 围栏（支持 ```mermaid 后跟空格/换行）
  const re = /```mermaid[ \t]*\r?\n([\s\S]*?)```/g
  let m: RegExpExecArray | null
  while ((m = re.exec(md)) !== null) {
    const source = m[1].replace(/\s+$/, '')
    const key = `m:${source}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push({ key, source })
    }
  }
  return result
}

/**
 * 批量预渲染 mermaid 源码为 SVG。
 * @returns Map<key, { svg, error? }>。失败项 svg 为空字符串、error 非空。
 */
export async function preRenderMermaid(
  diagrams: Array<{ key: string; source: string }>,
  containerWidth: number,
): Promise<Map<string, { svg: string; error?: string }>> {
  const map = new Map<string, { svg: string; error?: string }>()
  const results = await Promise.all(
    diagrams.map(async (d) => {
      const r = await renderMermaidDiagram(d.source, containerWidth)
      return { key: d.key, ...r }
    }),
  )
  for (const { key, svg, error } of results) {
    map.set(key, { svg, error })
  }
  return map
}

/**
 * 一步完成：收集公式 → 预渲染 → 解析。
 * 推荐所有 caller 使用这个入口。
 */
export async function parseMarkdownAsync(
  md: string,
  t: ThemeColors,
  containerWidth = 578,
  onWarning?: (warning: string) => void,
): Promise<string> {
  const formulas = collectFormulas(md)
  const formulaMap = formulas.length > 0 ? await preRenderFormulas(formulas) : undefined
  const diagrams = collectMermaidDiagrams(md)
  const mermaidMap =
    diagrams.length > 0 ? await preRenderMermaid(diagrams, containerWidth) : undefined
  return parseMarkdown(md, t, formulaMap, mermaidMap, onWarning)
}

export function parseMarkdown(
  md: string,
  t: ThemeColors,
  formulaMap?: Map<string, string>,
  mermaidMap?: Map<string, { svg: string; error?: string }>,
  onWarning?: (warning: string) => void,
): string {
  // 1. 先保护代码区域，避免公式/脚注替换侵入代码块/行内代码
  const { text: mdWithoutCode, store: codeStore } = protectCode(md)

  // 双引擎逻辑：若传入了 formulaMap（MathJax 模式），则不采用 KaTeX 抽取
  const isKaTeX = !formulaMap
  const { text: processedMdText, store: mathStore } = isKaTeX 
    ? extractMath(mdWithoutCode) 
    : { text: mdWithoutCode, store: null }

  // 收集脚注：[text](url "desc") 带引号标题的链接 → 脚注
  const footnotes: { label: string; url: string; desc: string }[] = []
  const footnoteRegex = /\[([^\]]+)\]\(([^)\s]+)\s+"([^"]+)"\)/g
  const processedMd = processedMdText.replace(footnoteRegex, (_match, _label, url, desc) => {
    // 检查是否已存在相同的脚注（根据 url 和 desc 判断）
    const existing = footnotes.findIndex((f) => f.url === url && f.desc === desc)
    let num: number
    if (existing >= 0) {
      // 已存在，复用序号
      num = existing + 1
    } else {
      // 新脚注，分配新序号
      num = footnotes.length + 1
      footnotes.push({ label: _label, url, desc })
    }
    return `__FN_${num - 1}__|${_label}|`
  })

  const lines = processedMd.split('\n')
  const parts: string[] = []
  let i = 0

  // front-matter
  if (lines[0] && lines[0].trim() === '---') {
    const closingIndex = lines.findIndex((l, idx) => idx > 0 && l.trim() === '---')
    if (closingIndex > 0) {
      i = 1
      const meta: Record<string, string> = {}
      while (i < lines.length && lines[i].trim() !== '---') {
        const m = lines[i].match(/^(\w+):\s*(Meta.+|.+)/)
        const finalMatch = m || lines[i].match(/^(\w+):\s*(.+)/)
        if (finalMatch) meta[finalMatch[1]] = finalMatch[2].trim()
        i++
      }
      i++
      parts.push(renderFrontMatter(meta, md, t))
    }
  }

  // 收集 p-title level1（用于 <reading-path> 标签）
  const pTitleLevel1List: { num: string; title: string; subtitle: string }[] = []
  for (let j = 0; j < lines.length; j++) {
    // 匹配 <p-title ...> 标签
    const ptMatch = lines[j].match(/^<p-title\b([^>]*)>([\s\S]*?)<\/p-title>/)
    if (ptMatch) {
      const attrs = parseAttrs(ptMatch[1])
      const level = parseInt(attrs.level || '1', 10)
      if (level === 1) {
        const num = attrs.num || ''
        const title = attrs.title || ptMatch[2].trim()
        const subtitle = attrs.subtitle || ''
        pTitleLevel1List.push({ num, title, subtitle })
      }
    }
  }

  const renderers = createDefaultBlockRenderers()
  const ctx: BlockRenderContext = { t, md, formulaMap, mermaidMap, pTitleLevel1List }

  while (i < lines.length) {
    const line = lines[i]
    let handled = false

    for (const renderer of renderers) {
      if (renderer.match(line, lines, i)) {
        const result = renderer.render(ctx, line, lines, i)
        if (result) {
          parts.push(result.html)
          i = result.next
          handled = true
          if (result.warning && onWarning) {
            onWarning(result.warning)
          }
          break
        }
      }
    }

    if (!handled) {
      i++
    }
  }

  let html = parts.join('')

  if (footnotes.length > 0) {
    const fnParts: string[] = []
    fnParts.push(`<section style="margin:${spacing[13]} 0px 0px;padding-top:${spacing[8]};border-top:1px solid ${t.border}">`)
    fnParts.push(`<h2 style="margin:0px 0px ${spacing[7]};font-size:${fontSize['3xl']};font-weight:${fontWeight.bold};color:${color.textPrimary};line-height:${lineHeight.normal}">参考资料</h2>`)
    fnParts.push(`<section style="font-size:${fontSize.md};color:${color.inkMuted};line-height:${lineHeight.loosest}">`)
    footnotes.forEach((fn, idx) => {
      fnParts.push(`<p style="margin:${spacing[2]} 0px"><span style="color:${t.accent};font-weight:${fontWeight.semibold}">[${idx + 1}]</span> ${leaf(fn.desc)}：<a href="${esc(fn.url)}" style="color:${t.accent};word-break:break-all">${esc(fn.url)}</a></p>`)
    })
    fnParts.push(`</section></section>`)
    html += fnParts.join('')
  }

  // 回填数学公式的 KaTeX HTML（仅在 KaTeX 模式下生效）
  if (mathStore) {
    html = restoreMath(html, mathStore)
  }
  // 回填代码区域（块级/行内代码）
  html = restoreCode(html, codeStore)
  return html
}

export interface TableData {
  headers: string[]
  rows: string[][]
  caption?: string
  rawMarkdown: string
  colChars?: number[]
}

export function parseTableMarkdown(markdown: string): TableData | null {
  const lines = markdown.split('\n').filter(line => line.trim())
  
  // 查找表头行（包含 | 的行）
  let headerIndex = -1
  let separatorIndex = -1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.includes('|')) {
      if (headerIndex === -1) {
        headerIndex = i
      } else if (/^[\|\s:-]+$/.test(line)) {
        separatorIndex = i
        break
      }
    }
  }
  
  if (headerIndex === -1 || separatorIndex === -1) return null
  
  const parseRow = (rowStr: string) => {
    let s = rowStr.trim()
    if (s.startsWith('|')) s = s.substring(1)
    if (s.endsWith('|')) s = s.substring(0, s.length - 1)
    return s.split('|').map(x => x.trim())
  }

  // 解析表头
  const headers = parseRow(lines[headerIndex])
  
  // 解析数据行
  const rows: string[][] = []
  for (let i = separatorIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.includes('|')) {
      rows.push(parseRow(line))
    }
  }
  
  // 提取前面的内容作为 caption（比如 "表 1：xxx"）
  const captionLines = lines.slice(0, headerIndex).join('\n').trim()
  
  // 智能估算每列的相对宽度（模拟 table-layout: auto）
  const maxChars = Array(headers.length).fill(2)
  const calcLen = (s: string) => s.trim().replace(/[^\x00-\xff]/g, 'aa').length / 2
  
  headers.forEach((h, i) => {
    maxChars[i] = Math.max(maxChars[i], calcLen(h))
  })
  rows.forEach(row => {
    row.forEach((cell, i) => {
      if (i < headers.length) {
        maxChars[i] = Math.max(maxChars[i], calcLen(cell))
      }
    })
  })
  
  const totalChars = maxChars.reduce((a, b) => a + b, 0)
  const totalAvailableChars = 46 // 约 650px 宽度能容纳的基准中文字符数
  const colChars = maxChars.map(chars => Math.max(3, Math.floor((chars / totalChars) * totalAvailableChars)))
  
  return {
    headers,
    rows,
    caption: captionLines ? captionLines : undefined,
    rawMarkdown: markdown,
    colChars
  }
}

export function estimateTableRowHeight(row: string[], isHeader: boolean = false, colChars?: number[]): number {
  // 基础行高
  const baseHeight = isHeader ? 46 : 42
  let maxLines = 1
  row.forEach((cell, i) => {
    // 如果有智能列宽估算则使用，否则默认 18 字符
    const charsPerLine = colChars && colChars[i] ? colChars[i] : 18
    const cellLen = cell.trim().replace(/[^\x00-\xff]/g, 'aa').length / 2
    // 考虑到标点符号避头尾和英文单词不截断，实际能利用的宽度打个 85% 的折扣
    const effectiveChars = Math.max(1, charsPerLine * 0.85)
    maxLines = Math.max(maxLines, Math.ceil(cellLen / effectiveChars))
  })
  return baseHeight + (maxLines - 1) * 24
}

export function estimateTableHeight(tableData: TableData): number {
  let height = estimateTableRowHeight(tableData.headers, true, tableData.colChars)
  for (const row of tableData.rows) {
    height += estimateTableRowHeight(row, false, tableData.colChars)
  }
  height += 60 // 30px margin top + 30px margin bottom
  return height
}
