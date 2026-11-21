import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createIdbStorage } from '@/lib/idbStorage'
import { generateId } from '@/lib/appStore'
import { getModeContent, setModeContent, type ContentMode } from '@/lib/contentStore'
import { extractContentMeta } from '@/lib/render/metadata'

/**
 * 文档库：每个模式可保存多篇文档，每篇文档带若干历史快照。
 *
 * 与 contentStore 的分工：contentStore 始终保存各模式「当前正在编辑」的内容（结构不变，
 * 老用户的数据无需迁移）；本 store 只保存文档清单、非当前文档的内容和快照。
 * 当前文档条目上的 content 不使用，真实内容以 contentStore 为准。
 */

export interface LibraryDoc {
  id: string
  /** 用户重命名后的名称；未重命名时为空，显示自动标题 */
  name?: string
  /** 从内容提取的自动标题（切走时缓存，供列表显示） */
  title: string
  updatedAt: number
  /** 非当前文档的内容；当前文档此字段不使用 */
  content: string
}

export interface DocSnapshot {
  id: string
  at: number
  /** 产生原因：自动保存 / 手动保存 / 恢复示例前 … */
  reason: string
  content: string
}

interface ModeLibrary {
  activeId: string
  docs: LibraryDoc[]
}

export const MAX_DOCS_PER_MODE = 50
export const MAX_SNAPSHOTS_PER_DOC = 20

const UNTITLED = '未命名文档'

/** 从内容提取文档标题：Markdown 取 title / 一级标题 / 首行，HTML 取 <title> 或 <h1> */
export function deriveDocTitle(mode: ContentMode, content: string): string {
  let title = ''
  if (mode === 'html') {
    title = (content.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || content.match(/<h1[^>]*>([^<]*)</i)?.[1] || '').trim()
  } else {
    const meta = extractContentMeta(content)
    title = meta.title || meta.summary
  }
  return title.slice(0, 40) || UNTITLED
}

function blankContent(mode: ContentMode): string {
  return mode === 'html' ? '' : `# ${UNTITLED}\n`
}

interface LibraryState {
  libraries: Partial<Record<ContentMode, ModeLibrary>>
  snapshots: Record<string, DocSnapshot[]>
  hasHydrated: boolean
  _markHydrated: () => void
  /** 确保该模式有文档清单：首次使用时把当前内容登记为第一篇文档 */
  ensureLibrary: (mode: ContentMode) => ModeLibrary
  /** 新建空白文档并切换过去；达到上限时返回 false */
  createDoc: (mode: ContentMode) => boolean
  switchDoc: (mode: ContentMode, id: string) => void
  renameDoc: (mode: ContentMode, id: string, name: string) => void
  /** 删除文档；只剩一篇时不可删除，返回 false */
  deleteDoc: (mode: ContentMode, id: string) => boolean
  /** 为当前文档保存一个快照；内容为空或与最近一个快照相同则跳过，返回 false */
  addSnapshot: (mode: ContentMode, reason: string) => boolean
  /** 恢复到某个快照（恢复前会先为当前内容存档） */
  restoreSnapshot: (mode: ContentMode, snapshotId: string) => void
  deleteSnapshot: (docId: string, snapshotId: string) => void
}

export const libraryStorage = createIdbStorage({
  dbName: 'm2v-library-db',
  storeName: 'persist',
  throttleMs: 500,
})

export const useLibraryStore = create<LibraryState>()(
  persist<LibraryState, [], [], Pick<LibraryState, 'libraries' | 'snapshots'>>(
    (set, get) => {
      /** 把当前编辑内容写回当前文档条目（切走前调用） */
      const stashActive = (mode: ContentMode, lib: ModeLibrary): LibraryDoc[] => {
        const content = getModeContent(mode)
        return lib.docs.map((d) =>
          d.id === lib.activeId ? { ...d, content, title: deriveDocTitle(mode, content), updatedAt: Date.now() } : d,
        )
      }

      return {
        libraries: {},
        snapshots: {},
        hasHydrated: false,
        _markHydrated: () => set({ hasHydrated: true }),

        ensureLibrary: (mode) => {
          const existing = get().libraries[mode]
          if (existing) return existing
          const id = generateId()
          const lib: ModeLibrary = {
            activeId: id,
            docs: [{ id, title: deriveDocTitle(mode, getModeContent(mode)), updatedAt: Date.now(), content: '' }],
          }
          set((s) => ({ libraries: { ...s.libraries, [mode]: lib } }))
          return lib
        },

        createDoc: (mode) => {
          const lib = get().ensureLibrary(mode)
          if (lib.docs.length >= MAX_DOCS_PER_MODE) return false
          const id = generateId()
          const docs = [...stashActive(mode, lib), { id, title: UNTITLED, updatedAt: Date.now(), content: '' }]
          set((s) => ({ libraries: { ...s.libraries, [mode]: { activeId: id, docs } } }))
          setModeContent(mode, blankContent(mode))
          return true
        },

        switchDoc: (mode, id) => {
          const lib = get().ensureLibrary(mode)
          const target = lib.docs.find((d) => d.id === id)
          if (!target || id === lib.activeId) return
          // 目标文档成为当前文档后，它的内容交给 contentStore 保管，这里清空以免重复占用存储
          const docs = stashActive(mode, lib).map((d) => (d.id === id ? { ...d, content: '' } : d))
          set((s) => ({ libraries: { ...s.libraries, [mode]: { activeId: id, docs } } }))
          setModeContent(mode, target.content)
        },

        renameDoc: (mode, id, name) => {
          const lib = get().ensureLibrary(mode)
          const trimmed = name.trim().slice(0, 40)
          const docs = lib.docs.map((d) => (d.id === id ? { ...d, name: trimmed || undefined } : d))
          set((s) => ({ libraries: { ...s.libraries, [mode]: { ...lib, docs } } }))
        },

        deleteDoc: (mode, id) => {
          const lib = get().ensureLibrary(mode)
          if (lib.docs.length <= 1 || !lib.docs.some((d) => d.id === id)) return false
          const remaining = lib.docs.filter((d) => d.id !== id)
          let activeId = lib.activeId
          let docs = remaining
          if (id === lib.activeId) {
            // 删除的是当前文档：切到最近修改的另一篇
            const next = [...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0]
            activeId = next.id
            docs = remaining.map((d) => (d.id === next.id ? { ...d, content: '' } : d))
            setModeContent(mode, next.content)
          }
          set((s) => {
            const snapshots = { ...s.snapshots }
            delete snapshots[id]
            return { libraries: { ...s.libraries, [mode]: { activeId, docs } }, snapshots }
          })
          return true
        },

        addSnapshot: (mode, reason) => {
          const lib = get().ensureLibrary(mode)
          const content = getModeContent(mode)
          if (!content.trim()) return false
          const list = get().snapshots[lib.activeId] ?? []
          if (list[0]?.content === content) return false
          const snapshot: DocSnapshot = { id: generateId(), at: Date.now(), reason, content }
          set((s) => ({
            snapshots: { ...s.snapshots, [lib.activeId]: [snapshot, ...list].slice(0, MAX_SNAPSHOTS_PER_DOC) },
          }))
          return true
        },

        restoreSnapshot: (mode, snapshotId) => {
          const lib = get().ensureLibrary(mode)
          const target = (get().snapshots[lib.activeId] ?? []).find((s) => s.id === snapshotId)
          if (!target) return
          get().addSnapshot(mode, '恢复历史版本前')
          setModeContent(mode, target.content)
        },

        deleteSnapshot: (docId, snapshotId) =>
          set((s) => ({
            snapshots: { ...s.snapshots, [docId]: (s.snapshots[docId] ?? []).filter((x) => x.id !== snapshotId) },
          })),
      }
    },
    {
      name: 'm2v-library-store',
      storage: createJSONStorage(() => libraryStorage),
      partialize: (state) => ({ libraries: state.libraries, snapshots: state.snapshots }),
      onRehydrateStorage: () => (state) => {
        state?._markHydrated()
      },
    },
  ),
)

/** 在会覆盖全文的操作之前存档（文档库尚未从存储恢复时跳过，避免用空清单覆盖已有数据） */
export function snapshotBeforeOverwrite(mode: ContentMode, reason: string): void {
  const store = useLibraryStore.getState()
  if (store.hasHydrated) store.addSnapshot(mode, reason)
}
