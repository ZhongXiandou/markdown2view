/**
 * MathJax SVG 渲染器 —— 本地打包 dynamic import 懒加载 tex-svg，输出自包含 SVG（微信编辑器兼容）
 */

let mathJaxReady: Promise<void> | null = null

/**
 * 加载 MathJax（本地打包 dynamic import 懒加载，fontCache='none' 内联路径）。
 * 导出供 docx 导出等场景复用：await ensureMathJax() 后即可使用 window.MathJax。
 */
export function ensureMathJax(): Promise<void> {
  return loadMathJax()
}

function loadMathJax(): Promise<void> {
  if (mathJaxReady) return mathJaxReady

  // 在加载 MathJax 前注入配置：fontCache='none' 让路径直接内联，
  // 避免 <use xlink:href> 引用（微信编辑器不支持）
  window.MathJax = {
    svg: {
      fontCache: 'none',
    },
    startup: {
      typeset: false,
    },
  }

  mathJaxReady = new Promise<void>((resolve, reject) => {
    if (window.MathJax?.startup?.adaptor) {
      resolve()
      return
    }
    // 本地打包 + dynamic import（替代原 CDN script 注入）：
    // mathjax/es5/tex-svg.js 导入后自执行，按上面注入的配置初始化 window.MathJax
    import('mathjax/es5/tex-svg.js')
      .then(() => {
        const check = setInterval(() => {
          if (window.MathJax?.startup?.adaptor) {
            clearInterval(check)
            resolve()
          }
        }, 50)
        // 超时保护：10秒后如果 adaptor 仍未就绪，清除轮询并 reject
        setTimeout(() => {
          clearInterval(check)
          reject(new Error('MathJax initialization timeout'))
        }, 10000)
      })
      .catch((e) => {
        mathJaxReady = null
        reject(new Error('MathJax load failed: ' + (e as Error)?.message))
      })
  })

  return mathJaxReady
}

export function preloadMathJax(): void {
  loadMathJax().catch(() => {})
}

/**
 * 使用 MathJax 将 LaTeX 公式渲染为自包含 SVG。
 * - fontCache='none' 确保路径直接内联（无 <use> 引用）
 * - 替换 currentColor → #333（微信不兼容 CSS 关键字）
 */
export async function renderMath(formula: string, displayMode: boolean = false): Promise<string> {
  await loadMathJax()
  try {
    const MathJax = window.MathJax
    if (!MathJax?.tex2svg) return ''
    const node = MathJax.tex2svg(formula, { display: displayMode })
    const adaptor = MathJax.startup.adaptor
    if (!adaptor) return ''

    const assistive = node.querySelector('mjx-assistive-mml')
    if (assistive) adaptor.remove(assistive)

    return adaptor
      .outerHTML(node)
      .replace(/currentColor/g, '#333')
      // 微信不兼容 xlink 命名空间，统一改为现代 SVG
      .replace(/xlink:href/g, 'href')
      // 强行设 display:inline + max-width:none!important
      // 公众号编辑器会注入 max-width:100% 压缩 SVG，导致公式变形；内联 !important 对抗
      .replace(
        /(<svg\b[^>]*style=")([^"]*)(")/i,
        (_m: string, before: string, styles: string, after: string) => {
          const cleaned = styles.replace(/display:\s*block\s*;?/gi, '')
          return `${before}display:inline;max-width:none!important;${cleaned}${after}`
        },
      )
      .replace(
        /<svg\b(?![^>]*style=")/i,
        '<svg style="display:inline;max-width:none!important"',
      )
  } catch {
    return ''
  }
}
