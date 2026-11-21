import { describe, it, expect, beforeEach } from 'vitest'
import { useContentStore, getModeContent, setModeContent } from './contentStore'
import { useLibraryStore, deriveDocTitle, MAX_SNAPSHOTS_PER_DOC } from './libraryStore'

const lib = () => useLibraryStore.getState()

describe('libraryStore', () => {
  beforeEach(() => {
    useLibraryStore.setState({ libraries: {}, snapshots: {} })
    useContentStore.setState({ articleMarkdown: '# 第一篇\n\n正文一', html: '<h1>页面</h1>' })
  })

  it('首次使用时把当前内容登记为第一篇文档，不改动内容', () => {
    const l = lib().ensureLibrary('article')
    expect(l.docs).toHaveLength(1)
    expect(l.docs[0].title).toBe('第一篇')
    expect(l.activeId).toBe(l.docs[0].id)
    expect(getModeContent('article')).toBe('# 第一篇\n\n正文一')
  })

  it('新建文档后切回原文档，两边内容互不影响', () => {
    const firstId = lib().ensureLibrary('article').activeId
    expect(lib().createDoc('article')).toBe(true)
    const secondId = lib().libraries.article!.activeId
    expect(secondId).not.toBe(firstId)
    expect(getModeContent('article')).toBe('# 未命名文档\n')

    setModeContent('article', '# 第二篇\n\n正文二')
    lib().switchDoc('article', firstId)
    expect(getModeContent('article')).toBe('# 第一篇\n\n正文一')
    expect(lib().libraries.article!.docs.find((d) => d.id === secondId)).toMatchObject({
      title: '第二篇',
      content: '# 第二篇\n\n正文二',
    })

    lib().switchDoc('article', secondId)
    expect(getModeContent('article')).toBe('# 第二篇\n\n正文二')
    // 各模式的文档清单相互独立
    expect(lib().libraries.html).toBeUndefined()
  })

  it('重命名优先于自动标题，清空名称后回到自动标题', () => {
    const id = lib().ensureLibrary('article').activeId
    lib().renameDoc('article', id, '  我的草稿  ')
    expect(lib().libraries.article!.docs[0].name).toBe('我的草稿')
    lib().renameDoc('article', id, '   ')
    expect(lib().libraries.article!.docs[0].name).toBeUndefined()
  })

  it('只剩一篇时不可删除；删除当前文档会切到另一篇并清掉它的快照', () => {
    const firstId = lib().ensureLibrary('article').activeId
    expect(lib().deleteDoc('article', firstId)).toBe(false)

    lib().createDoc('article')
    const secondId = lib().libraries.article!.activeId
    setModeContent('article', '# 第二篇')
    lib().addSnapshot('article', '手动保存')
    expect(lib().snapshots[secondId]).toHaveLength(1)

    expect(lib().deleteDoc('article', secondId)).toBe(true)
    expect(lib().libraries.article!.activeId).toBe(firstId)
    expect(getModeContent('article')).toBe('# 第一篇\n\n正文一')
    expect(lib().snapshots[secondId]).toBeUndefined()
  })

  it('快照去重、空内容不存、数量有上限且新的在前', () => {
    const id = lib().ensureLibrary('article').activeId
    expect(lib().addSnapshot('article', '手动保存')).toBe(true)
    expect(lib().addSnapshot('article', '自动保存')).toBe(false)
    setModeContent('article', '   ')
    expect(lib().addSnapshot('article', '自动保存')).toBe(false)

    for (let i = 0; i < MAX_SNAPSHOTS_PER_DOC + 5; i++) {
      setModeContent('article', `版本 ${i}`)
      lib().addSnapshot('article', '自动保存')
    }
    const list = lib().snapshots[id]
    expect(list).toHaveLength(MAX_SNAPSHOTS_PER_DOC)
    expect(list[0].content).toBe(`版本 ${MAX_SNAPSHOTS_PER_DOC + 4}`)
  })

  it('恢复快照前会先为当前内容存档', () => {
    const id = lib().ensureLibrary('article').activeId
    lib().addSnapshot('article', '手动保存')
    const snapId = lib().snapshots[id][0].id
    setModeContent('article', '改坏了的内容')

    lib().restoreSnapshot('article', snapId)
    expect(getModeContent('article')).toBe('# 第一篇\n\n正文一')
    expect(lib().snapshots[id][0]).toMatchObject({ reason: '恢复历史版本前', content: '改坏了的内容' })
  })

  it('deriveDocTitle：HTML 取 <title> 或 <h1>，都没有时为未命名', () => {
    expect(deriveDocTitle('html', '<html><head><title>报告</title></head></html>')).toBe('报告')
    expect(deriveDocTitle('html', '<h1 class="x">大标题</h1>')).toBe('大标题')
    expect(deriveDocTitle('html', '<div></div>')).toBe('未命名文档')
    expect(deriveDocTitle('document', '')).toBe('未命名文档')
  })
})
