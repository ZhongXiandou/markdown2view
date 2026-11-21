export function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function leaf(s: string | number): string {
  // 统一对内容块文本做两项处理：
  // 1. 中英文/数字自动加空格（pangu）
  // 2. 多行内容拆成多个 leaf span，<br> 作为「兄弟节点」输出
  //    （微信公众号把 leaf span 视为原子文本节点，会丢弃其内部的 <br>，
  //     放在 span 之间才能在公众号里正确换行）
  // 同时对每一行做 trim：换行后行首/行尾的缩进空格不带入，文本顶格输出
  const text = pangu(String(s))
  if (!text.includes('\n')) return `<span leaf="">${text}</span>`
  return text
    .split('\n')
    .map((line) => `<span leaf="">${line.trim()}</span>`)
    .join('<br>')
}

// 将换行符转为 <br>（保留为通用工具；leaf 已改为「span 之间放 <br>」的公众号兼容写法）
export function nl2br(s: string): string {
  return s.replace(/\n/g, '<br>')
}

// CJK 字符范围（中日韩表意文字 + 假名，不含标点，避免给「」。等加空格）
const PANGU_CJK = '\\u4e00-\\u9fff\\u3040-\\u30ff\\u3400-\\u4dbf\\uf900-\\ufaff'
const PANGU_RE1 = new RegExp(`([${PANGU_CJK}])([A-Za-z0-9])`, 'g')
const PANGU_RE2 = new RegExp(`([A-Za-z0-9])([${PANGU_CJK}])`, 'g')

// 中文与英文字母/数字之间自动加空格（盘古之白），幂等可重复执行
export function pangu(text: string): string {
  if (!text) return text
  return text.replace(PANGU_RE1, '$1 $2').replace(PANGU_RE2, '$1 $2')
}

export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

export function lightenHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.round(r + (255 - r) * factor)
  const lg = Math.round(g + (255 - g) * factor)
  const lb = Math.round(b + (255 - b) * factor)
  return '#' + ((1 << 24) + (lr << 16) + (lg << 8) + lb).toString(16).slice(1)
}

/**
 * 将任意颜色值（hex / rgb / 命名色）转为带透明度的背景色。
 * @param color  原始颜色，如 "#e74c3c"、"rgb(231,76,60)"、"red"
 * @param alpha  透明度 0~1，默认 0.06（约等于 hex 末尾追加 "10" 的效果）
 */
export function withAlpha(color: string, alpha = 0.06): string {
  // 已经是 rgba 格式，直接替换 alpha
  if (/^rgba?\(/.test(color)) {
    return color.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
      const parts = inner.split(',').map((s: string) => s.trim())
      if (parts.length >= 3) return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha})`
      return color
    })
  }
  // hex 格式
  if (color.startsWith('#')) {
    const hex =
      color.length === 4
        ? '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
        : color
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  // 命名色：用 canvas 测量
  if (typeof document !== 'undefined') {
    const ctx = document.createElement('canvas').getContext('2d')
    if (ctx) {
      ctx.fillStyle = color
      const computed = ctx.fillStyle // 浏览器会转为 hex
      if (computed.startsWith('#')) {
        const r = parseInt(computed.slice(1, 3), 16)
        const g = parseInt(computed.slice(3, 5), 16)
        const b = parseInt(computed.slice(5, 7), 16)
        return `rgba(${r},${g},${b},${alpha})`
      }
    }
  }
  // 兜底：直接用 CSS color-mix
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
}

export function parseAttrs(s: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  // 匹配 key="value"、key=value（无引号）和无值布尔属性（如 round）
  s.replace(
    /([\w-]+)="([^"]*)"|([\w-]+)=([\w-]+)|([\w-]+)/g,
    (_, k1: string, v: string, k2: string, v2: string, k3: string) => {
      if (k1) attrs[k1] = v
      else if (k2) attrs[k2] = v2
      else if (k3) attrs[k3] = 'true'
      return ''
    },
  )
  return attrs
}

/** 表格单元格：剥离合并标记后的文本与跨列/跨行数（被吸收格两者均为 0） */
export interface TableCellSpan {
  text: string
  colspan: number
  rowspan: number
}

/**
 * 解析单元格内的合并标记并剥离。
 * - `{col:2}` 向右跨 2 列，`{row:3}` 向下跨 3 行，可写成 `{col:2,row:3}` 或 `{col:2}{row:3}`
 * - 整格内容仅为 `{cover}` 表示该格被相邻的合并格吸收，渲染时跳过
 * - 其它花括号内容（如 `{name}`）不是标记，原样保留
 */
export function parseCellSpan(raw: string): TableCellSpan {
  const trimmed = raw.trim()
  if (trimmed === '{cover}') return { text: '', colspan: 0, rowspan: 0 }
  let colspan = 1
  let rowspan = 1
  const text = raw
    .replace(/\{\s*[^{}]*\}/g, (block) => {
      const inner = block.slice(1, -1)
      const kvRe = /(col|row)\s*:\s*(\d+)/g
      let m: RegExpExecArray | null
      while ((m = kvRe.exec(inner)) !== null) {
        const n = parseInt(m[2], 10)
        if (m[1] === 'col') colspan = Math.max(colspan, n)
        else rowspan = Math.max(rowspan, n)
      }
      // 去掉键值对后还有别的内容，说明不是纯合并标记，保持原样
      const rest = inner.replace(/(col|row)\s*:\s*\d+/g, '').replace(/[\s,]/g, '')
      return rest ? block : ''
    })
    .trim()
  return { text, colspan, rowspan }
}
