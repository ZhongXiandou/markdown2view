import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useContentStore } from '@/lib/store'
import { MaterialCopyMenu } from './MaterialCopyMenu'

describe('MaterialCopyMenu', () => {
  const writeText = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    writeText.mockClear()
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    useContentStore.setState({ documentMarkdown: '# 文档标题\n\n文档正文内容', articleMarkdown: '长图文内容' })
  })

  it('默认收起，不会复制任何内容', () => {
    render(<MaterialCopyMenu mode="article" buildPrompt={() => '指令正文'} onToast={() => {}} />)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(writeText).not.toHaveBeenCalled()
  })

  it('展开后列出来源与字数，点选后才复制「指令 + 原稿」并在提示里写明来源', async () => {
    const onToast = vi.fn()
    render(<MaterialCopyMenu mode="article" buildPrompt={() => '指令正文'} onToast={onToast} />)

    fireEvent.click(screen.getByText('指令 + 素材'))
    const item = screen.getByRole('menuitem')
    expect(item.textContent).toContain('「A4 文档」的当前内容')
    expect(item.textContent).toContain('10 字')
    expect(writeText).not.toHaveBeenCalled()

    fireEvent.click(item)
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    const copied = writeText.mock.calls[0][0] as string
    expect(copied.startsWith('指令正文')).toBe(true)
    expect(copied).toContain('<<<原稿开始>>>\n# 文档标题\n\n文档正文内容\n<<<原稿结束>>>')
    await waitFor(() => expect(onToast).toHaveBeenCalledWith('已复制指令，并附带「A4 文档」原稿（10 字）'))
    // 复制后菜单收起，下次仍需重新点选
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('来源没有内容时该项不可点', () => {
    useContentStore.setState({ documentMarkdown: '   ' })
    render(<MaterialCopyMenu mode="article" buildPrompt={() => '指令'} onToast={() => {}} />)
    fireEvent.click(screen.getByText('指令 + 素材'))
    const item = screen.getByRole('menuitem') as HTMLButtonElement
    expect(item.disabled).toBe(true)
    expect(item.textContent).toContain('暂无内容')
  })
})
