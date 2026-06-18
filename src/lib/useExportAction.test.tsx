import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExportAction } from './useExportAction'

describe('useExportAction', () => {
  it('shows success toast when action resolves', async () => {
    const onToast = vi.fn()
    const { result } = renderHook(() => useExportAction(onToast))

    await act(async () => {
      const [, , runExport] = result.current
      await runExport(async () => '导出成功')
    })

    expect(onToast).toHaveBeenCalledWith('导出成功')
    const [exporting] = result.current
    expect(exporting).toBe(false)
  })

  it('shows error toast when action rejects', async () => {
    const onToast = vi.fn()
    const { result } = renderHook(() => useExportAction(onToast))

    await act(async () => {
      const [, , runExport] = result.current
      await runExport(async () => {
        throw new Error('boom')
      })
    })

    expect(onToast).toHaveBeenCalledWith('导出失败：boom')
    const [exporting] = result.current
    expect(exporting).toBe(false)
  })

  it('does not show error toast when user cancels', async () => {
    const onToast = vi.fn()
    const { result } = renderHook(() => useExportAction(onToast))

    let capturedSignal: AbortSignal | undefined
    const promise = act(async () => {
      const [, , runExport, cancel] = result.current
      const p = runExport(async ({ signal }) => {
        capturedSignal = signal
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 'done'
      })
      // 在动作完成前取消
      setTimeout(() => cancel(), 10)
      await p
    })

    await promise

    expect(capturedSignal?.aborted).toBe(true)
    expect(onToast).not.toHaveBeenCalledWith(expect.stringContaining('导出失败'))
    const [exporting] = result.current
    expect(exporting).toBe(false)
  })

  it('does not call onToast after unmount', async () => {
    const onToast = vi.fn()
    const { result, unmount } = renderHook(() => useExportAction(onToast))

    await act(async () => {
      const [, , runExport] = result.current
      runExport(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 'done'
      })
      // 等待动作开始
      await new Promise((r) => setTimeout(r, 10))
    })

    unmount()

    // 等待动作完成
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150))
    })

    expect(onToast).not.toHaveBeenCalled()
  })
})
