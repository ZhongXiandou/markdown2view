import { describe, it, expect } from 'vitest'
import { countChars, extractOutline } from './docStats'

describe('countChars', () => {
  it('剥离 front-matter、标签与 Markdown 符号后计数', () => {
    const md = ['---', 'title: 标题', '---', '', '# 一级', '', '正文**加粗**，<lead>引言</lead>。'].join('\n')
    expect(countChars(md).chars).toBe('一级正文加粗，引言。'.length)
  })

  it('正文里的分割线不会被当成 front-matter 吞掉内容', () => {
    const md = ['开头', '', '---', '', '中间段落', '', '---', '', '结尾'].join('\n')
    expect(countChars(md).chars).toBe('开头中间段落结尾'.length)
  })

  it('空文档 0 字 0 分钟，非空至少 1 分钟', () => {
    expect(countChars('')).toEqual({ chars: 0, minutes: 0 })
    expect(countChars('字').minutes).toBe(1)
    expect(countChars('字'.repeat(801)).minutes).toBe(3)
  })
})

describe('extractOutline', () => {
  it('提取 1–4 级标题并带行号，剥离行内修饰', () => {
    const md = ['# 主题', '', '## **小节** 一', '正文', '##### 五级不算', '#### 四级'].join('\n')
    expect(extractOutline(md)).toEqual([
      { level: 1, text: '主题', line: 1 },
      { level: 2, text: '小节 一', line: 3 },
      { level: 4, text: '四级', line: 6 },
    ])
  })

  it('代码围栏内的 # 不算标题（围栏按长度配对）', () => {
    const md = ['````md', '```sh', '# 注释', '```', '# 仍在外层围栏内', '````', '# 真标题'].join('\n')
    expect(extractOutline(md)).toEqual([{ level: 1, text: '真标题', line: 7 }])
  })

  it('识别 <title> 与 <p-title> 组件，正文可跨行', () => {
    const md = ['<title type="DA01">', '组件主标题', '</title>', '', '<p-title num="01">段落标题</p-title>'].join('\n')
    expect(extractOutline(md)).toEqual([
      { level: 1, text: '组件主标题', line: 1 },
      { level: 2, text: '段落标题', line: 5 },
    ])
  })

  it('<p-title> 的标题写在 title 属性里时也能识别', () => {
    const md = '<p-title num="06" title="实践路径与成功案例" subtitle="CASES" level="1"></p-title>'
    expect(extractOutline(md)).toEqual([{ level: 2, text: '实践路径与成功案例', line: 1 }])
  })
})
