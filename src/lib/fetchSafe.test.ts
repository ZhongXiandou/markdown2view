import { describe, it, expect, vi } from 'vitest'
import {
  assertSafeHttpUrl,
  fetchWithTimeout,
  fetchImageBuffer,
  FetchSecurityError,
  FetchTimeoutError,
} from './fetchSafe'

describe('assertSafeHttpUrl', () => {
  it('允许 http URL', () => {
    expect(assertSafeHttpUrl('http://example.com').href).toBe('http://example.com/')
  })

  it('允许 https URL', () => {
    expect(assertSafeHttpUrl('https://example.com/path').href).toBe('https://example.com/path')
  })

  it('拒绝 file 协议', () => {
    expect(() => assertSafeHttpUrl('file:///etc/passwd')).toThrow(FetchSecurityError)
  })

  it('拒绝 javascript 协议', () => {
    expect(() => assertSafeHttpUrl('javascript:alert(1)')).toThrow(FetchSecurityError)
  })

  it('拒绝相对路径', () => {
    expect(() => assertSafeHttpUrl('/images/a.png')).toThrow(FetchSecurityError)
  })

  it('拒绝 data URI', () => {
    expect(() => assertSafeHttpUrl('data:image/png;base64,xxx')).toThrow(FetchSecurityError)
  })
})

describe('fetchWithTimeout', () => {
  it('正常返回响应', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const resp = await fetchWithTimeout('https://example.com/img.png', { mode: 'cors' })
    expect(resp.ok).toBe(true)
    expect(fetch).toHaveBeenCalledWith('https://example.com/img.png', expect.objectContaining({ mode: 'cors', signal: expect.any(AbortSignal) }))
  })

  it('不安全的 URL 直接抛出 FetchSecurityError', async () => {
    global.fetch = vi.fn()
    await expect(fetchWithTimeout('file:///etc/passwd')).rejects.toThrow(FetchSecurityError)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('超时抛出 FetchTimeoutError', async () => {
    global.fetch = vi.fn().mockImplementation((_url, options: RequestInit) => {
      return new Promise((_, reject) => {
        const signal = options.signal
        if (!signal) {
          reject(new Error('missing signal'))
          return
        }
        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    })

    await expect(fetchWithTimeout('https://example.com/slow.png', { timeoutMs: 10 })).rejects.toThrow(FetchTimeoutError)
  })
})

describe('fetchImageBuffer', () => {
  it('返回图片 ArrayBuffer', async () => {
    const data = new Uint8Array([1, 2, 3]).buffer
    const mockResponse = new Response(data, {
      status: 200,
      headers: { 'content-type': 'image/png' },
    })
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const result = await fetchImageBuffer('https://example.com/img.png')
    expect(result).toBeInstanceOf(ArrayBuffer)
  })

  it('非图片响应抛出错误', async () => {
    const mockResponse = new Response('text', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    })
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(fetchImageBuffer('https://example.com/img.png')).rejects.toThrow('响应不是图片类型')
  })
})
