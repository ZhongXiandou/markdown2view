import { useEffect, useState } from 'react'

export interface ToastState {
  message: string
  // 用于触发同样消息的重复弹出
  key: number
}

// 轻量级 Toast：接收一个 toast 状态，自动在底部居中弹出并淡出。
export function Toast({ toast }: { toast: ToastState | null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  return (
    <div
      className={`pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <div className="rounded-lg bg-slate-800/90 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
        {toast.message}
      </div>
    </div>
  )
}
