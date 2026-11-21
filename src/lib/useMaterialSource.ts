import { useCallback, useState } from 'react'
import { useContentStore, type RenderMode } from '@/lib/store'
import { MODE_LABELS } from '@/lib/uiLabels'
import { buildPromptWithMaterial, materialSourcesFor, type MaterialSource } from '@/lib/promptMaterial'
import { countChars } from '@/lib/editor/docStats'

/**
 * 指令库里「复制指令时附带素材」的状态与拼装逻辑（A4 文档与自由画布的指令库共用）。
 * withMaterial 返回 null 表示所选来源没有内容（已提示），调用方应放弃本次复制。
 * 来源默认为空，且指令库关闭时会复位，不会跨次记忆。
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

  // 所选来源当前的字数，用于在界面上明确告知将附带多少内容
  const sourceChars = useContentStore((s) =>
    source ? countChars({ article: s.articleMarkdown, document: s.documentMarkdown, card: s.cardMarkdown }[source]).chars : 0,
  )

  /** 复制成功提示的后缀，例如「，并附带「A4 文档」原稿（1200 字）」 */
  const suffix = source ? `，并附带「${MODE_LABELS[source]}」原稿（${sourceChars} 字）` : ''

  return { source, setSource, sourceChars, options: materialSourcesFor(mode), withMaterial, suffix }
}

export type MaterialSourceState = ReturnType<typeof useMaterialSource>
