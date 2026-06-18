import { getLocalImage, blobToBase64, localImageUrls, uploadImageFile } from '@/lib/editor/imageStorage'
import type { ImageHostConfig } from '@/lib/store'
import { domToBlob } from 'modern-screenshot'

function createHiddenTextarea(text: string): HTMLTextAreaElement {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:none;outline:none;box-shadow:none;opacity:0;'
  ta.setAttribute('readonly', 'readonly')
  document.body.appendChild(ta)
  return ta
}

/** 复制纯文本（带降级方案） */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
  }
  const ta = createHiddenTextarea(text)
  try {
    ta.focus()
    ta.select()
    ta.setSelectionRange(0, ta.value.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(ta)
  }
}

// 构建反向索引：url -> id，用于 O(1) 查找。
// 惰性重建：通过比对 localImageUrls 的条目数检测增删变化，避免缓存过期。
const urlToIdCache = new Map<string, string>()
let cachedEntryCount = -1

function getUrlToIdMap(): Map<string, string> {
  const currentCount = Object.keys(localImageUrls).length
  if (currentCount !== cachedEntryCount) {
    urlToIdCache.clear()
    for (const [id, url] of Object.entries(localImageUrls)) {
      urlToIdCache.set(url, id)
    }
    cachedEntryCount = currentCount
  }
  return urlToIdCache
}

/**
 * 辅助方法：克隆 DOM 节点，并将其中的所有 blob: 或 img:// 占位符 URL 编译替换为 base64
 */
async function compileElementImages(contentEl: HTMLElement): Promise<HTMLElement> {
  const clone = contentEl.cloneNode(true) as HTMLElement
  const imgs = clone.querySelectorAll('img')
  for (const img of Array.from(imgs)) {
    const src = img.getAttribute('src') || ''
    if (src.startsWith('blob:') || src.startsWith('img://')) {
      let id = ''
      if (src.startsWith('img://')) {
        id = src.replace('img://', '')
      } else {
        // 从反向索引中 O(1) 查找 id
        id = getUrlToIdMap().get(src) || ''
      }

      if (id) {
        const blob = await getLocalImage(id)
        if (blob) {
          try {
            const base64 = await blobToBase64(blob)
            img.setAttribute('src', base64)
          } catch (e) {
            console.error(`Failed to compile image ${id} to base64 during copy:`, e)
          }
        }
      }
    }
  }
  return clone
}

/**
 * 将 DOM 元素中所有 mermaid SVG 图表转换为 <img> 标签。
 * - 已配置图床：截图 → 上传图床 → 使用公网 URL（公众号兼容）
 * - 未配置图床：保持 SVG 不动（由调用方在复制前弹窗提示用户）
 */
async function convertSvgsToPng(el: HTMLElement, imageHostConfig?: ImageHostConfig): Promise<HTMLElement> {
  const figures = el.querySelectorAll<HTMLElement>('.m2v-mermaid-figure')
  for (const fig of Array.from(figures)) {
    const section = fig.closest('section[data-block="mermaid"]')
    if (!section) continue

    // 已配置图床：截图 → 上传 → 替换为 <img src="公网URL">
    if (imageHostConfig && imageHostConfig.activeType !== 'local') {
      try {
        const blob = await domToBlob(fig, {
          scale: 2,
          type: 'image/png',
          backgroundColor: '#ffffff',
        })
        if (!blob) continue
        const file = new File([blob], 'mermaid.png', { type: 'image/png' })
        const url = await uploadImageFile(file, imageHostConfig)
        section.innerHTML = `<img src="${url}" style="max-width:100%;height:auto;display:block;margin:0 auto;">`
      } catch (e) {
        console.error('[m2v] 上传 mermaid 图表到图床失败:', e)
        // 上传失败则保持 SVG 不动
      }
    }
    // 未配置图床：保持 SVG 不动
  }
  return el
}

/** 复制富文本：保留内联样式，并在后台自动编译本地图片为 base64 */
export async function copyRichText(contentEl: HTMLElement, fontFamily?: string, imageHostConfig?: ImageHostConfig): Promise<boolean> {
  const compiledEl = await compileElementImages(contentEl)
  await convertSvgsToPng(compiledEl, imageHostConfig)
  const fontCss = fontFamily ? `;font-family:${fontFamily}` : ''
  const html = `<section style="background-color:#fff;color:#333;padding:0${fontCss}">${compiledEl.innerHTML}</section>`
  const text = compiledEl.innerText

  try {
    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain;charset=utf-8' }),
    })
    await navigator.clipboard.write([item])
    return true
  } catch {
  }
  try {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    tmp.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;overflow:hidden;'
    document.body.appendChild(tmp)
    const range = document.createRange()
    range.selectNodeContents(tmp)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    const ok = document.execCommand('copy')
    sel?.removeAllRanges()
    document.body.removeChild(tmp)
    return ok
  } catch {
    return false
  }
}

/** 复制 HTML 源码（将图片动态替换为 base64） */
export async function copyHtmlSource(contentEl: HTMLElement, imageHostConfig?: ImageHostConfig): Promise<boolean> {
  const compiledEl = await compileElementImages(contentEl)
  await convertSvgsToPng(compiledEl, imageHostConfig)
  const html = compiledEl.innerHTML
  try {
    await navigator.clipboard.writeText(html)
    return true
  } catch {
  }
  try {
    const ta = createHiddenTextarea(html)
    ta.focus()
    ta.select()
    ta.setSelectionRange(0, ta.value.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
