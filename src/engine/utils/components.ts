import type { ThemeColors } from '../composables/useTheme'
import { esc, leaf, parseAttrs } from './helpers'
import { inlineFormat } from './inlineFormat'
import { Compare_DA01 } from '@engine/editor-components/Compare_DA01'
import { Compare_DA02 } from '@engine/editor-components/Compare_DA02'
import { CTA_DA01 } from '@engine/editor-components/Cta_DA01'
import { Badges_DA01 } from '@engine/editor-components/Badges_DA01'

export function renderFrontMatter(
  meta: Record<string, string>,
  fullText: string,
  t: ThemeColors,
): string {
  const cleanText = fullText
    ? fullText
        .replace(/---[\s\S]*?---\s*/, '')
        .replace(/[#*`>[\]!|_~=-]/g, '')
        .replace(/\s+/g, '')
    : ''
  const charCount = cleanText.length
  const readMin = Math.max(1, Math.ceil(charCount / 400))
  let html = `<section style="margin:0px 0px 30px;box-shadow:rgba(15,23,42,0.05) 0px 10px 24px;border-radius:14px;border:1px solid rgba(229,231,235,0.9);overflow:hidden;background:linear-gradient(135deg,rgb(248,250,252) 0%,rgb(238,244,251) 100%)">`
  html += `<section style="padding:20px;background:rgba(255,255,255,0.92)">`
  html += `<section class="tableWrapper"><table style="border:0px;border-collapse:collapse;table-layout:fixed;min-width:115px;width:100%;margin-bottom:0"><colgroup><col><col style="width:90px;"></colgroup><tbody><tr>`
  html += `<td valign="top" align="left" style="vertical-align:top;border:0px;padding:0px;text-align:left">`
  if (meta.badge)
    html += `<p style="margin:0px;padding:0px 0px 10px;font-size:10px;color:${t.accent};letter-spacing:2.4px;text-transform:uppercase;font-weight:800">${leaf(meta.badge)}</p>`
  if (meta.title)
    html += `<p style="margin:0px;font-size:28px;font-weight:900;color:rgb(17,24,39);line-height:1.2;letter-spacing:-0.5px;word-break:break-all">${leaf(meta.title)}</p>`
  if (meta.subtitle)
    html += `<p style="margin:0px;padding:10px 0px 0px;font-size:14px;color:rgb(71,85,105);line-height:1.7;font-weight:400;text-align:justify;letter-spacing:0.3px">${leaf(meta.subtitle)}</p>`
  if (meta.chips) {
    html += `<section style="margin:0px;padding:10px 0px 0px;font-size:0px;line-height:1.8">`
    meta.chips.split('|').forEach((c) => {
      html += `<span style="display:inline-block;margin:0px 8px 0px 0px;font-size:10px;color:#576B95;font-weight:700;letter-spacing:0.02em;white-space:nowrap">${leaf('#' + c.trim())}</span>`
    })
    html += `</section>`
  }
  html += `</td>`
  html += `<td data-colwidth="90" width="90" valign="top" align="right" style="vertical-align:top;border:0px;padding:0px;text-align:right">`
  html += `<p style="margin:0px 0px 8px;font-size:10px;line-height:1.2;color:rgb(148,163,184);font-weight:800;letter-spacing:0.4px">${leaf('预计阅读(分)')}</p>`
  html += `<section style="display:inline-block;width:64px;height:64px;line-height:64px;text-align:center;border-radius:10px;background-color:${t.accent};box-shadow:rgba(15,23,42,0.16) 0px 12px 24px"><span style="font-size:30px;line-height:64px;color:rgb(255,255,255);font-weight:900;letter-spacing:-1px">${leaf(readMin)}</span></section>`
  html += `<p style="margin:8px 0px 0px;font-size:10px;color:rgb(148,163,184);font-weight:700;letter-spacing:0.3px">${leaf('共 ' + charCount + ' 字')}</p>`
  html += `</td>`
  html += `</tr></tbody></table></section>`
  html += `</section></section>`
  return html
}

export function parseSteps(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  let i = start
  const attrs = parseAttrs(lines[i])
  i++
  const steps: { name: string; desc: string }[] = []
  while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
    const m = lines[i].match(/^-\s*(.+)\s*\|\s*(.+)/)
    if (m) steps.push({ name: m[1].trim(), desc: m[2].trim() })
    i++
  }
  i++
  const active = parseInt(attrs.active || '1')
  const color = attrs.color || t.accent

  let html = `<section style="margin:0px 0px 24px;padding:40px 20px;background:rgb(250,251,254);border-radius:12px;border:1px solid rgb(238,238,238)">`
  if (attrs.label)
    html += `<p style="margin:0px 0px 4px;font-size:10px;color:rgb(153,153,153);letter-spacing:2px;font-weight:700">${leaf(attrs.label)}</p>`
  if (attrs.title)
    html += `<p style="margin:0px 0px 4px;font-size:18px;font-weight:800;color:rgb(26,26,26)">${leaf(attrs.title)}</p>`
  if (attrs.hint)
    html += `<p style="margin:0px 0px 16px;font-size:12px;color:rgb(153,153,153)">${leaf(attrs.hint)}</p>`
  html += `<section style="display:flex;gap:12px;overflow-x:auto">`
  steps.forEach((s, idx) => {
    const isActive = idx + 1 === active
    const itemStyle = isActive
      ? `flex:1;min-width:100px;padding:16px 12px;background:${color}10;border-radius:10px;border:2px solid ${color};text-align:center;position:relative`
      : `flex:1;min-width:100px;padding:16px 12px;background:rgb(255,255,255);border-radius:10px;border:1px solid rgb(238,238,238);text-align:center;position:relative`
    html += `<section style="${itemStyle}">`
    html += `<p style="margin:0px 0px 4px;font-size:20px;font-weight:900;color:${color}">${leaf(idx + 1)}</p>`
    html += `<p style="margin:0px 0px 2px;font-size:13px;font-weight:700;color:rgb(51,65,85)">${leaf(s.name)}</p>`
    html += `<p style="margin:0px;font-size:11px;color:rgb(153,153,153)">${leaf(s.desc)}</p>`
    html += `</section>`
  })
  html += `</section></section>`
  return { html, next: i }
}

export function parseBadges(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  let i = start
  const attrs = parseAttrs(lines[i])
  i++
  let text = ''
  while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
    text += lines[i]
    i++
  }
  i++
  const html = Badges_DA01.render(attrs, text, t)
  return { html, next: i }
}

export function parseCtaBlock(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  let i = start
  const attrs = parseAttrs(lines[i])
  i++
  while (i < lines.length && !/^:::\s*$/.test(lines[i])) i++
  i++
  let html = `<section style="margin:24px 0px;padding:32px 24px;background:linear-gradient(135deg,${t.accent},${t.dark});border-radius:16px;text-align:center;color:rgb(255,255,255)">`
  if (attrs.label)
    html += `<p style="margin:0px 0px 8px;font-size:11px;letter-spacing:3px;font-weight:700;opacity:0.8">${leaf(attrs.label)}</p>`
  if (attrs.title)
    html += `<p style="margin:0px 0px 16px;font-size:20px;font-weight:800;line-height:1.4">${leaf(attrs.title)}</p>`
  if (attrs.button)
    html += `<span style="display:inline-block;padding:12px 32px;background:rgba(255,255,255,0.2);border-radius:8px;font-weight:700;letter-spacing:1px;backdrop-filter:blur(4px)">${leaf(attrs.button)}</span>`
  html += `</section>`
  return { html, next: i }
}

export function parseCtaTag(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  let i = start
  const openMatch = lines[i].match(/<cta\s*(.*)>/)
  const attrs = openMatch && openMatch[1] ? parseAttrs(openMatch[1]) : {}
  i++
  let body = ''
  while (i < lines.length && !/^<\/cta>/.test(lines[i])) {
    body += lines[i] + '\n'
    i++
  }
  i++
  return { html: CTA_DA01.render(attrs, body, t), next: i }
}

export function parseBreaking(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  let i = start
  const openMatch = lines[i].match(/<breaking\s*(.*)>/)
  const attrs = openMatch && openMatch[1] ? parseAttrs(openMatch[1]) : {}
  i++
  let body = ''
  while (i < lines.length && !/^<\/breaking>/.test(lines[i])) {
    body += lines[i] + '\n'
    i++
  }
  i++
  const color = attrs.color || t.accent
  let html = `<section style="margin:24px 0px;padding:28px 24px;background:linear-gradient(135deg,${t.light},rgba(255,255,255,0.8));border:1px solid ${t.border};border-radius:16px;position:relative;overflow:hidden">`
  html += `<section style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:${t.light};border-radius:50%;opacity:0.5"></section>`
  if (attrs.badge)
    html += `<span style="display:inline-block;padding:4px 12px;background:${color};color:rgb(255,255,255);border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:12px">${leaf(attrs.badge)}</span>`
  if (attrs.title)
    html += `<p style="margin:0px 0px 8px;font-size:22px;font-weight:800;color:rgb(26,26,26);line-height:1.4">${leaf(attrs.title)}</p>`
  if (attrs.subtitle)
    html += `<p style="margin:0px 0px 12px;font-size:14px;color:rgb(102,102,102)">${leaf(attrs.subtitle)}</p>`
  if (attrs.chips) {
    html += `<section style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">`
    attrs.chips.split('|').forEach((c) => {
      html += `<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;background:rgba(255,255,255,0.8);color:${color};border:1px solid ${t.border}">${leaf('#' + c.trim())}</span>`
    })
    html += `</section>`
  }
  if (body.trim())
    html += `<section style="font-size:14px;color:rgb(85,85,85);line-height:1.8;letter-spacing:0.5px;text-align:justify;margin-top:8px">${inlineFormat(body.trim(), t)}</section>`
  html += `</section>`
  return { html, next: i }
}

export function parseCtaInline(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  const attrs = parseAttrs(lines[start])
  let html = `<section style="margin:24px 0px;padding:32px 24px;background:linear-gradient(135deg,${t.accent},${t.dark});border-radius:16px;text-align:center;color:rgb(255,255,255)">`
  if (attrs.label)
    html += `<p style="margin:0px 0px 8px;font-size:11px;letter-spacing:3px;font-weight:700;opacity:0.8">${leaf(attrs.label)}</p>`
  if (attrs.title)
    html += `<p style="margin:0px 0px 16px;font-size:20px;font-weight:800;line-height:1.4">${leaf(attrs.title)}</p>`
  if (attrs.button)
    html += `<span style="display:inline-block;padding:12px 32px;background:rgba(255,255,255,0.2);border-radius:8px;font-weight:700;letter-spacing:1px;backdrop-filter:blur(4px)">${leaf(attrs.button)}</span>`
  html += `</section>`
  return { html, next: start + 1 }
}

export function parseCompare(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  let i = start
  const attrs = parseAttrs(lines[i])
  i++
  let leftContent = '',
    rightContent = '',
    side = ''
  while (i < lines.length && !/^<\/compare>/.test(lines[i])) {
    if (/^<left>/.test(lines[i])) {
      side = 'left'
      i++
      continue
    }
    if (/^<\/left>/.test(lines[i])) {
      side = ''
      i++
      continue
    }
    if (/^<right>/.test(lines[i])) {
      side = 'right'
      i++
      continue
    }
    if (/^<\/right>/.test(lines[i])) {
      side = ''
      i++
      continue
    }
    if (side === 'left') leftContent += lines[i] + '\n'
    if (side === 'right') rightContent += lines[i] + '\n'
    i++
  }
  i++

  // 构造 body 供 Compare_DA01 解析
  const body = `<left>\n${leftContent}</left>\n<right>\n${rightContent}</right>`

  // 使用 inlineFormat 渲染内部 markdown
  const inlineRenderer = (md: string) => inlineFormat(md, t)

  const renderer = attrs.type === 'DA02' ? Compare_DA02 : Compare_DA01
  return { html: renderer.render(attrs, body, t, inlineRenderer), next: i }
}

export function parseCallout(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  let i = start
  const m = lines[i].match(/>\s*\[(TIP|NOTE|WARNING|CAUTION|IMPORTANT)\]\s*(.*)/)
  const type = m ? m[1] : 'NOTE'
  const title = m ? m[2] : ''
  i++
  let body = ''
  while (i < lines.length && /^>/.test(lines[i])) {
    body += lines[i].replace(/^>\s?/, '') + '\n'
    i++
  }
  const icons: Record<string, string> = {
    TIP: '💡',
    NOTE: '📝',
    WARNING: '⚠️',
    CAUTION: '🚨',
    IMPORTANT: '❗',
  }
  const bgs: Record<string, string> = {
    TIP: '#f0f4fa',
    NOTE: '#f0f4fa',
    WARNING: '#fff8f0',
    CAUTION: '#fff0f0',
    IMPORTANT: '#f0f4fa',
  }
  const borders: Record<string, string> = {
    TIP: t.accent,
    NOTE: t.accent,
    WARNING: '#f5a623',
    CAUTION: '#e74c3c',
    IMPORTANT: t.accent,
  }
  const bg = bgs[type] || '#f0f4fa'
  const border = borders[type] || t.accent
  let html = `<section style="margin:16px 0px;padding:16px 18px;background:${bg};border-left:4px solid ${border};border-radius:0px 10px 10px 0px">`
  if (title)
    html += `<p style="margin:0px 0px 6px;font-size:16px;font-weight:700;color:rgb(51,65,85)">${leaf((icons[type] || '') + ' ' + title)}</p>`
  if (body.trim())
    html += `<section style="font-size:16px;color:rgb(85,85,85);line-height:1.7;letter-spacing:0.5px;text-align:justify">${inlineFormat(body.trim(), t)}</section>`
  html += `</section>`
  return { html, next: i }
}

export function parseEngage(
  lines: string[],
  start: number,
  t: ThemeColors,
): { html: string; next: number } {
  const attrs = parseAttrs(lines[start])
  let html = `<section style="margin:48px 0px 28px;width:677px;max-width:100%;box-sizing:border-box;overflow:hidden;text-align:center;padding:32px 24px;border-radius:14px;background:rgba(${t.rgb},0.05);border:1px dashed rgba(229,231,235,0.9)">`
  if (attrs.title)
    html += `<p style="margin:0px 0px 20px;font-size:16px;font-weight:800;color:rgb(30,41,59);line-height:1.6">${leaf(attrs.title)}</p>`
  html += `<section style="margin:0px 0px 14px;text-align:center;font-size:0px;line-height:1;color:${t.accent}">`
  html += `<span style="display:inline-block;margin:0px 10px;width:28px;height:28px;vertical-align:middle"><svg viewBox="0 0 24 24" width="28" height="28" style="display:block" xmlns="http://www.w3.org/2000/svg"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" fill="currentColor"></path></svg></span>`
  html += `<span style="display:inline-block;margin:0px 10px;width:28px;height:28px;vertical-align:middle"><svg viewBox="0 0 24 24" width="28" height="28" style="display:block" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"></path></svg></span>`
  html += `<span style="display:inline-block;margin:0px 10px;width:28px;height:28px;vertical-align:middle"><svg viewBox="0 0 24 24" width="28" height="28" style="display:block" xmlns="http://www.w3.org/2000/svg"><path d="M11.7333 8.26667V4L19.2 11.4667L11.7333 18.9333V14.5778C5.33333 14.5778 2.31111 18.2222 1.6 22.2222C2.84444 16.8889 6.22222 11.5556 11.7333 8.26667Z" fill="currentColor"></path></svg></span>`
  html += `</section>`
  html += `<p style="margin:0px 0px 4px;font-size:10px;color:${t.accent};font-weight:800;letter-spacing:2px;text-transform:uppercase">${leaf('点赞 · 推荐 · 转发')}</p>`
  html += `<p style="font-size:10px;color:rgb(203,213,225);letter-spacing:1px;margin:0px">${leaf(attrs.label || 'THANKS FOR READING')}</p>`
  html += `</section>`
  return { html, next: start + 1 }
}

export function parseGallery(lines: string[], start: number): { html: string; next: number } {
  let i = start
  const imgs: { alt: string; src: string }[] = []
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(lines[i])) !== null) {
    imgs.push({ alt: m[1], src: m[2] })
  }
  i++
  let html = `<section style="white-space:nowrap;overflow-x:auto;margin:12px 0px;padding:4px 0px">`
  imgs.forEach((img) => {
    html += `<img src="${esc(img.src)}" alt="${esc(img.alt)}" style="display:inline-block;vertical-align:top;max-height:200px;border-radius:8px;margin-right:8px">`
  })
  html += `</section>`
  return { html, next: i }
}
