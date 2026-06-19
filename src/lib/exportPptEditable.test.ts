import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock pptxgenjs
const slideMock = {
  addText: vi.fn(),
  addImage: vi.fn(),
  background: undefined as { color: string } | undefined,
}
const pptxMock = {
  defineLayout: vi.fn(),
  layout: '',
  addSlide: vi.fn().mockReturnValue(slideMock),
  writeFile: vi.fn().mockResolvedValue(undefined),
}
vi.mock('pptxgenjs', () => ({
  default: vi.fn(() => pptxMock),
}))

vi.mock('./exportImage', () => ({
  resolveBackground: vi.fn().mockReturnValue('#ffffff'),
  captureElementInIframeToBlob: vi.fn(),
  sanitizeFilename: (name: string) => name,
}))

import { extractSlideElements, colorToHex } from './exportPptEditable'

/** 给元素设置 getBoundingClientRect 返回值 */
function mockRect(el: Element, rect: { left: number; top: number; width: number; height: number }) {
  el.getBoundingClientRect = () =>
    ({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => {},
    }) as DOMRect
}

/** mock getComputedStyle：返回指定样式 */
function mockComputed(win: Window, styles: Record<string, string>) {
  const real = win.getComputedStyle.bind(win)
  vi.spyOn(win, 'getComputedStyle').mockImplementation((el: Element) => {
    const fake = real(el)
    return new Proxy(fake, {
      get(target, prop: string) {
        if (prop in styles) return styles[prop]
        return target[prop as keyof CSSStyleDeclaration]
      },
    }) as CSSStyleDeclaration
  })
}

describe('colorToHex', () => {
  it('rgb 转 6 位 HEX', () => {
    expect(colorToHex('rgb(255, 0, 0)')).toBe('ff0000')
    expect(colorToHex('rgb(16, 33, 240)')).toBe('1021f0')
  })
  it('rgba 转 HEX（忽略 alpha）', () => {
    expect(colorToHex('rgba(0, 128, 255, 0.5)')).toBe('0080ff')
  })
  it('无效颜色返回 null', () => {
    expect(colorToHex('transparent')).toBeNull()
    expect(colorToHex('#fff')).toBeNull()
  })
})

describe('extractSlideElements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('提取叶子文本容器（无子元素）', () => {
    const slide = document.createElement('section')
    slide.className = 'slide'
    const h1 = document.createElement('h1')
    h1.textContent = '标题文字'
    slide.appendChild(h1)
    document.body.appendChild(slide)

    mockRect(slide, { left: 0, top: 0, width: 1600, height: 900 })
    mockRect(h1, { left: 100, top: 50, width: 800, height: 120 })
    mockComputed(window, {
      fontSize: '48px',
      color: 'rgb(255, 255, 255)',
      fontWeight: '700',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: 'rgb(0, 47, 167)',
    })

    const { elements, background } = extractSlideElements(slide, window, 10, 5.625)

    expect(background).toBe('002fa7')
    const textEl = elements.find((e) => e.type === 'text')
    expect(textEl).toBeDefined()
    if (textEl && textEl.type === 'text') {
      expect(textEl.text).toBe('标题文字')
      // 字号：48px * (10/1600) * 72 = 21.6pt
      expect(textEl.fontSize).toBe(21.6)
      expect(textEl.bold).toBe(true)
      expect(textEl.align).toBe('center')
      expect(textEl.color).toBe('ffffff')
    }

    document.body.removeChild(slide)
  })

  it('跳过含子元素的容器，递归提取叶子', () => {
    const slide = document.createElement('section')
    slide.innerHTML = '<div><p>段落</p></div>'
    document.body.appendChild(slide)

    mockRect(slide, { left: 0, top: 0, width: 1200, height: 675 })
    const p = slide.querySelector('p')!
    mockRect(p, { left: 50, top: 30, width: 400, height: 60 })
    mockComputed(window, {
      fontSize: '24px',
      color: 'rgb(0, 0, 0)',
      fontWeight: '400',
      textAlign: 'left',
      fontFamily: 'sans-serif',
      backgroundColor: 'transparent',
    })

    const { elements } = extractSlideElements(slide, window, 10, 5.625)
    const texts = elements.filter((e) => e.type === 'text')
    expect(texts.length).toBe(1)
    if (texts[0] && texts[0].type === 'text') {
      expect(texts[0].text).toBe('段落')
    }

    document.body.removeChild(slide)
  })

  it('提取 img 元素', () => {
    const slide = document.createElement('section')
    const img = document.createElement('img')
    img.src = 'data:image/png;base64,xxx'
    slide.appendChild(img)
    document.body.appendChild(slide)

    mockRect(slide, { left: 0, top: 0, width: 1600, height: 900 })
    mockRect(img, { left: 200, top: 200, width: 400, height: 300 })
    mockComputed(window, {
      fontSize: '16px',
      color: 'rgb(0, 0, 0)',
      fontWeight: '400',
      textAlign: 'left',
      fontFamily: 'sans-serif',
      backgroundColor: 'transparent',
    })

    const { elements } = extractSlideElements(slide, window, 10, 5.625)
    const imageEl = elements.find((e) => e.type === 'image')
    expect(imageEl).toBeDefined()
    if (imageEl && imageEl.type === 'image') {
      expect(imageEl.data).toBe('data:image/png;base64,xxx')
      // 位置换算：200 * (10/1600) = 1.25
      expect(imageEl.x).toBe(1.25)
    }

    document.body.removeChild(slide)
  })

  it('跳过过小的元素（宽高 < 2px）', () => {
    const slide = document.createElement('section')
    const span = document.createElement('span')
    span.textContent = '微小'
    slide.appendChild(span)
    document.body.appendChild(slide)

    mockRect(slide, { left: 0, top: 0, width: 1600, height: 900 })
    mockRect(span, { left: 0, top: 0, width: 1, height: 1 })
    mockComputed(window, {
      fontSize: '12px',
      color: 'rgb(0, 0, 0)',
      fontWeight: '400',
      textAlign: 'left',
      fontFamily: 'sans-serif',
      backgroundColor: 'transparent',
    })

    const { elements } = extractSlideElements(slide, window, 10, 5.625)
    expect(elements.length).toBe(0)

    document.body.removeChild(slide)
  })
})
