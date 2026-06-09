import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useScrollSync } from '@/lib/useScrollSync'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { copyText } from '@/lib/clipboard'
import { buildCardAiGuide } from '@/lib/aiGuide'
import { downloadBlob, elementToBlob } from '@/lib/exportImage'
import { downloadAsZip, type ZipEntry } from '@/lib/export/zipDownload'
import { parseMarkdown, type ThemeColors } from '@engine'
import {
  ASPECTS,
  XHS,
  buildContentCard,
  buildCover,
  type XhsAspect,
} from '@/engine/utils/xhsCards'
import { createCardModel, type CardPlatform } from './cardModel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useStore } from '@/lib/store'
import { getFontFamilyCss, type FontFamilyOption } from '@/lib/fonts'

interface CardModeProps {
  markdown: string
  setMarkdown: (markdown: string) => void
  colors: ThemeColors
  platform: CardPlatform
  setPlatform: (platform: CardPlatform) => void
  onToast: (message: string) => void
}

interface PreviewCard {
  id: string
  label: string
  kind: 'cover' | 'content'
  html: string
}

function fileSafe(name: string) {
  return (name || 'card').replace(/[\\/:*?"<>|]/g, '_').slice(0, 40)
}

export function CardMode({
  markdown,
  setMarkdown,
  colors,
  platform,
  setPlatform,
  onToast,
}: CardModeProps) {
  const [aspect, setAspect] = useState<XhsAspect>('3:4')
  const [exporting, setExporting] = useState(false)
  const cardFont = useStore((s) => s.cardFont)
  const setCardFont = useStore((s) => s.setCardFont)
  const [authorName, setAuthorName] = useState('Pintley Tasia')
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})

  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(0)

  const [actualHeights, setActualHeights] = useState<Record<string, number>>({})
  const measuringRef = useRef<HTMLDivElement>(null)

  useScrollSync(editorScrollerRef, previewScrollRef, [editorReady])

  const size = ASPECTS[aspect]
  // 给四周留出均匀的呼吸感：卡片总高 - 页脚高度(44) - 顶部留白(32) - 底部留白(24)
  const pixelBudget = size.h - 44 - 32 - 24

  const model = useMemo(
    () => createCardModel(markdown, aspect, platform, Object.keys(actualHeights).length ? actualHeights : undefined, pixelBudget),
    [markdown, aspect, platform, actualHeights, pixelBudget],
  )

  useLayoutEffect(() => {
    if (!measuringRef.current) return
    const newHeights: Record<string, number> = {}
    let changed = false
    const elements = measuringRef.current.children
    
    let lastBottom = 0
    let isFirst = true

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement
      const id = el.getAttribute('data-block-id')
      if (id) {
        if (isFirst) {
          lastBottom = el.offsetTop
          isFirst = false
        }
        
        const bottom = el.offsetTop + el.offsetHeight
        const h = bottom - lastBottom
        lastBottom = bottom

        if (actualHeights[id] !== h) {
          changed = true
        }
        newHeights[id] = h
      }
    }
    if (changed) {
      setActualHeights(newHeights)
    }
  }, [model.rawBlocks, aspect, colors])

  const finalBrand = authorName || model.meta.brand

  const cards = useMemo<PreviewCard[]>(() => {
    const total = Math.max(1, model.pages.length)
    return [
      {
        id: 'cover',
        label: '封面图',
        kind: 'cover',
        html: buildCover({ ...model.meta, brand: finalBrand }, aspect, colors, getFontFamilyCss(cardFont)),
      },
      ...model.pages.map((page, index) => ({
        id: page.id,
        label: `内容图 ${index + 1}`,
        kind: 'content' as const,
        html: buildContentCard(
          parseMarkdown(page.markdown, colors),
          aspect,
          index + 1,
          total,
          finalBrand,
          colors,
          getFontFamilyCss(cardFont)
        ),
      })),
    ]
  }, [model, aspect, colors, cardFont])

  const exportOne = async (card: PreviewCard, index: number) => {
    const node = cardRefs.current[card.id]
    if (!node) {
      onToast('卡片尚未渲染完成')
      return
    }

    setExporting(true)
    try {
      const blob = await elementToBlob(node, {
        scale: 3,
        backgroundColor: card.kind === 'cover' ? XHS.bg : '#ffffff',
      })
      const prefix = 'card'
      downloadBlob(blob, `${prefix}-${String(index + 1).padStart(2, '0')}-${fileSafe(model.meta.title)}.png`)
      onToast(`已导出 ${card.label}`)
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }

  const exportAll = async () => {
    setExporting(true)
    try {
      for (let i = 0; i < cards.length; i += 1) {
        const node = cardRefs.current[cards[i].id]
        if (!node) throw new Error(`${cards[i].label} 尚未渲染完成`)
        const blob = await elementToBlob(node, {
          scale: 3,
          backgroundColor: cards[i].kind === 'cover' ? XHS.bg : '#ffffff',
        })
        const prefix = 'card'
        downloadBlob(blob, `${prefix}-${String(i + 1).padStart(2, '0')}-${fileSafe(model.meta.title)}.png`)
      }
      onToast(`已导出 ${cards.length} 张图片`)
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }

  const exportZip = async () => {
    setExporting(true)
    try {
      const entries: ZipEntry[] = []
      for (let i = 0; i < cards.length; i++) {
        const node = cardRefs.current[cards[i].id]
        if (!node) throw new Error(`${cards[i].label} 尚未渲染完成`)
        const blob = await elementToBlob(node, {
          scale: 3,
          backgroundColor: cards[i].kind === 'cover' ? XHS.bg : '#ffffff',
        })
        entries.push({
          filename: `card-${String(i + 1).padStart(2, '0')}-${fileSafe(model.meta.title)}.png`,
          blob,
        })
      }
      const zipName = `${fileSafe(model.meta.title) || 'cards'}.zip`
      await downloadAsZip(entries, zipName)
      onToast(`已打包 ${entries.length} 张图片`)
    } catch (e) {
      onToast(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }

  const copyCaption = async () => {
    const ok = await copyText(model.caption)
    onToast(ok ? '已复制发布文案' : '复制失败，请重试')
  }

  const copyGuide = async () => {
    const ok = await copyText(buildCardAiGuide(platform, aspect))
    onToast(ok ? '已复制图文卡片 AI 指令' : '复制失败，请重试')
  }

  return (
    <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(620px,1.1fr)] gap-px bg-gray-200">
      <section className="min-h-0 overflow-hidden bg-white">
        <CodeEditor
          value={markdown}
          onChange={setMarkdown}
          onScrollerReady={(el) => {
            editorScrollerRef.current = el
            setEditorReady((n) => n + 1)
          }}
        />
      </section>

      <section ref={previewScrollRef} className="min-h-0 overflow-y-auto bg-slate-100">
        <div className="sticky top-0 z-10 flex items-center justify-end border-b border-slate-200 bg-white/95 px-5 py-2.5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-1.5 text-[12px] text-slate-500">
              作者名
              <Input
                value={authorName}
                placeholder={model.meta.brand}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-24"
              />
            </label>
            <Select
              value={aspect}
              onChange={(e) => setAspect(e.target.value as XhsAspect)}
            >
              <option value="3:4">3:4比例</option>
              <option value="9:16">9:16比例</option>
            </Select>
            <Select
              value={cardFont}
              onChange={(e) => setCardFont(e.target.value as FontFamilyOption)}
            >
              <option value="songti">宋体</option>
              <option value="fangsong">仿宋</option>
              <option value="heiti">黑体</option>
              <option value="lxgwwenkai">霞鹜文楷</option>
            </Select>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <Button onClick={copyCaption} title="复制生成的小红书文案" disabled={!model.caption}>
              📋 复制文案
            </Button>
            <Button onClick={copyGuide} title="复制 AI 指令">
              ✨ 指令
            </Button>
            <Button onClick={exportAll} title="逐张下载所有生成的图片" disabled={exporting || !cards.length}>
              🖼️ 下载单图
            </Button>
            <Button variant="primary" onClick={exportZip} title="将所有图片打包为一个 ZIP 文件下载" disabled={exporting || !cards.length}>
              {exporting ? '打包中…' : '📦 打包下载'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          <aside className="group relative mx-auto w-full max-w-[480px] rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-400">发布文案</div>
              <button
                onClick={copyCaption}
                disabled={!model.caption}
                className="text-xs font-medium text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0"
              >
                复制
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {model.caption || '从 frontmatter 或 <title> 中补充 title / summary / chips 后，这里会生成可复制文案。'}
            </pre>
          </aside>

          <div className="flex flex-col items-center gap-6 pb-12">
            {/* 隐藏测量容器 */}
            <div
              ref={measuringRef}
              className="social-card-render"
              style={{
                position: 'absolute',
                visibility: 'hidden',
                top: -9999,
                width: size.w,
                boxSizing: 'border-box',
                padding: '32px 30px 0',
                fontSize: 15,
                lineHeight: 1.8,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                fontFamily: getFontFamilyCss(cardFont),
              }}
            >
              {model.rawBlocks?.map((block, i) => (
                <section
                  key={`block-${i}`}
                  data-block-id={`block-${i}`}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(block, colors) }}
                />
              ))}
            </div>

            {cards.map((card, index) => (
              <div
                key={card.id}
                className="group relative shadow-md transition-shadow hover:shadow-lg"
                style={{ width: size.w, height: size.h }}
              >
                <div
                  ref={(el) => {
                    cardRefs.current[card.id] = el
                  }}
                  className="h-full w-full overflow-hidden rounded-md bg-white"
                  dangerouslySetInnerHTML={{ __html: card.html }}
                />
                
                {/* 悬浮下载按钮 */}
                <button
                  onClick={() => exportOne(card, index)}
                  disabled={exporting}
                  className="absolute -right-3 -bottom-3 flex h-8 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 opacity-0 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 group-hover:opacity-100 disabled:opacity-0"
                  title={`下载${card.label}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  下载
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
