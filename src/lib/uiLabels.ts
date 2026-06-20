/**
 * 集中管理项目中的 UI 文案常量：按钮标签、tooltip 文本、Toast 提示模板等。
 * 各模块统一引用此文件，避免散落的硬编码字符串。
 */

export const UI_LABELS = {
  /** 全局功能区/工具栏通用文案 */
  toolbar: {
    promptLibrary: { label: '指令库', tooltip: '打开专属指令库，选择并复制 AI 提示词' },
    copyHtml: { label: 'HTML源码', tooltip: '复制带内联样式的 HTML 源码' },
    copyRichText: { label: '复制富文本', tooltip: '复制富文本，可直接粘贴到微信等编辑器，排版不丢失' },
    exportLongImage: { label: '导出长图', tooltip: '将预览内容导出为长图 PNG' },
    exportPdf: { label: '导出 PDF', tooltip: '高保真导出 PDF，视觉完全一致' },
    exportPptx: { label: '导出全图 PPT', tooltip: '高保真导出 PPT，每页为完整图片，视觉完全一致' },
    exportPptxEditable: { label: '导出可编辑 PPT', tooltip: '实验性功能：导出为可编辑文本框，字体、复杂样式（渐变、毛玻璃、动画等）可能会丢失，适合二次编辑草稿' },
    exportPng: { label: '导出 PNG', tooltip: '将预览内容导出为 PNG 图片' },
    exportCurrentPage: { label: '导出当前页', tooltip: '将当前页面导出为 PNG 图片' },
    exportZip: { label: '打包 ZIP', tooltip: '将所有页面打包为 ZIP 文件下载' },
    exportSource: { label: '导出源码', tooltip: '导出底层 HTML 源码为 .html 文件' },
    fullscreen: { label: '全屏播放', tooltip: '全屏沉浸查看展示区内容' },
    refresh: { label: '刷新', tooltip: '重新渲染预览区内容' },
    uploadImage: { label: '上传图片', tooltip: '上传图片到图床并复制链接，可发送给 AI 使用' },
    allowScripts: { label: '互动脚本', tooltip: '允许预览区执行 JavaScript 交互脚本' },
  },

  /** 指令库面板 */
  promptLibrary: {
    title: '风格指令库',
    workflowStep1: '选一个喜欢的风格',
    workflowStep2: '复制提示词发给 AI',
    workflowStep3: '将生成的 HTML 贴回系统渲染',
    copyPrompt: { label: '复制提示词', tooltip: '复制完整设计指令到剪贴板' },
    builtinTab: '内置风格',
    customTab: '我的指令',
    addCustom: '新增自定义指令',
    outputTypeLabel: '先选输出类型',
    visualToneLabel: '再选视觉气质',
    showBasic: '显示基础模板',
    recommendAI: '推荐使用 Claude / ChatGPT / Gemini 生成 HTML',
  },

  /** 图片上传 */
  imageUpload: {
    successToast: (hostType: string) =>
      hostType === 'local'
        ? '图片已上传，链接已复制。当前为本地存储，建议配置图床以便 AI 访问链接'
        : '图片已上传，链接已复制到剪贴板，可发送给 AI 使用',
    errorToast: '图片上传失败',
  },

  /** 通用跨模块文案 */
  common: {
    loading: '加载中…',
    copySuccess: '已复制到剪贴板',
    copyFail: '复制失败，请重试',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    exportMd: { label: '导出 Markdown', tooltip: '将编辑器内容导出为 .md 文件' },
  },
} as const
