/**
 * CodeMirror 内置界面文案的中文翻译（查找替换面板、代码折叠等）。
 * 键名是 CodeMirror 各扩展里的英文原文，必须逐字一致才会生效。
 */
export const zhPhrases: Record<string, string> = {
  // @codemirror/search
  Find: '查找',
  Replace: '替换为',
  next: '下一个',
  previous: '上一个',
  all: '全选匹配',
  'match case': '区分大小写',
  regexp: '正则',
  'by word': '全字匹配',
  replace: '替换',
  'replace all': '全部替换',
  close: '关闭',
  'current match': '当前匹配',
  'replaced $ matches': '已替换 $ 处',
  'replaced match on line $': '已替换第 $ 行的匹配',
  'on line': '位于第',
  'Go to line': '跳转到行',
  go: '跳转',
  // @codemirror/language（折叠）
  'Folded lines': '已折叠的行',
  'Unfolded lines': '已展开的行',
  to: '至',
  'folded code': '已折叠的代码',
  unfold: '展开',
  'Fold line': '折叠该行',
  'Unfold line': '展开该行',
}
