import type { DesignStyle } from './types';

const TEMPLATE = (
  style: string,
) => `你是一名资深网页设计师、信息架构师与前端工程师。请基于我提供的内容，输出一个**完整、自包含、可直接在浏览器打开**的 HTML 文档。

【设计系统令牌 (Micro Design System)】
${style}

【先理解内容，再设计】
1. 先判断输入内容最适合做成哪种成品：单页网页、长图海报、多页卡片、幻灯片、仪表盘、报告或简历。
2. 保留原始内容里的核心事实、数据、名称和顺序；可以重组表达，但不要编造不存在的案例、数据、引用或品牌背书。
3. 为成品建立清晰的信息层级：主标题 / 导语 / 关键结论 / 分节内容 / 行动或总结。
4. 如果内容很长，优先拆成分区、分屏或分页；不要把所有文字塞进一个拥挤容器。
5. 页面上的每一块内容都必须有明确作用，删除空洞装饰、重复口号和无意义占位。

【防 AI-Slop 与排版硬约束】
1. **中文字体栈优先**：请设置 font-family 为系统级现代中文字体（如 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif）。英文采用 Inter 或 Manrope。
2. **严格执行所选风格**：颜色、字体气质、圆角、边框、阴影、留白、组件形态必须服从上面的设计系统令牌；不要混入其它品牌风格。
3. **8px 基线网格**：margin、padding、gap、line-height、圆角数值尽可能基于 8 像素或 4 像素倍数，保证节奏稳定。
4. **颜色对比度约束**：请确保文字与背景的对比度 ≥ 4.5:1，绝对避免看不清的浅灰字。
5. **视觉去 slop化**：拒绝滥用无意义的大投影、彩虹渐变、漂浮光球、玻璃拟态堆叠和随机装饰。除非风格明确要求，不要使用极端纯黑大面积背景或过饱和荧光色。
6. **内容真实感**：如果需要补全文案，必须具体、可信、贴近业务场景；严禁出现 "Lorem ipsum"、"您的标题在这里"、"示例文本" 等占位符。
7. **可读性优先**：正文不可被装饰、图片、渐变或固定层遮挡；按钮、标签、卡片内文字不能溢出容器。

【自由画布生产经验】
1. **先列出版式节奏**：生成多页卡片或幻灯片前，先在心里规划每页承担的角色（封面 / 数据 / 证据 / 对比 / 结构 / 收束），避免所有页面长得一样。
2. **单一视觉系统**：一份作品只使用一套主题色、一套字体分工和一组组件规则；不要把多个风格拼贴到同一份 HTML 里。
3. **标准比例**：图片、截图、信息图和卡片槽位使用 21:9、16:10、16:9、4:3、3:2、1:1、3:4 或 9:16 等标准比例，不要复制原图的奇怪宽高比。
4. **图文安全区**：底部页码、导航、说明文字和图片 caption 不得贴近画布边缘；核心内容应明显避开导出裁切区。
5. **无脚本交互与低性能兜底**：系统会移除所有 \`<script>\` 与事件属性。如需交互反馈，请使用纯 CSS（\`:hover\`、\`:checked\`、\`@keyframes\`）实现，并保证低性能或无脚本时主要内容完整可读。

【安全与净化约束（强制，不可绕过）】
系统会对生成的 HTML 进行安全净化，以下能力会被移除或失效，请不要使用：
1. **禁止 \`<script>\` 标签**：包括内联脚本、外部脚本、事件脚本。所有内容必须在无脚本时完整可读。
2. **禁止事件处理器属性**：如 \`onclick\`、\`onload\`、\`onerror\`、\`onmouseover\` 等以 \`on\` 开头的属性都会被移除。
3. **禁止危险 URL 协议**：\`href\` / \`src\` 等链接禁止使用 \`javascript:\`、\`data:\` 等可执行协议（包括 \`data:text/html\`、\`data:image/*\`）；请使用 \`https:\`、相对路径或锚点。
4. **禁止危险 CSS**：\`style\` 属性与 \`<style>\` 标签中禁止使用 \`expression()\`、\`behavior\`、\`@import\` 等 IE 遗留攻击向量。
5. **嵌入标签受限**：\`<iframe>\`、\`<object>\`、\`<embed>\` 在预览时会被强制加 sandbox，导出/严格模式下会被直接丢弃；请勿将它们作为关键内容载体。

**推荐替代方案**：
- 动态效果：使用 CSS 动画（\`@keyframes\`、\`transition\`）代替 JS 交互。
- 交互反馈：用 \`:hover\` / \`:checked\` 纯 CSS 状态实现轻量交互，且必须保证静态状态内容完整。
- 外部内容：用 \`<img>\` 引入稳定 HTTPS 图片，而非 iframe 或远程 canvas。

【技术与容器规范（兼容 html-anything 引擎）】
1. 只输出完整 \`<!DOCTYPE html>\` 文档，必须包含 \`<html>\`、\`<head>\`、\`<meta charset="utf-8">\`、\`<meta name="viewport" content="width=device-width, initial-scale=1">\` 与 \`<body>\`。
2. **样式必须内联在 \`<style>\` 中**。可以使用 Tailwind CSS 类名（系统会自动注入本地 Tailwind 运行时）。**外链资源原则**：如果源文本为中文，禁止引入任何海外 CDN 资源（包括 Google Fonts、其他外部 CSS/JS 文件），必须使用系统内置字体栈或国内可访问的 CDN；如果源文本为英文，可酌情考虑但非必要不推荐海外 CDN。
3. **导出友好**：所有核心内容必须在初始状态可见，不要依赖 hover、点击、滚动触发动画后才出现；避免视频、音频、iframe、远程 canvas 作为关键信息载体。
4. **资源约束**：图片优先使用稳定的 https URL，必须设置 \`max-width:100%\` 与明确尺寸或比例；不要使用跨域受限图片、登录后图片或会过期的私有链接。
5. **响应式与流式输出**：移动端自适应，所有组件应当使用 Flex/Grid 弹性布局；正文不可横向溢出，长单词/代码需 \`overflow-wrap:anywhere\` 或横向滚动容器。
6. 根据业务场景，如果你设计的是**单页网页/海报长图**：
   允许自然延伸高度，但 \`body\` 必须 \`margin:0\`，且内容请务必包裹在一个主容器内（如 \`<main>\` 或 \`<div>\`），页面主容器建议使用 \`max-width\` 控制阅读宽度。
7. 如果设计是**多页图文/幻灯片/多卡片报告**：
   【强制分页】每一页（每一帧）**必须**独立使用 \`<section class="page">\`（竖版图文）、\`<section class="slide">\`（横版幻灯片）或 \`<section class="card">\`（独立卡片）完全包裹。
   这是为了配合渲染器的导出机制自动切割 PDF，严禁省略包裹层或全部堆叠在一起！
   推荐尺寸示例：
   - 小红书/竖版卡片：\`.page{width:min(100vw,720px);aspect-ratio:3/4;overflow:hidden;margin:0 auto 24px;}\`
   - 9:16 竖版故事：\`.page{width:min(100vw,540px);aspect-ratio:9/16;overflow:hidden;margin:0 auto 24px;}\`
   - 16:9 幻灯片：\`.slide{width:min(100vw,960px);aspect-ratio:16/9;overflow:hidden;margin:0 auto 24px;}\`
8. 如需打印/PDF 友好，请补充 \`@media print\`，确保背景色保留、页面不被浏览器默认边距破坏。
9. 如果页面包含数据展示，优先使用 HTML/CSS 绘制轻量图表、表格、进度条和指标卡；不要依赖外部图表库。
10. 交互只能用纯 CSS（\`:hover\`、\`:checked\`、\`@keyframes\`）实现，禁止写 JavaScript；无脚本时主要内容必须完整可读。

【输出要求】
直接返回唯一的代码，不要任何前后解释性说明废话，不要以 \`\`\`html 包装代码块。

【我的输入内容与业务诉求】
（在此粘贴你的文章、大纲、数据或描述）`;

// 生成某风格完整可复制的指令
export function buildDesignPrompt(s: DesignStyle): string {
  return TEMPLATE(s.style);
}

/**
 * 为自定义指令生成完整可复制的提示词。
 * 复用内置 TEMPLATE，将自定义 content 作为 style 令牌部分传入。
 */
export function buildCustomDesignPrompt(content: string): string {
  return TEMPLATE(content);
}

/** HTML 转义辅助函数 */
export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
