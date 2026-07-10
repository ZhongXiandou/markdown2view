// 多页 HTML 检测与提取工具。
// 约定：每个页面用 <section class="page|slide|card"> 包裹，
// 系统自动检测并支持逐页预览、翻页和导出。

export interface PageInfo {
  index: number
  label: string
  node: HTMLElement
}

// 页面选择器：任何带 .page / .slide / .card 类的元素（section、div、article 等）
const PAGE_SELECTOR = '.page, .slide, .card'

/**
 * 从 iframe document 中检测多页节点。
 * 返回空数组表示是单页长文档。
 */
export function detectPages(doc: Document): PageInfo[] {
  const nodes = doc.querySelectorAll<HTMLElement>(PAGE_SELECTOR)
  if (nodes.length <= 0) return []

  return Array.from(nodes).map((node, index) => {
    const classList = Array.from(node.classList)
    let type = '页'
    if (classList.includes('slide')) type = '幻灯片'
    else if (classList.includes('card')) type = '卡片'
    return {
      index,
      label: `${type} ${index + 1}`,
      node,
    }
  })
}
