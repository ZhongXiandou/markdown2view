import { getLocalImage, blobToBase64, localImageUrls } from '@/lib/editor/imageStorage'

/** 复制纯文本（带降级方案） */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '0'
      ta.setAttribute('readonly', 'readonly')
      document.body.appendChild(ta)
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
        // 从内存 Map 中逆向查找 id
        const found = Object.entries(localImageUrls).find(([_, url]) => url === src)
        if (found) id = found[0]
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

/** 复制富文本：保留内联样式，并在后台自动编译本地图片为 base64 */
export async function copyRichText(contentEl: HTMLElement): Promise<boolean> {
  try {
    const compiledEl = await compileElementImages(contentEl)
    const html = `<section style="background-color:#fff;color:#333;padding:0">${compiledEl.innerHTML}</section>`
    const text = compiledEl.innerText

    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain;charset=utf-8' }),
    })
    await navigator.clipboard.write([item])
    return true
  } catch (err) {
    console.warn('ClipboardItem copy failed, fallback to execCommand:', err)
    // 降级：选区 + execCommand
    try {
      const compiledEl = await compileElementImages(contentEl)
      const html = `<section style="background-color:#fff;color:#333;padding:0">${compiledEl.innerHTML}</section>`
      const tmp = document.createElement('div')
      tmp.innerHTML = html
      tmp.style.position = 'fixed'
      tmp.style.left = '-9999px'
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
}

/** 复制 HTML 源码（将图片动态替换为 base64） */
export async function copyHtmlSource(contentEl: HTMLElement): Promise<boolean> {
  try {
    const compiledEl = await compileElementImages(contentEl)
    const html = compiledEl.innerHTML
    await navigator.clipboard.writeText(html)
    return true
  } catch {
    try {
      const compiledEl = await compileElementImages(contentEl)
      const html = compiledEl.innerHTML
      const ta = document.createElement('textarea')
      ta.value = html
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '0'
      ta.setAttribute('readonly', 'readonly')
      document.body.appendChild(ta)
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
}
