import { useLayoutEffect, useState } from 'react'

/**
 * 测量隐藏 DOM 容器内部所有块级元素的真实物理高度，支持 ResizeObserver 和图片加载监听
 * @param measuringRef 隐藏测量容器的 Ref
 * @param deps 重新测量高度所依赖的外部属性（如宽度、缩放比例、字体、主题等）
 */
export function useBlockHeights(
  measuringRef: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList
) {
  const [actualHeights, setActualHeights] = useState<Record<string, number>>({})

  useLayoutEffect(() => {
    const container = measuringRef.current
    if (!container) return

    const measure = () => {
      const newHeights: Record<string, number> = {}
      const elements = container.children
      
      let lastBottom = 0
      let isFirst = true

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement
        const id = el.getAttribute('data-block-id')
        if (id) {
          if (isFirst) {
            lastBottom = el.offsetTop
            isFirst = false
          }
          
          const bottom = el.offsetTop + el.offsetHeight
          const h = bottom - lastBottom
          lastBottom = bottom

          newHeights[id] = h
        }
      }

      setActualHeights(prev => {
        let hasChange = Object.keys(newHeights).length !== Object.keys(prev).length
        if (!hasChange) {
          for (const key in newHeights) {
            if (prev[key] !== newHeights[key]) {
              hasChange = true
              break
            }
          }
        }
        return hasChange ? newHeights : prev
      })
    }

    measure()

    const resizeObserver = new ResizeObserver(() => measure())
    const handleLoad = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        measure()
      }
    }
    container.addEventListener('load', handleLoad, true)
    
    const elements = Array.from(container.children)
    elements.forEach(el => resizeObserver.observe(el))

    return () => {
      resizeObserver.disconnect()
      container.removeEventListener('load', handleLoad, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return [actualHeights, setActualHeights] as const
}
