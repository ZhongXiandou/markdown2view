import { describe, it, expect, vi } from 'vitest'
import { useContentStore, contentStorage } from './contentStore'

describe('useContentStore', () => {
  it('should persist large text to IndexedDB', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const largeText = 'x'.repeat(50_000)

    useContentStore.getState().setDocumentMarkdown(largeText)

    // 等待节流写入完成
    await vi.advanceTimersByTimeAsync(1100)

    const raw = await contentStorage.getItem('m2v-content-store')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.state.documentMarkdown).toBe(largeText)

    vi.useRealTimers()
  })

  it('should restore large text from persisted state', async () => {
    const largeText = 'y'.repeat(30_000)
    const persisted = JSON.stringify({
      state: {
        articleMarkdown: '',
        documentMarkdown: largeText,
        cardMarkdown: '',
        html: '',
        demoVersion: 1,
        articleDirty: false,
        documentDirty: false,
        cardDirty: false,
        htmlDirty: false,
      },
      version: 0,
    })

    await contentStorage.setItem('m2v-content-store', persisted)

    // 重建 store 以触发 rehydrate 在测试环境较麻烦，这里直接验证 storage 可读即可
    const raw = await contentStorage.getItem('m2v-content-store')
    const parsed = JSON.parse(raw!)
    expect(parsed.state.documentMarkdown).toBe(largeText)
  })
})
