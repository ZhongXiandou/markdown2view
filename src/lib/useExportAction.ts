import { useState, useCallback } from 'react'

/**
 * 包装导出动作，统一管理导出状态（exporting）以及异常处理与 Toast 反馈
 * @param onToast 外部传入的统一轻提示回调
 */
export function useExportAction(onToast: (msg: string) => void) {
  const [exporting, setExporting] = useState(false)

  const runExport = useCallback(async (action: () => Promise<string | void>) => {
    setExporting(true)
    try {
      const successMsg = await action()
      if (successMsg) {
        onToast(successMsg)
      }
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }, [onToast])

  return [exporting, runExport] as const
}
