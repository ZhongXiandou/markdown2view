export interface ContentMeta {
  title: string
  summary: string
  contentMarkdown: string
}

function stripInline(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[=^!~`*_#>|-]/g, '')
    .replace(/::/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseFrontMatter(md: string): { meta: Record<string, string>; body: string } | null {
  const lines = md.split('\n')
  if (lines[0]?.trim() !== '---') return null

  const meta: Record<string, string> = {}
  let i = 1
  while (i < lines.length && lines[i].trim() !== '---') {
    const m = lines[i].match(/^([\w-]+):\s*(.*)$/)
    if (m) meta[m[1]] = m[2].trim()
    i += 1
  }
  if (i >= lines.length) return null
  return { meta, body: lines.slice(i + 1).join('\n').trimStart() }
}

function firstMarkdownHeading(md: string): string {
  const m = md.match(/^#\s+(.+)$/m)
  return m ? stripInline(m[1]) : ''
}

function firstPlainParagraph(md: string): string {
  for (const raw of md.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (/^(---+|#{1,6}\s|>|[-*+]\s|\d+\.\s|```|<[^>]+>|\|)/.test(line)) continue
    const text = stripInline(line)
    if (text) return text
  }
  return ''
}

export function extractContentMeta(markdown: string): ContentMeta {
  const frontMatter = parseFrontMatter(markdown)
  const source = frontMatter?.body ?? markdown
  const fm = frontMatter?.meta ?? {}

  const titleTag = source.match(/<title\b([^>]*)>([\s\S]*?)<\/title>/)
  const leadTag = source.match(/<lead\b[^>]*>([\s\S]*?)<\/lead>/)

  const title =
    stripInline(fm.title || fm.name || (titleTag ? titleTag[2] : '') || firstMarkdownHeading(source))
  const summary = stripInline(
    fm.summary || fm.subtitle || fm.description || (leadTag ? leadTag[1] : '') || firstPlainParagraph(source),
  )

  return {
    title,
    summary,
    contentMarkdown: source,
  }
}
