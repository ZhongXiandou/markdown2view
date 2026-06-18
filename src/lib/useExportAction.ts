import { useState, useCallback, useRef, useEffect } from 'react'

export interface ExportActionContext {
  /** 可用于中断导出动作的信号 */
  signal: AbortSignal
}

/**
 * 包装导出动作，统一管理导出状态、异常处理、Toast 反馈与取消能力。
 *
 * - 内部创建 AbortController，通过 ctx.signal 传给 action；
 * - 组件卸载时自动 abort 正在进行的导出，并避免卸载后 setState；
 * - 返回 cancel 函数供 UI「取消导出」按钮使用。
 */
export function useExportAction(onToast: (msg: string) => void) {
  const [exporting, setExporting] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort('user-cancel')
  }, [])

  const runExport = useCallback(
    async (action: (ctx: ExportActionContext) => Promise<string | void>) => {
      if (exporting) return

      // 取消上一个仍在挂起的动作（理论上不会发生，因为 exporting 会阻止）
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setExporting(true)
      let successMsg: string | void = undefined
      let hasError = false

      try {
        successMsg = await action({ signal: controller.signal })
      } catch (e) {
        // 主动取消时不弹失败提示
        if (controller.signal.aborted) return
        hasError = true
        if (mountedRef.current) {
          onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
        }
      } finally {
        if (mountedRef.current && abortRef.current === controller) {
          setExporting(false)
          abortRef.current = null
        }
      }

      if (successMsg && mountedRef.current && !controller.signal.aborted && !hasError) {
        onToast(successMsg)
      }
    },
    [exporting, onToast],
  )

  return [exporting, runExport, cancel] as const
}
