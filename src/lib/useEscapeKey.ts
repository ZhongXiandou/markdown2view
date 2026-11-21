import { useEffect, useRef } from 'react'

// 已激活的 Esc 处理器栈：弹窗可能叠加（如指令库上再开预览），Esc 只应关闭最上层那个。
const stack: Array<{ current: () => void }> = []

function handleKeyDown(e: KeyboardEvent) {
  // 输入法组字期间的 Esc 用于取消候选，不应关闭弹窗
  if (e.key !== 'Escape' || e.isComposing) return
  stack[stack.length - 1]?.current()
}

/**
 * 弹窗/浮层打开期间按 Esc 关闭。
 * @param active 浮层是否处于打开状态
 * @param onEscape 关闭回调
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  const handlerRef = useRef(onEscape)
  handlerRef.current = onEscape

  useEffect(() => {
    if (!active) return
    stack.push(handlerRef)
    if (stack.length === 1) document.addEventListener('keydown', handleKeyDown)
    return () => {
      const idx = stack.indexOf(handlerRef)
      if (idx >= 0) stack.splice(idx, 1)
      if (stack.length === 0) document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])
}
