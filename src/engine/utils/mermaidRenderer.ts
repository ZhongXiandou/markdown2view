/**
 * Mermaid 渲染器 —— 本地打包 dynamic import 懒加载，输出自包含 SVG 字符串。
 *
 * 与 mathRenderer.ts 同构：ensureXxx 懒加载 + renderXxx 单次渲染。
 * mermaid 依赖 DOM，渲染时创建 offscreen 容器，渲染后立即移除。
 */

import type { Mermaid } from 'mermaid'

let mermaidReady: Promise<Mermaid> | null = null

/**
 * 懒加载 mermaid 库（dynamic import → Vite 拆独立 chunk → PWA app-chunks 缓存 → 离线可用）。
 * 幂等：多次调用返回同一 Promise。
 */
export function ensureMermaid(): Promise<Mermaid> {
  if (mermaidReady) return mermaidReady
  mermaidReady = import('mermaid').then((m) => {
    const mermaid = m.default
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral', // 中性主题，适配 A4 正式文档与卡片
      securityLevel: 'strict', // 安全：禁用源码中的 html 标签
      flowchart: { useMaxWidth: false }, // 关闭：让 mermaid 输出自然尺寸 + viewBox，由外层 CSS 控制响应
    })
    return mermaid
  })
  return mermaidReady
}

export interface MermaidRenderResult {
  svg: string
  error?: string
}

/**
 * 把一段 mermaid 源码渲染为自包含 SVG 字符串。
 *
 * @param source mermaid 源码（不含 ```mermaid 围栏）
 * @param containerWidth 内容区像素宽度，用于 mermaid 内部布局自适应换行
 * @returns 成功返回 { svg }；失败返回 { svg: '', error }
 */
export async function renderMermaidDiagram(
  source: string,
  containerWidth: number,
): Promise<MermaidRenderResult> {
  const mermaid = await ensureMermaid()
  // offscreen 容器：宽度=containerWidth，让 mermaid 按真实可用宽排版
  const host = document.createElement('div')
  host.style.cssText = `position:absolute;left:-9999px;top:0;width:${containerWidth}px;visibility:hidden`
  document.body.appendChild(host)
  try {
    const id = `m2v-mermaid-${Math.random().toString(36).slice(2, 10)}`
    const { svg: rawSvg } = await mermaid.render(id, source, host)
    // 剥除 mermaid 输出的固定 width/height（保留 viewBox 维持宽高比），
    // 让外层 CSS（width:100%; max-width:100%）控制响应式尺寸
    const svg = rawSvg
      .replace(/(<svg\b[^>]*?)\s+width="[^"]*"/gi, '$1')
      .replace(/(<svg\b[^>]*?)\s+height="[^"]*"/gi, '$1')
    return { svg }
  } catch (e) {
    return { svg: '', error: (e as Error)?.message || '图表渲染失败' }
  } finally {
    host.remove()
  }
}
