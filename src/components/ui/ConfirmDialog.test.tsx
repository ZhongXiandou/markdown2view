import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('关闭状态不渲染', () => {
    render(<ConfirmDialog open={false} title="删除？" onConfirm={() => {}} onCancel={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('点击确定/取消分别触发对应回调', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="删除？" message="不可恢复" onConfirm={onConfirm} onCancel={onCancel} />)

    expect(screen.getByText('不可恢复')).toBeTruthy()
    fireEvent.click(screen.getByText('确定'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByText('取消'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('按 Esc 等同于取消', () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="删除？" onConfirm={() => {}} onCancel={onCancel} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
