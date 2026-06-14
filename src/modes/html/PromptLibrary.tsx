import { useMemo, useState } from 'react'
import {
  DESIGN_STYLES,
  OUTPUT_TYPES,
  VISUAL_TONES,
  type DesignStyle,
  type OutputType,
  type VisualTone,
} from '@/data/designPrompts'
import { StyleThumbnail } from './StyleThumbnail'
import { CustomInstructionEditor } from './CustomInstructionEditor'
import { useStore, type RenderMode, type CustomInstruction } from '@/lib/store'
import { UI_LABELS } from '@/lib/uiLabels'
import { buildArticleAiGuide, buildDocumentAiGuide, buildCardAiGuide } from '@/lib/aiGuide'
import { copyText } from '@/lib/clipboard'

interface PromptLibraryProps {
  mode: RenderMode
  open: boolean
  onClose: () => void
  onCopy: (style: DesignStyle) => void
  onToast?: (msg: string) => void
}

type TabKey = 'builtin' | 'custom'

const NON_HTML_BUILTIN_PROMPTS: Record<string, DesignStyle[]> = {
  article: [
    {
      id: 'article-default',
      name: '公众号长图文',
      category: '长图文',
      accent: '#07C160',
      description: '适合微信公众号、长图文发布，支持各种交互组件与优雅排版。',
      outputType: '长页',
      visualTone: '编辑',
      family: 'heiti',
      displayLevel: 'primary',
      style: buildArticleAiGuide(),
      previewHtml: '<div style="padding: 20px; font-family: sans-serif; font-size: 14px; color: #333; line-height: 1.6; max-width: 400px; margin: 0 auto; background: #f9f9f9; border-radius: 8px;"> <h1 style="font-size: 18px; margin-bottom: 12px; color: #000;">公众号长图文排版示例</h1> <p>这是一种极其优雅的图文排版模式，支持高亮、下划线、卡片以及复杂的步骤组件。非常适合用来做长图文输出。</p> </div>',
    }
  ],
  document: [
    {
      id: 'document-default',
      name: 'A4 打印文档',
      category: '文档',
      accent: '#2563eb',
      description: '适合 A4 打印、报告导出、正式文档交付，自动分页与页眉页脚。',
      outputType: '文档',
      visualTone: '极简',
      family: 'songti',
      displayLevel: 'primary',
      style: buildDocumentAiGuide(),
      previewHtml: '<div style="padding: 30px; font-family: serif; font-size: 13px; color: #000; line-height: 1.8; width: 300px; margin: 0 auto; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"> <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">正式研究报告</div> <p style="text-indent: 2em; text-align: justify;">这是一种适合严肃阅读、打印和归档的A4排版风格，支持题注自动居中、强制分页等正式排版特性。</p> </div>',
    }
  ],
  card: [
    {
      id: 'card-default',
      name: '小红书卡片',
      category: '卡片',
      accent: '#ff2442',
      description: '适合小红书等多图文卡片社交平台，一键生成封面与多张内容图。',
      outputType: '卡片',
      visualTone: '科技',
      family: 'sans-serif',
      displayLevel: 'primary',
      style: buildCardAiGuide('小红书', '3:4'),
      previewHtml: '<div style="padding: 20px; font-family: sans-serif; font-size: 14px; color: #333; line-height: 1.6; max-width: 250px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; height: 333px; border-bottom: 4px solid #ff2442;"> <h1 style="font-size: 20px; margin-bottom: 8px; color: #ff2442; text-align: center;">吸睛大标题</h1> <p style="text-align: center; color: #666;">直击痛点的短文案</p> </div>',
    }
  ]
}

export function PromptLibrary({ mode, open, onClose, onCopy, onToast }: PromptLibraryProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('builtin')
  const [outputType, setOutputType] = useState<OutputType>('幻灯片')
  const [visualTone, setVisualTone] = useState<VisualTone | '全部'>('全部')
  const [showBasic, setShowBasic] = useState(false)

  // Custom instruction states
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [cloneFromStyle, setCloneFromStyle] = useState<DesignStyle | null>(null)

  const customInstructions = useStore((s) => s.customInstructions)
  const removeCustomInstruction = useStore((s) => s.removeCustomInstruction)

  const filteredCustomInstructions = useMemo(() => {
    return customInstructions.filter(c => (c.mode || 'html') === mode)
  }, [customInstructions, mode])

  const filteredStyles = useMemo(() => {
    if (mode !== 'html') {
      return NON_HTML_BUILTIN_PROMPTS[mode] || []
    }
    return DESIGN_STYLES.filter((style) => {
      if (style.outputType !== outputType) return false
      if (visualTone !== '全部' && style.visualTone !== visualTone) return false
      if (!showBasic && style.displayLevel === 'basic') return false
      return true
    })
  }, [mode, outputType, visualTone, showBasic])

  const groupedStyles = useMemo(() => {
    const groups: Record<string, typeof DESIGN_STYLES> = {}
    filteredStyles.forEach((s) => {
      if (!groups[s.visualTone]) groups[s.visualTone] = []
      groups[s.visualTone].push(s)
    })

    return Object.entries(groups).sort((a, b) => {
      return VISUAL_TONES.indexOf(a[0] as VisualTone) - VISUAL_TONES.indexOf(b[0] as VisualTone)
    })
  }, [filteredStyles])

  const handleCopyCustom = async (inst: CustomInstruction) => {
    const success = await copyText(inst.content)
    if (success && onToast) {
      onToast('复制指令成功')
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[85vw] max-w-[1000px] flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <div className="text-lg font-bold text-slate-900">📚 风格指令库</div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500">
              <span className="rounded bg-blue-50 px-1.5 text-blue-700 font-semibold flex items-center gap-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>工作流</span>
              <span>1. 选一个喜欢的风格</span>
              <span className="text-slate-300">→</span>
              <span>2. 复制提示词发给 AI</span>
              <span className="text-slate-300">→</span>
              <span>3. 将生成的 HTML/Markdown 贴回系统渲染</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <div className="flex border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('builtin')}
            className={`flex-1 py-3 text-[14px] font-semibold transition-colors ${
              activeTab === 'builtin'
                ? 'border-b-2 border-[var(--accent)] text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {UI_LABELS.promptLibrary.builtinTab}
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-[14px] font-semibold transition-colors ${
              activeTab === 'custom'
                ? 'border-b-2 border-[var(--accent)] text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {UI_LABELS.promptLibrary.customTab} {filteredCustomInstructions.length > 0 && <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[11px]">{filteredCustomInstructions.length}</span>}
          </button>
        </div>

        {/* 内置风格 Tab */}
        {activeTab === 'builtin' && (
          <>
            {mode === 'html' && (
              <div className="border-b border-slate-200 bg-white px-6 py-4">
                <div className="mb-3 text-xs font-semibold text-slate-400">{UI_LABELS.promptLibrary.outputTypeLabel}</div>
                <div className="flex flex-wrap gap-2">
                  {OUTPUT_TYPES.map((item) => (
                    <button
                      key={item}
                      onClick={() => setOutputType(item)}
                      className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                        outputType === item
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mt-4 mb-3 text-xs font-semibold text-slate-400">{UI_LABELS.promptLibrary.visualToneLabel}</div>
                <div className="flex flex-wrap items-center gap-2">
                  {(['全部', ...VISUAL_TONES] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setVisualTone(item)}
                      className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                        visualTone === item
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                  <label className="ml-auto flex items-center gap-2 text-[13px] text-slate-500">
                    <input
                      type="checkbox"
                      checked={showBasic}
                      onChange={(event) => setShowBasic(event.target.checked)}
                    />
                    显示基础模板
                  </label>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="mx-auto space-y-10">
                {groupedStyles.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    当前组合下没有推荐风格，可以切换视觉气质，或勾选显示基础模板。
                  </div>
                ) : null}
                {groupedStyles.map(([groupName, styles]) => (
                  <section key={groupName}>
                    <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-base font-bold text-slate-800">
                      <span className="h-4 w-1 rounded-full bg-[var(--accent)]"></span>
                      {groupName}气质
                      <span className="text-[13px] font-normal text-slate-400">({styles.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                      {styles.map((s) => {
                        const subCategory = s.category.includes('/') ? s.category.split('/')[1] : '常规'
                        return (
                          <div
                            key={s.id}
                            className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                          >
                            <div className="mb-3">
                              <StyleThumbnail style={s} />
                            </div>
                            <div className="mb-2 flex items-center gap-2">
                              <span
                                className="h-3 w-3 shrink-0 rounded-full shadow-inner"
                                style={{ background: s.accent }}
                              />
                              <span className="font-semibold text-slate-900 truncate">{s.name}</span>
                              <span className="ml-auto shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                                {subCategory}
                              </span>
                            </div>
                            <p className="mb-4 flex-1 text-[13px] leading-relaxed text-slate-600">
                              {s.description}
                            </p>
                            <button
                              onClick={() => onCopy(s)}
                              className="accent-bg mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-semibold text-white opacity-90 transition-all hover:opacity-100 hover:shadow-md hover:ring-2 hover:ring-[var(--accent)] hover:ring-offset-2 active:scale-[0.98] active:opacity-80 shadow-sm"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              {UI_LABELS.promptLibrary.copyPrompt.label}
                            </button>
                            <button
                              onClick={() => {
                                setCloneFromStyle(s)
                                setEditingId(null)
                                setActiveTab('custom')
                                setShowEditor(true)
                              }}
                              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7V5a2 2 0 0 1 2-2h4.5l5.5 5.5v8a2 2 0 0 1-2 2h-2"/><path d="M16 18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6.5L16 11.5z"/></svg>
                              克隆为自定义
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 自定义指令 Tab */}
        {activeTab === 'custom' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
            {showEditor ? (
              <CustomInstructionEditor
                mode={mode}
                editingId={editingId}
                cloneFromStyle={cloneFromStyle}
                onClose={() => { setShowEditor(false); setEditingId(null); setCloneFromStyle(null) }}
                onToast={onToast || (() => {})}
              />
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-[13px] text-slate-500">
                    可保存自己常用的提示词配置（仅保存在本地），每个模块独立管理。
                  </p>
                  <button
                    onClick={() => { setEditingId(null); setCloneFromStyle(null); setShowEditor(true) }}
                    className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    + {UI_LABELS.promptLibrary.addCustom}
                  </button>
                </div>

                {filteredCustomInstructions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <p className="mb-4 text-sm">暂无自定义指令</p>
                    <button
                      onClick={() => { setEditingId(null); setCloneFromStyle(null); setShowEditor(true) }}
                      className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                    >
                      {UI_LABELS.promptLibrary.addCustom}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCustomInstructions.map((inst) => (
                      <div
                        key={inst.id}
                        className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                      >
                        <div className="mb-3">
                          <StyleThumbnail
                            style={{ ...inst, id: inst.id, category: `自定义/${inst.visualTone}`, displayLevel: 'primary', style: inst.content, family: 'custom' } as DesignStyle}
                          />
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-3 w-3 shrink-0 rounded-full shadow-inner" style={{ background: inst.accent }} />
                          <span className="font-semibold text-slate-900 truncate">{inst.name}</span>
                          <span className="ml-auto shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">自定义</span>
                        </div>
                        {inst.description && (
                          <p className="mb-4 flex-1 text-[13px] leading-relaxed text-slate-600">{inst.description}</p>
                        )}
                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => handleCopyCustom(inst)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2 text-[13px] font-semibold text-white opacity-90 hover:opacity-100 hover:shadow-md hover:ring-2 hover:ring-[var(--accent)] hover:ring-offset-2 active:scale-[0.98] transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            {UI_LABELS.promptLibrary.copyPrompt.label}
                          </button>
                          <button
                            onClick={() => { setEditingId(inst.id); setShowEditor(true) }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors"
                            title={UI_LABELS.common.edit}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button
                            onClick={() => removeCustomInstruction(inst.id)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                            title="删除"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
