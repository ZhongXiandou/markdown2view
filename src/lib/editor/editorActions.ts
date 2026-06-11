import { EditorView } from '@uiw/react-codemirror'

// 1. 切换行内包裹格式 (加粗、斜体、删除线、行内代码等)
export const toggleInlineFormat = (view: EditorView, marker: string): boolean => {
  const { state } = view
  const { from, to } = state.selection.main
  const len = marker.length
  const selected = state.sliceDoc(from, to)

  // 检测选中文本自身是否被 marker 包裹 (特例：如果是包裹 <lead> 这样的非对称标签，这里目前只处理对称标记如 ** 或 ::)
  // 为了支持非对称标签（如 <lead> 和 </lead>），我们需要区分 marker 是不是一个标签。
  let openMarker = marker
  let closeMarker = marker
  if (marker.startsWith('<') && marker.endsWith('>')) {
    const tagName = marker.slice(1, -1)
    openMarker = `<${tagName}>`
    closeMarker = `</${tagName}>`
  }

  const openLen = openMarker.length
  const closeLen = closeMarker.length

  const isWrappedSelf =
    selected.startsWith(openMarker) &&
    selected.endsWith(closeMarker) &&
    selected.length >= openLen + closeLen

  const surroundingBefore = state.sliceDoc(Math.max(0, from - openLen), from)
  const surroundingAfter = state.sliceDoc(to, to + closeLen)
  const isWrappedSurrounding = surroundingBefore === openMarker && surroundingAfter === closeMarker

  if (isWrappedSelf) {
    const unwrapped = selected.slice(openLen, -closeLen)
    view.dispatch({
      changes: { from, to, insert: unwrapped },
      selection: { anchor: from, head: from + unwrapped.length },
    })
  } else if (isWrappedSurrounding) {
    view.dispatch({
      changes: { from: from - openLen, to: to + closeLen, insert: selected },
      selection: { anchor: from - openLen, head: to - openLen },
    })
  } else {
    view.dispatch({
      changes: { from, to, insert: `${openMarker}${selected}${closeMarker}` },
      selection: { anchor: from + openLen, head: from + openLen + selected.length },
    })
  }
  view.focus()
  return true
}

// 2. 包裹块级标签 (如自定义特色标签 <steps>, <breaking> 等)
export const wrapBlockFormat = (view: EditorView, before: string, after: string): boolean => {
  const { state } = view
  const { from, to } = state.selection.main
  const selected = state.sliceDoc(from, to)

  // 如果 selected 为空，插入占位符
  const innerContent = selected || '在这里输入内容'

  const insertText = `\n${before}\n${innerContent}\n${after}\n`
  view.dispatch({
    changes: { from, to, insert: insertText },
    selection: {
      anchor: from + before.length + 2,
      head: from + before.length + 2 + innerContent.length,
    },
  })
  view.focus()
  return true
}

// 3. 切换行首字符前缀格式 (标题, 引用)
export const toggleLineStartFormat = (view: EditorView, prefix: string): boolean => {
  const { state } = view
  const { from } = state.selection.main
  const line = state.doc.lineAt(from)
  const lineText = line.text

  const headerRegex = /^(#{1,4})\s+/
  const quoteRegex = /^>\s+(?:\[(TIP|NOTE|WARNING|CAUTION|IMPORTANT)\]\s+)?/

  let newText = lineText

  if (prefix.startsWith('#')) {
    const match = lineText.match(headerRegex)
    if (match) {
      const existingPrefix = match[0]
      if (existingPrefix.trim() === prefix.trim()) {
        newText = lineText.replace(headerRegex, '')
      } else {
        newText = prefix + lineText.replace(headerRegex, '')
      }
    } else {
      newText = prefix + lineText
    }
  } else if (prefix.startsWith('> ')) {
    const match = lineText.match(quoteRegex)
    if (match) {
      const existingPrefix = match[0]
      if (existingPrefix.trim() === prefix.trim()) {
        newText = lineText.replace(quoteRegex, '')
      } else {
        newText = prefix + lineText.replace(quoteRegex, '')
      }
    } else {
      newText = prefix + lineText
    }
  }

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: newText },
    selection: { anchor: line.from + newText.length },
  })
  view.focus()
  return true
}

// 4. 切换行首列表前缀 (无序列表, 有序列表, 任务列表)
export const toggleListFormat = (view: EditorView, listPrefix: string): boolean => {
  const { state } = view
  const { from, to } = state.selection.main
  const startLineNum = state.doc.lineAt(from).number
  const endLineNum = state.doc.lineAt(to).number

  const changes: { from: number; to: number; insert: string }[] = []
  const listRegex = /^(\s*)(-|\*|\d+\.)(\s+\[[ x]\])?\s+/

  for (let i = startLineNum; i <= endLineNum; i++) {
    const line = state.doc.line(i)
    const lineText = line.text
    const match = lineText.match(listRegex)

    let newLineText = lineText
    if (match) {
      const matchedPrefix = match[0]
      const cleanPrefix = matchedPrefix.trim()
      const isSameType =
        (listPrefix === '- ' && (cleanPrefix === '-' || cleanPrefix === '*')) ||
        (listPrefix === '- [ ] ' && (cleanPrefix === '- [ ]' || cleanPrefix === '- [x]')) ||
        (listPrefix === '1. ' && /^\d+\.$/.test(cleanPrefix))

      if (isSameType) {
        newLineText = lineText.replace(listRegex, '')
      } else {
        newLineText = listPrefix + lineText.replace(listRegex, '')
      }
    } else {
      newLineText = listPrefix + lineText
    }
    changes.push({ from: line.from, to: line.to, insert: newLineText })
  }

  view.dispatch({
    changes,
  })
  view.focus()
  return true
}

// 5. 插入块级横线等
export const insertDirectBlock = (view: EditorView, text: string): boolean => {
  const { state } = view
  const { from, to } = state.selection.main
  const insertText = `\n${text}\n`
  view.dispatch({
    changes: { from, to, insert: insertText },
    selection: { anchor: from + insertText.length },
  })
  view.focus()
  return true
}
