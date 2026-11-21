import { renderCodeBlock } from './codeBlock'
import { esc } from './helpers'

// 私有使用区字符作占位符分隔，确保不与 Markdown / HTML 语法冲突。
// 与 math.ts 中 \uE000/\uE001 区分，避免 token 互相干扰。
const BLOCK_OPEN = '\uE002'
const BLOCK_CLOSE = '\uE003'
const INLINE_OPEN = '\uE004'
const INLINE_CLOSE = '\uE005'

export interface CodeBlockEntry {
  type: 'block'
  code: string
  lang: string
}

export interface InlineCodeEntry {
  type: 'inline'
  code: string
}

export type ProtectedCodeEntry = CodeBlockEntry | InlineCodeEntry

export interface CodeStore {
  entries: ProtectedCodeEntry[]
}

/**
 * 删除反引号围栏代码块（按围栏长度配对），用于在收集公式前剔除代码区域。
 *
 * 不能只用 /```[\s\S]*?```/g：示范「怎么写围栏」时外层会用四个反引号包住三个反引号，
 * 简单正则会在内层就提前闭合，把代码原文漏进结果；残留的反引号数目失衡后，
 * 后续的行内代码正则还会跨行把正文里的公式一并吞掉。
 */
export function stripFencedCodeBlocks(md: string): string {
  const out: string[] = []
  let openLen = 0
  for (const line of md.split('\n')) {
    if (openLen > 0) {
      // 闭合：整行只有反引号（数量不少于开启时）和空白
      const close = line.match(/^[ \t]*(`+)[ \t]*$/)
      if (close && close[1].length >= openLen) openLen = 0
      continue
    }
    // 开启：info 字符串里不允许再出现反引号（否则是 ```code``` 这种单行写法）
    const open = line.match(/^[ \t]*(`{3,})[^`]*$/)
    if (open) {
      openLen = open[1].length
      continue
    }
    out.push(line)
  }
  return out.join('\n')
}

/**
 * 保护 Markdown 中的代码区域，使公式/脚注等后续处理不会侵入代码内部。
 *
 * 保护范围：
 * - 块级代码围栏（``` ... ```）：mermaid 图表不保护，仍走原有渲染管线
 * - 行内代码（`...`）
 *
 * 返回替换为占位符后的文本与还原表。
 */
export function protectCode(md: string): { text: string; store: CodeStore } {
  const store: CodeStore = { entries: [] }

  // 1. 块级代码围栏（支持 3 个及以上连续反引号，语言信息取 info 字符串第一个单词）
  //    换行设为可选以兼容单行围栏（如 ```code```）：无换行时 info 实为内容，按无 lang 处理
  let text = md.replace(/^(`{3,})([^\n]*)\n?([\s\S]*?)\n?\1\s*$/gm, (m, _ticks: string, info: string, code: string) => {
    // 单行围栏（整段匹配不含换行）：info 实际是内容，按无 lang 处理
    if (!m.includes('\n')) {
      code = info
      info = ''
    }
    const lang = info.trim().split(/\s+/)[0]
    if (lang === 'mermaid') {
      // mermaid 需要后续管线识别并渲染为 SVG，因此不保护
      return m
    }
    const idx = store.entries.length
    store.entries.push({ type: 'block', code, lang: lang || 'text' })
    return `\n${BLOCK_OPEN}B${idx}${BLOCK_CLOSE}\n`
  })

  // 2. 行内代码（单个反引号；复杂情况如包含反引号的代码留给后续 inlineFormat 兜底）
  text = text.replace(/`([^`\n]+)`/g, (_m, code: string) => {
    const idx = store.entries.length
    store.entries.push({ type: 'inline', code })
    return `${INLINE_OPEN}I${idx}${INLINE_CLOSE}`
  })

  return { text, store }
}

/**
 * 将占位符还原为渲染后的代码 HTML。
 * 先处理被 <p> 包裹的块级占位符，再处理裸占位符。
 */
export function restoreCode(html: string, store: CodeStore): string {
  let out = html

  for (let i = 0; i < store.entries.length; i++) {
    const entry = store.entries[i]
    const token = entry.type === 'block'
      ? `${BLOCK_OPEN}B${i}${BLOCK_CLOSE}`
      : `${INLINE_OPEN}I${i}${INLINE_CLOSE}`

    let replacement: string
    if (entry.type === 'block') {
      replacement = renderCodeBlock(entry.code, entry.lang)
    } else {
      replacement = `<code style="background:#f0f0f5;padding:2px 6px;border-radius:4px;font-size:13px;font-family:SF Mono,Consolas,monospace;color:#e83e8c;word-break:break-word;overflow-wrap:anywhere">${esc(entry.code)}</code>`
    }

    // 块级占位符可能被 parseMarkdown 包进 <p>，先处理这种情况
    if (entry.type === 'block') {
      out = out.split(`<p>${token}</p>`).join(replacement)
    }
    out = out.split(token).join(replacement)
  }

  return out
}
