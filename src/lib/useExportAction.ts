import { useState, useCallback, useRef, useEffect } from 'react'

export interface ExportActionContext {
  /** 可用于中断导出动作的信号 */
  signal: AbortSignal
  /** 导出动作可通过此回调报告进度（current/total），透出到 UI 进度条 */
  onProgress?: (current: number, total: number) => void
}

/**
 * 包装导出动作，统一管理导出状态、异常处理、Toast 反馈与取消能力。
 *
 * - 内部创建 AbortController，通过 ctx.signal 传给 action；
 * - 组件卸载时自动 abort 正在进行的导出，并避免卸载后 setState；
 * - 返回 cancel 函数供 UI「取消导出」按钮使用；
 * - 用 ref 跟踪运行状态，避免依赖 exporting 状态导致的 stale closure 并发问题；
 * - 透出 progress 供 UI 显示导出进度。
 */
export function useExportAction(onToast: (msg: string) => void) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)
  // 用 ref 跟踪是否有正在运行的导出，避免依赖 exporting 状态的 stale closure
  const runningRef = useRef(false)

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
      // 用 ref 守卫并发：避免闭包捕获旧的 exporting=false 导致重复触发
      if (runningRef.current) return
      runningRef.current = true

      // 取消上一个仍在挂起的动作（理论上不会发生，因为 runningRef 会阻止）
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setExporting(true)
      setProgress(null)
      let successMsg: string | void = undefined
      let hasError = false

      try {
        successMsg = await action({
          signal: controller.signal,
          onProgress: (current, total) => {
            if (mountedRef.current && !controller.signal.aborted) {
              setProgress({ current, total })
            }
          },
        })
      } catch (e) {
        // 主动取消时不弹失败提示
        if (controller.signal.aborted) return
        hasError = true
        if (mountedRef.current) {
          // 错误消息按纯文本处理，防止 Toast 以 innerHTML 渲染时被注入 HTML/脚本
          const rawMsg = e instanceof Error ? e.message : '未知错误'
          const safeMsg = rawMsg.replace(/[<>&"']/g, (ch) => {
            const escapeMap: Record<string, string> = {
              '<': '&lt;',
              '>': '&gt;',
              '&': '&amp;',
              '"': '&quot;',
              "'": '&#39;',
            }
            return escapeMap[ch] ?? ch
          })
          onToast(`导出失败：${safeMsg}`)
        }
      } finally {
        runningRef.current = false
        if (mountedRef.current && abortRef.current === controller) {
          setExporting(false)
          setProgress(null)
          abortRef.current = null
        }
      }

      if (successMsg && mountedRef.current && !controller.signal.aborted && !hasError) {
        onToast(successMsg)
      }
    },
    [onToast],
  )

  return [exporting, progress, runExport, cancel] as const
}
