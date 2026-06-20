import type { ComponentDef } from './index'
import type { ThemeColors } from '@engine/composables/useTheme'
import { esc } from '@engine/utils/helpers'

/**
 * 公文头部组件（红头文件）
 *
 * 符合 GB/T 9704-2012《党政机关公文格式》标准：
 * - 发文机关名称：红色宋体加粗居中
 * - 发文字号：居中，置于红头下方
 * - 密级：左上角红色加粗
 * - 紧急程度：左上角红色加粗（密级下方）
 * - 签发人：右上角（上行文需要）
 * - 红色分隔线：发文字号下方
 */
export const GovHeader_DA01: ComponentDef = {
  id: 'GovHeader_DA01',
  name: '公文头部',
  tag: 'gov-header',
  description: '党政机关公文红头文件头部，包含发文机关、发文字号、密级、签发人等',
  example: `<gov-header issuer="XX市人民政府办公厅" doc-no="市政发〔2026〕第1号" classification="绝密" urgency="特急" signer="张三"></gov-header>`,
  attrs: [
    { key: 'issuer', label: '发文机关名称', required: true },
    { key: 'doc-no', label: '发文字号' },
    { key: 'classification', label: '密级', options: ['绝密', '机密', '秘密'] },
    { key: 'urgency', label: '紧急程度', options: ['特急', '加急'] },
    { key: 'signer', label: '签发人（上行文）' },
  ],
  render: (attrs: Record<string, string>, _body: string, _t: ThemeColors): string => {
    const issuer = esc(attrs.issuer || '')
    const docNo = esc(attrs['doc-no'] || attrs.docNo || '')
    const classification = esc(attrs.classification || '')
    const urgency = esc(attrs.urgency || '')
    const signer = esc(attrs.signer || '')

    const RED = '#c0202c'
    const parts: string[] = []

    // 左上角：密级 + 紧急程度
    const leftTopItems: string[] = []
    if (classification) {
      leftTopItems.push(`<span style="font-size:16pt;font-weight:bold;color:${RED};font-family:'STSong','SimSun',serif">${classification}★保密期限</span>`)
    }
    if (urgency) {
      leftTopItems.push(`<span style="font-size:16pt;font-weight:bold;color:${RED};font-family:'STSong','SimSun',serif">${urgency}</span>`)
    }

    // 右上角：签发人（上行文）
    const rightTop = signer
      ? `<div style="position:absolute;top:0;right:0;font-size:16pt;color:#000;font-family:'FangSong','STFangsong',serif">签发人：${signer}</div>`
      : ''

    // 左上角容器
    const leftTop = leftTopItems.length > 0
      ? `<div style="position:absolute;top:0;left:0;display:flex;flex-direction:column;gap:4px">${leftTopItems.join('')}</div>`
      : ''

    // 发文机关名称（红头）
    const issuerHtml = issuer
      ? `<div style="text-align:center;font-size:36pt;font-weight:bold;color:${RED};font-family:'STSong','SimSun',serif;letter-spacing:6px;line-height:1.4;margin-top:24px">${issuer}</div>`
      : ''

    // 发文字号
    const docNoHtml = docNo
      ? `<div style="text-align:center;font-size:16pt;color:#000;font-family:'FangSong','STFangsong',serif;margin-top:8px">${docNo}</div>`
      : ''

    // 红色分隔线
    const dividerHtml = `<div style="height:4px;background:${RED};margin-top:12px;border:none"></div>`

    // 组装
    parts.push(`<section class="gov-header" data-block="gov-header" style="position:relative;margin-bottom:24px;break-inside:avoid">`)
    parts.push(leftTop)
    parts.push(rightTop)
    parts.push(issuerHtml)
    parts.push(docNoHtml)
    parts.push(dividerHtml)
    parts.push(`</section>`)

    return parts.join('')
  },
}
