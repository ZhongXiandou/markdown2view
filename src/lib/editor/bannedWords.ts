/**
 * 违禁词检测：内置公众号高风险词库（广告法极限词、权威背书、医疗功效、金融风险、诱导互动五类），
 * 扫描 Markdown 正文并返回带行列定位的命中列表。
 * 词库与扫描逻辑移植自 r-markdown（MIT）的 src/utils/bannedWords.ts。
 *
 * - 扫描前先把代码块 / 行内代码 / URL / 标签「遮罩」成等长空白，避免代码与链接误报，且行列号不变；
 * - 词库只是提示，不代表平台的实际审核结论。
 */

export interface BannedCategory {
  id: string
  label: string
  words: string[]
}

/** 内置分类词库 */
export const BANNED_CATEGORIES: BannedCategory[] = [
  {
    id: 'extreme',
    label: '极限用语',
    words: [
      '最佳', '最好', '最强', '最优', '最大', '最高级', '最高档', '最低价', '最便宜',
      '最先进', '最优秀', '最著名', '最流行', '最时尚', '最聚财', '最受欢迎', '最新科技',
      '史上最', '史上仅', '全网第一', '全网最低', '全国第一', '全球第一', '世界第一',
      '行业第一', '销量第一', '第一品牌', 'NO.1', 'TOP1', 'TOP 1',
      '顶级', '顶尖', '极品', '极致体验', '绝对', '绝无仅有', '独一无二', '空前绝后',
      '史无前例', '万能', '百分之百', '100%', '纯天然', '无敌', '冠军', '王牌',
      '独家', '首个', '首款', '首创', '全国首家', '领导品牌', '领军品牌', '领军者',
      '开创者', '缔造者', '始祖', '鼻祖', '开天辟地', '空前', '绝后', '永久',
      '彻底', '终极', '完美', '百分百',
    ],
  },
  {
    id: 'authority',
    label: '权威背书',
    words: [
      '国家级', '世界级', '国家认证', '国家推荐', '国家机关推荐', '质量免检', '免检产品',
      '特供', '专供', '国家专供', '军队特供', '驰名商标', '著名商标', '中国名牌',
      '名牌商品', '国际认证', '官方认证', '官方推荐', '权威认证', '专家推荐',
      '医生推荐', '明星推荐', '获奖产品', '金奖', '银奖', '质检合格首选',
    ],
  },
  {
    id: 'medical',
    label: '医疗功效',
    words: [
      '根治', '治愈', '治愈率', '包治百病', '药到病除', '立竿见影', '无副作用',
      '安全无副作用', '无依赖', '彻底根治', '根治顽疾', '消炎', '杀菌', '抗菌',
      '祛疤', '祛斑', '瘦身', '减肥', '燃脂', '刮油', '排毒', '抗癌', '防癌',
      '降血压', '降血糖', '降血脂', '提高免疫力', '增强免疫力', '延缓衰老',
      '返老还童', '延年益寿', '生发', '助眠', '壮阳', '补肾', '调理体质',
    ],
  },
  {
    id: 'finance',
    label: '金融风险',
    words: [
      '稳赚不赔', '稳赚', '保本保息', '保本', '零风险', '无风险', '躺赚',
      '翻倍收益', '收益翻倍', '暴富', '一夜暴富', '内部消息', '高回报',
      '超高回报', '日赚', '日入过千', '月入过万', '月赚', '财务自由',
      '复利奇迹', '钱生钱', '睡后收入过万', '包赚',
    ],
  },
  {
    id: 'induce',
    label: '诱导互动',
    words: [
      '求点赞', '求转发', '求关注', '求在看', '求分享', '关注后领取', '关注后回复',
      '关注公众号领取', '转发朋友圈', '转发到朋友圈', '转发本文', '分享朋友圈',
      '分享到朋友圈', '集赞', '集齐赞', '点赞过万', '点赞破万', '阅读原文领取',
      '点击关注', '扫码关注', '扫码进群', '加微信群', '加微信领取', '进群领取',
      '私信领取', '私信我', '评论区领取', '评论区扣', '在看过百', '点个在看',
      '素质三连', '一键三连', '不转不是', '转发这条', '截图领取',
    ],
  },
]

const CATEGORY_LABELS = new Map(BANNED_CATEGORIES.map((c) => [c.id, c.label]))

export interface BannedMatch {
  word: string
  categoryLabel: string
  /** 1 起始的行号 */
  line: number
  /** 行内 1 起始的列号 */
  col: number
  /** 命中词在全文中的偏移量 */
  offset: number
  /** 命中词前后的上下文片段 */
  before: string
  after: string
}

/** 单次扫描命中上限，防止极端长文卡顿 */
export const MAX_MATCHES = 500

function mask(s: string): string {
  return s.replace(/[^\n]/g, ' ')
}

/** 将不需要检测的区域替换为等长空白（保留换行，行号不变） */
function maskIgnoredRegions(src: string): string {
  let out = src
  // 开头的 front-matter（标题、摘要等元信息不算正文）
  out = out.replace(/^---\n[\s\S]*?\n---(?=\n|$)/, (m) => mask(m))
  // 围栏代码块
  out = out.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*(?=\n|$)/gm, (m) => mask(m))
  // 标签（含扩展组件标签及其属性）
  out = out.replace(/<[^>\n]*>/g, (m) => mask(m))
  // 行内代码
  out = out.replace(/`[^`\n]+`/g, (m) => mask(m))
  // URL 与 img:/data: 协议地址
  out = out.replace(/\b(?:https?:)?\/\/[^\s)"'<>]+/gi, (m) => mask(m))
  out = out.replace(/\b(?:img|data):[^\s)"'<>]+/gi, (m) => mask(m))
  // 图片尺寸后缀 ![alt](url)[宽 高]
  out = out.replace(/(!\[[^\]]*\]\([^)]*\))(\[[^\]]*\])/g, (_m, head: string, dim: string) => head + mask(dim))
  return out
}

/**
 * 扫描违禁词，返回按文中位置排序的命中列表。
 * @param ignored 用户选择忽略的词
 */
export function scanBannedWords(source: string, ignored: string[] = []): BannedMatch[] {
  if (!source.trim()) return []
  const skip = new Set(ignored)
  const lowered = maskIgnoredRegions(source).toLowerCase()

  // 每行起始偏移，用于把偏移量换算成行列号
  const lineStarts: number[] = [0]
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') lineStarts.push(i + 1)
  const lineOf = (offset: number) => {
    let lo = 0
    let hi = lineStarts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (lineStarts[mid] <= offset) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  // 长词优先：「全网最低」先于「最低价」之类的子串命中，避免同一处重复报告
  const terms = BANNED_CATEGORIES.flatMap((c) => c.words.filter((w) => !skip.has(w)).map((word) => ({ word, id: c.id })))
    .sort((x, y) => y.word.length - x.word.length)

  const occupied: Array<[number, number]> = []
  const overlaps = (s: number, e: number) => occupied.some(([x, y]) => s < y && e > x)
  const matches: BannedMatch[] = []

  for (const term of terms) {
    const needle = term.word.toLowerCase()
    let idx = lowered.indexOf(needle)
    while (idx !== -1 && matches.length < MAX_MATCHES) {
      const end = idx + needle.length
      if (!overlaps(idx, end)) {
        occupied.push([idx, end])
        const lineIdx = lineOf(idx)
        const lineStart = lineStarts[lineIdx]
        const lineEnd = lineIdx + 1 < lineStarts.length ? lineStarts[lineIdx + 1] - 1 : source.length
        matches.push({
          word: source.slice(idx, end),
          categoryLabel: CATEGORY_LABELS.get(term.id) ?? '',
          line: lineIdx + 1,
          col: idx - lineStart + 1,
          offset: idx,
          before: source.slice(Math.max(lineStart, idx - 12), idx),
          after: source.slice(end, Math.min(lineEnd, end + 12)),
        })
      }
      idx = lowered.indexOf(needle, end)
    }
  }

  return matches.sort((x, y) => x.offset - y.offset)
}
