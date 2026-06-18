import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createIdbStorage } from '@/lib/idbStorage'

export interface DemoContents {
  article: string
  document: string
  card: string
  html: string
}

export const DEMO_VERSION = 1

const FALLBACK_MARKDOWN = '# markdown2view\n\n正在加载示例内容，或直接在左侧输入 Markdown。'
const FALLBACK_HTML = '<main style="padding:32px;font-family:sans-serif">正在加载示例 HTML，或直接粘贴 AI 生成的 HTML。</main>'

export interface ContentState {
  articleMarkdown: string
  documentMarkdown: string
  cardMarkdown: string
  html: string
  demoVersion: number
  articleDirty: boolean
  documentDirty: boolean
  cardDirty: boolean
  htmlDirty: boolean
  setArticleMarkdown: (md: string) => void
  setDocumentMarkdown: (md: string) => void
  setCardMarkdown: (md: string) => void
  setHtml: (html: string) => void
  syncDemoContent: (demos: DemoContents) => void
  restoreDemo: (mode: 'article' | 'document' | 'card' | 'html', demos: DemoContents) => void
  hasHydrated: boolean
  _markHydrated: () => void
}

/** 从旧版分散的 localStorage key 迁移 Markdown / HTML 大文本。 */
export function getInitialContentFromLegacyKeys(): Partial<ContentState> {
  if (typeof localStorage === 'undefined') return {}
  if (localStorage.getItem('m2v-content-store')) return {}

  const state: Partial<ContentState> = {}

  const articleMd = localStorage.getItem('m2v-article-markdown')
  if (articleMd) {
    state.articleMarkdown = articleMd
    state.articleDirty = true
  }

  const docMd = localStorage.getItem('m2v-document-markdown') || localStorage.getItem('m2v-markdown')
  if (docMd) {
    state.documentMarkdown = docMd
    state.documentDirty = true
  }

  const cardMd = localStorage.getItem('m2v-card-markdown')
  if (cardMd) {
    state.cardMarkdown = cardMd
    state.cardDirty = true
  }

  const html = localStorage.getItem('m2v-html')
  if (html) {
    state.html = html
    state.htmlDirty = true
  }

  return state
}

export const contentStorage = createIdbStorage({
  dbName: 'm2v-content-db',
  storeName: 'persist',
  throttleMs: 1000,
})

export const useContentStore = create<ContentState>()(
  persist<ContentState, [], [], Partial<ContentState>>(
    (set, _get) => ({
      articleMarkdown: FALLBACK_MARKDOWN,
      documentMarkdown: FALLBACK_MARKDOWN,
      cardMarkdown: FALLBACK_MARKDOWN,
      html: FALLBACK_HTML,
      demoVersion: 0,
      articleDirty: false,
      documentDirty: false,
      cardDirty: false,
      htmlDirty: false,

      setArticleMarkdown: (md) => set({ articleMarkdown: md, articleDirty: true }),
      setDocumentMarkdown: (md) => set({ documentMarkdown: md, documentDirty: true }),
      setCardMarkdown: (md) => set({ cardMarkdown: md, cardDirty: true }),
      setHtml: (html) => set({ html, htmlDirty: true }),
      syncDemoContent: (demos) =>
        set((state) => {
          if (state.demoVersion === DEMO_VERSION) return {}
          return {
            articleMarkdown: state.articleDirty ? state.articleMarkdown : demos.article,
            documentMarkdown: state.documentDirty ? state.documentMarkdown : demos.document,
            cardMarkdown: state.cardDirty ? state.cardMarkdown : demos.card,
            html: state.htmlDirty ? state.html : demos.html,
            demoVersion: DEMO_VERSION,
          }
        }),
      restoreDemo: (mode, demos) =>
        set((state) => {
          const next: Partial<ContentState> = {}
          if (mode === 'article') { next.articleMarkdown = demos.article; next.articleDirty = false }
          else if (mode === 'document') { next.documentMarkdown = demos.document; next.documentDirty = false }
          else if (mode === 'card') { next.cardMarkdown = demos.card; next.cardDirty = false }
          else if (mode === 'html') { next.html = demos.html; next.htmlDirty = false }
          return { ...state, ...next }
        }),
      hasHydrated: false,
      _markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'm2v-content-store',
      storage: createJSONStorage(() => contentStorage),
      partialize: (state): Partial<ContentState> => ({
        articleMarkdown: state.articleMarkdown,
        documentMarkdown: state.documentMarkdown,
        cardMarkdown: state.cardMarkdown,
        html: state.html,
        demoVersion: state.demoVersion,
        articleDirty: state.articleDirty,
        documentDirty: state.documentDirty,
        cardDirty: state.cardDirty,
        htmlDirty: state.htmlDirty,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        const legacy = getInitialContentFromLegacyKeys()
        if (legacy.articleMarkdown != null) {
          state.articleMarkdown = legacy.articleMarkdown
          state.articleDirty = true
        }
        if (legacy.documentMarkdown != null) {
          state.documentMarkdown = legacy.documentMarkdown
          state.documentDirty = true
        }
        if (legacy.cardMarkdown != null) {
          state.cardMarkdown = legacy.cardMarkdown
          state.cardDirty = true
        }
        if (legacy.html != null) {
          state.html = legacy.html
          state.htmlDirty = true
        }

        state._markHydrated()
      },
    }
  )
)
