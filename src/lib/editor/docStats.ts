/**
 * 编辑器状态栏用的文档统计：字数/阅读时长与大纲。
 * 字数统计与大纲提取的规则参考 r-markdown 上游的 charCount.ts / outline.ts。
 */

/**
 * 仅当首个非空行就是 `---` 时才当作 front-matter 剥离。
 * 不能用 /---[\s\S]*?---/：正文里的水平分割线也是 `---`，那样会把两条分割线之间的正文吞掉。
 */
function stripFrontMatter(text: string): string {
  const lines = text.split('\n')
  let first = 0
  while (first < lines.length && lines[first].trim() === '') first++
  if (first >= lines.length || lines[first].trim() !== '---') return text
  for (let i = first + 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') return lines.slice(i + 1).join('\n')
  }
  return text
}

/** 统计正文纯文字字数（剥离 front-matter、标签、图片与 Markdown 符号）与预估阅读分钟数 */
export function countChars(raw: string): { chars: number; minutes: number } {
  const text = stripFrontMatter(raw)
    .replace(/<[^>]+>/g, '')
    .replace(/!\[.*?\]\([^)]*\)/g, '')
    .replace(/[#*`>[\]!|_~=^:-]/g, '')
    .replace(/\s+/g, '')
  const chars = text.length
  return { chars, minutes: chars === 0 ? 0 : Math.max(1, Math.ceil(chars / 400)) }
}

export interface OutlineItem {
  /** 层级 1–4 */
  level: number
  /** 显示文本（已剥离行内修饰语法） */
  text: string
  /** 1 起始的行号 */
  line: number
}

/** 剥离图片/链接/标签/行内修饰语法，得到纯文本 */
function cleanInlineText(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/(\*\*|__|~~|==|::|!!|\^\^|`|\*)/g, '')
    .trim()
}

/**
 * 从 Markdown 原文提取大纲：# 到 #### 标题、<title> 主标题、<p-title> 段落标题。
 * 代码围栏内的 # 不参与（围栏按长度配对）。
 */
export function extractOutline(markdown: string): OutlineItem[] {
  const items: OutlineItem[] = []
  const lines = markdown.split('\n')
  let fenceLen = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (fenceLen > 0) {
      const close = line.match(/^[ \t]*(`+)[ \t]*$/)
      if (close && close[1].length >= fenceLen) fenceLen = 0
      continue
    }
    const open = line.match(/^[ \t]*(`{3,})[^`]*$/)
    if (open) {
      fenceLen = open[1].length
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    if (heading) {
      const text = cleanInlineText(heading[2])
      if (text) items.push({ level: heading[1].length, text, line: i + 1 })
      continue
    }

    // <title> / <p-title> 组件：正文可能跨行，向后找到闭合标签为止
    const tag = line.match(/^<(title|p-title)\b/)
    if (tag) {
      const closeTag = `</${tag[1]}>`
      let block = line
      let j = i
      while (!block.includes(closeTag) && j + 1 < lines.length && j - i < 20) {
        j++
        block += '\n' + lines[j]
      }
      const body = block.match(new RegExp(`^<${tag[1]}\\b[^>]*>([\\s\\S]*?)${closeTag}`))
      // 标题文字可以写在标签正文里，也可以写在 title 属性里（如 <p-title title="…"></p-title>）
      const attrTitle = block.match(/^<[\w-]+\b[^>]*\btitle="([^"]*)"/)
      const text = cleanInlineText((body?.[1] || '').replace(/\s+/g, ' ')) || cleanInlineText(attrTitle?.[1] || '')
      if (text) items.push({ level: tag[1] === 'title' ? 1 : 2, text, line: i + 1 })
    }
  }
  return items
}
