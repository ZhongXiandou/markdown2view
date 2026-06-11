import { KeyBinding } from '@uiw/react-codemirror'
import {
  toggleInlineFormat,
  toggleLineStartFormat,
  toggleListFormat,
  wrapBlockFormat,
  insertDirectBlock,
} from './editorActions'

export const editorShortcuts: KeyBinding[] = [
  // 基础格式
  { key: 'Mod-b', run: (view) => toggleInlineFormat(view, '**') }, // 加粗
  { key: 'Mod-i', run: (view) => toggleInlineFormat(view, '*') }, // 斜体
  { key: 'Mod-u', run: (view) => toggleInlineFormat(view, '__') }, // 下划线
  { key: 'Mod-e', run: (view) => toggleInlineFormat(view, '`') }, // 行内代码

  // 自定义行内标识
  { key: 'Mod-Shift-x', run: (view) => toggleInlineFormat(view, '~~') }, // 删除线
  { key: 'Mod-Shift-h', run: (view) => toggleInlineFormat(view, '::') }, // 柔光重点
  { key: 'Mod-Shift-g', run: (view) => toggleInlineFormat(view, '==') }, // 渐变背景
  { key: 'Mod-Shift-c', run: (view) => toggleInlineFormat(view, '!!') }, // 胶囊文字
  { key: 'Mod-Shift-e', run: (view) => toggleInlineFormat(view, '^^') }, // 加重强调
  { key: 'Mod-Shift-ArrowUp', run: (view) => toggleInlineFormat(view, '^') }, // 上标
  { key: 'Mod-Shift-ArrowDown', run: (view) => toggleInlineFormat(view, '~') }, // 下标
  { key: 'Mod-Shift-l', run: (view) => toggleInlineFormat(view, '<lead>') }, // 引言大字

  // 块级结构与特色容器
  { key: 'Mod-1', run: (view) => toggleLineStartFormat(view, '# ') },
  { key: 'Mod-2', run: (view) => toggleLineStartFormat(view, '## ') },
  { key: 'Mod-3', run: (view) => toggleLineStartFormat(view, '### ') },
  { key: 'Mod-4', run: (view) => toggleLineStartFormat(view, '#### ') },

  { key: 'Mod-Shift-8', run: (view) => toggleListFormat(view, '- ') }, // 无序列表
  { key: 'Mod-Shift-7', run: (view) => toggleListFormat(view, '1. ') }, // 有序列表
  { key: 'Mod-Shift-9', run: (view) => toggleListFormat(view, '- [ ] ') }, // 任务列表
  { key: 'Mod-Shift-.', run: (view) => toggleLineStartFormat(view, '> ') }, // 引用区块
  { key: 'Mod-Shift--', run: (view) => insertDirectBlock(view, '---') }, // 分割线

  // Alt 组合的特色容器
  { key: 'Alt-s', run: (view) => wrapBlockFormat(view, '<steps>', '</steps>') }, // 步骤容器
  { key: 'Alt-c', run: (view) => toggleLineStartFormat(view, '> [TIP] ') }, // 高亮标注 (Callout)
  { key: 'Alt-b', run: (view) => wrapBlockFormat(view, '<breaking>', '</breaking>') }, // 突发要闻
  { key: 'Alt-e', run: (view) => wrapBlockFormat(view, '<engage>', '</engage>') }, // 互动提醒
  { key: 'Alt-a', run: (view) => wrapBlockFormat(view, '<cta>', '</cta>') }, // 行动呼吁
  { key: 'Alt-v', run: (view) => wrapBlockFormat(view, '<compare>\n<left>\n</left>\n<right>\n</right>', '</compare>') }, // 对比容器
  { key: 'Alt-t', run: (view) => wrapBlockFormat(view, '<timeline>', '</timeline>') }, // 时间轴
  { key: 'Alt-r', run: (view) => wrapBlockFormat(view, '<slider>', '</slider>') }, // 轮播图
  {
    key: 'Mod-k',
    run: (view) => {
      const { state } = view
      const { from, to } = state.selection.main
      const selected = state.sliceDoc(from, to)
      const insertText = `[${selected}](url)`
      view.dispatch({
        changes: { from, to, insert: insertText },
        selection: { anchor: from + 1, head: from + 1 + selected.length },
      })
      return true
    },
  },
]
