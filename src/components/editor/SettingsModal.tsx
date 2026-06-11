import { useState } from 'react'
import { useStore, type ImageHostType, type ImageHostConfig } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const imageHostConfig = useStore((s) => s.imageHostConfig)
  const setImageHostConfig = useStore((s) => s.setImageHostConfig)

  // 临时状态，用户点击保存时才写入 store
  const [activeType, setActiveType] = useState<ImageHostType>(imageHostConfig.activeType)
  const [smmsToken, setSmmsToken] = useState(imageHostConfig.smms?.token || '')
  
  // OSS
  const [ossRegion, setOssRegion] = useState(imageHostConfig.oss?.region || '')
  const [ossKeyId, setOssKeyId] = useState(imageHostConfig.oss?.accessKeyId || '')
  const [ossKeySecret, setOssKeySecret] = useState(imageHostConfig.oss?.accessKeySecret || '')
  const [ossBucket, setOssBucket] = useState(imageHostConfig.oss?.bucket || '')

  // COS
  const [cosSecretId, setCosSecretId] = useState(imageHostConfig.cos?.SecretId || '')
  const [cosSecretKey, setCosSecretKey] = useState(imageHostConfig.cos?.SecretKey || '')
  const [cosBucket, setCosBucket] = useState(imageHostConfig.cos?.Bucket || '')
  const [cosRegion, setCosRegion] = useState(imageHostConfig.cos?.Region || '')

  if (!isOpen) return null

  const handleSave = () => {
    const patch: Partial<ImageHostConfig> = {
      activeType,
      smms: { token: smmsToken },
      oss: {
        region: ossRegion,
        accessKeyId: ossKeyId,
        accessKeySecret: ossKeySecret,
        bucket: ossBucket,
      },
      cos: {
        SecretId: cosSecretId,
        SecretKey: cosSecretKey,
        Bucket: cosBucket,
        Region: cosRegion,
      },
    }
    setImageHostConfig(patch)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            图片上传与图床配置
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-[13px] font-semibold text-slate-500 block mb-2">图片上传目的地</label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { type: 'local', name: '本地 IndexedDB' },
                  { type: 'smms', name: 'Sm.ms 免费图床' },
                  { type: 'oss', name: '阿里云 OSS' },
                  { type: 'cos', name: '腾讯云 COS' },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  onClick={() => setActiveType(item.type)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    activeType === item.type
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)] font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span className="text-[12px]">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[160px] rounded-lg bg-slate-50 p-4 border border-slate-100">
            {activeType === 'local' && (
              <div className="text-[13px] leading-relaxed text-slate-500">
                <p className="font-semibold text-slate-700 mb-1.5">📁 本地 IndexedDB 模式</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>无需任何第三方配置，直接将图片保存在浏览器本地数据库中。</li>
                  <li>图片大小经 Canvas 压缩，性能流畅，对本地预览与 PDF 导出十分友好。</li>
                  <li>⚠️ <strong className="text-amber-600 font-medium">注意</strong>：由于本地图片为虚拟链接，直接复制 HTML 粘贴到微信公众号会导致图片失效（裂图），在公众号发布文章建议配置免费/付费图床。</li>
                </ul>
              </div>
            )}

            {activeType === 'smms' && (
              <div className="flex flex-col gap-3">
                <div className="text-[13px] leading-relaxed text-slate-500 mb-1">
                  <p className="font-semibold text-slate-700">☁️ Sm.ms 免费图床</p>
                  <p>请先在 <a href="https://sm.ms/" target="_blank" rel="noreferrer" className="text-[var(--accent)] underline font-medium">Sm.ms 官网</a> 注册并获取 API Token 填入下方。</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-slate-600">API Token</label>
                  <Input
                    type="password"
                    placeholder="输入 Sm.ms 秘钥 Token"
                    value={smmsToken}
                    onChange={(e) => setSmmsToken(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {activeType === 'oss' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 text-[13px] leading-relaxed text-slate-500 mb-1">
                  <p className="font-semibold text-slate-700">📦 阿里云对象存储 (OSS)</p>
                  <p>使用您的阿里云 Bucket 进行客户端直接上传。</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">Region (区域，如 oss-cn-hangzhou)</label>
                  <Input value={ossRegion} onChange={(e) => setOssRegion(e.target.value)} placeholder="oss-cn-hangzhou" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">Bucket Name (存储空间名称)</label>
                  <Input value={ossBucket} onChange={(e) => setOssBucket(e.target.value)} placeholder="my-bucket" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">AccessKey ID</label>
                  <Input value={ossKeyId} onChange={(e) => setOssKeyId(e.target.value)} placeholder="LTAI..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">AccessKey Secret</label>
                  <Input type="password" value={ossKeySecret} onChange={(e) => setOssKeySecret(e.target.value)} placeholder="Secret Key" />
                </div>
              </div>
            )}

            {activeType === 'cos' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 text-[13px] leading-relaxed text-slate-500 mb-1">
                  <p className="font-semibold text-slate-700">📦 腾讯云对象存储 (COS)</p>
                  <p>使用您的腾讯云 Bucket 进行客户端直接上传。</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">Region (区域，如 ap-shanghai)</label>
                  <Input value={cosRegion} onChange={(e) => setCosRegion(e.target.value)} placeholder="ap-shanghai" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">Bucket Name (存储桶，含 AppId)</label>
                  <Input value={cosBucket} onChange={(e) => setCosBucket(e.target.value)} placeholder="my-bucket-125000" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">SecretId</label>
                  <Input value={cosSecretId} onChange={(e) => setCosSecretId(e.target.value)} placeholder="AKID..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">SecretKey</label>
                  <Input type="password" value={cosSecretKey} onChange={(e) => setCosSecretKey(e.target.value)} placeholder="Secret Key" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSave}>保存配置</Button>
        </div>
      </div>
    </div>
  )
}
