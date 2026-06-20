import { components, type ComponentDef } from "@engine";

// 生成「长图文排版 Markdown 语法指令」纯文本，供用户复制后发给其它 AI，
// 让 AI 在输出长图文内容时能正确使用本系统支持的扩展语法与组件。

function renderAttrs(attrs: ComponentDef["attrs"]): string {
  if (!attrs || attrs.length === 0) return "  （无属性）";
  return attrs
    .map((a) => {
      const req = a.required ? "【必填】" : "【可选】";
      const def = a.default ? `，默认：${a.default}` : "";
      const opts =
        a.options && a.options.length
          ? `，可选值：${a.options.join(" / ")}`
          : "";
      return `  - ${a.key} ${req} ${a.label}${def}${opts}`;
    })
    .join("\n");
}

function renderComponents(): string {
  const groups = new Map<string, ComponentDef[]>();
  for (const c of components) {
    const list = groups.get(c.tag) ?? [];
    list.push(c);
    groups.set(c.tag, list);
  }

  const blocks: string[] = [];
  let idx = 1;
  for (const [tag, list] of groups) {
    const names = Array.from(new Set(list.map((c) => c.name))).join(" / ");
    const lines: string[] = [];
    lines.push(`### ${idx}. <${tag}>  ${names}`);

    list.forEach((c) => {
      const variant = list.length > 1 ? `（${c.id}）` : "";
      if (c.example) lines.push(`示例${variant}：\n${c.example}`);
    });

    const attrMap = new Map<
      string,
      NonNullable<ComponentDef["attrs"]>[number]
    >();
    list.forEach((c) =>
      c.attrs?.forEach((a) => {
        if (!attrMap.has(a.key)) attrMap.set(a.key, a);
      }),
    );
    lines.push("属性：");
    lines.push(renderAttrs(Array.from(attrMap.values())));

    blocks.push(lines.join("\n"));
    idx += 1;
  }
  return blocks.join("\n\n");
}

const INLINE_SECTION = `## 二、行内强调语法（写在正文里）

- ==文字==        渐变背景强调（主题色。注：强调强度大于加粗）
- !!文字!!        胶囊标签背景（圆角药丸）
- ^^文字^^        靛青/主题色加重强调
- ::文字::        柔光主题色重点文字
- **文字**        粗体
- *文字*          斜体
- ***文字***      粗体 + 斜体
- __文字__        主题色下划线
- <u>文字</u>     普通下划线
- ~~文字~~        删除线
- ~文字~          下标（如 H~2~O）
- ^文字^          上标（如 m^2^）
- \`文字\`          行内代码`;

const ARTICLE_STANDARD_SECTION = `## 一、标准 Markdown

- 标题：# 一级 / ## 二级 / ### 三级 / #### 四级
- 无序列表用 - ，有序列表用 1. ；支持引用 > 、表格、分隔线
- 任务列表：- [x] 已完成   - [ ] 未完成
- 代码块：用三个反引号包裹，必须标注语言，例如 \`\`\`javascript
  - 系统会自动做代码高亮和自动换行，不需要额外写 HTML 样式
- 图片：![描述](图片地址)
  - 限制尺寸：![描述](图片地址)[100% 250px]  （格式为 [宽度 高度]，可超出部分滚动）
- 多图横向并排（左右滑动）：< ![图1](地址1), ![图2](地址2), ![图3](地址3) >
- 流程图：用 mermaid 代码块绘制，系统自动渲染为 SVG 图表：
  \`\`\`mermaid
  flowchart LR
    A --> B --> C
  \`\`\`
  - 流程图图注写在代码块下方，写法和图片图注一样：\`图 1: xxx\` 或 \`Fig. 2. xxx\`，系统会自动识别并居中显示。
- 脚注链接：[显示文字](链接地址 "脚注说明")  —— 带引号说明的链接会自动汇总到文末"参考资料"`;

const ARTICLE_META_SECTION = `## 输出结构（必须遵守）

请先输出文章元信息，再输出正文。推荐使用 YAML frontmatter：

---
title: 这里写适合平台展示的标题
summary: 这里写 50-120 字摘要，便于单独复制到平台简介/导语
---

正文从这里开始。

要求：
- title 必须是可直接发布的标题，不要超过 30 个汉字。
- summary 必须概括正文核心信息，不要写成宣传口号。
- 正文继续使用下面的扩展 Markdown 语法。
- 不要把整篇文章包在代码块里。`;

const DOCUMENT_META_SECTION = `## 输出结构（必须遵守）

请先输出文档元信息，再输出正文。推荐使用 YAML frontmatter：

---
title: 这里写正式文档标题
summary: 这里写 50-120 字摘要，概括文档目的、范围和结论
---

正文从这里开始。

要求：
- title 必须是正式、清晰、可直接作为文件名或封面标题的名称。
- summary 必须客观概括文档内容，不要写成营销口号。
- 正文只使用标准 Markdown 与本文档指令中允许的扩展标记。
- 不要把整篇文档包在代码块里。`;

const CALLOUT_SECTION = `## 三、提示框（Callout）

> [TIP] 这里是标题
> 这里是提示框正文内容

可用类型：[TIP] / [NOTE] / [WARNING] / [CAUTION] / [IMPORTANT]`;

const MATH_SECTION = `## 五、数学公式（KaTeX）

- 行内公式：用单个美元符号包裹，例如 $E=mc^2$
- 块级公式（独占一行、居中显示）：用两个美元符号包裹，例如：
$$
\\int_0^1 x^2 \\,dx = \\frac{1}{3}
$$
- 公式语法遵循 LaTeX / KaTeX 规范。`;

const ARTICLE_RULES_SECTION = `## 六、使用规则（重要）

1. 只能使用上面列出的语法与标签，不要发明新标签或新属性。不要直接混入 \`<script>\`、事件处理器属性（如 \`onclick\`）、\`javascript:\` 链接或未列出的任意 HTML 标签，以免造成渲染异常或安全风险。
2. 组件标签写法与普通 HTML 一致：<tag 属性="值">内容</tag> 或自闭合 <tag ...></tag>。
3. 绝大多数属性都是可选的，不确定时可以省略，会使用默认值。
4. 颜色值可用十六进制（如 #e74c3c）或预设名（如 red/green/yellow），留空则跟随全局主题色。
5. 标题、步骤流、对比、互动卡片存在多种样式变体，用 type 属性切换（如 type="DA02"）。
6. 直接输出可粘贴的 Markdown 正文，不要额外解释，不要用代码块把整篇文章包起来。
7. 合理搭配组件：开头可用 <title> 或 <breaking>，结尾推荐使用 <engage type="DA02">（彩色引导卡片样式）。注意：不要轻易/频繁使用 <statement> 居中强调语，仅在高度总结的观点或核心金句时才克制使用，正文穿插 <steps>、<timeline> 等增强可读性。
8. <steps> 步骤流规则：
   - active 属性控制强调：active="2" 仅第2步强调（默认 active="1"）；active="all" 全部步骤强调；active="none" 全部不强调。
   - 步骤超过3个时，系统自动切换为竖向布局（DA02）；也可以主动指定 type="DA02"。
   - 2–3步用默认横向布局（DA01）即可，4步及以上建议主动写 type="DA02"。`;

// A4 文档专属排版与题注规范
const DOCUMENT_STANDARD_SECTION = `## 一、标准 Markdown 与文档规范

- 标题：# 一级标题（用作文档主标题）/ ## 二级标题 / ### 三级标题 / #### 四级标题
  - 说明：第一个、最大的一级标题会作为文档主标题居中展示；后续章节标题保持正式文档的左对齐层级。
- 列表与引用：无序列表用 - ，有序列表用 1. ；支持引用 > 以及水平分割线。
- 强制分页：在需要强行换页（例如分隔封面页、目录页、新章节、附录）处，写一行 \\\`<page-break>\\\` 或 \\\`<page-break />\\\`。**附录前必须分页。**
- 代码块：使用三个反引号包裹并标注语言，例如 \`\`\`javascript
- 流程图：用 \`\`\`mermaid 代码块绘制，系统自动渲染为 SVG 图表，图注写在代码块下方（见下方题注说明）。
- 段首空格：如需保留段首空格，请直接在段落开头输入全角空格或半角空格；系统会按文档模式保留这些空格。
- 图片与表格题注（Caption）自动居中：
  - **图片题注只能写在图片下方**，形如 \`图 1: xxxx\` 或 \`Fig. 2. xxxx\`；写在图片上方会被当作普通段落。
  - **表格题注只能写在表格上方**，形如 \`表 1: xxxx\` 或 \`Table 2. xxxx\`；写在表格下方会被当作普通段落。
  - **Mermaid 流程图题注写在代码块下方**，写法和图片题注一样：\`图 1: xxxx\` 或 \`Fig. 2. xxxx\`，系统会自动识别并居中显示。
  - **写法建议**：优先使用普通独立行作为题注；如写成 \`**图 1: xxxx**\` 或 \`**表 1: xxxx**\`，系统也会识别为题注并居中。
  - **编号规则**：图题和表题分别独立编号，可以同时存在图 1 和表 1，不要把表格编号接在图片编号后面。
  - **系统表现**：系统会自动识别这些符合前缀的单独行，并用 \`document-caption\` 题注标识渲染为居中、灰色小字，且自动贴合相邻的图表（首行缩进对其无效）。
- 脚注链接：[显示文字](链接地址 "脚注说明")  —— 带引号说明的链接会自动汇总到文末"参考资料"并生成规范列表。`;

const DOCUMENT_RULES_SECTION = `## 四、排版规范与要求（重要）

1. **不要使用**长图文里的社交互动组件（如 <breaking>、<timeline>、<engage> 等），保持文档正式、严谨、适合打印和归档。不要直接混入 \`<script>\`、事件处理器属性（如 \`onclick\`）、\`javascript:\` 链接或未列出的任意 HTML 标签，以免造成渲染异常或安全风险。
2. 表格首行（表头）内容默认会强制居中，表格体内容默认左对齐。
3. **附录必须另起一页**：在附录（如"附录 A"、"参考文献"、"术语表"等）之前必须插入 \\\`<page-break />\\\`，确保附录从新页面开始。
4. **长文档建议按大章节分页**：当文档篇幅较长时，可在每个一级或二级大章节（\\\`##\\\`）之前插入 \\\`<page-break />\\\`，使每章从新页开始，提升可读性。短文档不必强求。
5. 不要在正文中写死颜色、字号、字体或 HTML 样式；系统会统一使用导航栏主题色与 A4 文档样式。
6. 直接输出可粘贴的 Markdown 正文，不要有任何多余的解释，不要用代码块包住整篇文档。`;

const DOCUMENT_COVER_SECTION = `## 三、封面页写法

如果文档需要封面页，在第一个 \\\`<page-break/>\\\` 之前只写一个一级标题和一个信息表格。系统会自动识别封面页并将内容在垂直方向等距分布（标题到页眉、标题到表格、表格到页脚的间距相等）。

封面页参考格式：

\\\`\\\`\\\`
# 文档正式标题

| 文档编号 | XXX-DOC-2026-001 | 版本号 | V1.0 |
| --- | --- | --- | --- |
| 编写 | 编写人/编写组 | 编写日期 | 2026-06-11 |
| 审核 | 审核人/审核组 | 审核日期 | 2026-06-12 |
| 发布状态 | 草稿/已发布 | 机密等级 | 绝密/机密/内部公开/授权公开/公开 |

<page-break/>
\\\`\\\`\\\`

封面页要求：
- 一级标题只能有一个，作为文档主标题。
- 信息表格采用四列双键值对格式（字段名 | 值 | 字段名 | 值），每行放两组字段，共四行。字段可根据实际情况增减。
- 封面页内不要使用列表、代码块、图片等非标题/表格元素。
- \\\`<page-break/>\\\` 之后开始写正文。`;

export function buildArticleAiGuide(): string {
  return [
    "# 长图文排版 Markdown 语法指令",
    "",
    "你是一位长图文内容策划与排版助手。请把我提供的素材整理成适合公众号、知识长图或图文平台发布的长文章，",
    "并严格使用下面这套「扩展 Markdown 语法」输出，方便后续一键渲染、复制富文本或导出长图。",
    "",
    "写作目标：先搭好文章结构，再安排视觉节奏。标题要清楚，摘要要能独立传播，正文要有层次、有重点、有可读性。",
    "",
    ARTICLE_META_SECTION,
    "",
    ARTICLE_STANDARD_SECTION,
    "",
    INLINE_SECTION,
    "",
    CALLOUT_SECTION,
    "",
    "## 四、块级组件（直接以标签形式写在正文中）",
    "",
    renderComponents(),
    "",
    MATH_SECTION,
    "",
    ARTICLE_RULES_SECTION,
    "",
    "## 七、内容组织建议",
    "",
    "1. 开头用 1-2 段说明问题、对象和价值，不要直接堆概念。",
    "2. 正文按“背景 / 核心观点 / 方法步骤 / 案例或数据 / 总结行动”组织；没有素材时不要编造事实。",
    "3. 每个二级标题下优先使用短段落、列表、引用或步骤组件，不要生成一整块难读的大段文字。",
    "4. 组件用于强化阅读体验，不要为了炫技过度堆叠；同一屏内避免连续放多个重装饰组件。",
    '5. 结尾给出清晰总结或行动提示，推荐使用 <engage type="DA02">（彩色引导卡片样式）引导收藏、关注或分享。',
    "",
  ].join("\n");
}

export function buildDocumentAiGuide(): string {
  return [
    "# A4 文档排版 Markdown 语法指令",
    "",
    "你是一位专业的 A4 正式文档编辑与排版助手。请把我提供的素材整理成适合打印、归档、评审或 PDF 交付的正式文档，",
    "并严格使用标准 Markdown 及以下排版规范输出，确保结构清晰、术语克制、版面端庄。",
    "",
    DOCUMENT_META_SECTION,
    "",
    DOCUMENT_STANDARD_SECTION,
    "",
    DOCUMENT_COVER_SECTION,
    "",
    MATH_SECTION,
    "",
    DOCUMENT_RULES_SECTION,
    "",
  ].join("\n");
}

const GOV_DOC_HEADER_SECTION = `## 三、公文头部写法（<gov-header> 标签）

公文必须在正文开始前使用 <gov-header> 标签渲染红头文件头部。标签属性：

- issuer（必填）：发文机关名称，如"XX市人民政府办公厅"
- doc-no（可选）：发文字号，如"市政发〔2026〕第1号"
- classification（可选）：密级，可选值：绝密 / 机密 / 秘密
- urgency（可选）：紧急程度，可选值：特急 / 加急
- signer（可选）：签发人姓名（仅上行文需要）

示例：

\`\`\`
<gov-header issuer="XX市人民政府办公厅" doc-no="市政发〔2026〕第1号" classification="机密" signer="张三"></gov-header>
\`\`\`

公文头部要求：
- 发文机关名称会以红色大字居中显示，下方有红色分隔线。
- 密级与紧急程度显示在左上角，签发人显示在右上角。
- 所有属性除 issuer 外均为可选，根据实际情况填写。`

const GOV_DOC_RULES_SECTION = `## 四、公文排版规范（重要）

1. **必须使用 <gov-header> 标签**渲染公文头部，不要用普通标题或表格模拟红头文件。
2. 公文标题（正文第一个一级标题）居中显示，使用二号宋体加粗。
3. 主送机关左顶格，后跟全角冒号，如"各区人民政府，市政府各委、办、局："
4. 正文使用仿宋字体，首行缩进两字，两端对齐。
5. 落款（发文机关署名 + 日期）右对齐，距正文两行。
6. **不要使用**长图文里的社交互动组件（如 <breaking>、<timeline>、<engage> 等），保持公文严肃性。不要直接混入 \`<script>\`、事件处理器属性（如 \`onclick\`）、\`javascript:\` 链接或未列出的任意 HTML 标签。
7. 附录前必须插入 <page-break/>。
8. 直接输出可粘贴的 Markdown 正文，不要有任何多余的解释。`

export function buildGovDocAiGuide(): string {
  return [
    "# 公文排版 Markdown 语法指令",
    "",
    "你是一位专业的党政机关公文编辑与排版助手。请把我提供的素材整理成符合 GB/T 9704-2012 标准的正式公文，",
    "并严格使用标准 Markdown 及以下排版规范输出，确保格式规范、用语严谨、适合打印和归档。",
    "",
    DOCUMENT_META_SECTION,
    "",
    DOCUMENT_STANDARD_SECTION,
    "",
    GOV_DOC_HEADER_SECTION,
    "",
    MATH_SECTION,
    "",
    GOV_DOC_RULES_SECTION,
    "",
  ].join("\n");
}

const TECH_DOC_COVER_SECTION = `## 三、封面页写法（技术文档）

技术文档可选择是否需要封面页。如需封面，在第一个 <page-break/> 之前只写一个一级标题和一个信息表格。

封面页元数据字段（全部可选，根据实际情况填写）：

- 文档编号：如 PRD-2026-001
- 版本号：如 V1.0
- 编写者 / 编写日期
- 审核者 / 审核日期
- 文档状态：草稿 / 评审中 / 已发布 / 已归档
- 机密等级：绝密 / 机密 / 内部公开 / 授权公开 / 公开

封面页参考格式：

\`\`\`
# 技术文档标题

| 文档编号 | PRD-2026-001 | 版本号 | V1.0 |
| --- | --- | --- | --- |
| 编写 | 编写人 | 编写日期 | 2026-06-20 |
| 审核 | 审核人 | 审核日期 | 2026-06-21 |
| 文档状态 | 草稿 | 机密等级 | 内部公开 |

<page-break/>
\`\`\`

封面页要求：
- 一级标题只能有一个，作为文档主标题。
- 信息表格采用四列双键值对格式，字段可根据实际情况增减。
- 不需要封面时，直接从正文开始，不要插入 <page-break/>。`

export function buildTechDocAiGuide(): string {
  return [
    "# 技术文档排版 Markdown 语法指令",
    "",
    "你是一位专业的技术文档编辑与排版助手。请把我提供的素材整理成适合技术评审、归档和交付的正式技术文档，",
    "并严格使用标准 Markdown 及以下排版规范输出，确保结构清晰、术语准确、版面端庄。",
    "",
    DOCUMENT_META_SECTION,
    "",
    DOCUMENT_STANDARD_SECTION,
    "",
    TECH_DOC_COVER_SECTION,
    "",
    MATH_SECTION,
    "",
    DOCUMENT_RULES_SECTION,
    "",
  ].join("\n");
}

export function buildCardAiGuide(aspect: string): string {
  const platformName = "小红书";
  return [
    `# ${platformName}图文卡片 Markdown 生成指令`,
    "",
    `请把我提供的素材改写为适合 ${platformName} 发布的分页图文卡片稿，画布比例为 ${aspect}。`,
    "输出必须是 Markdown，不要把整篇包在代码块里，也不要直接输出 HTML。",
    "",
    "核心目标：封面负责吸引点击，内容页负责一页讲清一个重点，发布文案负责承接互动与搜索。",
    "",
    "## 输出结构",
    "",
    "先输出 YAML frontmatter：",
    "",
    "---",
    "title: 适合作为封面大标题的标题，不超过 24 个汉字",
    "summary: 适合作为发布文案摘要的 50-120 字内容",
    "badge: 可选角标，例如 GUIDE / NOTE / 清单",
    "hook: 可选金句或行动提示",
    "chips: 话题1|话题2|话题3",
    "brand: 可选账号名",
    "---",
    "",
    "然后输出正文 Markdown。正文会被自动拆成 N 张内容图，系统会统一生成封面图、发布文案和内容图。",
    "",
    "## 排版规则",
    "",
    "- 使用短段落、清晰小标题和列表，每张图只承载一个重点；不要把多个复杂观点塞进同一页。",
    "- 封面标题要短、明确、有记忆点；正文标题要像目录一样可扫读。",
    "- 内容页优先使用 ## 小标题、列表、引用和短段落；一页建议 3-6 个信息单元。",
    "- 支持标准 Markdown、表格、引用、图片、数学公式；除行内强调外，不要使用长图文模式的复杂社交组件。",
    "- 代码块必须标注语言，例如 ```ts；系统会自动代码高亮并自动换行。",
    "- 不要直接输出 HTML 样式或混入 \`<script>\`、事件处理器属性（如 \`onclick\`）、\`javascript:\` 链接；需要强调时使用 ==重点==、!!标签!!、^^强强调^^ 等行内语法。",
    "- 如果素材不足，请保守改写，不要编造数据、案例或不存在的来源。",
    "- 不要额外解释，只输出可粘贴回编辑器的 Markdown。",
    "",
    "## 分页建议",
    "",
    "- 第 1 页内容图承接封面，快速说明“为什么要看”。",
    "- 中间页按步骤、清单、误区、对比或案例展开，每页只突出一个关键词。",
    "- 最后一页做总结、行动建议或收藏理由，方便用户停留和互动。",
  ].join("\n");
}

// 兼容老代码的导出函数
export function buildAiGuide(): string {
  return buildArticleAiGuide();
}
