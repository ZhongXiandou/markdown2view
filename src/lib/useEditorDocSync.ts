import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/lib/useDebounce'

interface EditorDocSync {
  /** 编辑器本地值（每次按键更新），作为 CodeEditor 的 value / 初始文档 */
  localValue: string
  /** 防抖后的值，用于渲染预览与回写 store */
  debouncedValue: string
  /** 编辑器 onChange 回调 */
  setLocalValue: (value: string) => void
  /** 外部重置信号：递增时 CodeEditor 应将最新 localValue 强制写入文档 */
  externalVersion: number
}

// store ↔ 编辑器 双向同步：
// - 本地输入防抖后回写 store；
// - 用「最近一次回写到 store 的值」识别回写回声（纯值判定，无时序竞态），
//   避免回声把防抖旧值灌回编辑器导致丢字；
// - 仅真正的外部变更（恢复示例 / 示例版本刷新）才递增 externalVersion，通知编辑器覆盖文档。
export function useEditorDocSync(
  storeValue: string,
  setStoreValue: (value: string) => void,
  delay = 500,
): EditorDocSync {
  const [localValue, setLocalValue] = useState(storeValue)
  const [externalVersion, setExternalVersion] = useState(0)
  // 最近一次由本组件回写到 store 的值（初始即 store 值），用于识别回声
  const lastWrittenRef = useRef(storeValue)

  // 外部 store 变化（恢复示例 / 版本刷新）→ 同步到本地并通知编辑器
  useEffect(() => {
    if (storeValue === lastWrittenRef.current) return
    lastWrittenRef.current = storeValue
    setLocalValue(storeValue)
    setExternalVersion((v) => v + 1)
  }, [storeValue])

  const debouncedValue = useDebounce(localValue, delay)

  // 本地编辑（防抖后）→ 回写 store；与上次回写值相同则跳过，避免冗余写入与误标 dirty
  useEffect(() => {
    if (debouncedValue !== lastWrittenRef.current) {
      lastWrittenRef.current = debouncedValue
      setStoreValue(debouncedValue)
    }
  }, [debouncedValue, setStoreValue])

  return { localValue, debouncedValue, setLocalValue, externalVersion }
}
