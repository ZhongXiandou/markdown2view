import { useEffect, type RefObject } from 'react'

// 让两个可滚动容器按比例联动。
// 采用「主导方」策略：鼠标 / 指针进入哪个容器，哪个就是主导方，只有主导方的
// 滚动会驱动另一方。这样彻底避免「程序化设置 scrollTop 触发反向滚动事件」造成
// 的相互拉扯（用 flushing 标志无法可靠拦截，因为 scroll 事件是异步派发的）。
export function useScrollSync(
  aRef: RefObject<HTMLElement | null>,
  bRef: RefObject<HTMLElement | null>,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const a = aRef.current
    const b = bRef.current
    if (!a || !b) return

    // 当前主导方：'a' | 'b' | null
    let leader: 'a' | 'b' | null = null
    // 使用独立的 raf 变量，避免两个方向的帧请求互相取消
    let rafA = 0
    let rafB = 0

    const apply = (src: HTMLElement, dst: HTMLElement) => {
      const srcMax = src.scrollHeight - src.clientHeight
      if (srcMax <= 0) return
      const ratio = src.scrollTop / srcMax
      const dstMax = dst.scrollHeight - dst.clientHeight
      dst.scrollTop = ratio * dstMax
    }

    const onScrollA = () => {
      if (leader !== 'a') return
      cancelAnimationFrame(rafA)
      rafA = requestAnimationFrame(() => apply(a, b))
    }
    const onScrollB = () => {
      if (leader !== 'b') return
      cancelAnimationFrame(rafB)
      rafB = requestAnimationFrame(() => apply(b, a))
    }

    const makeLeaderA = () => (leader = 'a')
    const makeLeaderB = () => (leader = 'b')

    // 鼠标进入 / 滚轮 / 触摸时确定主导方
    a.addEventListener('mouseenter', makeLeaderA)
    a.addEventListener('wheel', makeLeaderA, { passive: true })
    a.addEventListener('touchstart', makeLeaderA, { passive: true })
    b.addEventListener('mouseenter', makeLeaderB)
    b.addEventListener('wheel', makeLeaderB, { passive: true })
    b.addEventListener('touchstart', makeLeaderB, { passive: true })

    a.addEventListener('scroll', onScrollA, { passive: true })
    b.addEventListener('scroll', onScrollB, { passive: true })

    return () => {
      a.removeEventListener('mouseenter', makeLeaderA)
      a.removeEventListener('wheel', makeLeaderA)
      a.removeEventListener('touchstart', makeLeaderA)
      b.removeEventListener('mouseenter', makeLeaderB)
      b.removeEventListener('wheel', makeLeaderB)
      b.removeEventListener('touchstart', makeLeaderB)
      a.removeEventListener('scroll', onScrollA)
      b.removeEventListener('scroll', onScrollB)
      cancelAnimationFrame(rafA)
      cancelAnimationFrame(rafB)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
