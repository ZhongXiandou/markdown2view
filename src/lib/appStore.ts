import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEMES, makeColors, type ThemeColors } from '@engine/composables/useTheme'
import { DEFAULT_DOCUMENT_SETTINGS, type DocumentSettings } from '@/modes/document/documentModel'
import type { FontFamilyOption } from '@/lib/fonts'
import type { OutputType, VisualTone } from '@/data/designPrompts'

export type ImageHostType = 'local' | 'smms' | 'oss' | 'cos'

export interface ImageHostConfig {
  activeType: ImageHostType
  smms?: { token: string }
  oss?: { region: string; accessKeyId: string; accessKeySecret: string; bucket: string }
  cos?: { SecretId: string; SecretKey: string; Bucket: string; Region: string }
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

export type RenderMode = 'article' | 'document' | 'card' | 'html'
export type InputType = 'markdown' | 'html'
export type PlatformPreset = 'longform' | 'xiaohongshu'

/** 生成可用 ID 的兼容实现，支持非安全上下文 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}

const MAX_CUSTOM_INSTRUCTIONS = 50
const MAX_CONTENT_LENGTH = 5000

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

const DEFAULT_IMAGE_HOST_CONFIG: ImageHostConfig = {
  activeType: 'local',
}

const DEFAULT_ACCENT = THEMES[3].accent
const DEFAULT_DARK = THEMES[3].dark

const MODE_STORAGE_KEY = 'm2v-mode'
const THEME_STORAGE_KEY = 'm2v-theme'
const DOCUMENT_SETTINGS_STORAGE_KEY = 'm2v-document-settings'
const ARTICLE_FONT_KEY = 'm2v-article-font'
const CARD_FONT_KEY = 'm2v-card-font'

/** 将主题色应用到 CSS 变量 */
export function applyCssVars(accent: string, dark: string) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-dark', dark)
}

/** 从旧版分散的 localStorage key 迁移 UI 与设置数据。 */
export function getInitialAppStateFromLegacyKeys(): Partial<AppState> {
  if (typeof localStorage === 'undefined') return {}

  const state: Partial<AppState> = {}

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

export interface AppState {
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
  setMode: (mode: RenderMode) => void
  setInputType: (type: InputType) => void
  setPlatform: (platform: PlatformPreset) => void
  updateDocumentSettings: (patch: Partial<DocumentSettings>) => void
  setArticleFont: (f: FontFamilyOption) => void
  setCardFont: (f: FontFamilyOption) => void
  restoreDocumentSettingsDemo: () => void
  setTheme: (accent: string, dark: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      customInstructions: [],
      addCustomInstruction: (inst) => {
        const currentLength = get().customInstructions.length
        if (currentLength >= MAX_CUSTOM_INSTRUCTIONS) return false

        set((state) => {
          const now = Date.now()
          return {
            customInstructions: [
              ...state.customInstructions,
              {
                ...inst,
                content: inst.content.slice(0, MAX_CONTENT_LENGTH),
                id: generateId(),
                createdAt: now,
                updatedAt: now,
              },
            ],
          }
        })
        return true
      },
      updateCustomInstruction: (id, patch) =>
        set((state) => ({
          customInstructions: state.customInstructions.map((inst) =>
            inst.id === id
              ? {
                  ...inst,
                  ...patch,
                  content: (patch.content ?? inst.content).slice(0, MAX_CONTENT_LENGTH),
                  updatedAt: Date.now(),
                }
              : inst
          ),
        })),
      removeCustomInstruction: (id) =>
        set((state) => ({
          customInstructions: state.customInstructions.filter((inst) => inst.id !== id),
        })),
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
      restoreDocumentSettingsDemo: () =>
        set((state) => {
          const cur = state.documentSettings
          const def = DEFAULT_DOCUMENT_SETTINGS
          return {
            documentSettings: {
              ...def,
              headerLeft: cur.headerLeft || def.headerLeft,
              headerRight: cur.headerRight || def.headerRight,
            },
          }
        }),
      setTheme: (accent, dark) => {
        applyCssVars(accent, dark)
        set({ accent, accentDark: dark, colors: makeColors(accent, dark) })
      },
    }),
    {
      name: 'm2v-app-store',
      partialize: (state) => ({
        mode: state.mode,
        inputType: state.inputType,
        platform: state.platform,
        documentSettings: state.documentSettings,
        articleFont: state.articleFont,
        cardFont: state.cardFont,
        accent: state.accent,
        accentDark: state.accentDark,
        imageHostConfig: stripImageHostSecrets(state.imageHostConfig),
        customInstructions: state.customInstructions,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        const legacy = getInitialAppStateFromLegacyKeys()
        if (Object.keys(legacy).length > 0) {
          Object.assign(state, {
            mode: legacy.mode ?? state.mode,
            inputType: legacy.inputType ?? state.inputType,
            platform: legacy.platform ?? state.platform,
            documentSettings: legacy.documentSettings ?? state.documentSettings,
            articleFont: legacy.articleFont ?? state.articleFont,
            cardFont: legacy.cardFont ?? state.cardFont,
          })
        }

        state.colors = makeColors(state.accent, state.accentDark)
        applyCssVars(state.accent, state.accentDark)
        state.customInstructions ??= []
        state._markHydrated()
      },
    }
  )
)
