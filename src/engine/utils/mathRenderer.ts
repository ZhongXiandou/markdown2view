/**
 * MathJax SVG 渲染器 —— 从 CDN 懒加载 tex-svg，输出自包含 SVG（微信编辑器兼容）
 */

let mathJaxReady: Promise<void> | null = null

/**
 * 加载 MathJax（CDN 懒加载，fontCache='none' 内联路径）。
 * 导出供 docx 导出等场景复用：await ensureMathJax() 后即可使用 window.MathJax。
 */
export function ensureMathJax(): Promise<void> {
  return loadMathJax()
}

function loadMathJax(): Promise<void> {
  if (mathJaxReady) return mathJaxReady

  // 在加载 MathJax 前注入配置：fontCache='none' 让路径直接内联，
  // 避免 <use xlink:href> 引用（微信编辑器不支持）
  ;(window as any).MathJax = {
    svg: {
      fontCache: 'none',
    },
    startup: {
      typeset: false,
    },
  }

  mathJaxReady = new Promise<void>((resolve, reject) => {
    if ((window as any).MathJax?.startup?.adaptor) {
      resolve()
      return
    }
    // 本地打包 + dynamic import（替代原 CDN script 注入）：
    // mathjax/es5/tex-svg.js 导入后自执行，按上面注入的配置初始化 window.MathJax
    import('mathjax/es5/tex-svg.js')
      .then(() => {
        const check = setInterval(() => {
          if ((window as any).MathJax?.startup?.adaptor) {
            clearInterval(check)
            resolve()
          }
        }, 50)
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
    const MathJax = (window as any).MathJax
    const node = MathJax.tex2svg(formula, { display: displayMode })
    const adaptor = MathJax.startup.adaptor

    const assistive = node.querySelector('mjx-assistive-mml')
    if (assistive) adaptor.remove(assistive)

    return adaptor
      .outerHTML(node)
      .replace(/currentColor/g, '#333')
      // 微信不兼容 xlink 命名空间，统一改为现代 SVG
      .replace(/xlink:href/g, 'href')
      // 强行设 display:inline（MathJax 可能通过样式表注入 display:block）
      .replace(
        /(<svg\b[^>]*style=")([^"]*)(")/i,
        (_m: string, before: string, styles: string, after: string) => {
          const cleaned = styles.replace(/display:\s*block\s*;?/gi, '')
          return `${before}display:inline;${cleaned}${after}`
        },
      )
      .replace(
        /<svg\b(?![^>]*style=")/i,
        '<svg style="display:inline"',
      )
  } catch {
    return ''
  }
}
