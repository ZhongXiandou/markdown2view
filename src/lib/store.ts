import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEMES, makeColors, type ThemeColors } from '@engine/composables/useTheme'
import {
  DEFAULT_DOCUMENT_SETTINGS,
  type DocumentSettings,
} from '@/modes/document/documentModel'
import type { FontFamilyOption } from '@/lib/fonts'

export type RenderMode = 'article' | 'document' | 'card' | 'html'
export type InputType = 'markdown' | 'html'
export type PlatformPreset = 'longform' | 'xiaohongshu'

const LEGACY_MD_STORAGE_KEY = 'm2v-markdown'
const ARTICLE_MD_STORAGE_KEY = 'm2v-article-markdown'
const DOCUMENT_MD_STORAGE_KEY = 'm2v-document-markdown'
const CARD_MD_STORAGE_KEY = 'm2v-card-markdown'
const THEME_STORAGE_KEY = 'm2v-theme'
const HTML_STORAGE_KEY = 'm2v-html'
const DOCUMENT_SETTINGS_STORAGE_KEY = 'm2v-document-settings'
const MODE_STORAGE_KEY = 'm2v-mode'
const ARTICLE_FONT_KEY = 'm2v-article-font'
const CARD_FONT_KEY = 'm2v-card-font'

const FALLBACK_MARKDOWN = '# markdown2view\n\n正在加载示例内容，或直接在左侧输入 Markdown。'
const FALLBACK_HTML = '<main style="padding:32px;font-family:sans-serif">正在加载示例 HTML，或直接粘贴 AI 生成的 HTML。</main>'

interface AppState {
  articleMarkdown: string
  documentMarkdown: string
  cardMarkdown: string
  html: string
  mode: RenderMode
  inputType: InputType
  platform: PlatformPreset
  documentSettings: DocumentSettings
  articleFont: FontFamilyOption
  cardFont: FontFamilyOption
  accent: string
  accentDark: string
  colors: ThemeColors
  setArticleMarkdown: (md: string) => void
  setDocumentMarkdown: (md: string) => void
  setCardMarkdown: (md: string) => void
  setHtml: (html: string) => void
  setMode: (mode: RenderMode) => void
  setInputType: (type: InputType) => void
  setPlatform: (platform: PlatformPreset) => void
  updateDocumentSettings: (patch: Partial<DocumentSettings>) => void
  setArticleFont: (f: FontFamilyOption) => void
  setCardFont: (f: FontFamilyOption) => void
  setTheme: (accent: string, dark: string) => void
}

function applyCssVars(accent: string, dark: string) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-dark', dark)
}

function getInitialStateFromLegacyKeys(): Partial<AppState> {
  if (typeof localStorage === 'undefined') return {}
  if (localStorage.getItem('m2v-store')) return {}

  const state: Partial<AppState> = {}
  
  const articleMd = localStorage.getItem(ARTICLE_MD_STORAGE_KEY)
  if (articleMd) state.articleMarkdown = articleMd

  const docMd = localStorage.getItem(DOCUMENT_MD_STORAGE_KEY) || localStorage.getItem(LEGACY_MD_STORAGE_KEY)
  if (docMd) state.documentMarkdown = docMd

  const cardMd = localStorage.getItem(CARD_MD_STORAGE_KEY)
  if (cardMd) state.cardMarkdown = cardMd

  const html = localStorage.getItem(HTML_STORAGE_KEY)
  if (html) state.html = html

  const mode = localStorage.getItem(MODE_STORAGE_KEY)
  if (mode && ['article', 'document', 'card', 'html'].includes(mode)) {
    state.mode = mode as RenderMode
    state.inputType = mode === 'html' ? 'html' : 'markdown'
    state.platform = mode === 'card' ? 'xiaohongshu' : 'longform'
  }

  const articleFont = localStorage.getItem(ARTICLE_FONT_KEY)
  if (articleFont && ['songti', 'fangsong', 'heiti', 'lxgwwenkai'].includes(articleFont)) {
    state.articleFont = articleFont as FontFamilyOption
  }

  const cardFont = localStorage.getItem(CARD_FONT_KEY)
  if (cardFont && ['songti', 'fangsong', 'heiti', 'lxgwwenkai'].includes(cardFont)) {
    state.cardFont = cardFont as FontFamilyOption
  }

  const docSettings = localStorage.getItem(DOCUMENT_SETTINGS_STORAGE_KEY)
  if (docSettings) {
    try {
      state.documentSettings = { ...DEFAULT_DOCUMENT_SETTINGS, ...JSON.parse(docSettings) }
    } catch { /* ignore */ }
  }

  const themeStr = localStorage.getItem(THEME_STORAGE_KEY)
  if (themeStr) {
    try {
      const t = JSON.parse(themeStr)
      if (t.accent && t.dark) {
        state.accent = t.accent
        state.accentDark = t.dark
        state.colors = makeColors(t.accent, t.dark)
      }
    } catch { /* ignore */ }
  }

  return state
}

const legacyState = getInitialStateFromLegacyKeys()
const initAccent = legacyState.accent ?? THEMES[3].accent
const initDark = legacyState.accentDark ?? THEMES[3].dark
applyCssVars(initAccent, initDark)

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      articleMarkdown: legacyState.articleMarkdown ?? FALLBACK_MARKDOWN,
      documentMarkdown: legacyState.documentMarkdown ?? FALLBACK_MARKDOWN,
      cardMarkdown: legacyState.cardMarkdown ?? FALLBACK_MARKDOWN,
      html: legacyState.html ?? FALLBACK_HTML,
      mode: legacyState.mode ?? 'document',
      inputType: legacyState.inputType ?? 'markdown',
      platform: legacyState.platform ?? 'longform',
      documentSettings: legacyState.documentSettings ?? DEFAULT_DOCUMENT_SETTINGS,
      articleFont: legacyState.articleFont ?? 'lxgwwenkai',
      cardFont: legacyState.cardFont ?? 'heiti',
      accent: initAccent,
      accentDark: initDark,
      colors: legacyState.colors ?? makeColors(initAccent, initDark),

      setArticleMarkdown: (md) => set({ articleMarkdown: md }),
      setDocumentMarkdown: (md) => set({ documentMarkdown: md }),
      setCardMarkdown: (md) => set({ cardMarkdown: md }),
      setHtml: (html) => set({ html }),
      setMode: (mode) =>
        set({
          mode,
          inputType: mode === 'html' ? 'html' : 'markdown',
          platform: mode === 'card' ? 'xiaohongshu' : 'longform',
        }),
      setInputType: (inputType) => set({ inputType }),
      setPlatform: (platform) => set({ platform }),
      updateDocumentSettings: (patch) =>
        set((state) => ({ documentSettings: { ...state.documentSettings, ...patch } })),
      setArticleFont: (f) => set({ articleFont: f }),
      setCardFont: (f) => set({ cardFont: f }),
      setTheme: (accent, dark) => {
        applyCssVars(accent, dark)
        set({ accent, accentDark: dark, colors: makeColors(accent, dark) })
      },
    }),
    {
      name: 'm2v-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyCssVars(state.accent, state.accentDark)
        }
      },
    }
  )
)

export function shouldHydrateDemoContent(mode: RenderMode): boolean {
  if (typeof localStorage === 'undefined') return false
  const storeStr = localStorage.getItem('m2v-store')
  if (storeStr) {
    try {
      const state = JSON.parse(storeStr).state
      if (mode === 'html') return !state.html || state.html === FALLBACK_HTML
      if (mode === 'article') return !state.articleMarkdown || state.articleMarkdown === FALLBACK_MARKDOWN
      if (mode === 'card') return !state.cardMarkdown || state.cardMarkdown === FALLBACK_MARKDOWN
      return !state.documentMarkdown || state.documentMarkdown === FALLBACK_MARKDOWN
    } catch {
      return true
    }
  }
  if (mode === 'html') return !localStorage.getItem(HTML_STORAGE_KEY)
  if (mode === 'article') return !localStorage.getItem(ARTICLE_MD_STORAGE_KEY)
  if (mode === 'card') return !localStorage.getItem(CARD_MD_STORAGE_KEY)
  return !localStorage.getItem(DOCUMENT_MD_STORAGE_KEY) && !localStorage.getItem(LEGACY_MD_STORAGE_KEY)
}
