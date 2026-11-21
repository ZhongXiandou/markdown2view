import { useEscapeKey } from '@/lib/useEscapeKey'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useEscapeKey(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* 顶部彩色装饰条 */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />

        <div className="p-6">
          {/* 标题区与盾牌图标 */}
          <div className="flex items-start gap-4 mb-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div>
              <h2 className="text-[18px] font-bold text-slate-900">隐私与数据安全说明</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">为您提供完全透明、安全独立的数据处理服务</p>
            </div>
          </div>

          {/* 条款核心卡片 */}
          <div className="space-y-4 text-slate-600 text-[13px] leading-relaxed">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                (a) 纯前端沙箱运行，数据零上传
              </h3>
              <p className="text-slate-500 pl-3.5">
                本项目为<strong>纯前端项目</strong>，没有设计任何后端服务器。您的所有 Markdown 文本、参数设置和生成的 HTML/图片/PDF 等成果，均完全在您本机的浏览器中进行实时解析与导出，<strong>绝对不会传输至任何服务器</strong>，充分保障您的商业机密与个人隐私。
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                (b) 本地持久化，安全又便捷
              </h3>
              <p className="text-slate-500 pl-3.5">
                您的个性化配置、历史编辑状态和图床设置，均安全地存储于浏览器的 <code>localStorage</code> 本地缓存中。<strong>只要您不手动清除浏览器缓存</strong>，在同一设备和浏览器上便可一直保持，避免数据丢失的同时实现了即开即用。
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                (c) 直连云服务，拒绝中间中转
              </h3>
              <p className="text-slate-500 pl-3.5">
                如果您在「图床设置」中配置了个人对象存储（如阿里云 OSS、腾讯云 COS），系统仅在您主动上传图片时<strong>直连您的云服务商 API</strong>，同样绝无任何中转服务器截留，密钥完全由您掌控。
              </p>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            100% 离线可用 / 开源受信任
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-5 py-2 text-[13px] font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}
