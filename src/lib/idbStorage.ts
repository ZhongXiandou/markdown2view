/**
 * 创建基于 IndexedDB 的 Zustand persist 自定义 storage。
 *
 * 特点：
 * - 突破 localStorage 5~10 MB 的容量限制，适合大文本持久化；
 * - 支持写入节流（throttleMs），避免每次按键都触发整 state 序列化与 DB 写入；
 * - API 兼容 zustand/middleware 的 StateStorage。
 */
export function createIdbStorage(options: IdbStorageOptions): StateStorage {
  const { dbName, storeName, version = 1, throttleMs = 1000 } = options

  let dbPromise: Promise<IDBDatabase> | null = null
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const pending = new Map<string, PendingWrite>()

  function getDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('IndexedDB is not supported in this environment'))
    }

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
      request.onblocked = () => reject(new Error(`IndexedDB ${dbName} open blocked`))
    })

    return dbPromise
  }

  async function doWrite(key: string, value: string): Promise<void> {
    const db = await getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.put(value, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async function flush(key: string): Promise<void> {
    const write = pending.get(key)
    if (!write) return
    pending.delete(key)
    timers.delete(key)
    await doWrite(write.key, write.value)
    write.resolve()
  }

  function scheduleFlush(key: string): void {
    const existing = timers.get(key)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      void flush(key)
    }, throttleMs)
    timers.set(key, timer)
  }

  return {
    getItem: async (name: string) => {
      try {
        const db = await getDB()
        return await new Promise<string | null>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly')
          const store = tx.objectStore(storeName)
          const req = store.get(name)
          req.onsuccess = () => {
            const result = req.result
            resolve(typeof result === 'string' ? result : null)
          }
          req.onerror = () => reject(req.error)
        })
      } catch {
        return null
      }
    },
    setItem: async (name: string, value: string) => {
      // 节流：合并同一 key 的连续写入，只保留最新值
      return new Promise<void>((resolve) => {
        const existing = pending.get(name)
        if (existing) existing.resolve()
        pending.set(name, { key: name, value, resolve })
        scheduleFlush(name)
      })
    },
    removeItem: async (name: string) => {
      // 取消待写入
      const timer = timers.get(name)
      if (timer) {
        clearTimeout(timer)
        timers.delete(name)
      }
      const write = pending.get(name)
      if (write) {
        write.resolve()
        pending.delete(name)
      }
      try {
        const db = await getDB()
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite')
          const store = tx.objectStore(storeName)
          const req = store.delete(name)
          req.onsuccess = () => resolve()
          req.onerror = () => reject(req.error)
        })
      } catch {
        // noop
      }
    },
  }
}

interface IdbStorageOptions {
  /** IndexedDB 数据库名 */
  dbName: string
  /** 对象仓库名 */
  storeName: string
  /** 数据库版本 */
  version?: number
  /** 写入节流间隔（毫秒） */
  throttleMs?: number
}

interface PendingWrite {
  key: string
  value: string
  resolve: () => void
}

interface StateStorage {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}
