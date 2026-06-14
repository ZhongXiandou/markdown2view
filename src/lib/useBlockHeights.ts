import { useLayoutEffect, useState } from 'react'

/**
 * 测量隐藏 DOM 容器内部所有块级元素的真实物理高度，以及表格每行的实际高度。
 * 支持 ResizeObserver 和图片加载监听。
 *
 * @param measuringRef 隐藏测量容器的 Ref
 * @param deps 重新测量高度所依赖的外部属性（如宽度、缩放比例、字体、主题等）
 * @returns [actualHeights, tableRowHeights, tableOverheads]
 *   - actualHeights: 每个 block 的总高度映射 { blockId: height }
 *   - tableRowHeights: 每个表格块的逐行高度映射 { blockId: [headerHeight, row0Height, row1Height, ...] }
 *   - tableOverheads: 每个表格块的非行开销（caption + 外边距 + 容器内边距 + 表格边框等）
 *                     = 块总高度 - 所有行高之和
 */
export function useBlockHeights(
  measuringRef: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList
): [Record<string, number>, Record<string, number[]>, Record<string, number>] {
  const [actualHeights, setActualHeights] = useState<Record<string, number>>({})
  const [tableRowHeights, setTableRowHeights] = useState<Record<string, number[]>>({})
  const [tableOverheads, setTableOverheads] = useState<Record<string, number>>({})

  useLayoutEffect(() => {
    const container = measuringRef.current
    if (!container) return

    const measure = () => {
      const newHeights: Record<string, number> = {}
      const newRowHeights: Record<string, number[]> = {}
      const newOverheads: Record<string, number> = {}
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

          // 表格块：逐行测量真实高度（thead 首行 + tbody 各数据行）
          if (el.getAttribute('data-kind') === 'table') {
            const rowHeights: number[] = []
            const theadTr = el.querySelector('thead > tr') as HTMLElement | null
            if (theadTr) {
              rowHeights.push(theadTr.offsetHeight)
            }
            const tbodyTrs = el.querySelectorAll('tbody > tr')
            for (let j = 0; j < tbodyTrs.length; j++) {
              rowHeights.push((tbodyTrs[j] as HTMLElement).offsetHeight)
            }
            if (rowHeights.length > 0) {
              newRowHeights[id] = rowHeights
              // 非行开销 = 块总高度 - 所有行高之和
              // 包含：caption 高度、外边距（上16px + 下30px）、容器内边距（上下各16px）、表格边框等
              const rowSum = rowHeights.reduce((s, v) => s + v, 0)
              newOverheads[id] = Math.max(0, h - rowSum)
            }
          }
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

      setTableRowHeights(prev => {
        const newKeys = Object.keys(newRowHeights)
        const prevKeys = Object.keys(prev)
        if (newKeys.length !== prevKeys.length) return newRowHeights
        for (const key of newKeys) {
          const newArr = newRowHeights[key]
          const prevArr = prev[key]
          if (!prevArr || newArr.length !== prevArr.length) return newRowHeights
          for (let k = 0; k < newArr.length; k++) {
            if (newArr[k] !== prevArr[k]) return newRowHeights
          }
        }
        return prev
      })

      setTableOverheads(prev => {
        let hasChange = Object.keys(newOverheads).length !== Object.keys(prev).length
        if (!hasChange) {
          for (const key in newOverheads) {
            if (prev[key] !== newOverheads[key]) {
              hasChange = true
              break
            }
          }
        }
        return hasChange ? newOverheads : prev
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
    elements.forEach(el => {
      resizeObserver.observe(el)
      // 对表格块：额外观察 <table> 元素，捕获列宽重排引起的行高变化
      const table = el.querySelector('table')
      if (table) resizeObserver.observe(table)
    })

    return () => {
      resizeObserver.disconnect()
      container.removeEventListener('load', handleLoad, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return [actualHeights, tableRowHeights, tableOverheads] as const
}
