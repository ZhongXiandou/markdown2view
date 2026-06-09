export const DEMO_ARTICLE = `<title type="DA02" badge="LONGFORM" subtitle="从 Markdown 草稿到可复制富文本与长图 PNG 的完整示例。" chips="长图文|公众号|组件化排版">markdown2view 长图文排版工作流</title>

<reading-path></reading-path>

<lead>
这份示例用于展示长图文模式的核心能力：用扩展 Markdown 写出适合公众号、知识长图和图文平台发布的文章，并一键复制富文本或导出完整长图。
</lead>

<p-title num="01" title="它解决什么问题" subtitle="ONE SOURCE · MULTI OUTPUT" level="1"></p-title>

内容团队常常会遇到同一个问题：素材已经写好，但不同平台需要不同形态。公众号要富文本排版，正式交付要 A4 文档，小红书要分页卡片，活动展示又可能需要风格化 HTML。

markdown2view 的长图文模式把重点放在“文章表达”上：你仍然写 Markdown，但可以按需要插入标题卡、提示框、步骤流、对比卡片、标签、行动号召和结尾互动，让内容更像一篇已经排好版的发布稿。

> [TIP] 你可以在左侧继续编辑 Markdown，右侧会实时预览长图文效果。完成后可复制富文本，也可导出为一张完整长图 PNG。

<p-title num="02" title="推荐工作流" subtitle="WORKFLOW" level="1"></p-title>

<steps label="HOW IT WORKS" title="从草稿到发布" hint="按顺序完成即可" active="3">
- 写作 | 在 Markdown 中完成正文、标题层级和核心信息
- 增强 | 使用扩展组件突出路径、步骤、对比、结论和行动入口
- 预览 | 在右侧检查段落节奏、组件间距、代码块和公式显示效果
- 交付 | 复制富文本到公众号，或导出长图用于知识平台分发
</steps>

<p-title num="03" title="适合放进长图文的内容" subtitle="CONTENT PATTERN" level="1"></p-title>

<badges tone="accent">产品介绍|教程文章|运营复盘|知识科普|项目更新</badges>

长图文不是把所有信息堆在一页里，而是把读者的阅读路径安排清楚。一个实用结构通常包含：

- 开头：一句话说明读者能获得什么。
- 中段：用步骤、对比、表格或清单拆解复杂信息。
- 结尾：给出结论、行动建议或下一步入口。

<statement>长图文的关键不是装饰更多，而是让读者更快理解重点。</statement>

<p-title num="04" title="对比：手工排版 vs 模块化输出" subtitle="BEFORE / AFTER" level="1"></p-title>

<compare left-label="BEFORE" left-title="手工排版" right-label="AFTER" right-title="模块化输出">
<left>
- 重复调整字号和间距
- 多平台样式难以统一
- 复制导出容易变形
- 后续复用成本较高
</left>
<right>
- 组件化 Markdown 描述内容
- 按场景生成不同成品
- 导出链路可重复复用
- 示例、指令和内容可持续迭代
</right>
</compare>

<p-title num="05" title="图文混排与基础样式" subtitle="RICH MEDIA & BASICS" level="1"></p-title>

![优质代码环境](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80)
图 1：展示高质量插图在长文中的视觉焦点作用

< ![ ![沉浸式开发](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80) ![极简工作流](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80) ]
图 2：排版精美的图片组合可以增强技术文档的阅读体验

### 文本强调

普通正文用于承载叙述，**加粗** 用于标记重点，*斜体* 用于轻量强调，\`inline code\` 适合标记字段、按钮名或命令。

### 引用提示

> [NOTE] 如果你准备把文章复制到公众号后台，建议先在这里完成结构、标题和组件排版，再去平台后台补充封面、合集和发布设置。

### 表格

| 输出方式 | 适合用途 | 说明 |
| --- | --- | --- |
| 复制富文本 | 公众号、图文编辑器 | 保留排版结构，便于继续发布 |
| 导出长图 | 知识平台、社群传播 | 将整篇内容输出为单张 PNG |
| 复制 AI 指令 | 外部 AI 改写 | 让 AI 按当前支持语法产出内容 |

<p-title num="06" title="实践路径与成功案例" subtitle="TIMELINE & CASES" level="1"></p-title>

我们在实际排版与推广中，整理出了如下关键的发展路线和案例分享：

<timeline>
- 2026年01月 | 项目启动 | 确定纯前端、零后端的极致流畅体验，搭建基础渲染器
- 2026年03月 | 多端适配 | 引入小红书卡片、A4 文档双排版内核，解决图片跨页等排版痛点 | ![多端适配](https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80)[100% 140px]
- 2026年06月 | 画布升级 | 突破静态限制，加入自由画布，支持横向网页 PPT 导出与打包下载 | ![自由画布](https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80)[100% 140px]
</timeline>

以下是使用本工作台的用户真实反馈：

<case-flow>
- [案例 01] 自媒体主创：原先排版公众号加导出小红书卡片需要2小时，现在10分钟内一键生成双平台素材，工作流效率大升。
- [案例 02] 独立开发者：使用 HTML 可视化模式，用 AI 快速生成炫酷的 Swiss 风格网页 PPT 并在发布会上大获好评。
</case-flow>

<p-title num="07" title="代码与公式也能放进长文" subtitle="TECH CONTENT" level="1"></p-title>

技术类文章常常需要展示代码、配置或公式。长图文模式会继续复用 Markdown 渲染能力，让工程说明和知识教程更容易交付。

\`\`\`ts
const modes = ['article', 'document', 'card', 'html']

function render(mode: string, content: string) {
  return 'render ' + mode + ' with ' + content.length + ' chars'
}
\`\`\`

行内公式示例：当 $a \\ne 0$ 时，二次方程可以写成 $ax^2 + bx + c = 0$。块级公式如下：

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

<p-title num="08" title="什么时候切换到其他模式" subtitle="SCENARIO GUIDE" level="1"></p-title>

<compare left-label="LONGFORM" left-title="继续使用长图文" right-label="OTHER MODES" right-title="切换到其他模式">
<left>
- 需要讲清一个完整主题
- 希望读者连续阅读
- 要复制富文本到公众号
- 要导出一张完整长图
</left>
<right>
- 正式归档：切到 A4 文档
- 多张发布图：切到分页图文
- 高度视觉化页面：切到 HTML 自由画布
- 需要打印交付：切到 A4 文档
</right>
</compare>

<p-title num="08" title="高级图片版式：轮播图" subtitle="CAROUSEL / SLIDER" level="1"></p-title>

如果你有更多的图片想要展示，还可以使用轮播组件。这在展示多个产品细节、多步骤操作演示时非常有用。由于它利用 SVG 原生动画，因此复制到公众号或各大知识平台时均可完美展示，无需任何额外插件。

<slider images="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop&q=80,https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop&q=80,https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop&q=80" interval="3" width="600" height="300" type="1"></slider>

<cta label="NEXT STEP" title="把这篇示例改成你的发布稿" button="复制长图文 AI 指令"></cta>

<engage type="DA02" title="感谢阅读" subtitle="继续把同一份内容变成更多可发布的成品。" color="green"></engage>
`
