import type { ThemeColors } from '../composables/useTheme'
import { leaf, esc, parseAttrs } from './helpers'
import { inlineFormat } from './inlineFormat'
import { extractMath, restoreMath } from './math'
import { renderCodeBlock } from './codeBlock'
import { localImageUrls } from '@/lib/editor/imageStorage'
import { renderMath } from './mathRenderer'
import {
  renderFrontMatter,
  parseCtaBlock,
  parseCtaInline,
  parseCtaTag,
  parseCompare,
  parseCallout,
  parseEngage,
  parseGallery,
} from './components'
import { Title_DA01 } from '@engine/editor-components/Title_DA01'
import { Title_DA02 } from '@engine/editor-components/Title_DA02'
import { PTitle } from '@engine/editor-components/PTitle_DA01'
import { Breaking_DA01 } from '@engine/editor-components/Breaking_DA01'
import { Steps_DA01 } from '@engine/editor-components/Steps_DA01'
import { Steps_DA02 } from '@engine/editor-components/Steps_DA02'
import { CaseFlow_DA01 } from '@engine/editor-components/CaseFlow_DA01'
import { Badges_DA01 } from '@engine/editor-components/Badges_DA01'
import { Statement_DA01 } from '@engine/editor-components/Statement_DA01'
import { Lead_DA01 } from '@engine/editor-components/Lead_DA01'
import { Engage_DA01 } from '@engine/editor-components/Engage_DA01'
import { Engage_DA02 } from '@engine/editor-components/Engage_DA02'
import { Timeline_DA01 } from '@engine/editor-components/Timeline_DA01'
import { Slider_DA01 } from '@engine/editor-components/Slider_DA01'
import { Img_DA01 } from '@engine/editor-components/Img_DA01'

function isImageLine(line: string | undefined): boolean {
  if (!line) return false
  const trimmed = line.trim()
  return /^\s*(<\s*!\[|!\[|<img)/i.test(trimmed)
}

function isTableStartLine(lines: string[], idx: number): boolean {
  if (idx < 0 || idx >= lines.length) return false
  const line = lines[idx]
  if (line.indexOf('|') < 0) return false
  // 寻找下一个非空行，判断是否为表格的分隔符行
  let nextIdx = idx + 1
  while (nextIdx < lines.length && lines[nextIdx].trim() === '') {
    nextIdx++
  }
  if (nextIdx >= lines.length) return false
  return /\|[\s-:]+\|/.test(lines[nextIdx])
}

function hasImageAbove(lines: string[], index: number): boolean {
  let steps = 0
  for (let i = index - 1; i >= 0 && steps < 3; i--) {
    const line = lines[i].trim()
    if (line === '') {
      continue
    }
    steps++
    if (isImageLine(line)) {
      return true
    }
    break
  }
  return false
}

function hasTableBelow(lines: string[], index: number): boolean {
  let steps = 0
  for (let i = index + 1; i < lines.length && steps < 3; i++) {
    const line = lines[i].trim()
    if (line === '') {
      continue
    }
    steps++
    if (isTableStartLine(lines, i)) {
      return true
    }
    break
  }
  return false
}

export function extractBlock(lines: string[], start: number, openTagRegex: RegExp, closeTagRegex: RegExp): { attrs: Record<string, string>; body: string; next: number } | null {
  const line = lines[start]
  const openMatch = line.match(openTagRegex)
  if (!openMatch) return null

  const attrs = openMatch[1] ? parseAttrs(openMatch[1]) : {}
  
  if (openMatch[2] !== undefined && closeTagRegex.test(openMatch[2])) {
    const text = openMatch[2].replace(closeTagRegex, '').trim()
    return { attrs, body: text, next: start + 1 }
  }

  let body = openMatch[2] !== undefined ? openMatch[2] + '\n' : ''
  let i = start + 1
  while (i < lines.length && !closeTagRegex.test(lines[i])) {
    body += lines[i] + '\n'
    i++
  }
  if (i < lines.length) {
    const match = lines[i].match(closeTagRegex)
    if (match) {
      body += lines[i].substring(0, match.index)
    }
    i++
  }
  return { attrs, body: body.trim(), next: i }
}

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
 * 一步完成：收集公式 → 预渲染 → 解析。
 * 推荐所有 caller 使用这个入口。
 */
export async function parseMarkdownAsync(md: string, t: ThemeColors): Promise<string> {
  const formulas = collectFormulas(md)
  const formulaMap = formulas.length > 0 ? await preRenderFormulas(formulas) : undefined
  return parseMarkdown(md, t, formulaMap)
}

export function parseMarkdown(md: string, t: ThemeColors, formulaMap?: Map<string, string>): string {
  // 双引擎逻辑：若传入了 formulaMap（MathJax 模式），则不采用 KaTeX 抽取
  const isKaTeX = !formulaMap
  const { text: processedMdText, store: mathStore } = isKaTeX 
    ? extractMath(md) 
    : { text: md, store: null }

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
  let html = ''
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
      html += renderFrontMatter(meta, md, t)
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

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }
    if (/^---+\s*$/.test(line.trim())) {
      html += `<section style="border:none;height:1px;background:linear-gradient(90deg,transparent,rgb(221,221,221),transparent);margin:24px 0px"></section>`
      i++
      continue
    }

    // <steps>
    if (/^<steps\b/.test(line)) {
      const block = extractBlock(lines, i, /^<steps\b([^>]*)>(.*)$/, /<\/steps>/) || extractBlock(lines, i, /^<steps\b([^>]*)>/, /<\/steps>/)
      if (block) {
        const stepsRenderer = block.attrs.type === 'DA02' ? Steps_DA02 : Steps_DA01
        html += stepsRenderer.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // <statement> ... </statement>
    if (/^<statement\b/.test(line)) {
      const block = extractBlock(lines, i, /^<statement\b([^>]*)>(.*)$/, /<\/statement>/)
      if (block) {
        html += Statement_DA01.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // <badges> ... </badges> (支持单行和多行)
    if (/^<badges\b/.test(line)) {
      const block = extractBlock(lines, i, /^<badges\b([^>]*)>(.*)$/, /<\/badges>/)
      if (block) {
        html += Badges_DA01.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // ::: cta
    if (/^:::\s*cta\b/.test(line)) {
      const r = parseCtaBlock(lines, i, t)
      html += r.html
      i = r.next
      continue
    }
    // ::: lead
    if (/^:::\s*lead\b/.test(line)) {
      const block = extractBlock(lines, i, /^:::\s*lead\b(.*)$/, /^:::\s*$/)
      if (block) {
        html += Lead_DA01.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // <lead> ... </lead>
    if (/^<lead\b/.test(line)) {
      const block = extractBlock(lines, i, /^<lead\b([^>]*)>(.*)$/, /<\/lead>/)
      if (block) {
        html += Lead_DA01.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // <breaking>
    if (/^<breaking\b/.test(line)) {
      const block = extractBlock(lines, i, /^<breaking\b([^>]*)>(.*)$/, /<\/breaking>/) || extractBlock(lines, i, /^<breaking\b([^>]*)>/, /<\/breaking>/)
      if (block) {
        html += Breaking_DA01.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // <cta ...> 单行属性语法（无 body）vs <cta ...>...</cta> 多行 body 语法
    if (/^<cta\b/.test(line)) {
      // 当前行已有闭合标签 → 单行属性语法
      if (/<\/cta>/.test(line)) {
        const r = parseCtaInline(lines, i, t)
        html += r.html
        i = r.next
      } else {
        const r = parseCtaTag(lines, i, t)
        html += r.html
        i = r.next
      }
      continue
    }
    // <compare>
    if (/^<compare\b/.test(line)) {
      const r = parseCompare(lines, i, t)
      html += r.html
      i = r.next
      continue
    }
    // <reading-path> 或 <reading-path />
    if (/^<reading-path\s*\/?>/.test(line) || /^<reading-path>/.test(line)) {
      // 渲染阅读路线组件（从 p-title level1 生成）
      if (pTitleLevel1List.length > 1) {
        html += `<section style="margin:0px 0px 30px"><section>`
        html += `<section style="display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:14px;gap:12px"><section style="flex-shrink:0"><p style="margin:0px;padding:0px 0px 6px;font-size:10px;color:rgb(100,116,139);text-transform:uppercase;letter-spacing:2.8px;font-weight:800;white-space:nowrap">${leaf('READING PATH')}</p><p style="margin:0px;font-size:16px;line-height:1.35;color:rgb(17,24,39);font-weight:800">${leaf('阅读路线')}</p></section><p style="margin:0px;font-size:10px;color:rgb(148,163,184);white-space:nowrap">${leaf(pTitleLevel1List.length + ' 个章节')}</p></section>`
        html += `<section style="padding:14px 12px 12px;border:1px solid rgb(229,231,235);border-radius:13px;background:linear-gradient(rgb(255,255,255) 0%,rgb(248,250,252) 100%);box-shadow:rgba(15,23,42,0.04) 0px 12px 30px;overflow-x:auto;white-space:nowrap;font-size:0px">`
        pTitleLevel1List.forEach((item, idx) => {
          const label = item.title
            .replace(/::.*/, '')
            .trim()
            .replace(/^\d+\s*/, '')
          const num = item.num || String(idx + 1).padStart(2, '0')
          const isActive = idx === 0
          html += `<section style="display:inline-flex;vertical-align:middle;align-items:center">`
          html += `<section style="display:inline-block;vertical-align:top;width:126px;white-space:normal;text-align:center">`
          html += `<section style="display:flex;justify-content:center;margin-bottom:10px">`
          html += `<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:${isActive ? t.accent : 'rgb(255,255,255)'};color:${isActive ? 'rgb(255,255,255)' : 'rgb(17,24,39)'};border:1px solid ${isActive ? t.accent : 'rgb(219,227,238)'};font-size:11px;font-weight:900;letter-spacing:1.2px;white-space:nowrap">${leaf(num)}</span>`
          html += `</section>`
          html += `<p style="margin:0px;font-size:13px;line-height:1.55;color:${isActive ? 'rgb(17,24,39)' : 'rgb(31,41,55)'};font-weight:800;letter-spacing:0.05px;white-space:normal;word-break:break-all">${leaf(label)}</p>`
          html += `</section>`
          if (idx < pTitleLevel1List.length - 1) {
            html += `<span style="display:inline-block;vertical-align:middle;width:32px;height:1px;line-height:1px;margin:0px 8px;background:linear-gradient(90deg,rgba(148,163,184,0.35),rgba(148,163,184,0.85));color:transparent;overflow:hidden">${leaf('-')}</span>`
          }
          html += `</section>`
        })
        html += `</section></section></section>`
      }
      // 跳过闭合标签（如果有）
      if (
        /^<reading-path>/.test(line) &&
        i + 1 < lines.length &&
        /^<\/reading-path>/.test(lines[i + 1])
      ) {
        i += 2
      } else {
        i++
      }
      continue
    }
    // <title> 标签（通过 type 属性选择样式：DA01/DA02/...）
    // 支持跨多行书写：累积到出现 </title> 为止，避免在属性/内容中换行导致标签失效
    if (/^<title\b/.test(line)) {
      let block = line
      while (!/<\/title>/.test(block) && i + 1 < lines.length) {
        i++
        block += '\n' + lines[i]
      }
      const titleMatch = block.match(/^<title\b([^>]*)>([\s\S]*?)<\/title>/)
      if (titleMatch) {
        const attrs = parseAttrs(titleMatch[1])
        const body = titleMatch[2].trim()
        const type = (attrs.type || 'DA01').toUpperCase()
        if (type === 'DA02') {
          html += Title_DA02.render(attrs, body, t, md)
        } else {
          html += Title_DA01.render(attrs, body, t, md)
        }
      }
      i++
      continue
    }

    // <p-title> 段落标题标签（同样支持跨多行书写）
    if (/^<p-title\b/.test(line)) {
      let block = line
      while (!/<\/p-title>/.test(block) && i + 1 < lines.length) {
        i++
        block += '\n' + lines[i]
      }
      const ptMatch = block.match(/^<p-title\b([^>]*)>([\s\S]*?)<\/p-title>/)
      if (ptMatch) {
        const attrs = parseAttrs(ptMatch[1])
        const body = ptMatch[2].trim()
        // 给根节点打个标记（不影响样式），分页时用它避免小节标题落在页底跟正文分家
        html += PTitle.render(attrs, body, t).replace('<section', '<section data-block="ptitle"')
      }
      i++
      continue
    }

    // < ![
    if (/^<\s*!\[/.test(line)) {
      const r = parseGallery(lines, i)
      html += r.html
      i = r.next
      continue
    }
    // > [TIP] etc
    if (/^>\s*\[(TIP|NOTE|WARNING|CAUTION|IMPORTANT)\]/.test(line)) {
      const r = parseCallout(lines, i, t)
      html += r.html
      i = r.next
      continue
    }
    // > quote
    if (/^>/.test(line)) {
      const ql: string[] = []
      while (i < lines.length && /^>/.test(lines[i])) {
        ql.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      html += `<section style="margin:14px 0px;padding:12px 16px;background:rgb(247,248,252);border-left:3px solid ${t.accent};border-radius:0px 6px 6px 0px;color:rgb(85,85,85);font-size:16px">`
      ql.forEach((l) => {
        html += `<section><p style="margin:4px 0px;line-height:1.8;text-align:justify;letter-spacing:0.5px">${inlineFormat(l, t, formulaMap)}</p></section>`
      })
      html += `</section>`
      continue
    }
    // <case-flow> 标签
    if (/^<case-flow\b/.test(line)) {
      const block = extractBlock(lines, i, /^<case-flow\b([^>]*)>(.*)$/, /<\/case-flow>/) || extractBlock(lines, i, /^<case-flow\b([^>]*)>/, /<\/case-flow>/)
      if (block) {
        html += CaseFlow_DA01.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // 案例流（行内语法，无标签包裹时）
    if (/^-\s*\[案例\s*\d+\]/.test(line)) {
      const caseLines: string[] = []
      while (i < lines.length && /^-\s*\[案例\s*\d+\]/.test(lines[i])) {
        caseLines.push(lines[i])
        i++
      }
      html += CaseFlow_DA01.render({}, caseLines.join('\n'), t)
      continue
    }
    // <timeline> 标签
    if (/^<timeline\b/.test(line)) {
      const block = extractBlock(lines, i, /^<timeline\b([^>]*)>(.*)$/, /<\/timeline>/) || extractBlock(lines, i, /^<timeline\b([^>]*)>/, /<\/timeline>/)
      if (block) {
        html += Timeline_DA01.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // <slider> 标签
    if (/^<slider\b/.test(line)) {
      const block = extractBlock(lines, i, /^<slider\b([^>]*)>(.*)$/, /<\/slider>/)
      if (block) {
        html += Slider_DA01.render(block.attrs, block.body, t)
        i = block.next
        continue
      }
    }
    // : engage 或 <engage>
    if (/^:\s*engage\b/.test(line) || /^<engage\b/.test(line)) {
      const attrs = parseAttrs(line)
      // type="DA02" 使用彩色图标版，否则默认 DA01
      if (attrs.type && attrs.type.toUpperCase() === 'DA02') {
        html += Engage_DA02.render(attrs, '', t)
      } else {
        html += Engage_DA01.render(attrs, '', t)
      }
      i++
      continue
    }

    // 标题 — Markdown 原生语法，不走 PTitle
    const h1m = line.match(/^#\s+(.+)/)
    if (h1m) {
      html += `<h1 style="margin:0px 0px 16px;font-size:24px;font-weight:700;color:rgb(17,24,39);line-height:1.4">${inlineFormat(h1m[1], t, formulaMap)}</h1>`
      i++
      continue
    }

    const h2m = line.match(/^##\s+(.+)/)
    if (h2m) {
      html += `<h2 style="margin:28px 0px 12px;font-size:20px;font-weight:700;color:rgb(17,24,39);line-height:1.4">${inlineFormat(h2m[1], t, formulaMap)}</h2>`
      i++
      continue
    }

    const h3m = line.match(/^###\s+(.+)/)
    if (h3m) {
      html += `<h3 style="margin:24px 0px 10px;font-size:17px;font-weight:700;color:rgb(31,41,55);line-height:1.4">${inlineFormat(h3m[1], t, formulaMap)}</h3>`
      i++
      continue
    }

    const h4m = line.match(/^####\s+(.+)/)
    if (h4m) {
      html += `<h4 style="margin:20px 0px 8px;font-size:15px;font-weight:700;color:rgb(55,65,81);line-height:1.4">${inlineFormat(h4m[1], t, formulaMap)}</h4>`
      i++
      continue
    }

    // 块级公式 $$...$$ — 优先取 formulaMap 中的预渲染 SVG
    if (/^\$\$/.test(line)) {
      const resolveSvg = (f: string) => {
        if (formulaMap) {
          const svg = formulaMap.get(`b:${f}`)
          if (svg) return svg
        }
        // 降级：使用 KaTeX 模式的错误输出外观或行内 fallback
        return `<code style="display:inline-block;background:#f3f4f6;padding:6px 12px;border-radius:6px;font-size:14px;font-family:SF Mono,Consolas,monospace;color:#e83e8c;max-width:100%;overflow-x:auto;white-space:nowrap">$$${esc(f)}$$</code>`
      }
      // 单行模式：$$formula$$
      const singleMatch = line.match(/^\$\$(.+?)\$\$/)
      if (singleMatch) {
        const formula = singleMatch[1].trim()
        html += `<section style="text-align:center;margin:24px 0;overflow-x:auto;color:#333">${resolveSvg(formula)}</section>`
        i++
        continue
      }
      // 多行模式：$$ 独占一行开头 → 收集行直到闭合 $$
      i++
      const formulaLines: string[] = []
      while (i < lines.length && !/^\$\$/.test(lines[i])) {
        formulaLines.push(lines[i])
        i++
      }
      if (i < lines.length) i++ // 跳过闭合的 $$
      const formula = formulaLines.join('\n').trim()
      html += `<section style="text-align:center;margin:24px 0;overflow-x:auto;color:#333">${resolveSvg(formula)}</section>`
      continue
    }

    // 代码块
    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, '').trim()
      i++
      let code = ''
      while (i < lines.length && !/^```/.test(lines[i])) {
        code += lines[i] + '\n'
        i++
      }
      i++
      html += renderCodeBlock(code, lang)
      continue
    }

    // 表格
    if (line.indexOf('|') >= 0 && i + 1 < lines.length && /\|[\s-:]+\|/.test(lines[i + 1])) {
      // 检测是否为续表（前一行包含"（续表）"）
      const isContinuation = i > 0 && lines[i - 1].includes('（续表）')
      
      const parseRow = (rowStr: string) => {
        let s = rowStr.trim()
        if (s.startsWith('|')) s = s.substring(1)
        if (s.endsWith('|')) s = s.substring(0, s.length - 1)
        return s.split('|').map(x => x.trim())
      }
      
      const headers = parseRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].indexOf('|') >= 0 && lines[i].trim() !== '') {
        rows.push(parseRow(lines[i]))
        i++
      }
      
      // 如果是续表，在表格前添加续表标记
      if (isContinuation) {
        html += `<section style="margin:0px 0px 10px;text-align:center;font-size:12px;color:rgb(100,116,139);font-style:italic">（续表）</section>`
      }
      
      html += `<section style="margin:0px 0px 30px;display:flex;justify-content:center;width:100%"><section style="box-shadow:rgba(15,23,42,0.05) 0px 10px 24px;border-radius:12px;border:1px solid rgba(229,231,235,0.9);overflow:hidden;background:#ffffff;max-width:100%;width:max-content"><section style="padding:16px;background:#ffffff"><section class="tableWrapper"><table style="border-collapse:collapse;table-layout:auto;width:100%;border:1px solid rgb(226,232,240)"><thead><tr style="background-color:rgb(248,250,252)">`
      headers.forEach((h) => {
        html += `<th valign="top" align="left" style="vertical-align:top;border:1px solid rgb(226,232,240);padding:10px 14px;text-align:left;font-size:13px;font-weight:700;color:rgb(51,65,85)">${inlineFormat(h, t, formulaMap) || '&nbsp;'}</th>`
      })
      html += `</tr></thead><tbody>`
      rows.forEach((r) => {
        html += `<tr>`
        r.forEach((c) => {
          html += `<td valign="top" align="left" style="vertical-align:top;border:1px solid rgb(226,232,240);padding:10px 14px;text-align:left;font-size:13px;color:rgb(51,65,85)">${inlineFormat(c, t, formulaMap) || '&nbsp;'}</td>`
        })
        html += `</tr>`
      })
      html += `</tbody></table></section></section></section></section>`
      continue
    }

    // 无序列表
    if (/^\s*[-*+]\s/.test(line)) {
      html += `<section style="margin:10px 0px;padding-left:24px">`
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) {
        const li = lines[i].replace(/^\s*[-*+]\s/, '')
        const cb = li.match(/^\[([ x])\]\s*(.*)/)
        if (cb) {
          const isChecked = cb[1] === 'x'
          const boxStyle = isChecked
            ? `background:${t.accent};border-color:${t.accent}`
            : `border-color:${t.border}`
          const uncheckedBorder = t.border === '#e2e8f0' ? '#94a3b8' : t.border
          const checkSvg = isChecked
            ? '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 9l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="${uncheckedBorder}" stroke-width="1.5" fill="none"/></svg>`
          html += `<section style="margin:5px 0px"><span style="display:inline-flex;align-items:center;gap:8px"><span style="width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;${isChecked ? `background:${t.accent};border-radius:4px` : ''}">${checkSvg}</span><span>${inlineFormat(cb[2], t, formulaMap)}</span></span></section>`
        } else {
          html += `<section style="margin:5px 0px;line-height:1.8;letter-spacing:0.5px;display:flex;align-items:flex-start"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${t.accent};margin-right:10px;margin-top:10px;flex-shrink:0"></span><span style="flex:1">${inlineFormat(li, t, formulaMap)}</span></section>`
        }
        i++
      }
      html += `</section>`
      continue
    }

    // 有序列表
    if (/^\s*\d+\.\s/.test(line)) {
      html += `<section style="margin:10px 0px;padding-left:24px">`
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        const match = lines[i].match(/^\s*(\d+)\.\s/)
        const num = match ? match[1] : '1'
        const content = lines[i].replace(/^\s*\d+\.\s/, '')
        html += `<section style="margin:5px 0px;line-height:1.8;letter-spacing:0.5px;display:flex;align-items:flex-start"><span style="color:${t.accent};font-weight:800;margin-right:8px;flex-shrink:0;min-width:16px">${num}.</span><span style="flex:1">${inlineFormat(content, t, formulaMap)}</span></section>`
        i++
      }
      html += `</section>`
      continue
    }

    // 图片
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\[([^\]]+)\])?/)
    if (imgMatch) {
      const [, alt, src, size] = imgMatch
      let resolvedSrc = src
      if (src.startsWith('img://')) {
        const id = src.replace('img://', '')
        resolvedSrc = localImageUrls[id] || src
      }
      if (size) {
        const parts = size.split(/\s+/)
        html += `<section style="max-height:${parts[1] || '250px'};overflow-y:auto;border-radius:8px;margin:12px 0px;display:flex;justify-content:center"><img src="${esc(resolvedSrc)}" alt="${esc(alt)}" style="width:${parts[0] || '100%'};display:block;margin:0 auto"></section>`
      } else {
        html += `<section style="margin:12px 0px;display:flex;justify-content:center"><img src="${esc(resolvedSrc)}" alt="${esc(alt)}" style="max-width:100%;border-radius:6px;display:block;margin:0 auto"></section>`
      }
      i++
      continue
    }

    // <img>
    if (/^<img\s/.test(line.trim())) {
      const attrs = parseAttrs(line)
      html += Img_DA01.render(attrs, '', t)
      i++
      continue
    }

    // 普通段落
    const trimmedLine = line.trim()
    // 去除加粗、斜体等排版包裹字符后进行匹配，例如 **图 1: xxxx**
    const cleanLine = trimmedLine.replace(/^(\*\*|\*|__|_)*/, '').replace(/(\*\*|\*|__|_)*$/, '').trim()
    const separatorMatch = cleanLine.match(/^\s*(图|表|Fig|Table|Figure)\.?\s*(\d+|[一二三四五六七八九十百]+)([:：.\-\—\s]+)/i)
    
    let isCaption = false
    let isTableCaption = false
    
    if (separatorMatch) {
      isTableCaption = /^\s*(表|Table)/i.test(cleanLine)
      const separator = separatorMatch[3]
      const isOnlySpace = /^\s+$/.test(separator)
      const hasVerb = /展示|显示|展现|是|有|如下图|如下表/g.test(cleanLine)
      
      // 如果分隔符仅为空格，限制其长度与内容以防止把描述句误认为题注
      const isValidPattern = !(isOnlySpace && (cleanLine.length > 60 || hasVerb))
      
      if (isValidPattern) {
        if (isTableCaption) {
          isCaption = hasTableBelow(lines, i)
        } else {
          isCaption = hasImageAbove(lines, i)
        }
      }
    }

    if (isCaption) {
      const captionClass = isTableCaption ? 'document-caption document-caption-table' : 'document-caption document-caption-image'
      const captionKind = isTableCaption ? 'table' : 'image'
      const sectionStyle = isTableCaption ? 'margin:16px 0px 8px' : 'margin:8px 0px 16px'
      html += `<section data-caption-kind="${captionKind}" style="${sectionStyle};display:flex;justify-content:center;width:100%"><p class="${captionClass}" style="margin:0px;font-size:13px;color:rgb(100,116,139);line-height:1.5;text-align:center;white-space:nowrap">${inlineFormat(trimmedLine, t, formulaMap)}</p></section>`
    } else {
      html += `<section style="margin:0px 0px 24px"><p style="margin:0px;font-size:16px;color:rgb(51,65,85);line-height:1.85;letter-spacing:0.5px;text-align:justify;overflow-wrap:break-word">${inlineFormat(line, t, formulaMap)}</p></section>`
    }
    i++
  }

  // 添加脚注参考资料
  if (footnotes.length > 0) {
    html += `<section style="margin:32px 0px 0px;padding-top:20px;border-top:1px solid ${t.border}">`
    html += `<h2 style="margin:0px 0px 16px;font-size:18px;font-weight:700;color:rgb(17,24,39);line-height:1.4">参考资料</h2>`
    html += `<section style="font-size:14px;color:rgb(100,116,139);line-height:1.8">`
    footnotes.forEach((fn, idx) => {
      html += `<p style="margin:6px 0px"><span style="color:${t.accent};font-weight:600">[${idx + 1}]</span> ${leaf(fn.desc)}：<a href="${esc(fn.url)}" style="color:${t.accent};word-break:break-all">${esc(fn.url)}</a></p>`
    })
    html += `</section></section>`
  }

  // 回填数学公式的 KaTeX HTML（仅在 KaTeX 模式下生效）
  if (mathStore) {
    return restoreMath(html, mathStore)
  }
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
