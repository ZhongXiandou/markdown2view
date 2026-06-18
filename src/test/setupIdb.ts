import { beforeEach } from 'vitest'

class MockIDBRequest<T> {
  onsuccess: ((this: MockIDBRequest<T>, ev: Event) => void) | null = null
  onerror: ((this: MockIDBRequest<T>, ev: Event) => void) | null = null
  onupgradeneeded: ((this: MockIDBRequest<T>, ev: Event) => void) | null = null
  result: T | undefined
  error: DOMException | null = null
  source: unknown = null
  transaction: unknown = null
  readyState: 'pending' | 'done' = 'pending'

  constructor(public readonly __target: unknown) {}

  resolve(value: T) {
    this.readyState = 'done'
    this.result = value
    this.onsuccess?.(new Event('success'))
  }

  reject(message: string) {
    this.readyState = 'done'
    this.error = new DOMException(message)
    this.onerror?.(new Event('error'))
  }
}

class MockIDBObjectStore {
  data = new Map<string, string>()

  get(key: string) {
    const req = new MockIDBRequest<string | undefined>(this)
    queueMicrotask(() => req.resolve(this.data.get(key)))
    return req as unknown as IDBRequest<string | undefined>
  }

  put(value: string, key: string) {
    const req = new MockIDBRequest<void>(this)
    queueMicrotask(() => {
      this.data.set(key, value)
      req.resolve(undefined)
    })
    return req as unknown as IDBRequest<void>
  }

  delete(key: string) {
    const req = new MockIDBRequest<void>(this)
    queueMicrotask(() => {
      this.data.delete(key)
      req.resolve(undefined)
    })
    return req as unknown as IDBRequest<void>
  }
}

class MockIDBTransaction {
  constructor(private store: MockIDBObjectStore) {}

  objectStore(_name: string) {
    return this.store as unknown as IDBObjectStore
  }
}

class MockIDBDatabase {
  storeNames = new Set<string>()
  stores = new Map<string, MockIDBObjectStore>()

  constructor(public name: string) {}

  createObjectStore(name: string) {
    const store = new MockIDBObjectStore()
    this.stores.set(name, store)
    this.storeNames.add(name)
    return store as unknown as IDBObjectStore
  }

  transaction(names: string | string[], _mode?: IDBTransactionMode) {
    const storeName = Array.isArray(names) ? names[0] : names
    const store = this.stores.get(storeName)
    if (!store) throw new Error(`Store ${storeName} not found`)
    return new MockIDBTransaction(store) as unknown as IDBTransaction
  }

  get objectStoreNames() {
    return {
      contains: (name: string) => this.storeNames.has(name),
      [Symbol.iterator]: () => this.storeNames[Symbol.iterator](),
    } as unknown as DOMStringList
  }
}

class MockIDBOpenDBRequest extends MockIDBRequest<IDBDatabase> {
  constructor(target: unknown, public readonly result: IDBDatabase) {
    super(target)
  }
}

const mockDatabases = new Map<string, MockIDBDatabase>()

export function resetMockDatabases() {
  mockDatabases.clear()
}

beforeEach(() => {
  resetMockDatabases()
})

if (typeof globalThis.indexedDB === 'undefined') {
  globalThis.indexedDB = {
    open: (name: string, _version?: number) => {
      const db = mockDatabases.get(name) ?? new MockIDBDatabase(name)
      const existed = mockDatabases.has(name)
      mockDatabases.set(name, db)
      const req = new MockIDBOpenDBRequest(undefined, db as unknown as IDBDatabase)
      queueMicrotask(() => {
        if (!existed) {
          req.onupgradeneeded?.(new Event('upgradeneeded'))
        }
        req.resolve(db as unknown as IDBDatabase)
      })
      return req as unknown as IDBOpenDBRequest
    },
    deleteDatabase: (name: string) => {
      mockDatabases.delete(name)
      const req = new MockIDBRequest<void>(undefined)
      queueMicrotask(() => req.resolve(undefined))
      return req as unknown as IDBOpenDBRequest
    },
  } as unknown as IDBFactory
}
