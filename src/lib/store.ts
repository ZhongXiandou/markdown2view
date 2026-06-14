import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEMES, makeColors, type ThemeColors } from '@engine/composables/useTheme'
import {
  DEFAULT_DOCUMENT_SETTINGS,
  type DocumentSettings,
} from '@/modes/document/documentModel'
import type { FontFamilyOption } from '@/lib/fonts'
import type { OutputType, VisualTone } from '@/data/designPrompts'

/** 用户自定义指令数据结构 */
export interface CustomInstruction {
  id: string
  name: string
  content: string      // 指令文本（对应 style 字段）
  accent: string       // 强调色
  description: string  // 简短描述
  outputType: OutputType
  visualTone: VisualTone
  createdAt: number
  updatedAt: number
  mode?: import('./store').RenderMode // 兼容历史数据，未定义的视为 'html'
}

const MAX_CUSTOM_INSTRUCTIONS = 50
const MAX_CONTENT_LENGTH = 5000

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

// 示例内容版本号：当更新了 src/data/demo* 示例、且希望「老用户 / 已有本地缓存」在下次加载时
// 也能自动获取最新示例，请将此值 +1。版本变化时只会覆盖用户「从未编辑过」的字段，
// 用户手动编辑过的内容始终保留，不会被覆盖。
export const DEMO_VERSION = 1

// 各模式的最新示例内容集合，由 App 在挂载时传入，避免 store 直接依赖示例数据文件。
export interface DemoContents {
  article: string
  document: string
  card: string
  html: string
}

export type ImageHostType = 'local' | 'smms' | 'oss' | 'cos'

export interface ImageHostConfig {
  activeType: ImageHostType
  smms?: { token: string }
  oss?: { region: string; accessKeyId: string; accessKeySecret: string; bucket: string }
  cos?: { SecretId: string; SecretKey: string; Bucket: string; Region: string }
}

const DEFAULT_IMAGE_HOST_CONFIG: ImageHostConfig = {
  activeType: 'local',
}

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
  // 图床设置
  imageHostConfig: ImageHostConfig
  setImageHostConfig: (config: Partial<ImageHostConfig>) => void
  // 示例内容版本与「是否被用户编辑过」标记（dirty）
  demoVersion: number
  articleDirty: boolean
  documentDirty: boolean
  cardDirty: boolean
  htmlDirty: boolean
  setArticleMarkdown: (md: string) => void
  setDocumentMarkdown: (md: string) => void
  setCardMarkdown: (md: string) => void
  setHtml: (html: string) => void
  // 版本驱动的示例同步：仅在版本变化时，刷新用户未编辑过的字段为最新示例
  syncDemoContent: (demos: DemoContents) => void
  // 恢复当前模式示例：强制写入最新示例并清除该模式的 dirty 标记
  restoreDemo: (mode: RenderMode, demos: DemoContents) => void
  setMode: (mode: RenderMode) => void
  setInputType: (type: InputType) => void
  setPlatform: (platform: PlatformPreset) => void
  updateDocumentSettings: (patch: Partial<DocumentSettings>) => void
  setArticleFont: (f: FontFamilyOption) => void
  setCardFont: (f: FontFamilyOption) => void
  setTheme: (accent: string, dark: string) => void
  // 自定义指令管理
  customInstructions: CustomInstruction[]
  addCustomInstruction: (inst: Omit<CustomInstruction, 'id' | 'createdAt' | 'updatedAt'>) => boolean
  updateCustomInstruction: (id: string, patch: Partial<Omit<CustomInstruction, 'id' | 'createdAt'>>) => void
  removeCustomInstruction: (id: string) => void
  // 引导弹窗强行打开触发器，每种模式独立计数
  guideTrigger: { [key in RenderMode]?: number }
  triggerGuide: (mode: RenderMode) => void
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
  if (articleFont && ['songti', 'fangsong', 'heiti'].includes(articleFont)) {
    state.articleFont = articleFont as FontFamilyOption
  }

  const cardFont = localStorage.getItem(CARD_FONT_KEY)
  if (cardFont && ['songti', 'fangsong', 'heiti'].includes(cardFont)) {
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
    (set, get) => ({
      articleMarkdown: legacyState.articleMarkdown ?? FALLBACK_MARKDOWN,
      documentMarkdown: legacyState.documentMarkdown ?? FALLBACK_MARKDOWN,
      cardMarkdown: legacyState.cardMarkdown ?? FALLBACK_MARKDOWN,
      html: legacyState.html ?? FALLBACK_HTML,
      mode: legacyState.mode ?? 'document',
      inputType: legacyState.inputType ?? 'markdown',
      platform: legacyState.platform ?? 'longform',
      documentSettings: legacyState.documentSettings ?? DEFAULT_DOCUMENT_SETTINGS,
      articleFont: legacyState.articleFont ?? 'songti',
      cardFont: legacyState.cardFont ?? 'heiti',
      accent: initAccent,
      accentDark: initDark,
      colors: legacyState.colors ?? makeColors(initAccent, initDark),
      imageHostConfig: DEFAULT_IMAGE_HOST_CONFIG,
      setImageHostConfig: (config) =>
        set((state) => ({ imageHostConfig: { ...state.imageHostConfig, ...config } })),
      // 默认版本号 0，确保首次加载（无持久化版本）时会注入最新示例。
      demoVersion: 0,
      // 旧版分散 key 迁移而来的内容视为「用户内容」，标记为 dirty 以免被示例覆盖。
      articleDirty: legacyState.articleMarkdown != null,
      documentDirty: legacyState.documentMarkdown != null,
      cardDirty: legacyState.cardMarkdown != null,
      htmlDirty: legacyState.html != null,

      setArticleMarkdown: (md) => set({ articleMarkdown: md, articleDirty: true }),
      setDocumentMarkdown: (md) => set({ documentMarkdown: md, documentDirty: true }),
      setCardMarkdown: (md) => set({ cardMarkdown: md, cardDirty: true }),
      setHtml: (html) => set({ html, htmlDirty: true }),
      syncDemoContent: (demos) =>
        set((state) => {
          // 版本未变化则不动用户内容，避免每次加载都覆盖。
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
          const next: Partial<AppState> = {}
          if (mode === 'article') { next.articleMarkdown = demos.article; next.articleDirty = false }
          else if (mode === 'document') {
            next.documentMarkdown = demos.document
            next.documentDirty = false
            const cur = state.documentSettings
            const def = DEFAULT_DOCUMENT_SETTINGS
            next.documentSettings = {
              ...def,
              headerLeft: cur.headerLeft || def.headerLeft,
              headerRight: cur.headerRight || def.headerRight,
            }
          }
          else if (mode === 'card') { next.cardMarkdown = demos.card; next.cardDirty = false }
          else if (mode === 'html') { next.html = demos.html; next.htmlDirty = false }
          return next
        }),
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
      // 自定义指令管理
      customInstructions: [],
      addCustomInstruction: (inst) => {
        // 在 set 之前检查长度，避免依赖 Zustand set 的同步返回值
        const currentLength = get().customInstructions.length
        if (currentLength >= MAX_CUSTOM_INSTRUCTIONS) return false
        
        set((state) => {
          const now = Date.now()
          return {
            customInstructions: [
              ...state.customInstructions,
              { ...inst, content: inst.content.slice(0, MAX_CONTENT_LENGTH), id: crypto.randomUUID(), createdAt: now, updatedAt: now },
            ],
          }
        })
        return true
      },
      updateCustomInstruction: (id, patch) =>
        set((state) => ({
          customInstructions: state.customInstructions.map((inst) =>
            inst.id === id
              ? { ...inst, ...patch, content: (patch.content ?? inst.content).slice(0, MAX_CONTENT_LENGTH), updatedAt: Date.now() }
              : inst
          ),
        })),
      removeCustomInstruction: (id) =>
        set((state) => ({
          customInstructions: state.customInstructions.filter((inst) => inst.id !== id),
        })),
      // 初始化引导触发器状态
      guideTrigger: {},
      triggerGuide: (mode) =>
        set((state) => ({
          guideTrigger: {
            ...state.guideTrigger,
            [mode]: (state.guideTrigger[mode] || 0) + 1,
          },
        })),
    }),
    {
      name: 'm2v-store',
      partialize: (state) => ({
        articleMarkdown: state.articleMarkdown,
        documentMarkdown: state.documentMarkdown,
        cardMarkdown: state.cardMarkdown,
        html: state.html,
        mode: state.mode,
        inputType: state.inputType,
        platform: state.platform,
        documentSettings: state.documentSettings,
        articleFont: state.articleFont,
        cardFont: state.cardFont,
        accent: state.accent,
        accentDark: state.accentDark,
        colors: state.colors,
        imageHostConfig: state.imageHostConfig,
        demoVersion: state.demoVersion,
        articleDirty: state.articleDirty,
        documentDirty: state.documentDirty,
        cardDirty: state.cardDirty,
        htmlDirty: state.htmlDirty,
        customInstructions: state.customInstructions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyCssVars(state.accent, state.accentDark)
          state.customInstructions ??= []
        }
      },
    }
  )
)
