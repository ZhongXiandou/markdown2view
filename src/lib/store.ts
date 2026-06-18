import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEMES, makeColors, type ThemeColors } from '@engine/composables/useTheme'
import {
  DEFAULT_DOCUMENT_SETTINGS,
  type DocumentSettings,
} from '@/modes/document/documentModel'
import type { FontFamilyOption } from '@/lib/fonts'
import type { OutputType, VisualTone } from '@/data/designPrompts'

/** 生成可用 ID 的兼容实现，支持非安全上下文 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}

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
  mode?: RenderMode // 兼容历史数据，未定义的视为 'html'
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

/**
 * 移除图床配置中的敏感字段（AK/SK/token），仅保留目的地与非敏感配置（region/bucket）。
 * 用于持久化：密钥默认不落盘，仅存在于当前会话内存中；如需长期记忆，由用户主动通过
 * 加密保险箱（secureVault）以口令加密保存。
 */
export function stripImageHostSecrets(config: ImageHostConfig): ImageHostConfig {
  return {
    activeType: config.activeType,
    smms: config.smms ? { token: '' } : undefined,
    oss: config.oss
      ? { region: config.oss.region, bucket: config.oss.bucket, accessKeyId: '', accessKeySecret: '' }
      : undefined,
    cos: config.cos
      ? { Bucket: config.cos.Bucket, Region: config.cos.Region, SecretId: '', SecretKey: '' }
      : undefined,
  }
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
  // 持久化 rehydrate 完成标记
  hasHydrated: boolean
  _markHydrated: () => void
}

/** 将主题色应用到 CSS 变量 */
export function applyCssVars(accent: string, dark: string) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-dark', dark)
}

/** 从旧版分散的 localStorage key 迁移数据，仅在未找到新版 store 时执行。 */
export function getInitialStateFromLegacyKeys(): Partial<AppState> {
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

const DEFAULT_ACCENT = THEMES[3].accent
const DEFAULT_DARK = THEMES[3].dark

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      articleMarkdown: FALLBACK_MARKDOWN,
      documentMarkdown: FALLBACK_MARKDOWN,
      cardMarkdown: FALLBACK_MARKDOWN,
      html: FALLBACK_HTML,
      mode: 'document',
      inputType: 'markdown',
      platform: 'longform',
      documentSettings: DEFAULT_DOCUMENT_SETTINGS,
      articleFont: 'songti',
      cardFont: 'heiti',
      accent: DEFAULT_ACCENT,
      accentDark: DEFAULT_DARK,
      colors: makeColors(DEFAULT_ACCENT, DEFAULT_DARK),
      imageHostConfig: DEFAULT_IMAGE_HOST_CONFIG,
      setImageHostConfig: (config) =>
        set((state) => ({ imageHostConfig: { ...state.imageHostConfig, ...config } })),
      // 默认版本号 0，确保首次加载（无持久化版本）时会注入最新示例。
      demoVersion: 0,
      // 旧版分散 key 迁移而来的内容会在 onRehydrateStorage 中补回，并标记为 dirty。
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
              { ...inst, content: inst.content.slice(0, MAX_CONTENT_LENGTH), id: generateId(), createdAt: now, updatedAt: now },
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
      hasHydrated: false,
      _markHydrated: () => set({ hasHydrated: true }),
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
        // colors 是 accent/accentDark 的派生值，不持久化，避免老用户拿到旧值
        // 图床密钥默认不落盘：仅持久化目的地与 region/bucket 等非敏感字段，
        // 敏感的 AK/SK/token 仅存在于内存中，如需长期记忆由用户通过加密保险箱保存。
        imageHostConfig: stripImageHostSecrets(state.imageHostConfig),
        demoVersion: state.demoVersion,
        articleDirty: state.articleDirty,
        documentDirty: state.documentDirty,
        cardDirty: state.cardDirty,
        htmlDirty: state.htmlDirty,
        customInstructions: state.customInstructions,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // 1. 迁移旧版分散 key 数据（仅当新版 store 不存在时）
        const legacy = getInitialStateFromLegacyKeys()
        if (Object.keys(legacy).length > 0) {
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
          Object.assign(state, {
            mode: legacy.mode ?? state.mode,
            inputType: legacy.inputType ?? state.inputType,
            platform: legacy.platform ?? state.platform,
            documentSettings: legacy.documentSettings ?? state.documentSettings,
            articleFont: legacy.articleFont ?? state.articleFont,
            cardFont: legacy.cardFont ?? state.cardFont,
          })
        }

        // 2. 重新计算 colors，保证 makeColors 逻辑更新后老用户也能拿到新值
        state.colors = makeColors(state.accent, state.accentDark)

        // 3. 应用 CSS 变量
        applyCssVars(state.accent, state.accentDark)

        // 4. 兼容旧数据
        state.customInstructions ??= []

        // 5. 标记 rehydrate 完成，供 App 等依赖本地缓存的初始化逻辑使用
        state._markHydrated()
      },
    }
  )
)
