import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { THEMES } from '@engine/composables/useTheme'
import { ThemePicker } from './ThemePicker'

describe('ThemePicker', () => {
  it('默认收起，点击后展开全部预设色，选中后回调对应主题', () => {
    const setTheme = vi.fn()
    render(<ThemePicker accent={THEMES[3].accent} setTheme={setTheme} />)
    expect(screen.queryByLabelText(`主题色 ${THEMES[0].accent}`)).toBeNull()

    fireEvent.click(screen.getByLabelText('切换主题色'))
    expect(screen.getAllByLabelText(/^主题色 #/)).toHaveLength(THEMES.length)

    fireEvent.click(screen.getByLabelText(`主题色 ${THEMES[0].accent}`))
    expect(setTheme).toHaveBeenCalledWith(THEMES[0].accent, THEMES[0].dark)
  })

  it('自定义取色经防抖后以加深色作为 dark 回调', () => {
    vi.useFakeTimers()
    const setTheme = vi.fn()
    render(<ThemePicker accent={THEMES[3].accent} setTheme={setTheme} />)
    fireEvent.click(screen.getByLabelText('切换主题色'))

    fireEvent.change(screen.getByLabelText('自定义主题色'), { target: { value: '#102030' } })
    expect(setTheme).not.toHaveBeenCalled()
    vi.advanceTimersByTime(250)
    expect(setTheme).toHaveBeenCalledTimes(1)
    expect(setTheme.mock.calls[0][0]).toBe('#102030')
    expect(setTheme.mock.calls[0][1]).toMatch(/^#[0-9a-f]{6}$/)
    vi.useRealTimers()
  })

  it('按 Esc 收起弹层', () => {
    render(<ThemePicker accent={THEMES[3].accent} setTheme={() => {}} />)
    fireEvent.click(screen.getByLabelText('切换主题色'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByLabelText('自定义主题色')).toBeNull()
  })
})
