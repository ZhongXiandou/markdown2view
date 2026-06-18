import type { ImageHostConfig } from '@/lib/store'
import { hasVault } from '@/lib/secureVault'

const DB_NAME = 'm2v-images-db'
const STORE_NAME = 'images'

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

/**
 * Canvas 图片压缩，JPEG 格式，quality 默认 0.7，最大宽度 1600
 */
export function compressImage(file: File, maxWidth = 1600, quality = 0.7): Promise<Blob> {
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
          'image/jpeg',
          quality
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
export const localImageUrls: Record<string, string> = {}

/**
 * 释放指定 id 对应的 Object URL 并从缓存中移除，避免 Blob 长期驻留内存。
 * 在删除本地图片或不再需要引用时调用。
 */
export function revokeImageUrl(id: string): void {
  const url = localImageUrls[id]
  if (url) {
    URL.revokeObjectURL(url)
    delete localImageUrls[id]
  }
}

/**
 * 将 img://id 转换为 base64 Data URL（兼容 srcdoc iframe 等跨域场景）
 */
export async function resolveImageUrl(id: string): Promise<string> {
  if (localImageUrls[id]) {
    return localImageUrls[id]
  }
  const blob = await getLocalImage(id)
  if (blob) {
    const dataUrl = await blobToBase64(blob)
    localImageUrls[id] = dataUrl
    return dataUrl
  }
  return ''
}

/**
 * 在解析 Markdown 前，预先并行加载文档中所有 img:// 图片到内存中
 */
export async function preloadImagesFromMarkdown(md: string): Promise<void> {
  const matches = Array.from(md.matchAll(/!\[[^\]]*\]\((img:\/\/img_[a-zA-Z0-9_-]+)\)/g))
  const promises = matches.map(async (match) => {
    const url = match[1]
    const id = url.replace('img://', '')
    if (!localImageUrls[id]) {
      await resolveImageUrl(id)
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
  if (resData.success) {
    return resData.data.url
  } else if (resData.code === 'image_repeated') {
    return resData.images || resData.data // 针对重复图片返回已有链接
  } else {
    throw new Error(resData.message || 'Sm.ms upload failed')
  }
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
  const ext = file.name.split('.').pop() || 'jpg'
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
  const compressed = await compressImage(file)
  const asUploadFile = (blob: Blob) => new File([blob], file.name, { type: blob.type })

  if (config.activeType === 'smms') {
    if (!config.smms?.token) throw new Error(missingSecretMessage('Sm.ms Token'))
    return uploadToSmMs(asUploadFile(compressed), config.smms.token)
  }
  if (config.activeType === 'oss') {
    if (!config.oss?.accessKeyId || !config.oss?.accessKeySecret) {
      throw new Error(missingSecretMessage('OSS 密钥'))
    }
    return uploadToOss(asUploadFile(compressed), config.oss)
  }
  if (config.activeType === 'cos') {
    if (!config.cos?.SecretId || !config.cos?.SecretKey) {
      throw new Error(missingSecretMessage('COS 密钥'))
    }
    return uploadToCos(asUploadFile(compressed), config.cos)
  }

  // 默认本地 IndexedDB
  const id = `img_${Date.now()}`
  await saveLocalImage(id, compressed)
  await resolveImageUrl(id)
  return `img://${id}`
}
