import { describe, it, expect, beforeAll, vi } from 'vitest'
import { compileMarkdownImages, saveLocalImage, getLocalImage, blobToBase64 } from './imageStorage'

// 模拟 FileReader
class MockFileReader {
  onloadend: (() => void) | null = null
  result: string = ''
  readAsDataURL(blob: Blob) {
    this.result = 'data:image/jpeg;base64,dGVzdC1pbWFnZS1kYXRh'
    setTimeout(() => {
      this.onloadend?.()
    })
  }
}
globalThis.FileReader = MockFileReader as any

const mockDatabase = new Map<string, any>()

beforeAll(() => {
  const mockStore = {
    get: (id: string) => {
      const req = {
        onsuccess: null as any,
        onerror: null as any,
        result: mockDatabase.get(id) || null
      }
      setTimeout(() => req.onsuccess?.())
      return req
    },
    put: (blob: any, id: string) => {
      mockDatabase.set(id, blob)
      const req = {
        onsuccess: null as any,
        onerror: null as any
      }
      setTimeout(() => req.onsuccess?.())
      return req
    }
  }

  const mockTx = {
    objectStore: () => mockStore
  }

  const mockDb = {
    transaction: () => mockTx,
    objectStoreNames: {
      contains: () => true
    }
  }

  const mockOpenReq = {
    onsuccess: null as any,
    onupgradeneeded: null as any,
    result: mockDb
  }

  globalThis.indexedDB = {
    open: () => {
      setTimeout(() => {
        mockOpenReq.onsuccess?.()
      })
      return mockOpenReq as any
    }
  } as any
})

describe('imageStorage - compileMarkdownImages', () => {
  it('should save and get local images from IndexedDB', async () => {
    const blob = new Blob(['hello-world'], { type: 'image/jpeg' })
    await saveLocalImage('img_12345', blob)
    const retrieved = await getLocalImage('img_12345')
    expect(retrieved).not.toBeNull()
    expect(retrieved?.type).toBe('image/jpeg')
  })

  it('should compile img:// tags into base64', async () => {
    const blob = new Blob(['hello-world'], { type: 'image/jpeg' })
    await saveLocalImage('img_12345', blob)

    const md = 'Here is an image: ![alt text](img://img_12345) and some text.'
    const result = await compileMarkdownImages(md)
    expect(result).toBe('Here is an image: ![alt text](data:image/jpeg;base64,dGVzdC1pbWFnZS1kYXRh) and some text.')
  })

  it('should return original text if no local images are present', async () => {
    const md = 'Here is a regular link: [Google](https://google.com) and text.'
    const result = await compileMarkdownImages(md)
    expect(result).toBe(md)
  })

  it('should leave unknown local images as is', async () => {
    const md = 'Here is an unknown image: ![alt text](img://img_99999).'
    const result = await compileMarkdownImages(md)
    expect(result).toBe(md)
  })
})
