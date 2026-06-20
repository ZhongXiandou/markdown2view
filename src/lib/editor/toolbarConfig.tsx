import React from 'react'
import { EditorView } from '@uiw/react-codemirror'
import {
  toggleInlineFormat,
  toggleLineStartFormat,
  toggleListFormat,
  wrapBlockFormat,
  insertDirectBlock,
} from './editorActions'

export interface ToolbarItem {
  id: string
  label: string
  icon?: React.ReactNode // icon 可以为空，如果在下拉菜单中使用
  shortcut?: string
  action: (view: EditorView) => void
}

export interface ToolbarGroup {
  id: string
  name: string
  type: 'buttons' | 'dropdown'
  items: ToolbarItem[]
}

const SvgIcon = ({ children, viewBox = '0 0 24 24' }: { children: React.ReactNode; viewBox?: string }) => (
  <svg width="14" height="14" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

export const toolbarGroups: ToolbarGroup[] = [
  {
    id: 'headers',
    name: '标题',
    type: 'buttons',
    items: [
      {
        id: 'h1',
        label: '一级标题',
        shortcut: 'Ctrl+1',
        icon: <span className="text-[13px] font-bold leading-none">H1</span>,
        action: (view) => toggleLineStartFormat(view, '# '),
      },
      {
        id: 'h2',
        label: '二级标题',
        shortcut: 'Ctrl+2',
        icon: <span className="text-[13px] font-bold leading-none">H2</span>,
        action: (view) => toggleLineStartFormat(view, '## '),
      },
      {
        id: 'h3',
        label: '三级标题',
        shortcut: 'Ctrl+3',
        icon: <span className="text-[13px] font-bold leading-none">H3</span>,
        action: (view) => toggleLineStartFormat(view, '### '),
      },
    ],
  },
  {
    id: 'inline-basic',
    name: '基础格式',
    type: 'buttons',
    items: [
      {
        id: 'bold',
        label: '加粗',
        shortcut: 'Ctrl+B',
        icon: <SvgIcon><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></SvgIcon>,
        action: (view) => toggleInlineFormat(view, '**'),
      },
      {
        id: 'italic',
        label: '斜体',
        shortcut: 'Ctrl+I',
        icon: <SvgIcon><line x1="19" y1="4" x2="10" y2="20"></line><line x1="14" y1="4" x2="5" y2="20"></line></SvgIcon>,
        action: (view) => toggleInlineFormat(view, '*'),
      },
      {
        id: 'underline',
        label: '下划线',
        shortcut: 'Ctrl+U',
        icon: <SvgIcon><path d="M6 4v6a6 6 0 0 0 12 0V4"></path><line x1="4" y1="20" x2="20" y2="20"></line></SvgIcon>,
        action: (view) => toggleInlineFormat(view, '__'),
      },
      {
        id: 'strikethrough',
        label: '删除线',
        shortcut: 'Ctrl+Shift+X',
        icon: <SvgIcon><line x1="5" y1="12" x2="19" y2="12"></line><path d="M16 6A6 6 0 0 0 4 9c0 4 6 3 6 7a6 6 0 0 1-12 3"></path></SvgIcon>,
        action: (view) => toggleInlineFormat(view, '~~'),
      },
      {
        id: 'code',
        label: '行内代码',
        shortcut: 'Ctrl+E',
        icon: <SvgIcon><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></SvgIcon>,
        action: (view) => toggleInlineFormat(view, '`'),
      },
    ],
  },
  {
    id: 'lists',
    name: '列表与引用',
    type: 'buttons',
    items: [
      {
        id: 'ul',
        label: '无序列表',
        shortcut: 'Ctrl+Shift+8',
        icon: <SvgIcon><line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><line x1="5" y1="6" x2="5.01" y2="6"></line><line x1="5" y1="12" x2="5.01" y2="12"></line><line x1="5" y1="18" x2="5.01" y2="18"></line></SvgIcon>,
        action: (view) => toggleListFormat(view, '- '),
      },
      {
        id: 'ol',
        label: '有序列表',
        shortcut: 'Ctrl+Shift+7',
        icon: <SvgIcon><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></SvgIcon>,
        action: (view) => toggleListFormat(view, '1. '),
      },
      {
        id: 'task',
        label: '任务列表',
        shortcut: 'Ctrl+Shift+9',
        icon: <SvgIcon><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></SvgIcon>,
        action: (view) => toggleListFormat(view, '- [ ] '),
      },
      {
        id: 'quote',
        label: '引用区块',
        shortcut: 'Ctrl+Shift+.',
        icon: <SvgIcon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></SvgIcon>,
        action: (view) => toggleLineStartFormat(view, '> '),
      },
      {
        id: 'divider',
        label: '横线',
        shortcut: 'Ctrl+Shift+-',
        icon: <SvgIcon><line x1="5" y1="12" x2="19" y2="12"></line></SvgIcon>,
        action: (view) => insertDirectBlock(view, '---'),
      },
    ],
  },
  {
    id: 'inline-custom',
    name: '行内标识',
    type: 'dropdown',
    items: [
      {
        id: 'highlight',
        label: '柔光重点 ::',
        shortcut: 'Ctrl+Shift+H',
        action: (view) => toggleInlineFormat(view, '::'),
      },
      {
        id: 'gradient',
        label: '渐变背景 ==',
        shortcut: 'Ctrl+Shift+G',
        action: (view) => toggleInlineFormat(view, '=='),
      },
      {
        id: 'capsule',
        label: '胶囊文字 !!',
        shortcut: 'Ctrl+Shift+C',
        action: (view) => toggleInlineFormat(view, '!!'),
      },
      {
        id: 'emphasis',
        label: '加重强调 ^^',
        shortcut: 'Ctrl+Shift+E',
        action: (view) => toggleInlineFormat(view, '^^'),
      },
      {
        id: 'lead',
        label: '引言大字 <lead>',
        shortcut: 'Ctrl+Shift+L',
        action: (view) => toggleInlineFormat(view, '<lead>'),
      },
    ],
  },
  {
    id: 'components',
    name: '块级特色组件',
    type: 'dropdown',
    items: [
      {
        id: 'steps',
        label: '步骤容器 <steps>',
        shortcut: 'Alt+S',
        action: (view) => wrapBlockFormat(view, '<steps>', '</steps>'),
      },
      {
        id: 'callout',
        label: '高亮标注 > [TIP]',
        shortcut: 'Alt+C',
        action: (view) => toggleLineStartFormat(view, '> [TIP] '),
      },
      {
        id: 'breaking',
        label: '突发要闻 <breaking>',
        shortcut: 'Alt+B',
        action: (view) => wrapBlockFormat(view, '<breaking>', '</breaking>'),
      },
      {
        id: 'engage',
        label: '互动提醒 <engage>',
        shortcut: 'Alt+E',
        action: (view) => wrapBlockFormat(view, '<engage>', '</engage>'),
      },
      {
        id: 'cta',
        label: '行动呼吁 <cta>',
        shortcut: 'Alt+A',
        action: (view) => wrapBlockFormat(view, '<cta>', '</cta>'),
      },
      {
        id: 'compare',
        label: '对比容器 <compare>',
        shortcut: 'Alt+V',
        action: (view) => wrapBlockFormat(view, '<compare>\n<left>\n</left>\n<right>\n</right>', '</compare>'),
      },
      {
        id: 'timeline',
        label: '时间轴 <timeline>',
        shortcut: 'Alt+T',
        action: (view) => wrapBlockFormat(view, '<timeline>', '</timeline>'),
      },
      {
        id: 'slider',
        label: '轮播图 <slider>',
        shortcut: 'Alt+R',
        action: (view) => wrapBlockFormat(view, '<slider>', '</slider>'),
      },
    ],
  },
  {
    id: 'gov-components',
    name: '公文组件',
    type: 'dropdown',
    items: [
      {
        id: 'gov-header',
        label: '公文头部 <gov-header>',
        shortcut: 'Alt+G',
        action: (view) => wrapBlockFormat(view, '<gov-header issuer="发文机关名称" doc-no="发文字号">', '</gov-header>'),
      },
      {
        id: 'page-break',
        label: '强制分页 <page-break>',
        shortcut: 'Alt+P',
        action: (view) => insertDirectBlock(view, '<page-break/>'),
      },
    ],
  },
]
