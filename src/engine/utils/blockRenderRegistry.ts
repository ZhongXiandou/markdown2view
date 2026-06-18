import type { ThemeColors } from '../composables/useTheme'
import { esc, leaf, parseAttrs } from './helpers'
import { inlineFormat } from './inlineFormat'
import { renderCodeBlock } from './codeBlock'
import { localImageUrls } from '@/lib/editor/imageStorage'
import {
  parseCtaBlock,
  parseCtaInline,
  parseCtaTag,
  parseCompare,
  parseCallout,
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

export interface BlockRenderContext {
  t: ThemeColors
  md: string
  formulaMap?: Map<string, string>
  mermaidMap?: Map<string, { svg: string; error?: string }>
  pTitleLevel1List: Array<{ num: string; title: string; subtitle: string }>
}

export interface BlockRenderResult {
  html: string
  next: number
  warning?: string
}

export interface BlockRenderer {
  name: string
  match: (line: string, lines: string[], index: number) => boolean
  render: (
    ctx: BlockRenderContext,
    line: string,
    lines: string[],
    index: number,
  ) => BlockRenderResult | null
}

export function extractBlock(
  lines: string[],
  start: number,
  openTagRegex: RegExp,
  closeTagRegex: RegExp,
): { attrs: Record<string, string>; body: string; next: number; warning?: string } | null {
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
  const MAX_SCAN_LINES = 50 // 最大扫描行数限制（防止未闭合标签吞掉整篇文档）
  while (i < lines.length && !closeTagRegex.test(lines[i])) {
    body += lines[i] + '\n'
    i++
    // 超过最大扫描行数，自动截断降级
    if (i - start > MAX_SCAN_LINES) {
      return {
        attrs,
        body: body.trim(),
        next: i,
        warning: `自定义标签未闭合，已扫描 ${MAX_SCAN_LINES} 行后自动截断，请检查闭合标签`
      }
    }
  }
  // 未找到闭合标签：不把剩余整篇文档当作 body 吃掉，回退为普通段落渲染
  if (i >= lines.length) {
    return null
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

function isImageLine(line: string | undefined): boolean {
  if (!line) return false
  const trimmed = line.trim()
  return /^\s*(<\s*!\[|!\[|<img)/i.test(trimmed)
}

function isTableStartLine(lines: string[], idx: number): boolean {
  if (idx < 0 || idx >= lines.length) return false
  const line = lines[idx]
  if (line.indexOf('|') < 0) return false
  let nextIdx = idx + 1
  while (nextIdx < lines.length && lines[nextIdx].trim() === '') {
    nextIdx++
  }
  if (nextIdx >= lines.length) return false
  return /\|[\s-:]+\|/.test(lines[nextIdx])
}

function hasMermaidBlockAbove(lines: string[], closingIdx: number): boolean {
  for (let i = closingIdx - 1; i >= 0; i--) {
    if (/^```mermaid\b/.test(lines[i].trim())) return true
    if (/^```/.test(lines[i].trim())) return false
  }
  return false
}

function hasImageAbove(lines: string[], index: number): boolean {
  for (let k = index - 1; k >= 0; k--) {
    const line = lines[k].trim()
    if (line === '') continue
    if (isImageLine(line)) return true
    if (/^```\s*$/.test(line) && hasMermaidBlockAbove(lines, k)) return true
    break
  }
  return false
}

function hasTableBelow(lines: string[], index: number): boolean {
  for (let k = index + 1; k < lines.length; k++) {
    const line = lines[k].trim()
    if (line === '') continue
    if (isTableStartLine(lines, k)) return true
    break
  }
  return false
}

const emptyLineRenderer: BlockRenderer = {
  name: 'emptyLine',
  match: (line) => line.trim() === '',
  render: (_ctx, _line, _lines, i) => ({ html: '', next: i + 1 }),
}

const separatorRenderer: BlockRenderer = {
  name: 'separator',
  match: (line) => /^---+\s*$/.test(line.trim()),
  render: (_ctx, _line, _lines, i) => ({
    html: `<section style="border:none;height:1px;background:linear-gradient(90deg,transparent,rgb(221,221,221),transparent);margin:24px 0px"></section>`,
    next: i + 1,
  }),
}

const stepsRenderer: BlockRenderer = {
  name: 'steps',
  match: (line) => /^<steps\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block =
      extractBlock(lines, i, /^<steps\b([^>]*)>(.*)$/, /<\/steps>/) ||
      extractBlock(lines, i, /^<steps\b([^>]*)>/, /<\/steps>/)
    if (!block) return null
    const stepCount = block.body
      .split('\n')
      .filter((l: string) => /^-\s*.+\s*\|\s*.+/.test(l.trim())).length
    const useDA02 = block.attrs.type === 'DA02' || (!block.attrs.type && stepCount > 3)
    const renderer = useDA02 ? Steps_DA02 : Steps_DA01
    return { html: renderer.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const statementRenderer: BlockRenderer = {
  name: 'statement',
  match: (line) => /^<statement\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block = extractBlock(lines, i, /^<statement\b([^>]*)>(.*)$/, /<\/statement>/)
    if (!block) return null
    return { html: Statement_DA01.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const badgesRenderer: BlockRenderer = {
  name: 'badges',
  match: (line) => /^<badges\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block = extractBlock(lines, i, /^<badges\b([^>]*)>(.*)$/, /<\/badges>/)
    if (!block) return null
    return { html: Badges_DA01.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const ctaContainerRenderer: BlockRenderer = {
  name: 'ctaContainer',
  match: (line) => /^:::\s*cta\b/.test(line),
  render: (ctx, _line, lines, i) => parseCtaBlock(lines, i, ctx.t),
}

const leadContainerRenderer: BlockRenderer = {
  name: 'leadContainer',
  match: (line) => /^:::\s*lead\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block = extractBlock(lines, i, /^:::\s*lead\b(.*)$/, /^:::\s*$/)
    if (!block) return null
    return { html: Lead_DA01.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const leadTagRenderer: BlockRenderer = {
  name: 'leadTag',
  match: (line) => /^<lead\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block = extractBlock(lines, i, /^<lead\b([^>]*)>(.*)$/, /<\/lead>/)
    if (!block) return null
    return { html: Lead_DA01.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const breakingRenderer: BlockRenderer = {
  name: 'breaking',
  match: (line) => /^<breaking\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block =
      extractBlock(lines, i, /^<breaking\b([^>]*)>(.*)$/, /<\/breaking>/) ||
      extractBlock(lines, i, /^<breaking\b([^>]*)>/, /<\/breaking>/)
    if (!block) return null
    return { html: Breaking_DA01.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const ctaRenderer: BlockRenderer = {
  name: 'cta',
  match: (line) => /^<cta\b/.test(line),
  render: (ctx, line, lines, i) => {
    if (/<\/cta>/.test(line)) {
      return parseCtaInline(lines, i, ctx.t)
    }
    return parseCtaTag(lines, i, ctx.t)
  },
}

const compareRenderer: BlockRenderer = {
  name: 'compare',
  match: (line) => /^<compare\b/.test(line),
  render: (ctx, _line, lines, i) => parseCompare(lines, i, ctx.t),
}

const readingPathRenderer: BlockRenderer = {
  name: 'readingPath',
  match: (line) => /^<reading-path\s*\/?>/.test(line) || /^<reading-path>/.test(line),
  render: (ctx, line, lines, i) => {
    const { t, pTitleLevel1List } = ctx
    let html = ''
    if (pTitleLevel1List.length > 1) {
      html += `<section style="margin:0px 0px 30px"><section>`
      html += `<section style="display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:14px;gap:12px"><section style="flex-shrink:0"><p style="margin:0px;padding:0px 0px 6px;font-size:10px;color:rgb(100,116,139);text-transform:uppercase;letter-spacing:2.8px;font-weight:800;white-space:nowrap">${leaf('READING PATH')}</p><p style="margin:0px;font-size:16px;line-height:1.35;color:rgb(17,24,39);font-weight:800">${leaf('阅读路线')}</p></section><p style="margin:0px;font-size:10px;color:rgb(148,163,184);white-space:nowrap">${leaf(pTitleLevel1List.length + ' 个章节')}</p></section>`
      html += `<section style="padding:14px 12px 12px;border:1px solid rgb(229,231,235);border-radius:13px;background:linear-gradient(rgb(255,255,255) 0%,rgb(248,250,252) 100%);box-shadow:rgba(15,23,42,0.04) 0px 12px 30px;overflow-x:auto;white-space:nowrap;font-size:0px">`
      pTitleLevel1List.forEach((item, idx) => {
        const label = item.title.replace(/::.*/, '').trim().replace(/^\d+\s*/, '')
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
    if (
      /^<reading-path>/.test(line) &&
      i + 1 < lines.length &&
      /^<\/reading-path>/.test(lines[i + 1])
    ) {
      return { html, next: i + 2 }
    }
    return { html, next: i + 1 }
  },
}

const titleRenderer: BlockRenderer = {
  name: 'title',
  match: (line) => /^<title\b/.test(line),
  render: (ctx, _line, lines, i) => {
    let block = lines[i]
    let j = i
    while (!/<\/title>/.test(block) && j + 1 < lines.length) {
      j++
      block += '\n' + lines[j]
    }
    const titleMatch = block.match(/^<title\b([^>]*)>([\s\S]*?)<\/title>/)
    if (!titleMatch) {
      // 未闭合：回退为普通段落渲染，避免吞掉后续内容
      return null
    }
    let html = ''
    const attrs = parseAttrs(titleMatch[1])
    const body = titleMatch[2].trim()
    const type = (attrs.type || 'DA01').toUpperCase()
    if (type === 'DA02') {
      html += Title_DA02.render(attrs, body, ctx.t, ctx.md)
    } else {
      html += Title_DA01.render(attrs, body, ctx.t, ctx.md)
    }
    return { html, next: j + 1 }
  },
}

const pTitleRenderer: BlockRenderer = {
  name: 'pTitle',
  match: (line) => /^<p-title\b/.test(line),
  render: (ctx, _line, lines, i) => {
    let block = lines[i]
    let j = i
    while (!/<\/p-title>/.test(block) && j + 1 < lines.length) {
      j++
      block += '\n' + lines[j]
    }
    const ptMatch = block.match(/^<p-title\b([^>]*)>([\s\S]*?)<\/p-title>/)
    if (!ptMatch) {
      // 未闭合：回退为普通段落渲染，避免吞掉后续内容
      return null
    }
    const attrs = parseAttrs(ptMatch[1])
    const body = ptMatch[2].trim()
    const html = PTitle.render(attrs, body, ctx.t).replace('<section', '<section data-block="ptitle"')
    return { html, next: j + 1 }
  },
}

const galleryRenderer: BlockRenderer = {
  name: 'gallery',
  match: (line) => /^<\s*!\[/.test(line),
  render: (_ctx, _line, lines, i) => parseGallery(lines, i),
}

const calloutRenderer: BlockRenderer = {
  name: 'callout',
  match: (line) => /^>\s*\[(TIP|NOTE|WARNING|CAUTION|IMPORTANT)\]/.test(line),
  render: (ctx, _line, lines, i) => parseCallout(lines, i, ctx.t),
}

const quoteRenderer: BlockRenderer = {
  name: 'quote',
  match: (line) => /^>/.test(line),
  render: (ctx, _line, lines, i) => {
    const { t, formulaMap } = ctx
    const ql: string[] = []
    let j = i
    while (j < lines.length && /^>/.test(lines[j])) {
      ql.push(lines[j].replace(/^>\s?/, ''))
      j++
    }
    let html = `<section style="margin:14px 0px;padding:12px 16px;background:rgb(247,248,252);border-left:3px solid ${t.accent};border-radius:0px 6px 6px 0px;color:rgb(85,85,85);font-size:16px">`
    ql.forEach((l) => {
      html += `<section><p style="margin:4px 0px;line-height:1.8;text-align:justify;letter-spacing:0.5px">${inlineFormat(l, t, formulaMap)}</p></section>`
    })
    html += `</section>`
    return { html, next: j }
  },
}

const caseFlowTagRenderer: BlockRenderer = {
  name: 'caseFlowTag',
  match: (line) => /^<case-flow\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block =
      extractBlock(lines, i, /^<case-flow\b([^>]*)>(.*)$/, /<\/case-flow>/) ||
      extractBlock(lines, i, /^<case-flow\b([^>]*)>/, /<\/case-flow>/)
    if (!block) return null
    return { html: CaseFlow_DA01.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const caseFlowInlineRenderer: BlockRenderer = {
  name: 'caseFlowInline',
  match: (line) => /^-\s*\[案例\s*\d+\]/.test(line),
  render: (ctx, _line, lines, i) => {
    const caseLines: string[] = []
    let j = i
    while (j < lines.length && /^-\s*\[案例\s*\d+\]/.test(lines[j])) {
      caseLines.push(lines[j])
      j++
    }
    return { html: CaseFlow_DA01.render({}, caseLines.join('\n'), ctx.t), next: j }
  },
}

const timelineRenderer: BlockRenderer = {
  name: 'timeline',
  match: (line) => /^<timeline\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block =
      extractBlock(lines, i, /^<timeline\b([^>]*)>(.*)$/, /<\/timeline>/) ||
      extractBlock(lines, i, /^<timeline\b([^>]*)>/, /<\/timeline>/)
    if (!block) return null
    return { html: Timeline_DA01.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const sliderRenderer: BlockRenderer = {
  name: 'slider',
  match: (line) => /^<slider\b/.test(line),
  render: (ctx, _line, lines, i) => {
    const block = extractBlock(lines, i, /^<slider\b([^>]*)>(.*)$/, /<\/slider>/)
    if (!block) return null
    return { html: Slider_DA01.render(block.attrs, block.body, ctx.t), next: block.next, warning: block.warning }
  },
}

const engageRenderer: BlockRenderer = {
  name: 'engage',
  match: (line) => /^:\s*engage\b/.test(line) || /^<engage\b/.test(line),
  render: (ctx, line, _lines, i) => {
    const attrs = parseAttrs(line)
    if (attrs.type && attrs.type.toUpperCase() === 'DA02') {
      return { html: Engage_DA02.render(attrs, '', ctx.t), next: i + 1 }
    }
    return { html: Engage_DA01.render(attrs, '', ctx.t), next: i + 1 }
  },
}

const headingRenderer: BlockRenderer = {
  name: 'heading',
  match: (line) => /^#{1,4}\s+/.test(line),
  render: (ctx, line, _lines, i) => {
    const { t, formulaMap } = ctx
    const h1m = line.match(/^#\s+(.+)/)
    if (h1m) {
      return {
        html: `<h1 style="margin:0px 0px 16px;font-size:24px;font-weight:700;color:rgb(17,24,39);line-height:1.4">${inlineFormat(h1m[1], t, formulaMap)}</h1>`,
        next: i + 1,
      }
    }
    const h2m = line.match(/^##\s+(.+)/)
    if (h2m) {
      return {
        html: `<h2 style="margin:28px 0px 12px;font-size:20px;font-weight:700;color:rgb(17,24,39);line-height:1.4">${inlineFormat(h2m[1], t, formulaMap)}</h2>`,
        next: i + 1,
      }
    }
    const h3m = line.match(/^###\s+(.+)/)
    if (h3m) {
      return {
        html: `<h3 style="margin:24px 0px 10px;font-size:17px;font-weight:700;color:rgb(31,41,55);line-height:1.4">${inlineFormat(h3m[1], t, formulaMap)}</h3>`,
        next: i + 1,
      }
    }
    const h4m = line.match(/^####\s+(.+)/)
    if (h4m) {
      return {
        html: `<h4 style="margin:20px 0px 8px;font-size:15px;font-weight:700;color:rgb(55,65,81);line-height:1.4">${inlineFormat(h4m[1], t, formulaMap)}</h4>`,
        next: i + 1,
      }
    }
    return { html: '', next: i + 1 }
  },
}

const blockFormulaRenderer: BlockRenderer = {
  name: 'blockFormula',
  match: (line) => /^\$\$/.test(line),
  render: (ctx, line, lines, i) => {
    const { formulaMap } = ctx
    const resolveSvg = (f: string) => {
      if (formulaMap) {
        const svg = formulaMap.get(`b:${f}`)
        if (svg) return svg
      }
      return `<code style="display:inline-block;background:#f3f4f6;padding:6px 12px;border-radius:6px;font-size:14px;font-family:SF Mono,Consolas,monospace;color:#e83e8c;max-width:100%;overflow-x:auto;white-space:nowrap">$$${esc(f)}$$</code>`
    }
    const singleMatch = line.match(/^\$\$(.+?)\$\$/)
    if (singleMatch) {
      const formula = singleMatch[1].trim()
      return {
        html: `<section style="text-align:center;margin:24px 0;overflow-x:auto;color:#333">${resolveSvg(formula)}</section>`,
        next: i + 1,
      }
    }
    let j = i + 1
    const formulaLines: string[] = []
    while (j < lines.length && !/^\$\$/.test(lines[j])) {
      formulaLines.push(lines[j])
      j++
    }
    if (j < lines.length) j++
    const formula = formulaLines.join('\n').trim()
    return {
      html: `<section style="text-align:center;margin:24px 0;overflow-x:auto;color:#333">${resolveSvg(formula)}</section>`,
      next: j,
    }
  },
}

const codeBlockRenderer: BlockRenderer = {
  name: 'codeBlock',
  match: (line) => /^```/.test(line),
  render: (ctx, line, lines, i) => {
    const { mermaidMap } = ctx
    const lang = line.replace(/^```/, '').trim()
    let j = i + 1
    let code = ''
    while (j < lines.length && !/^```/.test(lines[j])) {
      code += lines[j] + '\n'
      j++
    }
    if (j < lines.length) j++
    let html = ''
    if (lang === 'mermaid') {
      const source = code.replace(/\s+$/, '')
      const entry = mermaidMap?.get(`m:${source}`)
      if (entry?.svg) {
        html += `<section data-block="mermaid" style="max-width:100%;margin:16px auto;text-align:center;break-inside:avoid"><div class="m2v-mermaid-figure" style="width:100%;max-width:100%;max-height:var(--m2v-mermaid-max-height,none);overflow:hidden">${entry.svg}</div></section>`
      } else if (entry?.error) {
        html += `<section data-block="mermaid-error" style="background:rgb(254,242,242);border-left:3px solid rgb(220,80,80);padding:10px 14px;margin:14px 0;font-size:12.5px;color:rgb(120,30,30)">图表渲染失败：${esc(entry.error)}</section>`
        html += renderCodeBlock(code, 'mermaid')
      } else {
        html += renderCodeBlock(code, 'mermaid')
      }
    } else {
      html += renderCodeBlock(code, lang)
    }
    return { html, next: j }
  },
}

const tableRenderer: BlockRenderer = {
  name: 'table',
  match: (line, lines, i) =>
    line.indexOf('|') >= 0 &&
    i + 1 < lines.length &&
    /\|[\s-:]+\|/.test(lines[i + 1]),
  render: (ctx, line, lines, i) => {
    const { t, formulaMap } = ctx
    const isContinuation = i > 0 && lines[i - 1].includes('（续表）')
    const parseRow = (rowStr: string) => {
      let s = rowStr.trim()
      if (s.startsWith('|')) s = s.substring(1)
      if (s.endsWith('|')) s = s.substring(0, s.length - 1)
      return s.split('|').map((x) => x.trim())
    }
    const headers = parseRow(line)
    let j = i + 2
    const rows: string[][] = []
    while (j < lines.length && lines[j].indexOf('|') >= 0 && lines[j].trim() !== '') {
      rows.push(parseRow(lines[j]))
      j++
    }
    let html = ''
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
    return { html, next: j }
  },
}

const unorderedListRenderer: BlockRenderer = {
  name: 'unorderedList',
  match: (line) => /^\s*[-*+]\s/.test(line),
  render: (ctx, _line, lines, i) => {
    const { t, formulaMap } = ctx
    let j = i
    let html = `<section style="margin:10px 0px;padding-left:24px">`
    while (j < lines.length && /^\s*[-*+]\s/.test(lines[j])) {
      const li = lines[j].replace(/^\s*[-*+]\s/, '')
      const cb = li.match(/^\[([ x])\]\s*(.*)/)
      if (cb) {
        const isChecked = cb[1] === 'x'
        const uncheckedBorder = t.border === '#e2e8f0' ? '#94a3b8' : t.border
        const checkSvg = isChecked
          ? '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 9l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="${uncheckedBorder}" stroke-width="1.5" fill="none"/></svg>`
        html += `<section style="margin:5px 0px"><span style="display:inline-flex;align-items:center;gap:8px"><span style="width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;${isChecked ? `background:${t.accent};border-radius:4px` : ''}">${checkSvg}</span><span>${inlineFormat(cb[2], t, formulaMap)}</span></span></section>`
      } else {
        html += `<section style="margin:5px 0px;line-height:1.8;letter-spacing:0.5px;display:flex;align-items:flex-start"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${t.accent};margin-right:10px;margin-top:10px;flex-shrink:0"></span><span style="flex:1">${inlineFormat(li, t, formulaMap)}</span></section>`
      }
      j++
    }
    html += `</section>`
    return { html, next: j }
  },
}

const orderedListRenderer: BlockRenderer = {
  name: 'orderedList',
  match: (line) => /^\s*\d+\.\s/.test(line),
  render: (ctx, _line, lines, i) => {
    const { t, formulaMap } = ctx
    let j = i
    let html = `<section style="margin:10px 0px;padding-left:24px">`
    while (j < lines.length && /^\s*\d+\.\s/.test(lines[j])) {
      const match = lines[j].match(/^\s*(\d+)\.\s/)
      const num = match ? match[1] : '1'
      const content = lines[j].replace(/^\s*\d+\.\s/, '')
      html += `<section style="margin:5px 0px;line-height:1.8;letter-spacing:0.5px;display:flex;align-items:flex-start"><span style="color:${t.accent};font-weight:800;margin-right:8px;flex-shrink:0;min-width:16px">${num}.</span><span style="flex:1">${inlineFormat(content, t, formulaMap)}</span></section>`
      j++
    }
    html += `</section>`
    return { html, next: j }
  },
}

const imageRenderer: BlockRenderer = {
  name: 'image',
  match: (line) => /^!\[([^\]]*)\]\(([^)]+)\)(?:\[([^\]]+)\])?/.test(line),
  render: (_ctx, line, _lines, i) => {
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\[([^\]]+)\])?/)
    if (!imgMatch) return { html: '', next: i + 1 }
    const [, alt, src, size] = imgMatch
    let resolvedSrc = src
    if (src.startsWith('img://')) {
      const id = src.replace('img://', '')
      resolvedSrc = localImageUrls[id] || src
    }
    let html = ''
    if (size) {
      const parts = size.split(/\s+/)
      html += `<section style="max-height:${parts[1] || '250px'};overflow-y:auto;border-radius:8px;margin:12px 0px;display:flex;justify-content:center"><img src="${esc(resolvedSrc)}" alt="${esc(alt)}" style="width:${parts[0] || '100%'};display:block;margin:0 auto"></section>`
    } else {
      html += `<section style="margin:12px 0px;display:flex;justify-content:center"><img src="${esc(resolvedSrc)}" alt="${esc(alt)}" style="max-width:100%;border-radius:6px;display:block;margin:0 auto"></section>`
    }
    return { html, next: i + 1 }
  },
}

const imgTagRenderer: BlockRenderer = {
  name: 'imgTag',
  match: (line) => /^<img\s/.test(line.trim()),
  render: (ctx, line, _lines, i) => {
    const attrs = parseAttrs(line)
    return { html: Img_DA01.render(attrs, '', ctx.t), next: i + 1 }
  },
}

const paragraphRenderer: BlockRenderer = {
  name: 'paragraph',
  match: () => true,
  render: (ctx, line, lines, i) => {
    const { t, formulaMap } = ctx
    const trimmedLine = line.trim()
    const cleanLine = trimmedLine
      .replace(/^(\*\*|\*|__|_)*/, '')
      .replace(/(\*\*|\*|__|_)*$/, '')
      .trim()
    const separatorMatch = cleanLine.match(
      /^\s*(图|表|Fig|Table|Figure)\.?\s*(\d+|[一二三四五六七八九十百]+)([:：.\s—-]+)/i,
    )
    let isCaption = false
    let isTableCaption = false
    if (separatorMatch) {
      isTableCaption = /^\s*(表|Table)/i.test(cleanLine)
      const separator = separatorMatch[3]
      const isOnlySpace = /^\s+$/.test(separator)
      const hasVerb = /展示|显示|展现|是|有|如下图|如下表/g.test(cleanLine)
      const isValidPattern = !(isOnlySpace && (cleanLine.length > 60 || hasVerb))
      if (isValidPattern) {
        if (isTableCaption) {
          isCaption = hasTableBelow(lines, i)
        } else {
          isCaption = hasImageAbove(lines, i)
        }
      }
    }
    let html = ''
    if (isCaption) {
      const captionClass = isTableCaption
        ? 'document-caption document-caption-table'
        : 'document-caption document-caption-image'
      const captionKind = isTableCaption ? 'table' : 'image'
      const sectionStyle = isTableCaption ? 'margin:16px 0px 8px' : 'margin:8px 0px 16px'
      html += `<section data-caption-kind="${captionKind}" style="${sectionStyle};display:flex;justify-content:center;width:100%"><p class="${captionClass}" style="margin:0px;font-size:13px;color:rgb(100,116,139);line-height:1.5;text-align:center;white-space:nowrap">${inlineFormat(trimmedLine, t, formulaMap)}</p></section>`
    } else {
      html += `<section style="margin:0px 0px 24px"><p style="margin:0px;font-size:16px;color:rgb(51,65,85);line-height:1.85;letter-spacing:0.5px;text-align:justify;overflow-wrap:break-word">${inlineFormat(line, t, formulaMap)}</p></section>`
    }
    return { html, next: i + 1 }
  },
}

export function createDefaultBlockRenderers(): BlockRenderer[] {
  return [
    emptyLineRenderer,
    separatorRenderer,
    stepsRenderer,
    statementRenderer,
    badgesRenderer,
    ctaContainerRenderer,
    leadContainerRenderer,
    leadTagRenderer,
    breakingRenderer,
    ctaRenderer,
    compareRenderer,
    readingPathRenderer,
    titleRenderer,
    pTitleRenderer,
    galleryRenderer,
    calloutRenderer,
    quoteRenderer,
    caseFlowTagRenderer,
    caseFlowInlineRenderer,
    timelineRenderer,
    sliderRenderer,
    engageRenderer,
    headingRenderer,
    blockFormulaRenderer,
    codeBlockRenderer,
    tableRenderer,
    unorderedListRenderer,
    orderedListRenderer,
    imageRenderer,
    imgTagRenderer,
    paragraphRenderer,
  ]
}
