import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock pptxgenjs：记录 addSlide/addImage/writeFile/defineLayout 调用
const pptxMock = {
  defineLayout: vi.fn(),
  layout: '',
  addSlide: vi.fn().mockReturnValue({
    addImage: vi.fn(),
  }),
  writeFile: vi.fn().mockResolvedValue(undefined),
}
vi.mock('pptxgenjs', () => ({
  default: vi.fn(() => pptxMock),
}))

// mock exportImage：captureElementInIframeToBlob 返回可控 blob/尺寸
vi.mock('./exportImage', () => ({
  resolveBackground: vi.fn().mockReturnValue('#ffffff'),
  captureElementInIframeToBlob: vi.fn(),
  sanitizeFilename: (name: string) => name,
}))

import { captureElementInIframeToBlob } from './exportImage'
import { exportIframeToPptx, exportSinglePageToPptx } from './exportPpt'

function makeIframe() {
  const doc = document.createElement('iframe')
  // jsdom 不支持 contentDocument，用 Object.defineProperty 模拟
  Object.defineProperty(doc, 'contentDocument', {
    value: document.implementation.createHTMLDocument(),
    configurable: true,
  })
  Object.defineProperty(doc, 'contentWindow', {
    value: window,
    configurable: true,
  })
  return doc
}

function makePageNode() {
  const node = document.createElement('section')
  node.className = 'slide'
  return node
}

describe('exportPpt image-based', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(captureElementInIframeToBlob).mockResolvedValue({
      blob: new Blob(['x'], { type: 'image/jpeg' }),
      width: 1600,
      height: 900,
    })
  })

  it('exportIframeToPptx 逐页截图并写入 PPTX，恢复 display', async () => {
    const iframe = makeIframe()
    const pages = [makePageNode(), makePageNode()]
    pages.forEach((p) => (p.style.display = ''))

    await exportIframeToPptx(iframe, pages, 'test', {})

    // 每页截图一次
    expect(captureElementInIframeToBlob).toHaveBeenCalledTimes(2)
    // 两张幻灯片
    expect(pptxMock.addSlide).toHaveBeenCalledTimes(2)
    // 写入文件
    expect(pptxMock.writeFile).toHaveBeenCalledWith({ fileName: 'test.pptx' })
    // 首页定义布局
    expect(pptxMock.defineLayout).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'M2V_CUSTOM', width: 10 }),
    )
  })

  it('abort 时恢复 display 并抛出', async () => {
    const iframe = makeIframe()
    const pages = [makePageNode(), makePageNode()]
    const controller = new AbortController()

    // 让截图挂起，abort 后释放
    let release: (() => void) | undefined
    const deferred = new Promise<void>((resolve) => {
      release = resolve
      controller.signal.addEventListener('abort', () => resolve(), { once: true })
      setTimeout(resolve, 200)
    })
    vi.mocked(captureElementInIframeToBlob).mockImplementationOnce(async () => {
      await deferred
      return { blob: new Blob(['x']), width: 1600, height: 900 }
    })

    const promise = exportIframeToPptx(iframe, pages, 'test', { signal: controller.signal })
    setTimeout(() => controller.abort(), 10)

    await expect(promise).rejects.toThrow(/aborted|取消/i)
    // display 已恢复
    expect(pages[0].style.display).toBe('')
    expect(pages[1].style.display).toBe('')
    release?.()
  })

  it('exportSinglePageToPptx 单页导出', async () => {
    const iframe = makeIframe()
    const doc = iframe.contentDocument!
    const wrapper = document.createElement('div')
    doc.body.appendChild(wrapper)

    await exportSinglePageToPptx(iframe, 'single', {})

    expect(captureElementInIframeToBlob).toHaveBeenCalledTimes(1)
    expect(pptxMock.addSlide).toHaveBeenCalledTimes(1)
    expect(pptxMock.writeFile).toHaveBeenCalledWith({ fileName: 'single.pptx' })
  })
})
