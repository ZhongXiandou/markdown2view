import { downloadBlob, sanitizeFilename } from '../exportImage'

export interface ZipEntry {
  filename: string
  blob: Blob
}

/**
 * 将多个文件打包为 ZIP 并触发下载（利用 fflate 异步 Web-Worker API 实现非阻塞压缩）。
 */
export async function downloadAsZip(entries: ZipEntry[], zipName = 'export.zip'): Promise<void> {
  const safeZipName = sanitizeFilename(zipName)
  try {
    const { zip } = await import('fflate')

    // 6.7: 以"最终生成名"为 key 校验重名，避免 a.png → a-1.png 与已有 a-1.png 冲突
    const usedNames = new Set<string>()
    const getUniqueFilename = (original: string): string => {
      // M5: 先净化路径穿越/特殊字符
      const safe = sanitizeFilename(original)
      if (!usedNames.has(safe)) {
        usedNames.add(safe)
        return safe
      }

      const lastDotIndex = safe.lastIndexOf('.')
      const name = lastDotIndex === -1 ? safe : safe.slice(0, lastDotIndex)
      const ext = lastDotIndex === -1 ? '' : safe.slice(lastDotIndex)

      // 循环递增直到找到未占用的名字
      let count = 1
      let candidate = `${name}-${count}${ext}`
      while (usedNames.has(candidate)) {
        count++
        candidate = `${name}-${count}${ext}`
      }
      usedNames.add(candidate)
      return candidate
    }

    const zipData: Record<string, Uint8Array> = {}

    // 并发异步将所有 Blob 转换为 ArrayBuffer，防止在主线程中依次转换导致界面微卡顿
    await Promise.all(
      entries.map(async (entry) => {
        const uniqueFilename = getUniqueFilename(entry.filename)
        const buffer = await entry.blob.arrayBuffer()
        zipData[uniqueFilename] = new Uint8Array(buffer)
      })
    )

    return new Promise<void>((resolve, reject) => {
      // 使用 fflate 的异步 zip 接口，它能自动开启后台 Web Worker 进行压缩工作，完全释放主线程
      zip(zipData, (err, zipped) => {
        if (err) {
          reject(err)
        } else {
          const zipBlob = new Blob([zipped], { type: 'application/zip' })
          downloadBlob(zipBlob, safeZipName)
          resolve()
        }
      })
    })
  } catch (err) {
    // 异常时优雅回退到依次触发单文件下载的方案
    console.error('Failed to create ZIP in worker, falling back to sequential download', err)
    for (let i = 0; i < entries.length; i++) {
      try {
        downloadBlob(entries[i].blob, sanitizeFilename(entries[i].filename))
      } catch (e) {
        console.error(`Failed to download ${entries[i].filename}`, e)
      }
      if (i < entries.length - 1) {
        await new Promise(r => setTimeout(r, 300))
      }
    }
  }
}
