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
import { buildArticleAiGuide, buildDocumentAiGuide, buildCardAiGuide, buildGovDocAiGuide, buildTechDocAiGuide, type DocCoverMetadata, type GovDocMetadata } from '@/lib/aiGuide'
import { copyText } from '@/lib/clipboard'
import { Book } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

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
      name: '正式文档',
      category: '文档',
      accent: '#2563eb',
      description: '适合 A4 打印、报告导出、正式文档交付，自动分页与页眉页脚。',
      outputType: '文档',
      visualTone: '极简',
      family: 'songti',
      displayLevel: 'primary',
      style: buildDocumentAiGuide(),
      previewHtml: '<div style="padding: 30px; font-family: serif; font-size: 13px; color: #000; line-height: 1.8; width: 300px; margin: 0 auto; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"> <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">正式研究报告</div> <p style="text-indent: 2em; text-align: justify;">这是一种适合严肃阅读、打印和归档的A4排版风格，支持题注自动居中、强制分页等正式排版特性。</p> </div>',
    },
    {
      id: 'document-tech',
      name: '极简报告',
      category: '文档',
      accent: '#0891b2',
      description: '适合 PRD、技术方案、设计文档，支持封面元数据（文档编号、版本号、审核者等）。',
      outputType: '文档',
      visualTone: '极简',
      family: 'songti',
      displayLevel: 'primary',
      style: buildTechDocAiGuide(),
      previewHtml: '<div style="padding: 20px; font-family: sans-serif; font-size: 12px; color: #1e293b; line-height: 1.6; width: 280px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px;"> <div style="display: flex; justify-content: space-between; margin-bottom: 10px;"> <span style="font-weight: bold;">PRD-2026</span> <span style="background: rgba(8,145,178,0.12); color: #0891b2; padding: 2px 6px; border-radius: 3px; font-size: 10px;">DRAFT</span> </div> <div style="font-size: 15px; font-weight: bold; margin-bottom: 8px;">技术方案文档</div> <div style="font-size: 10px; color: #64748b;">版本 V1.0 | 编写: 张三 | 审核: 李四</div> </div>',
    },
    {
      id: 'document-gov',
      name: '严肃公文',
      category: '文档',
      accent: '#c0202c',
      description: '符合 GB/T 9704-2012 标准的党政机关公文，红头文件、发文字号、密级标注。',
      outputType: '文档',
      visualTone: '极简',
      family: 'fangsong',
      displayLevel: 'primary',
      style: buildGovDocAiGuide(),
      previewHtml: '<div style="padding: 18px; font-family: FangSong, serif; font-size: 11px; color: #000; line-height: 1.8; width: 280px; margin: 0 auto; background: #fff;"> <div style="text-align: center; font-size: 18px; font-weight: bold; color: #c0202c; font-family: SimSun, serif; margin-bottom: 4px;">XX市人民政府办公厅</div> <div style="text-align: center; font-size: 10px; margin-bottom: 4px;">市政发〔2026〕第1号</div> <div style="height: 2px; background: #c0202c; margin-bottom: 10px;"></div> <div style="text-align: center; font-size: 13px; font-weight: bold; margin-bottom: 8px;">关于推进数字经济发展的通知</div> <div style="text-indent: 2em; text-align: justify;">各区人民政府，市政府各委、办、局：为深入贯彻数字经济发展战略...</div> </div>',
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
      style: buildCardAiGuide('3:4'),
      previewHtml: '<div style="padding: 20px; font-family: sans-serif; font-size: 14px; color: #333; line-height: 1.6; max-width: 250px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; height: 333px; border-bottom: 4px solid #ff2442;"> <h1 style="font-size: 20px; margin-bottom: 8px; color: #ff2442; text-align: center;">吸睛大标题</h1> <p style="text-align: center; color: #666;">直击痛点的短文案</p> </div>',
    }
  ]
}

type MetaFieldType = 'text' | 'date' | 'select'

interface MetaFieldDef {
  key: string
  label: string
  type: MetaFieldType
  placeholder?: string
  options?: string[]
}

/** 正式文档/技术文档封面元数据字段定义 */
const DOC_COVER_FIELDS: MetaFieldDef[] = [
  { key: 'docNo', label: '文档编号', type: 'text', placeholder: '如 PRD-2026-001' },
  { key: 'version', label: '版本号', type: 'text', placeholder: '如 V1.0' },
  { key: 'author', label: '编写者', type: 'text', placeholder: '编写人姓名' },
  { key: 'authorDate', label: '编写日期', type: 'date' },
  { key: 'reviewer', label: '审核者', type: 'text', placeholder: '审核人姓名' },
  { key: 'reviewDate', label: '审核日期', type: 'date' },
  { key: 'status', label: '文档状态', type: 'select', options: ['', '草稿', '评审中', '已发布', '已归档'] },
  { key: 'classification', label: '机密等级', type: 'select', options: ['', '绝密', '机密', '内部公开', '授权公开', '公开'] },
]

/** 公文元数据字段定义 */
const GOV_DOC_FIELDS: MetaFieldDef[] = [
  { key: 'issuer', label: '发文机关', type: 'text', placeholder: 'XX市人民政府办公厅' },
  { key: 'docNo', label: '发文字号', type: 'text', placeholder: '如 市政发〔2026〕第1号' },
  { key: 'classification', label: '密级', type: 'select', options: ['', '绝密', '机密', '秘密'] },
  { key: 'urgency', label: '紧急程度', type: 'select', options: ['', '特急', '加急'] },
  { key: 'signer', label: '签发人', type: 'text', placeholder: '签发人姓名（上行文）' },
  { key: 'recipient', label: '主送机关', type: 'text', placeholder: '如 各区人民政府，市政府各委、办、局' },
  { key: 'publishDate', label: '成文日期', type: 'date' },
]

export function PromptLibrary({ mode, open, onClose, onCopy, onToast }: PromptLibraryProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('builtin')
  const [outputType, setOutputType] = useState<OutputType>('幻灯片')
  const [visualTone, setVisualTone] = useState<VisualTone | '全部'>('全部')
  const [showBasic, setShowBasic] = useState(false)

  // Custom instruction states
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [cloneFromStyle, setCloneFromStyle] = useState<DesignStyle | null>(null)

  // 文档模式：封面元数据与公文元数据
  const [docCoverMeta, setDocCoverMeta] = useState<DocCoverMetadata>({ enabled: true })
  const [govDocMeta, setGovDocMeta] = useState<GovDocMetadata>({})
  const [showDocMetaPanel, setShowDocMetaPanel] = useState(false)
  const [docMetaSubTab, setDocMetaSubTab] = useState<'cover' | 'gov'>('cover')

  // 计算已填写的封面元数据字段数 (排除 enabled 属性)
  const filledCoverFieldsCount = useMemo(() => {
    return Object.entries(docCoverMeta).filter(([key, val]) => key !== 'enabled' && Boolean(val)).length
  }, [docCoverMeta])

  // 计算已填写的公文元数据字段数
  const filledGovFieldsCount = useMemo(() => {
    return Object.entries(govDocMeta).filter(([, val]) => Boolean(val)).length
  }, [govDocMeta])

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

  /** 根据当前元数据配置，重新生成文档模式的指令文本 */
  const getCustomizedStyle = (style: DesignStyle): DesignStyle => {
    if (mode !== 'document') return style
    if (style.id === 'document-default') {
      return { ...style, style: buildDocumentAiGuide(docCoverMeta) }
    }
    if (style.id === 'document-tech') {
      return { ...style, style: buildTechDocAiGuide(docCoverMeta) }
    }
    if (style.id === 'document-gov') {
      return { ...style, style: buildGovDocAiGuide(govDocMeta) }
    }
    return style
  }

  const handleDocCoverFieldChange = (key: string, value: string) => {
    setDocCoverMeta((prev) => ({ ...prev, [key]: value }))
  }

  const handleGovDocFieldChange = (key: string, value: string) => {
    setGovDocMeta((prev) => ({ ...prev, [key]: value }))
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
            <div className="flex items-center gap-2 text-lg font-bold text-slate-900"><Book size={18} /> 风格指令库</div>
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

            {/* 文档模式：封面元数据与公文元数据配置面板 */}
            {mode === 'document' && (
              <div className="border-b border-slate-200 bg-white px-6 py-4">
                <button
                  onClick={() => setShowDocMetaPanel(!showDocMetaPanel)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-1 rounded-full bg-[var(--accent)]" />
                      <span className="text-sm font-semibold text-slate-800">封面与元数据选项</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        docCoverMeta.enabled !== false 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        📄 正式封面: {docCoverMeta.enabled !== false ? '启用' : '禁用'}
                        {filledCoverFieldsCount > 0 && ` (已填${filledCoverFieldsCount}项)`}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        filledGovFieldsCount > 0 
                          ? 'bg-red-50 text-red-700 border border-red-100' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        🏛️ 严肃公文: {filledGovFieldsCount > 0 ? `已填${filledGovFieldsCount}项` : '无元数据'}
                      </span>
                    </div>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-slate-400 transition-transform ${showDocMetaPanel ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showDocMetaPanel && (
                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                    {/* 子 Tab 头部 */}
                    <div className="flex border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => setDocMetaSubTab('cover')}
                        className={`pb-2 text-[13px] font-semibold transition-colors relative mr-6 ${
                          docMetaSubTab === 'cover'
                            ? 'text-[var(--accent)]'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        📄 封面元数据
                        {filledCoverFieldsCount > 0 && (
                          <span className="ml-1 rounded bg-blue-50 px-1 text-[10px] text-blue-700 border border-blue-100 font-bold">
                            {filledCoverFieldsCount}
                          </span>
                        )}
                        {docMetaSubTab === 'cover' && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocMetaSubTab('gov')}
                        className={`pb-2 text-[13px] font-semibold transition-colors relative ${
                          docMetaSubTab === 'gov'
                            ? 'text-[var(--accent)]'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        🏛️ 公文元数据
                        {filledGovFieldsCount > 0 && (
                          <span className="ml-1 rounded bg-red-50 px-1 text-[10px] text-red-700 border border-red-100 font-bold">
                            {filledGovFieldsCount}
                          </span>
                        )}
                        {docMetaSubTab === 'gov' && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
                        )}
                      </button>
                    </div>

                    {/* 子 Tab 内容 */}
                    <div className="transition-all duration-200">
                      {docMetaSubTab === 'cover' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-400">
                              适用于「正式文档」「极简报告」，控制是否生成独立封面页
                            </span>
                            <label className="flex items-center gap-1.5 text-[12px] text-slate-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={docCoverMeta.enabled !== false}
                                onChange={(e) => setDocCoverMeta((prev) => ({ ...prev, enabled: e.target.checked }))}
                                className="rounded border-slate-300 accent-[var(--accent)] cursor-pointer"
                              />
                              生成封面页
                            </label>
                          </div>
                          {docCoverMeta.enabled !== false ? (
                            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                              {DOC_COVER_FIELDS.map((field) => (
                                <MetaFieldInput
                                  key={field.key}
                                  field={field}
                                  value={(docCoverMeta as Record<string, unknown>)[field.key] as string ?? ''}
                                  onChange={(v) => handleDocCoverFieldChange(field.key, v)}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-lg bg-slate-50 p-3 text-center border border-dashed border-slate-200">
                              <p className="text-xs text-slate-500 italic">已关闭封面页生成，指令将告知 AI 直接从正文开始。</p>
                            </div>
                          )}
                        </div>
                      )}

                      {docMetaSubTab === 'gov' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-400">
                              适用于「严肃公文」，红头文件专用的发文机关、字号、密级等属性
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                            {GOV_DOC_FIELDS.map((field) => (
                              <MetaFieldInput
                                key={field.key}
                                field={field}
                                value={(govDocMeta as Record<string, unknown>)[field.key] as string ?? ''}
                                onChange={(v) => handleGovDocFieldChange(field.key, v)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                            {mode === 'document' && (
                              <div className="mt-2 mb-3 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 border border-slate-100 flex flex-col gap-0.5">
                                {s.id === 'document-gov' ? (
                                  <>
                                    <div className="flex items-center gap-1 font-semibold text-red-700">
                                      <span>🏛️ 关联：公文元数据</span>
                                      <span className="ml-auto rounded bg-red-50 border border-red-100 px-1 text-[9px] font-bold text-red-700">
                                        {filledGovFieldsCount > 0 ? `已填 ${filledGovFieldsCount} 项` : '未填写'}
                                      </span>
                                    </div>
                                    <span className="text-slate-400">复制后将生成红头属性：&lt;gov-header&gt;</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-1 font-semibold text-blue-700">
                                      <span>📄 关联：封面元数据</span>
                                      <span className="ml-auto rounded bg-blue-50 border border-blue-100 px-1 text-[9px] font-bold text-blue-700">
                                        {docCoverMeta.enabled !== false ? `已启用 (${filledCoverFieldsCount}项)` : '未启用'}
                                      </span>
                                    </div>
                                    <span className="text-slate-400">复制后将生成封面表格与分页</span>
                                  </>
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => onCopy(getCustomizedStyle(s))}
                              className="accent-bg mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-semibold text-white opacity-90 transition-all hover:opacity-100 hover:shadow-md hover:ring-2 hover:ring-[var(--accent)] hover:ring-offset-2 active:scale-[0.98] active:opacity-80 shadow-sm"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              {UI_LABELS.promptLibrary.copyPrompt.label}
                            </button>
                            <button
                              onClick={() => {
                                setCloneFromStyle(getCustomizedStyle(s))
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

function MetaFieldInput({ field, value, onChange }: { field: MetaFieldDef; value: string; onChange: (v: string) => void }) {
  const baseClass = 'w-full h-8 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] text-slate-700 outline-none transition-colors focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30'

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-600">{field.label}</span>
      {field.type === 'select' ? (
        <Select value={value} onChange={(e) => onChange(e.target.value)} className={baseClass}>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt || '（不填）'}</option>
          ))}
        </Select>
      ) : field.type === 'date' ? (
        <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={baseClass} />
      ) : (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )}
    </label>
  )
}
