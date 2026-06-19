import type { ImageHostConfig } from '@/lib/store'
import { hasVault } from '@/lib/secureVault'

const DB_NAME = 'm2v-images-db'
const STORE_NAME = 'images'
const MAX_LOCAL_IMAGE_URLS = 64
const MAX_UPLOAD_IMAGE_BYTES = 10 * 1024 * 1024

const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type SupportedImageMime = 'image/jpeg' | 'image/png' | 'image/webp'

// 缓存数据库连接，避免每次操作都新建连接
let dbPromise: Promise<IDBDatabase> | null = null

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  
  return dbPromise
}

/**
 * 存储图片 Blob 到 IndexedDB
 */
export async function saveLocalImage(id: string, blob: Blob): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.put(blob, id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/**
 * 从 IndexedDB 获取图片 Blob
 */
export async function getLocalImage(id: string): Promise<Blob | null> {
  try {
    const db = await getDB()
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.error('IndexedDB error:', err)
    return null
  }
}

function normalizeImageMime(type: string): SupportedImageMime | null {
  const normalized = type.toLowerCase() === 'image/jpg' ? 'image/jpeg' : type.toLowerCase()
  return SUPPORTED_IMAGE_MIME_TYPES.has(normalized) ? normalized as SupportedImageMime : null
}

function imageExtensionFromMime(type: string): 'jpg' | 'png' | 'webp' | null {
  const mime = normalizeImageMime(type)
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return null
}

async function detectImageMime(file: Blob): Promise<SupportedImageMime | null> {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return 'image/jpeg'
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) return 'image/png'
  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) return 'image/webp'
  return null
}

export async function validateImageFile(file: File, maxSize = MAX_UPLOAD_IMAGE_BYTES): Promise<SupportedImageMime> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }
  if (file.size > maxSize) {
    throw new Error(`图片不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)
  }
  const declaredMime = normalizeImageMime(file.type)
  const detectedMime = await detectImageMime(file)
  if (!detectedMime) {
    throw new Error('不支持的图片格式，仅支持 JPG、PNG、WebP')
  }
  if (declaredMime && declaredMime !== detectedMime) {
    throw new Error('图片文件类型与文件头不一致')
  }
  return detectedMime
}

export function createImageUploadFile(original: File, blob: Blob): File {
  const ext = imageExtensionFromMime(blob.type) || imageExtensionFromMime(original.type) || 'jpg'
  const base = original.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${base}.${ext}`, { type: blob.type })
}

/**
 * Canvas 图片压缩，quality 默认 0.7，最大宽度 1600
 */
export function compressImage(file: File, maxWidth = 1600, quality = 0.7, outputType?: SupportedImageMime): Promise<Blob> {
  const mime = outputType || normalizeImageMime(file.type) || 'image/jpeg'
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Canvas compression failed'))
            }
          },
          mime,
          mime === 'image/png' ? undefined : quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// 内存 Object URL 缓存：img://id -> blob:http://...
//
// 6.8: 这是模块级可变状态，在本项目的运行约束下是安全的：
// - 纯前端 SPA，无 SSR，不会出现服务端/客户端 realm 撕裂
// - 每个浏览器 tab 拥有独立的 JS realm，模块级状态天然隔离
// - ObjectURL 无法跨 realm 使用，模块级缓存与当前 document 绑定是正确语义
// 测试场景下需在 beforeEach 中调用 clearLocalImageUrlCache() 重置状态，避免用例间污染。
export const localImageUrls: Record<string, string> = {}
// LRU 顺序表：与 localImageUrls 一一对应，记录访问顺序（Map 迭代顺序 = 插入顺序）。
const localImageUrlOrder = new Map<string, string>()

/**
 * 安全地读取缓存的图片 URL（只读访问，不更新 LRU 顺序）。
 * 外部模块应使用此函数替代直接访问 localImageUrls，确保封装性。
 */
export function getCachedImageUrl(id: string): string | undefined {
  return localImageUrls[id]
}

/**
 * 构建反向索引：url -> id，用于 O(1) 查找。
 * 每次调用都基于当前缓存状态实时构建，保证数据一致性。
 */
export function getUrlToIdMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const [id, url] of Object.entries(localImageUrls)) {
    map.set(url, id)
  }
  return map
}

/**
 * 获取当前缓存中所有图片 ID 列表（主要用于测试与诊断）。
 */
export function getAllCachedImageIds(): string[] {
  return Object.keys(localImageUrls)
}

function revokeObjectUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function touchImageUrl(id: string): string | undefined {
  const url = localImageUrls[id]
  if (!url) return undefined
  // LRU 语义：delete+set 把条目移到 Map 末尾（最近使用）。
  // Map.set 对已存在的 key 不会改变迭代顺序，因此必须 delete+set。
  localImageUrlOrder.delete(id)
  localImageUrlOrder.set(id, url)
  return url
}

function rememberImageUrl(id: string, url: string): string {
  const existing = localImageUrls[id]
  // 6.2: url 未变时原地返回，避免 revoke+recreate 导致 Map 抖动
  if (existing === url) {
    // 仅更新 LRU 顺序
    localImageUrlOrder.delete(id)
    localImageUrlOrder.set(id, url)
    return url
  }
  if (existing) {
    revokeObjectUrl(existing)
  }
  localImageUrls[id] = url
  localImageUrlOrder.delete(id)
  localImageUrlOrder.set(id, url)
  while (localImageUrlOrder.size > MAX_LOCAL_IMAGE_URLS) {
    const oldest = localImageUrlOrder.entries().next().value as [string, string] | undefined
    if (!oldest) break
    const [oldestId, oldestUrl] = oldest
    localImageUrlOrder.delete(oldestId)
    // 6.2: 无条件同步清理 localImageUrls，确保两个结构大小一致，
    // 避免 localImageUrls 残留条目导致 ObjectURL 泄漏或测试断言错位
    delete localImageUrls[oldestId]
    revokeObjectUrl(oldestUrl)
  }
  return url
}

/**
 * 释放指定 id 对应的 Object URL 并从缓存中移除，避免 Blob 长期驻留内存。
 * 在删除本地图片或不再需要引用时调用。
 */
export function revokeImageUrl(id: string): void {
  const url = localImageUrls[id]
  if (url) {
    revokeObjectUrl(url)
    delete localImageUrls[id]
  }
  localImageUrlOrder.delete(id)
}

export function clearLocalImageUrlCache(): void {
  for (const url of Object.values(localImageUrls)) {
    revokeObjectUrl(url)
  }
  for (const id of Object.keys(localImageUrls)) {
    delete localImageUrls[id]
  }
  localImageUrlOrder.clear()
}

export function pruneLocalImageUrlCache(usedIds: Iterable<string>): void {
  const used = new Set(usedIds)
  for (const id of Object.keys(localImageUrls)) {
    if (!used.has(id)) {
      revokeImageUrl(id)
    }
  }
}

function extractLocalImageIds(md: string): string[] {
  return Array.from(md.matchAll(/!\[[^\]]*\]\((img:\/\/img_[a-zA-Z0-9_-]+)\)/g), (match) => match[1].replace('img://', ''))
}

/**
 * 将 img://id 转换为 Object URL，避免把 Blob 长期缓存为 base64 Data URL
 */
export async function resolveImageUrl(id: string): Promise<string> {
  const cached = touchImageUrl(id)
  if (cached) return cached
  const blob = await getLocalImage(id)
  if (blob) {
    return rememberImageUrl(id, URL.createObjectURL(blob))
  }
  return ''
}

/**
 * 在解析 Markdown 前，预先并行加载文档中所有 img:// 图片到内存中
 */
export async function preloadImagesFromMarkdown(md: string): Promise<void> {
  const ids = Array.from(new Set(extractLocalImageIds(md)))
  pruneLocalImageUrlCache(ids)
  const promises = ids.map(async (id) => {
    if (!localImageUrls[id]) {
      await resolveImageUrl(id)
    } else {
      touchImageUrl(id)
    }
  })
  if (promises.length > 0) {
    await Promise.all(promises)
  }
}

/**
 * 免费图床 Sm.ms 上传
 */
export async function uploadToSmMs(file: File, token: string): Promise<string> {
  const formData = new FormData()
  formData.append('smfile', file)

  const response = await fetch('https://sm.ms/api/v2/upload', {
    method: 'POST',
    headers: {
      'Authorization': token,
    },
    body: formData,
  })

  const resData = await response.json()
  let url: unknown = null
  if (resData.success) {
    url = resData.data?.url
  } else if (resData.code === 'image_repeated') {
    url = typeof resData.images === 'string' ? resData.images : resData.data?.url || resData.data
  } else {
    throw new Error(resData.message || 'Sm.ms upload failed')
  }
  if (typeof url !== 'string' || !url) {
    throw new Error('Sm.ms 返回的图片地址无效')
  }
  return url
}

/**
 * 阿里云 OSS 上传（动态加载 SDK）
 */
export async function uploadToOss(
  file: File,
  config: { region: string; accessKeyId: string; accessKeySecret: string; bucket: string }
): Promise<string> {
  const OSS = (await import('ali-oss')).default
  const client = new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
    secure: true,
  })
  const filename = generateImageFilename(file)
  const result = await client.put(filename, file)
  return result.url
}

/**
 * 腾讯云 COS 上传（动态加载 SDK）
 */
export async function uploadToCos(
  file: File,
  config: { SecretId: string; SecretKey: string; Bucket: string; Region: string }
): Promise<string> {
  const COS = (await import('cos-js-sdk-v5')).default
  const cos = new COS({
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
  })
  const filename = generateImageFilename(file)
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Body: file,
      },
      (err: any, data: any) => {
        if (err) {
          reject(err)
        } else {
          const url = data.Location.startsWith('http') ? data.Location : `https://${data.Location}`
          resolve(url)
        }
      }
    )
  })
}

/**
 * 辅助：将 Blob 转为 base64 Data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 异步编译 Markdown：将所有 img://img_xxx 本地占位符转换为 base64 内联 Data URL
 * 使用并行处理提升多图片场景下的编译速度
 */
export async function compileMarkdownImages(md: string): Promise<string> {
  const imgRegex = /(!\[[^\]]*\]\()(img:\/\/img_[a-zA-Z0-9_-]+)(\))/g
  const matches = Array.from(md.matchAll(imgRegex))
  if (matches.length === 0) return md

  // 并行处理所有图片查找和 base64 转换
  const replacements = await Promise.all(
    matches.map(async (match) => {
      const fullMatch = match[0]
      const prefix = match[1]
      const url = match[2]
      const suffix = match[3]
      const id = url.replace('img://', '')

      const blob = await getLocalImage(id)
      if (blob) {
        try {
          const base64 = await blobToBase64(blob)
          return { fullMatch, replacement: `${prefix}${base64}${suffix}` }
        } catch (e) {
          console.error(`Failed to compile image ${id} to base64:`, e)
          return null
        }
      }
      return null
    })
  )

  // 统一执行字符串替换
  let compiledMd = md
  for (const item of replacements) {
    if (item) {
      compiledMd = compiledMd.replace(item.fullMatch, item.replacement)
    }
  }
  return compiledMd
}

// ── 共享上传流程（压缩 → 按图床配置上传 → 返回 URL）───────────────────

// 生成唯一的图片文件名
function generateImageFilename(file: File): string {
  const ext = imageExtensionFromMime(file.type) || file.name.split('.').pop() || 'jpg'
  return `m2v-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
}

/**
 * 生成「密钥缺失」错误信息：若本地存在加密保险箱，提示用户去设置中解锁；否则提示去配置。
 * 密钥默认不落盘后，刷新页面会清空内存中的 AK/SK/token，需要重新解锁或填写。
 */
function missingSecretMessage(name: string): string {
  return hasVault()
    ? `${name}已加密保存，请先在「设置」中输入口令解锁后再上传`
    : `请先在「设置」中配置${name}`
}

/**
 * 压缩图片并按图床配置上传，返回可用于 Markdown 的 URL 字符串。
 * 供 CodeEditor（粘贴/拖拽）和 EditorToolbar（手动选择）共用。
 */
export async function uploadImageFile(
  file: File,
  config: ImageHostConfig,
): Promise<string> {
  const detectedMime = await validateImageFile(file)
  const compressed = await compressImage(file, 1600, 0.7, detectedMime)
  const uploadFile = createImageUploadFile(file, compressed)

  if (config.activeType === 'smms') {
    if (!config.smms?.token) throw new Error(missingSecretMessage('Sm.ms Token'))
    return uploadToSmMs(uploadFile, config.smms.token)
  }
  if (config.activeType === 'oss') {
    if (!config.oss?.accessKeyId || !config.oss?.accessKeySecret) {
      throw new Error(missingSecretMessage('OSS 密钥'))
    }
    return uploadToOss(uploadFile, config.oss)
  }
  if (config.activeType === 'cos') {
    if (!config.cos?.SecretId || !config.cos?.SecretKey) {
      throw new Error(missingSecretMessage('COS 密钥'))
    }
    return uploadToCos(uploadFile, config.cos)
  }

  // 默认本地 IndexedDB
  const id = `img_${Date.now()}`
  await saveLocalImage(id, compressed)
  await resolveImageUrl(id)
  return `img://${id}`
}
