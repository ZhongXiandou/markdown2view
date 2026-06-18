import { useState, useEffect } from 'react'
import { useStore, type ImageHostType, type ImageHostConfig } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HardDrive, Cloud, Package, AlertTriangle, Shield } from '@/components/ui/Icon'
import {
  hasVault,
  isCryptoAvailable,
  encryptToVault,
  decryptFromVault,
  clearVault,
} from '@/lib/secureVault'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type HostForm = {
  activeType: ImageHostType
  smmsToken: string
  ossRegion: string
  ossKeyId: string
  ossKeySecret: string
  ossBucket: string
  cosSecretId: string
  cosSecretKey: string
  cosBucket: string
  cosRegion: string
}

/** 从图床配置构造表单初始值 */
function buildForm(c: ImageHostConfig): HostForm {
  return {
    activeType: c.activeType,
    smmsToken: c.smms?.token || '',
    ossRegion: c.oss?.region || '',
    ossKeyId: c.oss?.accessKeyId || '',
    ossKeySecret: c.oss?.accessKeySecret || '',
    ossBucket: c.oss?.bucket || '',
    cosSecretId: c.cos?.SecretId || '',
    cosSecretKey: c.cos?.SecretKey || '',
    cosBucket: c.cos?.Bucket || '',
    cosRegion: c.cos?.Region || '',
  }
}

/** 当前内存配置中是否已含任意敏感密钥（用于判断是否需要解锁） */
function configHasSecret(c: ImageHostConfig): boolean {
  return Boolean(
    c.smms?.token || c.oss?.accessKeyId || c.oss?.accessKeySecret || c.cos?.SecretId || c.cos?.SecretKey,
  )
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const imageHostConfig = useStore((s) => s.imageHostConfig)
  const setImageHostConfig = useStore((s) => s.setImageHostConfig)

  const cryptoOk = isCryptoAvailable()

  // 临时状态，用户点击保存时才写入 store
  const [form, setForm] = useState<HostForm>(() => buildForm(imageHostConfig))
  // 加密保险箱相关状态
  const [vaultExists, setVaultExists] = useState(false)
  const [remember, setRemember] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [saveError, setSaveError] = useState('')
  // 解锁相关状态
  const [unlockPass, setUnlockPass] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')

  // 每次打开弹窗时，从 store 重新初始化表单，避免「取消后重开看到上次未保存的脏值」。
  // 组件常驻挂载（hooks 之后才 return null），故必须在 isOpen 切换时重置。
  // 解锁成功后 imageHostConfig 变化也会触发此处，从而把解密出的密钥自动回填表单。
  useEffect(() => {
    if (!isOpen) return
    setForm(buildForm(imageHostConfig))
    const exists = hasVault()
    setVaultExists(exists)
    setRemember(exists) // 已有保险箱时默认保持「记住密钥」勾选
    setPassphrase('')
    setUnlockPass('')
    setUnlockError('')
    setSaveError('')
  }, [isOpen, imageHostConfig])

  if (!isOpen) return null

  // 本地存在加密保险箱，但当前内存中尚无密钥 → 需要解锁
  const needsUnlock = vaultExists && !configHasSecret(imageHostConfig)

  const updateFormField = <K extends keyof HostForm>(key: K, value: HostForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // 用口令解锁保险箱，将密钥合并回内存配置（保留现有 region/bucket）
  const handleUnlock = async () => {
    setUnlockError('')
    setUnlocking(true)
    try {
      const secrets = await decryptFromVault(unlockPass)
      setImageHostConfig({
        smms: { token: secrets.smms?.token || '' },
        oss: {
          region: imageHostConfig.oss?.region || '',
          bucket: imageHostConfig.oss?.bucket || '',
          accessKeyId: secrets.oss?.accessKeyId || '',
          accessKeySecret: secrets.oss?.accessKeySecret || '',
        },
        cos: {
          Bucket: imageHostConfig.cos?.Bucket || '',
          Region: imageHostConfig.cos?.Region || '',
          SecretId: secrets.cos?.SecretId || '',
          SecretKey: secrets.cos?.SecretKey || '',
        },
      })
      setUnlockPass('')
      // 表单会因 imageHostConfig 变化经由上面的 useEffect 自动重填
    } catch {
      setUnlockError('口令错误或数据已损坏，请重试')
    } finally {
      setUnlocking(false)
    }
  }

  const handleSave = async () => {
    setSaveError('')
    const patch: Partial<ImageHostConfig> = {
      activeType: form.activeType,
      smms: { token: form.smmsToken },
      oss: {
        region: form.ossRegion,
        accessKeyId: form.ossKeyId,
        accessKeySecret: form.ossKeySecret,
        bucket: form.ossBucket,
      },
      cos: {
        SecretId: form.cosSecretId,
        SecretKey: form.cosSecretKey,
        Bucket: form.cosBucket,
        Region: form.cosRegion,
      },
    }
    setImageHostConfig(patch)

    if (remember && cryptoOk) {
      if (passphrase) {
        // 用新口令加密保存（覆盖旧保险箱）
        try {
          await encryptToVault(
            {
              smms: { token: form.smmsToken },
              oss: { accessKeyId: form.ossKeyId, accessKeySecret: form.ossKeySecret },
              cos: { SecretId: form.cosSecretId, SecretKey: form.cosSecretKey },
            },
            passphrase,
          )
        } catch (e) {
          setSaveError(`加密保存失败：${e instanceof Error ? e.message : '未知错误'}`)
          return // 不关闭，让用户重试
        }
      } else if (!vaultExists) {
        // 想记住但既没填口令、也没有现成保险箱
        setSaveError('请输入用于加密的口令，或取消勾选「记住密钥」')
        return
      }
      // remember && 口令留空 && 已有保险箱：沿用现有保险箱，不重新加密
    } else {
      // 未勾选「记住密钥」（或环境不支持加密）：清除任何已存在的保险箱
      clearVault()
    }
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
            type="button"
            onClick={onClose}
            aria-label="关闭"
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
                  onClick={() => updateFormField('activeType', item.type)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    form.activeType === item.type
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)] font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span className="text-[12px]">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 解锁横幅：本地已加密保存密钥但当前会话尚未解锁时显示 */}
          {needsUnlock && form.activeType !== 'local' && (
            <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                <Shield size={15} className="text-[var(--accent)]" />
                已加密保存图床密钥，请输入口令解锁
              </div>
              <p className="text-[12px] text-slate-500">输入口令解锁后即可使用，无需重新填写密钥。</p>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  placeholder="输入解锁口令"
                  value={unlockPass}
                  onChange={(e) => setUnlockPass(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && unlockPass && !unlocking) handleUnlock()
                  }}
                  className="flex-1"
                />
                <Button variant="primary" onClick={handleUnlock} disabled={unlocking || !unlockPass}>
                  {unlocking ? '解锁中…' : '解锁'}
                </Button>
              </div>
              {unlockError && <p className="text-[12px] text-red-500">{unlockError}</p>}
            </div>
          )}

          <div className="min-h-[160px] rounded-lg bg-slate-50 p-4 border border-slate-100">
            {form.activeType === 'local' && (
              <div className="text-[13px] leading-relaxed text-slate-500">
                <p className="font-semibold text-slate-700 mb-1.5"><span className="inline-flex items-center gap-1.5"><HardDrive size={15} /> 本地 IndexedDB 模式</span></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>无需任何第三方配置，直接将图片保存在浏览器本地数据库中。</li>
                  <li>图片大小经 Canvas 压缩，性能流畅，对本地预览与 PDF 导出十分友好。</li>
                  <li>注意：<strong className="text-amber-600 font-medium">由于本地图片为虚拟链接</strong>，直接复制 HTML 粘贴到微信公众号会导致图片失效（裂图），在公众号发布文章建议配置免费/付费图床。</li>
                </ul>
              </div>
            )}

            {form.activeType === 'smms' && (
              <div className="flex flex-col gap-3">
                <div className="text-[13px] leading-relaxed text-slate-500 mb-1">
                  <p className="font-semibold text-slate-700"><span className="inline-flex items-center gap-1.5"><Cloud size={15} /> Sm.ms 免费图床</span></p>
                  <p>请先在 <a href="https://sm.ms/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline font-medium">Sm.ms 官网</a> 注册并获取 API Token 填入下方。</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-slate-600">API Token</label>
                  <Input
                    type="password"
                    placeholder="输入 Sm.ms 秘钥 Token"
                    value={form.smmsToken}
                    onChange={(e) => updateFormField('smmsToken', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {form.activeType === 'oss' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 text-[13px] leading-relaxed text-slate-500 mb-1">
                  <p className="font-semibold text-slate-700"><span className="inline-flex items-center gap-1.5"><Package size={15} /> 阿里云对象存储 (OSS)</span></p>
                  <p>使用您的阿里云 Bucket 进行客户端直接上传。</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">Region (区域，如 oss-cn-hangzhou)</label>
                  <Input value={form.ossRegion} onChange={(e) => updateFormField('ossRegion', e.target.value)} placeholder="oss-cn-hangzhou" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">Bucket Name (存储空间名称)</label>
                  <Input value={form.ossBucket} onChange={(e) => updateFormField('ossBucket', e.target.value)} placeholder="my-bucket" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">AccessKey ID</label>
                  <Input value={form.ossKeyId} onChange={(e) => updateFormField('ossKeyId', e.target.value)} placeholder="LTAI..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">AccessKey Secret</label>
                  <Input type="password" value={form.ossKeySecret} onChange={(e) => updateFormField('ossKeySecret', e.target.value)} placeholder="Secret Key" />
                </div>
              </div>
            )}

            {form.activeType === 'cos' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 text-[13px] leading-relaxed text-slate-500 mb-1">
                  <p className="font-semibold text-slate-700"><span className="inline-flex items-center gap-1.5"><Package size={15} /> 腾讯云对象存储 (COS)</span></p>
                  <p>使用您的腾讯云 Bucket 进行客户端直接上传。</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">Region (区域，如 ap-shanghai)</label>
                  <Input value={form.cosRegion} onChange={(e) => updateFormField('cosRegion', e.target.value)} placeholder="ap-shanghai" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">Bucket Name (存储桶，含 AppId)</label>
                  <Input value={form.cosBucket} onChange={(e) => updateFormField('cosBucket', e.target.value)} placeholder="my-bucket-125000" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">SecretId</label>
                  <Input value={form.cosSecretId} onChange={(e) => updateFormField('cosSecretId', e.target.value)} placeholder="AKID..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">SecretKey</label>
                  <Input type="password" value={form.cosSecretKey} onChange={(e) => updateFormField('cosSecretKey', e.target.value)} placeholder="Secret Key" />
                </div>
              </div>
            )}
          </div>

          {/* 记住密钥（加密保存）：仅在云图床且环境支持 Web Crypto 时可用 */}
          {form.activeType !== 'local' && cryptoOk && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                <span className="text-[13px] font-medium text-slate-700 inline-flex items-center gap-1.5">
                  <Shield size={14} className="text-[var(--accent)]" /> 记住密钥（用口令加密保存到本地）
                </span>
              </label>
              {remember && (
                <div className="flex flex-col gap-1">
                  <Input
                    type="password"
                    placeholder={vaultExists ? '留空沿用旧口令，填写则重新加密' : '设置加密口令'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-[11px] text-slate-400">口令仅用于本地加密，不上传；遗忘需重新填写密钥。</p>
                </div>
              )}
              {saveError && <p className="text-[12px] text-red-500">{saveError}</p>}
            </div>
          )}

          {form.activeType !== 'local' && (
            <div className="text-[11px] leading-relaxed text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-100 flex items-start gap-1.5">
              <span className="shrink-0 mt-0.5"><AlertTriangle size={14} className="text-amber-600" /></span>
              <span>
                <strong>安全提示</strong>：本应用纯前端无后端。<strong>默认密钥仅存当前会话内存</strong>，刷新即清除。勾选「记住密钥」后会用口令加密保存在本地。请勿在公共计算机上配置生产环境密钥。
                {!cryptoOk && <><br />当前为非安全上下文（非 HTTPS），无法加密保存。</>}
              </span>
            </div>
          )}
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
