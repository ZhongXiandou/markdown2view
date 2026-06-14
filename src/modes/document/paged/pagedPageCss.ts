import type { DocumentSettings } from '../documentModel'

/**
 * 由文档设置生成喂给 Paged.js 的样式表（仅含分页/页面外壳相关规则）。
 *
 * 内容排版样式（.document-* 字号/居中/缩进/表格/引用等）通过「克隆父页样式表」
 * 复用，本函数只负责 Paged.js 特有的：@page 页面与页边距、页眉页脚 margin box、
 * 页码计数器、封面具名页、分页标记、表格按行分片，以及对既有 break-inside 的放开。
 */

/** 把任意文本转为 CSS content 的字符串字面量（转义反斜杠与引号） */
function cssString(text: string): string {
  return '"' + text.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

/** 把页脚模板（含 {page}/{total}）转为 CSS content 值（用 counter 替换占位符） */
function footerToContent(template: string): string {
  const parts = template.split(/(\{page\}|\{total\})/)
  const pieces: string[] = []
  for (const part of parts) {
    if (part === '{page}') pieces.push('counter(page)')
    else if (part === '{total}') pieces.push('counter(pages)')
    else if (part) pieces.push(cssString(part))
  }
  return pieces.length ? pieces.join(' ') : '""'
}

export function buildPageCss(settings: DocumentSettings, docTitle: string): string {
  const { pageWidth, pageHeight, marginTop, marginRight, marginBottom, marginLeft } = settings
  const headerLeft = settings.headerLeft || docTitle || 'markdown2view'
  const headerRight = settings.headerRight || ''
  const footerContent = footerToContent(settings.footerText || '第 {page} / {total} 页')
  const contentHeight = pageHeight - marginTop - marginBottom

  return `
/* ===== @page：页面尺寸 / 页边距 / 页眉页脚 / 页码 ===== */
@page {
  size: ${pageWidth}px ${pageHeight}px;
  margin: ${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px;

  @top-left {
    content: ${cssString(headerLeft)};
    font-size: 12px; color: #94a3b8; white-space: nowrap;
    vertical-align: bottom; padding-bottom: 6px;
    border-bottom: 1px solid #cbd5e1;
  }
  @top-center {
    content: "";
    vertical-align: bottom; padding-bottom: 6px;
    border-bottom: 1px solid #cbd5e1;
  }
  @top-right {
    content: ${cssString(headerRight)};
    font-size: 12px; color: #94a3b8; white-space: nowrap; text-align: right;
    vertical-align: bottom; padding-bottom: 6px;
    border-bottom: 1px solid #cbd5e1;
  }
  @bottom-center {
    content: ${footerContent};
    font-size: 12px; color: #94a3b8; vertical-align: top; padding-top: 6px;
  }
}

/* 封面页：内容上下等距分布；页眉页脚沿用默认 @page（首页同样显示页眉页脚） */
.document-cover {
  break-after: page;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  min-height: ${contentHeight}px;
}

/* 显式分页标记（来自 <page-break>） */
.document-pagebreak { break-after: page; }

/* ===== Paged.js 适配：放开可拆块的 break-inside（覆盖 index.css 的 avoid）===== */
.document-block {
  break-inside: auto !important;
  page-break-inside: auto !important;
}
.document-block[data-kind='heading'],
.document-block[data-kind='image'],
.document-block[data-kind='rule'],
.document-block[data-kind='component'],
.document-block.document-code-atomic {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
/* 标题不与下一块孤立断开 */
.document-block[data-kind='heading'] { break-after: avoid; }

/* 段落孤寡行（决策 1/0；CSS 最小值为 1） */
.document-block p { orphans: 1; widows: 1; }

/* ===== 表格按行跨页 ===== */
.document-block[data-kind='table'] table { break-inside: auto; }
.document-block[data-kind='table'] thead { display: table-header-group; }
.document-block[data-kind='table'] tr { break-inside: avoid; }

/* 续表标记（由 TableContinuationHandler 注入） */
.continued-caption {
  text-align: center;
  font-size: 12px;
  color: rgb(100, 116, 139);
  font-style: italic;
  margin: 0 0 8px;
}

/* ===== 图/表题注居中 =====
   index.css 的 .document-block p{text-align:justify!important} 会盖过题注内联的 center；
   旧版靠 .document-page .document-caption 顶回，iframe 无 .document-page 祖先而失效。
   这里用 .document-content p.document-caption（特异性 0,2,1 > .document-block p 0,1,1）顶回居中。*/
.document-content section[data-caption-kind] {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
}
.document-content p.document-caption {
  width: 100% !important;
  margin: 0 !important;
  text-align: center !important;
  text-indent: 0 !important;
  font-size: 13px !important;
  color: rgb(100, 116, 139) !important;
  white-space: nowrap !important;
}

/* ===== 列表文字与正文一致 =====
   引擎用 section+span 渲染列表（无 <li>），文字 span 无显式字号/颜色会继承 body 默认，
   与正文 <p>（rgb(51,65,85) + var(--doc-font-size)）不一致。此处对列表块统一基准。*/
.document-content .document-block[data-kind='list'] {
  font-size: var(--doc-font-size, 15px) !important;
  line-height: var(--doc-line-height, 1.9) !important;
  color: rgb(51, 65, 85) !important;
}

/* ===== 表格单元格文字垂直居中（覆盖引擎内联 vertical-align:top）===== */
.document-content .document-block td,
.document-content .document-block th {
  vertical-align: middle !important;
}
`
}
