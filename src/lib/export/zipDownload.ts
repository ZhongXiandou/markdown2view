import { downloadBlob } from '../exportImage'

export interface ZipEntry {
  filename: string
  blob: Blob
}

/**
 * 将多个文件打包为 ZIP 并触发下载（利用 fflate 异步 Web-Worker API 实现非阻塞压缩）。
 */
export async function downloadAsZip(entries: ZipEntry[], zipName = 'export.zip'): Promise<void> {
  try {
    const { zip } = await import('fflate')

    // 检测重名文件并自动追加序号
    const filenameMap = new Map<string, number>()
    const getUniqueFilename = (original: string): string => {
      if (!filenameMap.has(original)) {
        filenameMap.set(original, 0)
        return original
      }
      const count = filenameMap.get(original)! + 1
      filenameMap.set(original, count)

      // 在扩展名前插入序号：card-01.png → card-01-1.png
      const lastDotIndex = original.lastIndexOf('.')
      if (lastDotIndex === -1) {
        return `${original}-${count}`
      }
      const name = original.slice(0, lastDotIndex)
      const ext = original.slice(lastDotIndex)
      return `${name}-${count}${ext}`
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
          downloadBlob(zipBlob, zipName)
          resolve()
        }
      })
    })
  } catch (err) {
    // 异常时优雅回退到依次触发单文件下载的方案
    console.error('Failed to create ZIP in worker, falling back to sequential download', err)
    for (let i = 0; i < entries.length; i++) {
      try {
        downloadBlob(entries[i].blob, entries[i].filename)
      } catch (e) {
        console.error(`Failed to download ${entries[i].filename}`, e)
      }
      if (i < entries.length - 1) {
        await new Promise(r => setTimeout(r, 300))
      }
    }
  }
}
