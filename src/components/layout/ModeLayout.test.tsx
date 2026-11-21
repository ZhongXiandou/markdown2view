import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModeLayout } from './ModeLayout'

describe('ModeLayout', () => {
  it('renders editor and preview panes', () => {
    render(
      <ModeLayout
        editor={<div data-testid="editor">Editor</div>}
        preview={<div data-testid="preview">Preview</div>}
      />,
    )

    expect(screen.getByTestId('editor')).toHaveTextContent('Editor')
    expect(screen.getByTestId('preview')).toHaveTextContent('Preview')
  })

  it('shows toolbar when provided', () => {
    render(
      <ModeLayout
        editor={<div>Editor</div>}
        preview={<div>Preview</div>}
        toolbar={<div data-testid="toolbar">Toolbar</div>}
      />,
    )

    expect(screen.getByTestId('toolbar')).toHaveTextContent('Toolbar')
  })

  it('switches active view via mobile tabs on narrow viewport', () => {
    // 默认移动端下 edit tab 被激活
    render(
      <ModeLayout
        editor={<div data-testid="editor">Editor</div>}
        preview={<div data-testid="preview">Preview</div>}
      />,
    )

    const previewTab = screen.getByRole('button', { name: '实时预览' })
    fireEvent.click(previewTab)

    // 点击后 preview tab 应当带有激活样式
    expect(previewTab.className).toContain('text-[var(--accent)]')
  })

  it('supports controlled activeView', () => {
    const onChange = vi.fn()
    render(
      <ModeLayout
        activeView="preview"
        onActiveViewChange={onChange}
        editor={<div>Editor</div>}
        preview={<div>Preview</div>}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '编辑内容' }))
    expect(onChange).toHaveBeenCalledWith('edit')
  })
})

describe('ModeLayout - 分栏拖拽', () => {
  it('分隔条可用方向键调整比例，Home 恢复均分，且不超出允许范围', async () => {
    const { useAppStore, clampEditorSplit } = await import('@/lib/appStore')
    useAppStore.setState({ editorSplit: 0.5 })
    render(<ModeLayout editor={<div>Editor</div>} preview={<div>Preview</div>} />)

    const divider = screen.getByRole('separator')
    expect(divider.getAttribute('aria-valuenow')).toBe('50')

    fireEvent.keyDown(divider, { key: 'ArrowRight' })
    expect(useAppStore.getState().editorSplit).toBeCloseTo(0.52)
    expect(screen.getByRole('separator').getAttribute('aria-valuenow')).toBe('52')

    fireEvent.keyDown(divider, { key: 'Home' })
    expect(useAppStore.getState().editorSplit).toBe(0.5)

    expect(clampEditorSplit(0.05)).toBe(0.25)
    expect(clampEditorSplit(0.99)).toBe(0.75)
    expect(clampEditorSplit(Number.NaN)).toBe(0.5)
  })
})
