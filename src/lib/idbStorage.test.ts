import { describe, it, expect, vi } from 'vitest'
import { createIdbStorage } from './idbStorage'

const DB_NAME = 'm2v-test-storage'
const STORE_NAME = 'persist'

describe('createIdbStorage', () => {
  it('should return null for missing item', async () => {
    const storage = createIdbStorage({ dbName: DB_NAME, storeName: STORE_NAME })
    const value = await storage.getItem('missing')
    expect(value).toBeNull()
  })

  it('should set and get string item', async () => {
    const storage = createIdbStorage({ dbName: DB_NAME, storeName: STORE_NAME })
    await storage.setItem('hello', JSON.stringify({ world: true }))
    const raw = await storage.getItem('hello')
    expect(JSON.parse(raw!)).toEqual({ world: true })
  })

  it('should remove item', async () => {
    const storage = createIdbStorage({ dbName: DB_NAME, storeName: STORE_NAME })
    await storage.setItem('delete-me', JSON.stringify({ a: 1 }))
    await storage.removeItem('delete-me')
    const raw = await storage.getItem('delete-me')
    expect(raw).toBeNull()
  })

  it('should throttle repeated writes so only the last value is persisted', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const storage = createIdbStorage({
      dbName: DB_NAME,
      storeName: STORE_NAME,
      throttleMs: 1000,
    })

    const p1 = storage.setItem('key', JSON.stringify({ v: 1 }))
    const p2 = storage.setItem('key', JSON.stringify({ v: 2 }))
    const p3 = storage.setItem('key', JSON.stringify({ v: 3 }))

    await vi.advanceTimersByTimeAsync(1000)
    await Promise.all([p1, p2, p3])

    const raw = await storage.getItem('key')
    expect(JSON.parse(raw!)).toEqual({ v: 3 })

    vi.useRealTimers()
  })
})
