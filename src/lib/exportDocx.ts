/**
 * A4 文档 Word（.docx）导出模块
 * 基于 docx（dolanmiu/docx）库，从 DocumentBlock 模型直接构建 OOXML，
 * 不经过 Paged.js / iframe / PDF，导出通路完全独立于预览渲染管线。
 */

import type { DocumentBlock, DocumentSettings } from '@/modes/document/documentModel'
import { parseTableMarkdown } from '@/engine/utils/markdownParser'
import { downloadBlob } from './exportImage'
import { ensureMathJax } from '@engine/utils/mathRenderer'
import { ensureMermaid } from '@engine/utils/mermaidRenderer'
import { fetchImageBuffer, FetchSecurityError, FetchTimeoutError } from './fetchSafe'

// docx 库动态导入（避免影响首屏加载体积）
let docxModule: typeof import('docx') | null = null
async function getDocx() {
  if (!docxModule) docxModule = await import('docx')
  return docxModule
}

// ================================================================
// 常量映射
// ================================================================

/** 字体选项 → Word 字体名 */
const FONT_MAP: Record<string, { eastAsia: string; ascii: string; hAnsi: string }> = {
  songti:   { eastAsia: 'SimSun',    ascii: 'Times New Roman', hAnsi: 'Times New Roman' },
  fangsong: { eastAsia: 'FangSong',  ascii: 'Times New Roman', hAnsi: 'Times New Roman' },
  heiti:    { eastAsia: 'Microsoft YaHei', ascii: 'Microsoft YaHei', hAnsi: 'Microsoft YaHei' },
}

/**
 * 字号映射表（half-point 单位）
 * 换算公式：Math.round(px × 1.5)
 * 数据源自 index.css 中 .document-fontscale-{small,normal,large} 的 CSS 变量
 */
const FONT_SIZE: Record<string, { body: number; h1: number; h2: number; h3: number }> = {
  small:  { body: 20, h1: 33, h2: 27, h3: 24 },
  normal: { body: 23, h1: 39, h2: 30, h3: 26 },
  large:  { body: 26, h1: 45, h2: 35, h3: 29 },
}

/** 行高倍率（与 CSS --doc-line-height 一致） */
const LINE_HEIGHT_RATIO: Record<string, number> = {
  small: 1.8,
  normal: 1.9,
  large: 2.0,
}

// ================================================================
// 工具函数
// ================================================================

/** px → twip（基于 96dpi：1px = 15 twip） */
function pxToTwip(px: number): number {
  return Math.round(px * 15)
}

/** 获取字体配置 */
function getFont(family: string) {
  return FONT_MAP[family] ?? FONT_MAP.songti
}

/** 获取字号配置 */
function getSizes(scale: string) {
  return FONT_SIZE[scale] ?? FONT_SIZE.normal
}

/** 获取行高值（OOXML AUTO 模式，240 = 单倍行距） */
function getLineValue(scale: string) {
  return Math.round((LINE_HEIGHT_RATIO[scale] ?? 1.9) * 240)
}

/** 从 Markdown 标题中提取层级和纯文本 */
function parseHeading(markdown: string): { level: number; text: string } {
  const h = markdown.match(/^(#{1,6})\s+(.+)/)
  if (h) return { level: h[1].length, text: h[2] }

  // <title> 自定义标签 → h1
  const title = markdown.match(/^<title\b[^>]*>([\s\S]*?)<\/title>/)
  if (title) return { level: 1, text: title[1].replace(/<[^>]+>/g, '').trim() }

  // <p-title> 段落标题 → h3
  const pt = markdown.match(/^<p-title\b[^>]*>([\s\S]*?)<\/p-title>/)
  if (pt) return { level: 3, text: pt[1].replace(/<[^>]+>/g, '').trim() }

  return { level: 1, text: markdown }
}

/** 去除 Markdown 行内格式标记，返回纯文本 */
function stripInlineMarkup(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

// ================================================================
// 行内格式解析器
// ================================================================

/** 将 Markdown 行内格式解析为 TextRun 数组（支持公式图片嵌入） */
function parseInlineToRuns(
  md: string,
  font: ReturnType<typeof getFont>,
  sizeHp: number,
  color?: string,
  formulaMap?: FormulaMap,
): InstanceType<typeof import('docx').TextRun>[] {
  const { TextRun, ImageRun } = docxModule!
  const runs: any[] = []
  if (!md) return runs

  // 先按行内代码拆分（保护代码内容不被进一步解析）
  const codeParts = md.split(/(`[^`]+`)/g)

  for (const part of codeParts) {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const codeContent = part.slice(1, -1)
      // 如果是公式，渲染为矢量 SVG 图片嵌入（PNG fallback 兼容旧版 Word）
      if (formulaMap?.has(codeContent)) {
        const f = formulaMap.get(codeContent)!
        runs.push(new ImageRun({
          data: f.svgData,
          transformation: { width: f.width, height: f.height },
          type: 'svg',
          fallback: { type: 'png', data: f.pngData, transformation: { width: f.width, height: f.height } },
        } as any))
      } else {
        runs.push(new TextRun({
          text: codeContent,
          font: { ascii: 'Consolas', hAnsi: 'Consolas' },
          size: sizeHp,
          shading: { fill: 'EEF2FF' },
          ...(color ? { color } : {}),
        }))
      }
      continue
    }

    // 匹配 bold / italic / strike / link
    const re = /(\*\*(.+?)\*\*|__(.+?)__)|(\*(.+?)\*|_(.+?)_)|~~(.+?)~~|\[([^\]]+)\]\(([^)]+)\)/g
    let lastIndex = 0
    let m: RegExpExecArray | null

    while ((m = re.exec(part)) !== null) {
      if (m.index > lastIndex) {
        runs.push(new TextRun({ text: part.slice(lastIndex, m.index), font, size: sizeHp, ...(color ? { color } : {}) }))
      }

      if (m[2] || m[3]) {
        // bold
        runs.push(new TextRun({ text: m[2] ?? m[3], bold: true, font, size: sizeHp, ...(color ? { color } : {}) }))
      } else if (m[5] || m[6]) {
        // italic
        runs.push(new TextRun({ text: m[5] ?? m[6], italics: true, font, size: sizeHp, ...(color ? { color } : {}) }))
      } else if (m[7]) {
        // strike
        runs.push(new TextRun({ text: m[7], strike: true, font, size: sizeHp, ...(color ? { color } : {}) }))
      } else if (m[8] && m[9]) {
        // link
        runs.push(new TextRun({
          text: m[8],
          color: '2563EB',
          underline: { type: docxModule!.UnderlineType.SINGLE },
          font,
          size: sizeHp,
        }))
      }

      lastIndex = m.index + m[0].length
    }

    if (lastIndex < part.length) {
      runs.push(new TextRun({ text: part.slice(lastIndex), font, size: sizeHp, ...(color ? { color } : {}) }))
    }
  }

  return runs
}

// ================================================================
// 块转换器
// ================================================================

/** heading → docx Paragraph */
function convertHeading(
  block: DocumentBlock,
  settings: DocumentSettings,
  isDocumentTitle: boolean = false,
): InstanceType<typeof import('docx').Paragraph> {
  const { Paragraph, HeadingLevel, AlignmentType, TextRun } = docxModule!
  const { level, text } = parseHeading(block.markdown)
  const font = getFont(settings.fontFamily)
  const sizes = getSizes(settings.fontScale)
  const cleanText = stripInlineMarkup(text)

  const levelMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  }
  const sizeMap: Record<number, number> = { 1: sizes.h1, 2: sizes.h2, 3: sizes.h3 }

  // 仅文档大标题（首个 h1）居中，章节标题保持左对齐
  const isCentered = isDocumentTitle && level === 1

  return new Paragraph({
    heading: levelMap[level] ?? HeadingLevel.HEADING_3,
    alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: 240, after: 120, line: getLineValue(settings.fontScale), lineRule: 'auto' as any },
    children: [
      new TextRun({
        text: cleanText,
        font,
        size: sizeMap[level] ?? sizes.h3,
        bold: true,
        color: '111827',
      }),
    ],
  })
}

// ================================================================
// 公式渲染（LaTeX → MathJax SVG → docx 矢量 SVG + PNG fallback）
// 复用预览链路的 MathJax tex2svg，保证导出与预览视觉一致。
// 不再使用 KaTeX HTML + foreignObject 管线（foreignObject 会触发
// Canvas 安全污染，且 KaTeX webfont 异步加载导致快照时字体缺失）。
// ================================================================

interface FormulaInfo {
  /** 矢量 SVG 数据（docx ImageRun type:'svg' 使用） */
  svgData: ArrayBuffer
  /** PNG 位图回退（旧版 Word 不渲染 SVG 时使用） */
  pngData: ArrayBuffer
  width: number
  height: number
}
type FormulaMap = Map<string, FormulaInfo>

/**
 * 文档级公式缓存。
 * 一次性扫描整篇文档的所有公式并渲染，避免每个段落/列表重复调用 MathJax；
 * 同时把公式替换为内部占位符，解决行内代码与公式标记冲突的问题。
 */
export class FormulaCache {
  private map: FormulaMap = new Map()
  private pending: Array<{ latex: string; display: boolean; placeholder: string }> = []
  private blockCounter = 0
  private inlineCounter = 0

  register(latex: string, display: boolean): string {
    const placeholder = display
      ? `__BLOCK_FORMULA_${this.blockCounter++}__`
      : `__INLINE_FORMULA_${this.inlineCounter++}__`
    this.pending.push({ latex, display, placeholder })
    return placeholder
  }

  async renderAll() {
    for (const { latex, display, placeholder } of this.pending) {
      if (this.map.has(placeholder)) continue
      const info = await renderFormula(latex, display)
      if (info) this.map.set(placeholder, info)
    }
  }

  getFormulaMap(): FormulaMap {
    return this.map
  }
}

// ── 公式提取时保护代码区域，避免代码块/行内代码内的 $ 被误识别 ──
const CB_OPEN = '\uE002', CB_CLOSE = '\uE003'
const IC_OPEN = '\uE004', IC_CLOSE = '\uE005'

export function protectCodeRegions(md: string): { text: string; codes: string[] } {
  const codes: string[] = []
  let text = md.replace(/```[\s\S]*?```/g, (code) => {
    const i = codes.length
    codes.push(code)
    return `${CB_OPEN}${i}${CB_CLOSE}`
  })
  text = text.replace(/`[^`\n]+`/g, (code) => {
    const i = codes.length
    codes.push(code)
    return `${IC_OPEN}${i}${IC_CLOSE}`
  })
  return { text, codes }
}

export function restoreCodeRegions(text: string, codes: string[]): string {
  return text
    .replace(new RegExp(`${CB_OPEN}(\\d+)${CB_CLOSE}`, 'g'), (_, i) => codes[parseInt(i, 10)])
    .replace(new RegExp(`${IC_OPEN}(\\d+)${IC_CLOSE}`, 'g'), (_, i) => codes[parseInt(i, 10)])
}

/** 公式预处理：将 $/$$ 公式转为代码样式占位符，并注册到文档级缓存。 */
export function preprocessFormulasSafe(md: string, cache: FormulaCache): string {
  const { text, codes } = protectCodeRegions(md)
  let result = text

  result = result.replace(/\$\$\n?([\s\S]+?)\n?\$\$/g, (_m, latex: string) => {
    const placeholder = cache.register(latex.trim(), true)
    return '`' + placeholder + '`'
  })

  result = result.replace(/(?<![\w$])\$([^\n$]+?)\$(?![\w$])/g, (_m, latex: string) => {
    const placeholder = cache.register(latex.trim(), false)
    return '`' + placeholder + '`'
  })

  return restoreCodeRegions(result, codes)
}

/** MathJax 默认 1ex ≈ 6px（tex2svg 以 ex 为单位，需换算到 px 供 docx 使用） */
const MATHJAX_EX_PX = 6

/**
 * 用 MathJax tex2svg 渲染 LaTeX，产出：
 * - 自包含矢量 SVG（清理 assistive-mml、currentColor→#333、强制白底）
 * - PNG fallback（纯路径 SVG 转 Canvas，不触发安全污染）
 * 返回 svgData / pngData（ArrayBuffer）+ 像素尺寸。
 */
async function renderFormula(latex: string, displayMode: boolean): Promise<FormulaInfo | null> {
  try {
    const MathJax = window.MathJax
    if (!MathJax?.tex2svg) return null

    const node = MathJax.tex2svg(latex.trim(), { display: displayMode })
    const adaptor = MathJax.startup.adaptor
    if (!adaptor) return null

    // 移除无障碍 MathML（docx 只需视觉 SVG）
    const assistive = node.querySelector('mjx-assistive-mml')
    if (assistive) adaptor.remove(assistive)

    const svgEl = node.querySelector('svg')
    if (!svgEl) return null

    // ── 提取尺寸：ex 属性 → px ──
    const parseEx = (val: string | null): number => {
      if (!val) return 0
      const m = val.match(/([\d.]+)/)
      return m ? parseFloat(m[1]) * MATHJAX_EX_PX : 0
    }
    let w = parseEx(svgEl.getAttribute('width'))
    let h = parseEx(svgEl.getAttribute('height'))

    // 兆底 1：viewBox（MathJax 始终输出 viewBox）
    if (!w || !h) {
      const vb = svgEl.getAttribute('viewBox')
      if (vb) {
        const parts = vb.split(/\s+/).map(Number)
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          w = w || parts[2]
          h = h || parts[3]
        }
      }
    }

    // 兆底 2：getBBox（必须临时挂载到 DOM 才能返回正确值）
    if (!w || !h) {
      document.body.appendChild(node)
      try {
        const bbox = svgEl.getBBox?.()
        if (bbox && bbox.width > 0) { w = w || bbox.width; h = h || bbox.height }
      } finally {
        node.remove()
      }
    }
    if (!w || !h) return null

    // 行内公式按 display 模式微调：display 居中块级，inline 内联
    const displayStyle = displayMode
      ? 'display:block;margin:0 auto;'
      : 'display:inline;vertical-align:middle;'
    svgEl.setAttribute('style', `${displayStyle}background:#ffffff;`)

    let svgStr = adaptor.outerHTML(svgEl)
      .replace(/currentColor/g, '#333')
      .replace(/xlink:href/g, 'href')

    // 补全 SVG 命名空间（部分 outerHTML 缺失 xmlns）
    if (!/xmlns=/.test(svgStr)) {
      svgStr = svgStr.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    const svgData = new TextEncoder().encode(svgStr).buffer as ArrayBuffer

    // SVG → PNG fallback（纯路径 SVG，Canvas 不污染）
    const pngData = await svgToPng(svgStr, Math.ceil(w), Math.ceil(h))
    if (!pngData) return null

    return { svgData, pngData, width: Math.ceil(w), height: Math.ceil(h) }
  } catch {
    return null
  }
}

/** 把 SVG 字符串光栅化为 PNG ArrayBuffer（2x 超采样保证清晰度） */
async function svgToPng(svgStr: string, w: number, h: number): Promise<ArrayBuffer | null> {
  try {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('SVG image load failed'))
      i.src = url
    })

    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, w, h)
    URL.revokeObjectURL(url)

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        'image/png',
      )
    })
    return await pngBlob.arrayBuffer()
  } catch {
    return null
  }
}

/** paragraph → docx Paragraph */
async function convertParagraph(
  block: DocumentBlock,
  settings: DocumentSettings,
  formulaMap: FormulaMap,
): Promise<InstanceType<typeof import('docx').Paragraph>> {
  const { Paragraph, AlignmentType, ImageRun } = docxModule!
  const font = getFont(settings.fontFamily)
  const sizes = getSizes(settings.fontScale)

  // 检测整个段落是否仅为块级公式（markdown 已被预处理为占位符）
  const blockFormulaMatch = block.markdown.match(/^`\s*(__BLOCK_FORMULA_\d+__)\s*`$/)
  if (blockFormulaMatch) {
    const info = formulaMap.get(blockFormulaMatch[1])
    if (info) {
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 160 },
        children: [new ImageRun({
          data: info.svgData,
          transformation: { width: info.width, height: info.height },
          type: 'svg',
          fallback: { type: 'png', data: info.pngData, transformation: { width: info.width, height: info.height } },
        } as any)],
      })
    }
  }

  const indent: any = {}
  if (settings.indentParagraph) {
    // 2em 首行缩进：按字号换算（half-point ÷ 2 = pt，pt × 20 = twip，再 ×2 = 2em）
    indent.firstLine = sizes.body * 20
  }

  return new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { after: 120, line: getLineValue(settings.fontScale), lineRule: 'auto' as any },
    indent,
    children: parseInlineToRuns(block.markdown, font, sizes.body, '333333', formulaMap),
  })
}

/** quote → docx Paragraph */
function convertQuote(
  block: DocumentBlock,
  settings: DocumentSettings,
): InstanceType<typeof import('docx').Paragraph> {
  const { Paragraph, AlignmentType } = docxModule!
  const font = getFont(settings.fontFamily)
  const sizes = getSizes(settings.fontScale)
  const content = block.markdown.replace(/^>\s?/gm, '')

  return new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { before: 120, after: 120, line: getLineValue(settings.fontScale), lineRule: 'auto' as any },
    indent: { left: pxToTwip(24) },
    border: { left: { style: docxModule!.BorderStyle.SINGLE, size: 6, color: '9CA3AF', space: 8 } },
    shading: { fill: 'F9FAFB' },
    children: parseInlineToRuns(content, font, sizes.body, '333333'),
  })
}

/** code → docx Paragraph */
function convertCode(
  block: DocumentBlock,
  _settings: DocumentSettings,
): InstanceType<typeof import('docx').Paragraph> {
  const { Paragraph, TextRun, AlignmentType } = docxModule!
  const codeFont = { ascii: 'Consolas', hAnsi: 'Consolas', eastAsia: 'SimSun' }
  const lines = block.markdown.replace(/^```[\w]*\n?/, '').replace(/```$/, '').trimEnd()

  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 120 },
    indent: { left: pxToTwip(16) },
    shading: { fill: 'F3F4F6' },
    children: lines.split('\n').flatMap((line, i, arr) => {
      const runs: InstanceType<typeof TextRun>[] = [
        new TextRun({ text: line || ' ', font: codeFont, size: 20, color: '6B7280' }),
      ]
      if (i < arr.length - 1) runs.push(new TextRun({ break: 1 }))
      return runs
    }),
  })
}

/** list → docx Paragraph */
async function convertList(
  block: DocumentBlock,
  settings: DocumentSettings,
  formulaMap: FormulaMap,
): Promise<InstanceType<typeof import('docx').Paragraph>> {
  const { Paragraph, TextRun } = docxModule!
  const font = getFont(settings.fontFamily)
  const sizes = getSizes(settings.fontScale)
  const md = block.markdown

  // 计算缩进层级
  const indent = md.match(/^( *)/)?.[1].length ?? 0
  const level = Math.min(Math.floor(indent / 2), 2)

  // 待办清单复选框
  const checked = md.match(/^\s*[-*+]\s+\[([xX ])\]\s*(.*)/)
  if (checked) {
    const isChecked = checked[1].toLowerCase() === 'x'
    return new Paragraph({
      spacing: { after: 60, line: getLineValue(settings.fontScale), lineRule: 'auto' as any },
      indent: { left: pxToTwip(24) },
      children: [
        new TextRun({ text: isChecked ? '☑ ' : '☐ ', font, size: sizes.body, bold: true, color: isChecked ? '16A34A' : '9CA3AF' }),
        ...parseInlineToRuns(checked[2], font, sizes.body, '333333', formulaMap),
      ],
    })
  }

  const ul = md.match(/^\s*[-*+]\s+(.*)/)
  const ol = md.match(/^\s*(\d+)\.\s+(.*)/)

  if (ul) {
    return new Paragraph({
      numbering: { reference: 'unordered-list', level },
      spacing: { after: 60, line: getLineValue(settings.fontScale), lineRule: 'auto' as any },
      children: parseInlineToRuns(ul[1], font, sizes.body, '333333', formulaMap),
    })
  }

  if (ol) {
    return new Paragraph({
      numbering: { reference: 'ordered-list', level },
      spacing: { after: 60, line: getLineValue(settings.fontScale), lineRule: 'auto' as any },
      children: parseInlineToRuns(ol[2], font, sizes.body, '333333', formulaMap),
    })
  }

  // 兜底：作为普通段落
  return new Paragraph({
    spacing: { after: 60 },
    children: parseInlineToRuns(md, font, sizes.body, '333333', formulaMap),
  })
}

/** rule → docx Paragraph（水平分隔线） */
function convertRule(): InstanceType<typeof import('docx').Paragraph> {
  const { Paragraph } = docxModule!
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: docxModule!.BorderStyle.SINGLE, size: 1, color: 'CBD5E1', space: 1 } },
  })
}

// ================================================================
// 表格转换
// ================================================================

/** table → docx Table */
function convertTable(
  markdown: string,
  settings: DocumentSettings,
): InstanceType<typeof import('docx').Table> | null {
  const { Table, TableRow, TableCell, Paragraph, WidthType, BorderStyle, TableLayoutType, VerticalAlign } = docxModule!
  const tableData = parseTableMarkdown(markdown)
  if (!tableData) return null

  const font = getFont(settings.fontFamily)
  const bodySize = getSizes(settings.fontScale).body
  const colCount = tableData.headers.length
  const colWidthPct = Math.floor(100 / colCount)

  const border = { style: BorderStyle.SINGLE, size: 1, color: '9CA3AF' }
  const borders = { top: border, bottom: border, left: border, right: border }

  const makeCell = (
    text: string,
    isHeader: boolean,
  ): InstanceType<typeof TableCell> =>
    new TableCell({
      width: { size: colWidthPct, type: WidthType.PERCENTAGE },
      borders,
      verticalAlign: VerticalAlign.TOP,
      shading: isHeader ? { fill: 'F3F4F6' } : undefined,
      children: [
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: parseInlineToRuns(text, font, bodySize, '333333'),
        }),
      ],
    })

  // 表头行
  const headerRow = new TableRow({
    tableHeader: true,
    children: tableData.headers.map((h) => makeCell(h, true)),
  })

  // 数据行
  const dataRows = tableData.rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell) => makeCell(cell, false)),
      }),
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...dataRows],
  })
}

// ================================================================
// 图片嵌入
// ================================================================

/** 友好的错误提示 */
function formatImageError(url: string, err: unknown): string {
  if (err instanceof FetchSecurityError) {
    return `图片 URL 不安全，仅支持 http/https: ${url}`
  }
  if (err instanceof FetchTimeoutError) {
    return `获取图片超时: ${url}`
  }
  if (err instanceof Error) {
    return `获取图片失败: ${err.message}`
  }
  return `获取图片失败: ${url}`
}

/** image → docx Paragraph */
async function convertImage(
  markdown: string,
  settings: DocumentSettings,
): Promise<InstanceType<typeof import('docx').Paragraph>> {
  const { Paragraph, TextRun, ImageRun, AlignmentType } = docxModule!

  const imgMatch = markdown.match(/!\[([^\]]*)\]\(([^)]+)\)/)
  if (!imgMatch) return new Paragraph({ children: [] })

  const [, alt, src] = imgMatch
  const contentWidthPx = settings.pageWidth - settings.marginLeft - settings.marginRight

  try {
    const data = await fetchImageBuffer(src)

    // 通过 createImageBitmap 获取原始尺寸
    const blob = new Blob([data])
    const bmp = await createImageBitmap(blob)
    const { width: natW, height: natH } = bmp
    bmp.close()

    const maxW = contentWidthPx
    const scale = natW > maxW ? maxW / natW : 1
    const w = Math.round(natW * scale)
    const h = Math.round(natH * scale)

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [new ImageRun({ data, transformation: { width: w, height: h } } as any)],
    })
  } catch (err) {
    // 生产环境可替换为 Sentry 等埋点
    console.error(formatImageError(src, err))
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: `[图片: ${alt || src}]`, color: '9CA3AF', italics: true })],
    })
  }
}

/** mermaid → docx Paragraph（DOM 渲染 + modern-screenshot 截图嵌入） */
async function convertMermaid(
  markdown: string,
  settings: DocumentSettings,
): Promise<InstanceType<typeof import('docx').Paragraph>> {
  const { Paragraph, TextRun, ImageRun, AlignmentType } = docxModule!

  // 提取 mermaid 源码（去掉 ```mermaid 和 ``` 围栏）
  const sourceMatch = markdown.match(/```mermaid[ \t]*\r?\n([\s\S]*?)```/)
  if (!sourceMatch) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '[mermaid 图表]', color: '9CA3AF', italics: true })],
    })
  }
  const source = sourceMatch[1].replace(/\s+$/, '')

  const contentWidthPx = settings.pageWidth - settings.marginLeft - settings.marginRight

  try {
    const mermaid = await ensureMermaid()

    // 创建离屏容器（移到屏幕外，保持 visibility:visible 以确保截图工具能正常捕获内容）
    // 注意：不能用 visibility:hidden，否则 modern-screenshot 克隆节点时会复制该样式，导致截图空白
    const host = document.createElement('div')
    host.style.cssText =
      `position:fixed;left:-9999px;top:0;width:${contentWidthPx}px;` +
      `pointer-events:none;z-index:-1;overflow:hidden;background:#fff`
    document.body.appendChild(host)

    try {
      const id = `m2v-mermaid-${Math.random().toString(36).slice(2, 10)}`
      const { svg } = await mermaid.render(id, source, host)

      // 将 SVG 注入容器
      host.innerHTML = svg
      const svgEl = host.querySelector('svg')
      if (svgEl) {
        // 保留 viewBox + width/height，只用 CSS 约束不超出容器
        // 注意：不能 removeAttribute('width')，否则 SVG 无固有尺寸，容器高度为 0 → 截图空白
        svgEl.setAttribute(
          'style',
          'max-width:100%;height:auto;display:block;margin:0 auto;',
        )
      }

      // 等待两帧确保 SVG 布局完成
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

      // 用 modern-screenshot 直接截取 DOM → PNG（已验证的可靠方案）
      const { domToBlob } = await import('modern-screenshot')
      const rect = host.getBoundingClientRect()
      const w = Math.ceil(rect.width) || contentWidthPx
      const h = Math.ceil(rect.height) || Math.round(contentWidthPx * 0.6)

      const blob = await domToBlob(host, {
        scale: 2,
        type: 'image/png',
        backgroundColor: '#ffffff',
        width: w,
        height: h,
        fetch: { requestInit: { cache: 'force-cache' } },
      })
      if (!blob) throw new Error('截图失败')

      const pngData = await blob.arrayBuffer()

      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [new ImageRun({ data: pngData, transformation: { width: w, height: h } } as any)],
      })
    } finally {
      host.remove()
    }
  } catch (e) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: `[mermaid 图表渲染失败: ${(e as Error).message}]`, color: '9CA3AF', italics: true })],
    })
  }
}

// ================================================================
// 页眉 / 页脚
// ================================================================

function buildHeader(
  left: string,
  right: string,
  contentWidthTwip: number,
): InstanceType<typeof import('docx').Header> {
  const { Header, Paragraph, TextRun, TabStopType } = docxModule!
  const parts: InstanceType<typeof TextRun>[] = []

  if (left) parts.push(new TextRun({ text: left, size: 18, color: '64748B' }))
  if (right) {
    parts.push(new TextRun({ children: [new (docxModule!.Tab)()], size: 18, color: '64748B' }))
    parts.push(new TextRun({ text: right, size: 18, color: '64748B' }))
  }

  return new Header({
    children: [
      new Paragraph({
        children: parts,
        tabStops: right ? [{ type: TabStopType.RIGHT, position: contentWidthTwip }] : undefined,
        border: { bottom: { style: docxModule!.BorderStyle.SINGLE, size: 1, color: 'CBD5E1', space: 4 } },
      }),
    ],
  })
}

/**
 * 解析 footerText 模板（如 "第 {page} / {total} 页"），
 * 将 {page} 替换为 PageNumber.CURRENT，{total} 替换为 PageNumber.TOTAL_PAGES。
 */
function buildFooter(
  footerText: string,
  font: ReturnType<typeof getFont>,
): InstanceType<typeof import('docx').Footer> {
  const { Footer, Paragraph, TextRun, AlignmentType, PageNumber } = docxModule!
  const children: any[] = []
  let remaining = footerText

  while (remaining.length > 0) {
    const pi = remaining.indexOf('{page}')
    const ti = remaining.indexOf('{total}')
    if (pi === -1 && ti === -1) {
      if (remaining) children.push(new TextRun({ text: remaining, font, size: 18, color: '64748B' }))
      break
    }

    const idxs = [
      pi >= 0 ? { i: pi, l: 6, t: 'page' as const } : null,
      ti >= 0 ? { i: ti, l: 7, t: 'total' as const } : null,
    ]
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.i - b.i)

    const first = idxs[0]
    if (first.i > 0) {
      children.push(new TextRun({ text: remaining.slice(0, first.i), font, size: 18, color: '64748B' }))
    }
    children.push(first.t === 'page' ? PageNumber.CURRENT : PageNumber.TOTAL_PAGES)
    remaining = remaining.slice(first.i + first.l)
  }

  return new Footer({
    children: [new Paragraph({ children, alignment: AlignmentType.CENTER })],
  })
}

// ================================================================
// 主构建器
// ================================================================

async function buildDocument(
  blocks: DocumentBlock[],
  settings: DocumentSettings,
): Promise<InstanceType<typeof import('docx').Document>> {
  const {
    Document, Paragraph, TextRun, PageBreak,
    convertMillimetersToTwip, AlignmentType,
  } = docxModule!

  const font = getFont(settings.fontFamily)
  const sizes = getSizes(settings.fontScale)

  // --- 页面尺寸与页边距 ---
  const page = {
    size: {
      width: convertMillimetersToTwip(210),
      height: convertMillimetersToTwip(297),
    },
    margin: {
      top: pxToTwip(settings.marginTop),
      right: pxToTwip(settings.marginRight),
      bottom: pxToTwip(settings.marginBottom),
      left: pxToTwip(settings.marginLeft),
    },
  }

  const contentWidthTwip =
    convertMillimetersToTwip(210) -
    pxToTwip(settings.marginLeft) -
    pxToTwip(settings.marginRight)

  // --- 文档级公式缓存：一次性扫描、渲染整篇文档的公式 ---
  const formulaCache = new FormulaCache()
  const preprocessedBlocks = blocks.map((b) => ({
    ...b,
    markdown: preprocessFormulasSafe(b.markdown, formulaCache),
  }))
  await formulaCache.renderAll()
  const formulaMap = formulaCache.getFormulaMap()

  // --- 检测封面页（基于原始 blocks，封面页检测不依赖公式预处理） ---
  const firstPbIdx = blocks.findIndex((b) => b.kind === 'pagebreak')
  const hasCover =
    firstPbIdx !== -1 &&
    blocks
      .slice(0, firstPbIdx)
      .every((b) => b.kind === 'heading' || b.kind === 'paragraph' || b.kind === 'table') &&
    blocks.slice(0, firstPbIdx).filter((b) => b.kind === 'heading').length === 1

  // --- 块 → docx 段落转换 ---
  const convertBlock = async (block: DocumentBlock, isDocumentTitle = false) => {
    switch (block.kind) {
      case 'heading':   return [convertHeading(block, settings, isDocumentTitle)]
      case 'paragraph': return [await convertParagraph(block, settings, formulaMap)]
      case 'quote':     return [convertQuote(block, settings)]
      case 'code':      return [convertCode(block, settings)]
      case 'list':      return [await convertList(block, settings, formulaMap)]
      case 'rule':      return [convertRule()]
      case 'image':     return [await convertImage(block.markdown, settings)]
      case 'mermaid':   return [await convertMermaid(block.markdown, settings)]
      case 'table': {
        const t = convertTable(block.markdown, settings)
        if (t) {
          // 表格前后增加间距，避免与正文紧贴
          const spacerBefore = new Paragraph({ spacing: { before: 160, after: 0 }, children: [] })
          const spacerAfter = new Paragraph({ spacing: { before: 0, after: 160 }, children: [] })
          return [spacerBefore, t, spacerAfter]
        }
        return [new Paragraph({ children: [new TextRun({ text: block.markdown, font, size: sizes.body })] })]
      }
      default:
        return [new Paragraph({ children: [new TextRun({ text: block.markdown, font, size: sizes.body })] })]
    }
  }

  // --- 构建 sections ---
  const sections: any[] = []
  const emptyHeader = new (docxModule!.Header)({ children: [new Paragraph('')] })
  const emptyFooter = new (docxModule!.Footer)({ children: [new Paragraph('')] })

  if (hasCover && firstPbIdx >= 0) {
    // 封面页 section（无页眉页脚）
    const coverBlocks = preprocessedBlocks.slice(0, firstPbIdx)
    const coverChildren: any[] = []
    let isFirstCoverHeading = true
    for (let ci = 0; ci < coverBlocks.length; ci++) {
      const b = coverBlocks[ci]
      const next = coverBlocks[ci + 1]
      if (isFirstCoverHeading && b.kind === 'heading') {
        // 封面标题下推至页面约 35% 处，营造专业封面布局
        coverChildren.push(
          new Paragraph({ spacing: { before: 4800 }, children: [] }),
        )
        coverChildren.push(...(await convertBlock(b, true)))
        // 若封面标题后紧跟表格，插入间距
        if (next?.kind === 'table') {
          coverChildren.push(new Paragraph({ spacing: { before: 600 }, children: [] }))
        }
        isFirstCoverHeading = false
      } else {
        coverChildren.push(...(await convertBlock(b)))
      }
    }
    sections.push({
      properties: { page: { ...page }, titlePage: true },
      headers: { first: emptyHeader },
      footers: { first: emptyFooter },
      children: coverChildren,
    })

    // 正文 section
    const mainBlocks = preprocessedBlocks.slice(firstPbIdx + 1)
    const mainChildren: any[] = []
    let firstMainHeadingSeen = false
    for (const b of mainBlocks) {
      if (b.kind === 'pagebreak') {
        mainChildren.push(new Paragraph({ children: [new PageBreak()] }))
        continue
      }
      const isDocTitle = !firstMainHeadingSeen && b.kind === 'heading'
      if (isDocTitle) firstMainHeadingSeen = true
      mainChildren.push(...(await convertBlock(b, isDocTitle)))
    }
    sections.push({
      properties: { page },
      headers: { default: buildHeader(settings.headerLeft, settings.headerRight, contentWidthTwip) },
      footers: { default: buildFooter(settings.footerText, font) },
      children: mainChildren,
    })
  } else {
    // 单一 section（含页眉页脚）
    const children: any[] = []
    let firstHeadingSeen = false
    for (const b of preprocessedBlocks) {
      if (b.kind === 'pagebreak') {
        children.push(new Paragraph({ children: [new PageBreak()] }))
        continue
      }
      const isDocTitle = !firstHeadingSeen && b.kind === 'heading'
      if (isDocTitle) firstHeadingSeen = true
      children.push(...(await convertBlock(b, isDocTitle)))
    }
    sections.push({
      properties: { page },
      headers: { default: buildHeader(settings.headerLeft, settings.headerRight, contentWidthTwip) },
      footers: { default: buildFooter(settings.footerText, font) },
      children,
    })
  }

  return new Document({
    numbering: {
      config: [
        {
          reference: 'unordered-list',
          levels: [
            { level: 0, format: docxModule!.LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: pxToTwip(36), hanging: pxToTwip(18) } } } },
            { level: 1, format: docxModule!.LevelFormat.BULLET, text: '\u25E6', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: pxToTwip(72), hanging: pxToTwip(18) } } } },
            { level: 2, format: docxModule!.LevelFormat.BULLET, text: '\u25AA', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: pxToTwip(108), hanging: pxToTwip(18) } } } },
          ],
        },
        {
          reference: 'ordered-list',
          levels: [
            { level: 0, format: docxModule!.LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: pxToTwip(36), hanging: pxToTwip(18) } } } },
            { level: 1, format: docxModule!.LevelFormat.LOWER_LETTER, text: '%2)', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: pxToTwip(72), hanging: pxToTwip(18) } } } },
            { level: 2, format: docxModule!.LevelFormat.LOWER_ROMAN, text: '%3.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: pxToTwip(108), hanging: pxToTwip(18) } } } },
          ],
        },
      ],
    },
    sections,
  })
}

// ================================================================
// 导出入口
// ================================================================

/**
 * 将 A4 文档导出为 Word（.docx）文件。
 * 动态导入 docx 库，确保不影响首屏加载体积。
 * 公式渲染依赖 MathJax（与预览同源 CDN）：联网时输出矢量 SVG，断网则降级为 LaTeX 文本。
 */
export async function exportToDocx(
  blocks: DocumentBlock[],
  settings: DocumentSettings,
  filename: string,
): Promise<string> {
  await getDocx()

  // 预加载 MathJax（5s 超时）；失败不阻断导出，公式将降级为 LaTeX 文本
  let mathJaxReady = false
  try {
    await Promise.race([
      ensureMathJax(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ])
    mathJaxReady = true
  } catch {
    mathJaxReady = false
  }

  // 预加载 Mermaid（5s 超时）；失败不阻断导出，图表将降级为文本提示
  let mermaidReady = false
  try {
    await Promise.race([
      ensureMermaid(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ])
    mermaidReady = true
  } catch {
    mermaidReady = false
  }

  const doc = await buildDocument(blocks, settings)
  const blob = await docxModule!.Packer.toBlob(doc)
  downloadBlob(blob, filename)

  // 检测文档是否含公式/图表，给出针对性提示
  const hasFormula = blocks.some((b) => /\$\$|(?<!\w)\$[^\n$]+\$(?!\w)/.test(b.markdown))
  const hasMermaid = blocks.some((b) => b.kind === 'mermaid')
  if (!mathJaxReady && hasFormula) {
    return '已导出 Word 文档（公式渲染需联网，本次已降级为 LaTeX 文本）'
  }
  if (!mermaidReady && hasMermaid) {
    return '已导出 Word 文档（mermaid 图表渲染需联网，本次已降级为文本提示）'
  }
  return '已导出 Word 文档'
}
