import { getFontFamilyCss } from '../../lib/fonts'

/**
 * 风格缩略图绘制工具。
 * 所有内置风格的 previewHtml 都画在固定的 480×300 画布上，由 StyleThumbnail 等比缩放到卡片宽度，
 * 这样每张缩略图的比例、精细度一致，也不受卡片栅格宽度影响。
 */
export const PREVIEW_WIDTH = 480
export const PREVIEW_HEIGHT = 300

/** 画布根节点上的标记属性：StyleThumbnail 据此区分固定画布预览与旧式流式预览 */
export const PREVIEW_CANVAS_MARKER = 'data-preview-canvas'

/** 缩略图用字体栈（中文字体统一取自 lib/fonts） */
export const SANS = getFontFamilyCss('heiti')
export const SERIF = `Georgia, 'Times New Roman', ${getFontFamilyCss('songti')}`
export const MONO = "'SF Mono', Menlo, Consolas, 'Courier New', monospace"

/** 通用块元素 */
export function el(css: string, inner = ''): string {
  return `<div style="${css}">${inner}</div>`
}

/** 画布根节点 */
export function canvas(css: string, inner: string): string {
  return `<div ${PREVIEW_CANVAS_MARKER} style="width:${PREVIEW_WIDTH}px;height:${PREVIEW_HEIGHT}px;box-sizing:border-box;position:relative;overflow:hidden;${css}">${inner}</div>`
}

/** 正文占位线：widths 为各行宽度百分比 */
export function textLines(widths: number[], color: string, height = 5, gap = 7): string {
  const rows = widths
    .map((w) => `<div style="height:${height}px;width:${w}%;background:${color};border-radius:${height / 2}px;"></div>`)
    .join('')
  return `<div style="display:flex;flex-direction:column;gap:${gap}px;">${rows}</div>`
}

/** 柱状图：values 为 0-100 的高度百分比；highlight 用于突出最后一根柱子 */
export function barChart(
  values: number[],
  o: { height: number; color: string; highlight?: string; gap?: number; radius?: number },
): string {
  const last = values.length - 1
  const r = o.radius ?? 2
  const bars = values
    .map((v, i) => `<div style="flex:1;height:${v}%;background:${i === last && o.highlight ? o.highlight : o.color};border-radius:${r}px ${r}px 0 0;"></div>`)
    .join('')
  return `<div style="display:flex;align-items:flex-end;gap:${o.gap ?? 6}px;height:${o.height}px;">${bars}</div>`
}

/** 折线 / 面积图（内联 SVG）：points 为任意量纲的数值序列 */
export function lineChart(
  points: number[],
  o: { width: number; height: number; stroke: string; fill?: string; strokeWidth?: number },
): string {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const sw = o.strokeWidth ?? 2
  const step = o.width / (points.length - 1)
  const y = (v: number) => sw + (1 - (v - min) / (max - min || 1)) * (o.height - sw * 2)
  const line = points.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = o.fill ? `<polygon points="0,${o.height} ${line} ${o.width},${o.height}" fill="${o.fill}"/>` : ''
  return `<svg width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}" style="display:block;">${area}<polyline points="${line}" fill="none" stroke="${o.stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

/** 绝对定位块元素 */
export function abs(css: string, inner = ''): string {
  return el(`position:absolute;${css}`, inner)
}

/** 代码占位行：每行为 [缩进 px, ...[宽度 px, 颜色]]，用色块模拟语法高亮 */
export function codeLines(rows: Array<[number, ...Array<[number, string]>]>, height = 6, gap = 8): string {
  const lines = rows
    .map(([indent, ...segs]) => {
      const cells = (segs as Array<[number, string]>)
        .map(([w, color]) => `<div style="width:${w}px;height:${height}px;background:${color};border-radius:${height / 2}px;"></div>`)
        .join('')
      return `<div style="display:flex;gap:5px;margin-left:${indent}px;">${cells}</div>`
    })
    .join('')
  return `<div style="display:flex;flex-direction:column;gap:${gap}px;">${lines}</div>`
}
