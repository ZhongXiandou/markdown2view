import { describe, it, expect, vi } from 'vitest'
import { exportElementsToPdf } from './exportPdf'

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockReturnValue({
    addPage: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
  }),
}))

vi.mock('modern-screenshot', () => ({
  domToJpeg: vi.fn(),
}))

describe('exportPdf signal handling', () => {
  it('restores display style when aborted during exportElementsToPdf', async () => {
    const { domToJpeg } = await import('modern-screenshot')
    const controller = new AbortController()

    let release: (() => void) | undefined
    const deferred = new Promise<void>((resolve) => {
      release = resolve
      // abort 时立即释放，避免测试挂起
      controller.signal.addEventListener('abort', () => resolve(), { once: true })
      // 安全网：避免测试意外挂起
      setTimeout(resolve, 200)
    })
    vi.mocked(domToJpeg).mockImplementation(async () => {
      await deferred
      return 'data:image/jpeg;base64,xxx'
    })

    const el = document.createElement('div')
    el.style.display = 'none'
    document.body.appendChild(el)

    try {
      const promise = exportElementsToPdf([el], 'test.pdf', { width: 800, height: 600, signal: controller.signal })

      // 在 domToJpeg 挂起时 abort
      setTimeout(() => controller.abort(), 10)

      await expect(promise).rejects.toThrow(/aborted/i)

      // 即使取消，finally 也要恢复原始 display 状态
      expect(el.style.display).toBe('none')
    } finally {
      if (el.parentNode) document.body.removeChild(el)
      release?.()
    }
  })

  it('aborts before starting any page', async () => {
    const controller = new AbortController()
    controller.abort()

    const el = document.createElement('div')
    el.style.display = 'none'
    document.body.appendChild(el)

    try {
      await expect(exportElementsToPdf([el], 'test.pdf', { width: 800, height: 600, signal: controller.signal }))
        .rejects.toThrow(/aborted/i)
      expect(el.style.display).toBe('none')
    } finally {
      if (el.parentNode) document.body.removeChild(el)
    }
  })
})
