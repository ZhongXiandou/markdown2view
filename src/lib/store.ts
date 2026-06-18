import {
  useAppStore,
  useContentStore,
  type RenderMode,
  type InputType,
  type PlatformPreset,
  type CustomInstruction,
  type DemoContents,
  type ImageHostType,
  type ImageHostConfig,
  DEMO_VERSION,
} from './rootStore'

export type { ImageHostType, ImageHostConfig, RenderMode, InputType, PlatformPreset, CustomInstruction, DemoContents }
export { useAppStore, useContentStore, DEMO_VERSION }

// 兼容旧导入：保留 useStore 别名，指向 useAppStore
export const useStore = useAppStore

export { stripImageHostSecrets } from './appStore'
