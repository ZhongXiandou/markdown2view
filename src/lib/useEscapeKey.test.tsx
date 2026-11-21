import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useEscapeKey } from './useEscapeKey'

function Layer({ active, onEscape }: { active: boolean; onEscape: () => void }) {
  useEscapeKey(active, onEscape)
  return null
}

describe('useEscapeKey', () => {
  it('激活时按 Esc 触发回调，未激活时不触发', () => {
    const onEscape = vi.fn()
    const { rerender } = render(<Layer active={false} onEscape={onEscape} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).not.toHaveBeenCalled()

    rerender(<Layer active onEscape={onEscape} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('多层叠加时只关闭最后打开的一层', () => {
    const lower = vi.fn()
    const upper = vi.fn()
    const { rerender } = render(
      <>
        <Layer active onEscape={lower} />
        <Layer active={false} onEscape={upper} />
      </>,
    )
    rerender(
      <>
        <Layer active onEscape={lower} />
        <Layer active onEscape={upper} />
      </>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(upper).toHaveBeenCalledTimes(1)
    expect(lower).not.toHaveBeenCalled()

    // 上层关闭后，Esc 回到下层
    rerender(
      <>
        <Layer active onEscape={lower} />
        <Layer active={false} onEscape={upper} />
      </>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(lower).toHaveBeenCalledTimes(1)
  })

  it('输入法组字期间忽略 Esc', () => {
    const onEscape = vi.fn()
    render(<Layer active onEscape={onEscape} />)
    fireEvent.keyDown(document, { key: 'Escape', isComposing: true })
    expect(onEscape).not.toHaveBeenCalled()
  })
})
