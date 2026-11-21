import { useCallback, useState } from 'react'
import { useContentStore, type RenderMode } from '@/lib/store'
import { MODE_LABELS } from '@/lib/uiLabels'
import { buildPromptWithMaterial, materialSourcesFor, type MaterialSource } from '@/lib/promptMaterial'

/**
 * 「复制指令时附带素材」的状态与拼装逻辑，各模式的指令复制入口共用。
 * withMaterial 返回 null 表示所选来源没有内容（已提示），调用方应放弃本次复制。
 */
export function useMaterialSource(mode: RenderMode, onToast: (msg: string) => void) {
  const [source, setSource] = useState<MaterialSource | ''>('')

  const withMaterial = useCallback(
    (prompt: string): string | null => {
      if (!source) return prompt
      const state = useContentStore.getState()
      const content = {
        article: state.articleMarkdown,
        document: state.documentMarkdown,
        card: state.cardMarkdown,
      }[source]
      if (!content.trim()) {
        onToast(`「${MODE_LABELS[source]}」当前没有内容，无法附带`)
        return null
      }
      return buildPromptWithMaterial(prompt, content, MODE_LABELS[source])
    },
    [source, onToast],
  )

  /** 复制成功提示的后缀，例如「（已附带「A4 文档」原稿）」 */
  const suffix = source ? `（已附带「${MODE_LABELS[source]}」原稿）` : ''

  return { source, setSource, options: materialSourcesFor(mode), withMaterial, suffix }
}

export type MaterialSourceState = ReturnType<typeof useMaterialSource>
