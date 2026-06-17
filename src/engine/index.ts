// 渲染引擎对外统一出口。引擎为框架无关的纯 TS，移植自 r-markdown。

export {
  parseMarkdown,
  parseMarkdownAsync,
  collectFormulas,
  preRenderFormulas,
  collectMermaidDiagrams,
  preRenderMermaid,
} from './utils/markdownParser'
export { renderMermaidDiagram, ensureMermaid } from './utils/mermaidRenderer'
export { inlineFormat } from './utils/inlineFormat'
export { extractMath, restoreMath } from './utils/math'
export { renderCodeBlock } from './utils/codeBlock'
export { components, componentMap, tagMap, type ComponentDef } from './editor-components'
export {
  THEMES,
  makeColors,
  hexToRgb,
  lightenHex,
  darkenHex,
  type ThemeColors,
} from './composables/useTheme'
