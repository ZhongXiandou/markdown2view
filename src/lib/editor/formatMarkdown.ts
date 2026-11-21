import { components } from '@engine'

/**
 * 编辑器「格式化文档」的纯逻辑实现（不依赖 DOM / CodeMirror）。
 * 思路参考 r-markdown 上游的 markdownFormatter.ts，但只保留对本项目确定安全的规则：
 *
 * 1. 组件标签行去缩进 —— 渲染器用行首锚定的正则识别组件（如 /^<steps\b/），标签一旦带前导空格
 *    就识别不到：轻则组件退化成段落，重则闭标签等不到、后文被吞。AI 生成的内容最常踩这个坑。
 * 2. 顶层块级组件与分页符前后各留一个空行。
 * 3. 清除行尾空白，连续空行收敛为一个。
 * 4. 未闭合的代码围栏补上闭合行 —— 否则围栏之后的全文都会被当成代码。
 * 5. 去掉首尾空行，结尾恰好一个换行。
 *
 * 明确不碰：代码围栏内部、组件内部的空行、标题与列表的写法（`#话题` 这类文字补空格会变成标题）、
 * 段首空格（A4 文档模式会保留它）。
 */

/** 块级组件标签：取自引擎的组件注册表，新增组件时无需改这里 */
const BLOCK_TAGS = Array.from(new Set(components.map((c) => c.tag))).filter((tag) => tag !== 'img')
/** 参与「行首锚定」判断的全部标签：块级组件 + 对比卡的左右栏 + 分页符 */
const ANCHORED_TAGS = [...BLOCK_TAGS, 'left', 'right', 'page-break']

const BLOCK_ALT = BLOCK_TAGS.join('|')
const INDENTED_TAG_RE = new RegExp(`^[ \\t]+<\\/?(?:${ANCHORED_TAGS.join('|')})\\b`)
const BLOCK_OPEN_RE = new RegExp(`^<(?:${BLOCK_ALT})\\b`)
const BLOCK_CLOSE_RE = new RegExp(`^</(?:${BLOCK_ALT})>\\s*$`)
const PAGE_BREAK_RE = /^<page-break\s*\/?>\s*$/i

/** 空的引用标记行（`>` 或 `> `）：清行尾空白时要保住那个空格，避免多行引用在解析时断开 */
const BARE_QUOTE_RE = /^>[ \t]*$/

export interface FormatStats {
  /** 去掉前导空白的组件标签行数 */
  deindented: number
  /** 为块级组件补的空行数 */
  blankInserted: number
  /** 收敛掉的连续空行数 */
  blankCollapsed: number
  /** 清掉行尾空白的行数 */
  trailingSpaces: number
  /** 自动补上的围栏闭合行数 */
  fencesClosed: number
}

export interface FormatResult {
  text: string
  stats: FormatStats
  /** 内容是否真的变了；false 表示本来就已经是规范格式 */
  changed: boolean
}

/** 开标签是否在同一行就闭合（`<p-title …></p-title>`、`<reading-path />`） */
function closesOnSameLine(line: string): boolean {
  return /\/>\s*$/.test(line) || /<\/[a-zA-Z][\w-]*>\s*$/.test(line)
}

/** 格式化 Markdown 全文。幂等：对已规范的内容再跑一次返回 changed: false。 */
export function formatMarkdown(md: string): FormatResult {
  const stats: FormatStats = { deindented: 0, blankInserted: 0, blankCollapsed: 0, trailingSpaces: 0, fencesClosed: 0 }
  const out: string[] = []

  /** 当前代码围栏的反引号数量，0 表示不在围栏内 */
  let fenceLen = 0
  /** 块级组件嵌套深度：只有顶层的进出才管空行 */
  let blockDepth = 0
  /** 顶层块刚结束，下一个非空行之前要补一个空行 */
  let pendingBlank = false

  const lastIsBlank = () => out.length > 0 && out[out.length - 1] === ''
  const ensureBlankBefore = () => {
    if (out.length === 0 || lastIsBlank()) return
    out.push('')
    stats.blankInserted++
  }
  const settlePendingBlank = () => {
    if (!pendingBlank) return
    pendingBlank = false
    ensureBlankBefore()
  }

  for (const rawLine of md.split(/\r?\n/)) {
    // 围栏内部原样保留：缩进与行尾空白都是代码内容
    if (fenceLen > 0) {
      const close = rawLine.match(/^[ \t]*(`+)[ \t]*$/)
      if (close && close[1].length >= fenceLen) fenceLen = 0
      out.push(rawLine)
      continue
    }

    let line = rawLine.replace(/[ \t]+$/, '')
    if (line !== rawLine && !BARE_QUOTE_RE.test(rawLine)) stats.trailingSpaces++
    if (BARE_QUOTE_RE.test(line)) line = '> '

    // 围栏开启（info 里不允许再出现反引号，否则是 ```code``` 单行写法）
    const fenceOpen = line.match(/^[ \t]*(`{3,})[^`]*$/)
    if (fenceOpen) {
      settlePendingBlank()
      fenceLen = fenceOpen[1].length
      out.push(line)
      continue
    }

    if (INDENTED_TAG_RE.test(line)) {
      line = line.replace(/^[ \t]+/, '')
      stats.deindented++
    }

    if (line.trim() === '') {
      // 组件内部的空行原样保留；顶层的连续空行收敛为一个
      if (blockDepth === 0 && lastIsBlank()) {
        stats.blankCollapsed++
        continue
      }
      pendingBlank = false
      out.push('')
      continue
    }

    settlePendingBlank()

    if (PAGE_BREAK_RE.test(line)) {
      if (blockDepth === 0) {
        ensureBlankBefore()
        pendingBlank = true
      }
      out.push(line)
      continue
    }

    if (BLOCK_CLOSE_RE.test(line)) {
      out.push(line)
      if (blockDepth > 0) blockDepth--
      if (blockDepth === 0) pendingBlank = true
      continue
    }

    if (BLOCK_OPEN_RE.test(line)) {
      if (blockDepth === 0) ensureBlankBefore()
      out.push(line)
      if (!closesOnSameLine(line)) blockDepth++
      else if (blockDepth === 0) pendingBlank = true
      continue
    }

    out.push(line)
  }

  if (fenceLen > 0) {
    out.push('`'.repeat(fenceLen))
    stats.fencesClosed++
  }

  while (out.length > 0 && out[0] === '') out.shift()
  while (out.length > 0 && out[out.length - 1] === '') out.pop()

  const text = out.length > 0 ? out.join('\n') + '\n' : ''
  return { text, stats, changed: text !== md.replace(/\r\n/g, '\n') }
}

/** 把统计结果压成一句提示文案；什么都没做时返回空串 */
export function describeFormatStats(stats: FormatStats): string {
  const parts: string[] = []
  if (stats.deindented) parts.push(`标签去缩进 ${stats.deindented}`)
  if (stats.blankInserted) parts.push(`补空行 ${stats.blankInserted}`)
  if (stats.blankCollapsed) parts.push(`收敛空行 ${stats.blankCollapsed}`)
  if (stats.trailingSpaces) parts.push(`清行尾空白 ${stats.trailingSpaces}`)
  if (stats.fencesClosed) parts.push(`补围栏闭合 ${stats.fencesClosed}`)
  return parts.join(' · ')
}
