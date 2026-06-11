import { useMemo, useState, useEffect, useRef } from 'react'
import CodeMirror, { EditorView, type Extension } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import type { LanguageDescription } from '@codemirror/language'
import { html } from '@codemirror/lang-html'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  /** 外部重置信号：递增时将最新 value 强制写入编辑器文档（恢复示例 / 版本刷新等场景） */
  externalVersion?: number
  onScrollerReady?: (el: HTMLElement) => void
  language?: 'markdown' | 'html'
}

const lightTheme = EditorView.theme({
  '&': { backgroundColor: '#ffffff', color: '#1f2937', height: '100%' },
  '.cm-gutters': { backgroundColor: '#fafafa', color: '#9ca3af', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'rgba(20,30,60,0.035)' },
  '.cm-activeLineGutter': { backgroundColor: '#f0f1f3' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content': { minHeight: '100%', caretColor: '#1f2937', cursor: 'text' },
  '.cm-selectionBackground': { backgroundColor: '#c7d0f5' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#aab6f0' },
})

const COMMON_LANGS = [
  'c', 'c++', 'css', 'go', 'html', 'java', 'javascript', 'json', 'jsx', 'markdown',
  'php', 'python', 'rust', 'sql', 'tsx', 'typescript', 'xml', 'yaml', 'shell', 'bash', 'sh', 'vue'
]

// 模块级预加载：在编辑器挂载前完成语言数据加载，避免运行时异步加载触发 reconfigure 导致输入丢失
let preloadedCodeLangs: LanguageDescription[] | null = null
const preloadPromise = import('@codemirror/language-data').then((m) => {
  preloadedCodeLangs = m.languages.filter((l) =>
    COMMON_LANGS.includes(l.name.toLowerCase()) || l.alias.some((a) => COMMON_LANGS.includes(a.toLowerCase()))
  )
})

export function CodeEditor({
  value,
  onChange,
  externalVersion = 0,
  onScrollerReady,
  language = 'markdown',
}: CodeEditorProps) {
  const [codeLangs, setCodeLangs] = useState<LanguageDescription[]>(() =>
    preloadedCodeLangs ?? []
  )

  // 编辑器为「挂载时受控、之后非受控」：仅用初始值创建文档，后续输入由 CodeMirror 自身维护。
  // 避免 react-codemirror 受控 value 全文替换与 IME 组合输入产生竞态导致丢字。
  const [initialValue] = useState(value)
  const viewRef = useRef<EditorView | null>(null)
  // 始终指向最新 value，供外部重置时读取（不触发受控同步）
  const valueRef = useRef(value)
  valueRef.current = value

  // 将最新 value 覆盖写入编辑器文档（仅外部变更时调用）
  const applyExternalValue = (view: EditorView) => {
    const current = view.state.doc.toString()
    if (valueRef.current !== current) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: valueRef.current } })
    }
  }

  // 外部重置信号变化 → 命令式写入；编辑器尚未创建时挂起，创建后补齐
  const appliedVersionRef = useRef(externalVersion)
  const pendingExternalRef = useRef(false)
  useEffect(() => {
    if (externalVersion === appliedVersionRef.current) return
    appliedVersionRef.current = externalVersion
    const view = viewRef.current
    if (view) {
      applyExternalValue(view)
    } else {
      pendingExternalRef.current = true
    }
  }, [externalVersion])

  // 如果模块级预加载尚未完成，等待完成后同步一次
  useEffect(() => {
    if (language === 'markdown' && preloadedCodeLangs === null) {
      preloadPromise.then(() => {
        if (preloadedCodeLangs) setCodeLangs(preloadedCodeLangs)
      })
    }
  }, [language])

  const extensions = useMemo<Extension[]>(() => {
    const langExtension =
      language === 'html'
        ? html()
        : markdown({ base: markdownLanguage, codeLanguages: codeLangs })
    return [langExtension, EditorView.lineWrapping]
  }, [language, codeLangs])

  return (
    <CodeMirror
      value={initialValue}
      onChange={onChange}
      theme={lightTheme}
      height="100%"
      style={{ height: '100%', fontSize: 14 }}
      onCreateEditor={(view) => {
        viewRef.current = view
        if (pendingExternalRef.current) {
          pendingExternalRef.current = false
          // 等 react-codemirror 完成挂载期受控同步后再覆盖，避免被其回写还原
          requestAnimationFrame(() => applyExternalValue(view))
        }
        onScrollerReady?.(view.scrollDOM)
      }}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
      }}
    />
  )
}
