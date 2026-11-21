import type { RawDesignStyle } from "../types";
import { FANGSONG, MONO, SANS, SERIF, SONGTI, abs, barChart, canvas, lineChart, textLines } from "../previewKit";

const PAGE_RULE = '- **分页容器**：多页输出时每一页必须使用 `<section class="page">` 独立包裹并固定比例（A4 竖版用 `aspect-ratio:210/297`）。';

export const docStyles: RawDesignStyle[] = [
  {
    id: "notion",
    name: "暖色极简 · Notion",
    category: "文档知识/知识文档",
    accent: "#0f0f0f",
    description: "暖白底色，衬线标题，柔和灰色区块，专注文档阅读体验",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#37352f;`,
      abs(`left:0;right:0;top:0;height:54px;background:linear-gradient(100deg,#f6e7c8,#f3d2c1 55%,#d9e4f2);`) +
        abs(
          `left:56px;top:32px;width:42px;height:42px;border-radius:9px;background:#ffffff;box-shadow:0 2px 8px rgba(15,15,15,0.12);display:flex;align-items:center;justify-content:center;`,
          `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#37352f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21a2 2 0 0 0 2 2h13v-4"/><path d="M9 8h6"/></svg>`,
        ) +
        abs(`left:56px;top:84px;font-family:${SERIF};font-size:25px;font-weight:700;letter-spacing:-0.3px;`, "读书笔记：设计的日常") +
        abs(
          `left:56px;top:124px;display:flex;align-items:center;gap:8px;font-size:10px;color:#787774;`,
          `<span>标签</span><span style="background:#fdecc8;color:#402c1b;border-radius:3px;padding:1px 7px;">阅读</span><span style="background:#d3e5ef;color:#183347;border-radius:3px;padding:1px 7px;">设计</span><span style="margin-left:14px;">日期</span><span style="color:#37352f;">2026 年 9 月 12 日</span>`,
        ) +
        abs(
          `left:56px;right:56px;top:152px;box-sizing:border-box;background:#f1f1ef;border-radius:6px;padding:11px 14px;display:flex;gap:10px;`,
          `<div style="width:14px;height:14px;border-radius:50%;border:1.8px solid #37352f;box-sizing:border-box;flex:none;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;">i</div><div style="flex:1;">${textLines([100, 72], "#c8c6c0", 5, 7)}</div>`,
        ) +
        abs(
          `left:56px;right:56px;top:212px;`,
          [
            [true, 58],
            [false, 74],
          ]
            .map(
              ([done, w]) =>
                `<div style="display:flex;align-items:center;gap:9px;margin-bottom:9px;"><div style="width:13px;height:13px;box-sizing:border-box;border-radius:3px;${done ? "background:#2383e2;" : "border:1.5px solid #37352f;"}"></div><div style="width:${w}%;height:5px;border-radius:3px;background:${done ? "#dedcd7" : "#bdbbb5"};"></div></div>`,
            )
            .join(""),
        ) +
        abs(`left:56px;right:56px;top:264px;border-left:3px solid #37352f;padding-left:12px;`, textLines([88, 60], "#bdbbb5", 5, 7)),
    ),
    style: `【视觉主题】专注阅读与书写的暖色极简文档：安静、朴素，像一页整理好的笔记（参考 Notion）
  【色彩系统】
   - 底色：纯白 #ffffff；侧栏与分区可用暖灰白 #f7f6f3。
   - 文本：深灰近黑 #37352f，次要文本 #787774，占位 #9b9a97。
   - 背景块：柔和的浅灰 #f1f1ef；分隔线 #e9e9e7。
   - 标签色（低饱和，浅底配同色系深字）：黄 #fdecc8、蓝 #d3e5ef、绿 #dbeddb、粉 #f5e0e9、紫 #e8deee、灰 #e3e2e0。
   - 链接与勾选蓝 #2383e2，只用于链接、复选框和选中态。
  【字体与字号】
   - 标题使用优雅的衬线体（Georgia / 宋体），正文使用无衬线体；代码用等宽字体。
   - 字号阶梯：页面标题 40px 字重 700，一级标题 30px，二级 24px，三级 20px，正文 16px 行高 1.65，说明与属性 14px，标签 12px。
  【间距与形状】
   - 正文栏定宽 720px 并居中（或左对齐留出 96px 页边距），段落间距 8-12px，标题上方留 28-32px。
   - 圆角很小：背景块与图片 4-6px，标签 3px；不用阴影和描边卡片。
  【组件特征】
   - 页面头部：可选的通栏封面色带 + 压在封面下沿的页面图标（圆角方块里的线性图标）+ 衬线大标题 + 属性行（标签、日期、作者）。
   - 提示块：浅灰底、6px 圆角，左侧一个线性小图标，右侧正文；不用彩色边框。
   - 待办列表：方形复选框 + 文本，已完成项文字变浅并加删除线。
   - 引用块：3px 左侧深色竖线；折叠块：小三角 + 标题；表格：1px 浅灰线、表头浅灰底；代码块：#f7f6f3 底。
   - 目录：页面开头的浅色链接列表，按标题层级缩进。
  【页面结构】封面与图标 → 标题与属性 → 提示块（一句话摘要）→ 目录 → 按标题分节的正文（段落、列表、引用、表格、代码穿插）→ 相关页面链接。
  【禁忌】不用大色块、渐变按钮和装饰图标；不用表情符号做图标；不做多栏杂志排版。
  【布局原则】单栏、左对齐、定宽，无冗余装饰；靠标题层级和留白组织长文。`,
  },
  {
    id: "resume",
    name: "简历 / 个人主页",
    category: "文档知识/个人简历",
    accent: "#0891b2",
    description: "单页简历，左右分栏，清晰层级，A4 打印友好",
    previewHtml: canvas(
      `background:#e2e8f0;font-family:${SANS};color:#0f172a;`,
      abs(
        `left:60px;right:60px;top:18px;bottom:-30px;background:#ffffff;box-shadow:0 10px 30px rgba(15,23,42,0.15);display:flex;`,
        `<div style="width:118px;flex:none;box-sizing:border-box;background:#0e7490;color:#ffffff;padding:18px 14px;">` +
          `<div style="width:46px;height:46px;box-sizing:border-box;border-radius:50%;background:linear-gradient(135deg,#a5f3fc,#22d3ee);border:2px solid #ffffff;"></div>` +
          `<div style="font-size:17px;font-weight:700;margin-top:10px;">林澈</div><div style="font-size:9px;opacity:0.85;margin-top:2px;">高级产品设计师</div>` +
          `<div style="font-size:8px;font-weight:700;letter-spacing:1.5px;opacity:0.7;margin:14px 0 7px;">联系方式</div>` +
          textLines([90, 70, 80], "rgba(255,255,255,0.45)", 3, 6) +
          `<div style="font-size:8px;font-weight:700;letter-spacing:1.5px;opacity:0.7;margin:14px 0 8px;">专业技能</div>` +
          [90, 76, 62].map((w) => `<div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.25);margin-bottom:8px;"><div style="width:${w}%;height:100%;border-radius:2px;background:#ffffff;"></div></div>`).join("") +
          `</div>` +
          `<div style="flex:1;padding:18px;">` +
          `<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#0891b2;padding-bottom:5px;border-bottom:1.5px solid #0891b2;">工作经历</div>` +
          [
            ["星河科技", "设计负责人", "2022 — 至今"],
            ["青禾互动", "资深交互设计师", "2019 — 2022"],
          ]
            .map(
              ([c, r, d]) =>
                `<div style="position:relative;margin:10px 0 0 3px;padding-left:14px;border-left:1px dashed #cbd5e1;"><i style="position:absolute;left:-4px;top:3px;width:7px;height:7px;border-radius:50%;background:#0891b2;"></i><div style="display:flex;justify-content:space-between;align-items:baseline;font-size:10px;"><b>${c}</b><span style="color:#94a3b8;font-size:8px;">${d}</span></div><div style="font-size:8px;color:#64748b;margin:2px 0 6px;">${r}</div>${textLines([100, 82], "#e2e8f0", 3, 5)}</div>`,
            )
            .join("") +
          `<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#0891b2;padding-bottom:5px;border-bottom:1.5px solid #0891b2;margin-top:16px;">项目经历</div>` +
          `<div style="margin-top:10px;">${textLines([100, 90, 70], "#e2e8f0", 3, 5)}</div>` +
          `</div>`,
      ),
    ),
    style: `【视觉主题】专业清晰的 A4 打印级简历：一页讲清“我是谁、做过什么、能带来什么”
  【色彩系统】
   - 底色：纸面纯白 #ffffff；页面外背景浅灰 #e2e8f0（打印时不显示）。
   - 侧栏：深青 #0e7490 反白，或浅灰 #f8fafc 配深色文字，二选一。
   - 文本：主文本 #0f172a，职位与说明 #64748b，日期 #94a3b8，分隔线 #cbd5e1。
   - 强调色：商务青 #0891b2，只用于分节标题、时间轴圆点、链接和技能条；全页不出现第二种彩色。
  【字体与字号】
   - 现代无衬线体，数字使用 tabular-nums；不用装饰字体。
   - 字号阶梯（按 A4 页面）：姓名 28-32px 字重 700，求职意向 13-14px，分节标题 12-13px 字重 700、字距 0.12em，公司与项目名 14px 字重 700，正文 12-13px 行高 1.6，日期 11px。
  【间距与形状】
   - 左右双栏：左栏占 30%-34%，右栏为主内容；页面定宽 A4 比例（210:297），内边距 36-48px。
   - 分节标题下压一条 1.5px 强调色横线；分节间距 20-24px，条目间距 12px。
   - 头像为圆形并带 2px 白色描边；不用阴影和大圆角卡片。
  【组件特征】
   ${PAGE_RULE}
   - 左栏：头像 → 姓名与求职意向 → 联系方式（电话、邮箱、城市、作品集链接）→ 专业技能（技能名 + 4px 进度条或等级点）→ 语言与证书。
   - 时间轴：左侧 1px 虚线 + 7px 圆点；每条经历为“公司名（加粗）+ 右对齐日期”“职位（偏灰）”“2-4 条成果要点”。
   - 成果要点以动词开头并包含数字（如“将转化率提升 23%”）。
   - 项目卡：项目名 + 角色 + 一句成果；教育经历：学校、专业、时间一行排完。
  【页面结构】左栏个人信息与技能；右栏依次为个人简介（3 行以内）→ 工作经历 → 项目经历 → 教育经历 → 奖项或开源贡献。
  【禁忌】不要超过两页；不要技能雷达图和满屏图标；不要用百分比给自己的“沟通能力”打分；不放与岗位无关的信息。
  【布局原则】左窄右宽，高度紧凑，留白克制但绝不拥挤；补充 @media print 保证背景色与分栏在打印时保留。`,
  },
  {
    id: "report",
    name: "年度报告",
    category: "文档知识/年度报告",
    accent: "#2f4f4f",
    description: "现代数字年度报告，暖白底自然色调，衬线与无衬线混搭，适合数据叙事",
    previewHtml: canvas(
      `background:#faf9f6;font-family:${SANS};color:#2c2c2c;`,
      abs(`left:30px;top:24px;font-size:9px;font-weight:600;letter-spacing:3px;color:#2f4f4f;`, "ANNUAL REPORT") +
        abs(`left:30px;top:46px;font-family:${SERIF};font-size:31px;font-weight:700;line-height:1.22;`, "2026<br>可持续发展报告") +
        abs(`left:30px;top:138px;width:176px;`, textLines([100, 90, 64], "#d6d3cb", 4, 7)) +
        abs(
          `right:30px;top:28px;width:180px;text-align:right;`,
          `<div style="font-family:${SERIF};font-size:62px;font-weight:700;color:#2f4f4f;line-height:1;letter-spacing:-2px;">42%</div><div style="font-size:11px;color:#57534e;margin-top:5px;">碳排放强度同比下降</div>`,
        ) +
        abs(
          `right:30px;top:126px;width:180px;`,
          barChart([92, 84, 78, 66, 58, 48], { height: 64, color: "#b7c4b4", highlight: "#2f4f4f", gap: 8, radius: 1 }) +
            `<div style="display:flex;justify-content:space-between;font-size:8px;color:#a8a29e;margin-top:4px;"><span>2021</span><span>2026</span></div>`,
        ) +
        abs(
          `left:30px;right:30px;bottom:20px;display:flex;gap:34px;border-top:1px solid #d6d3cb;padding-top:12px;`,
          [
            ["1.2 亿", "减排投入（元）"],
            ["86 城", "业务覆盖"],
            ["3,400 人", "员工志愿者"],
          ]
            .map(([v, k]) => `<div><div style="font-family:${SERIF};font-size:19px;font-weight:700;color:#2f4f4f;">${v}</div><div style="font-size:9px;color:#78756c;margin-top:2px;">${k}</div></div>`)
            .join(""),
        ),
    ),
    style: `【视觉主题】故事驱动的现代数字年度报告：像一本高端商业杂志，一页一个洞察
  【色彩系统】
   - 底色：暖调纸白 #faf9f6 或 #f5f5f0，避免刺眼的纯白；章节页可整页使用强调色并反白。
   - 文本：深灰 #2c2c2c（不用纯黑），说明 #57534e，注释 #78756c，分隔线 #d6d3cb。
   - 强调色：成熟自然的墨绿 #2f4f4f，用于核心数字、图表主系列和章节标记；辅以同色系浅档 #b7c4b4 和一种大地色（陶土 #b4532a 或赭黄 #b08d57）标记次要数据。
  【字体与字号】
   - 标题与核心数字用古典衬线体（Georgia / Noto Serif SC / 宋体），传达权威感与人文感；正文和图表标注用高可读的无衬线体。
   - 字号阶梯：封面标题 44-56px 行高 1.2，章节标题 30-36px，核心数字 56-80px 字重 700、字距 -0.02em，导语 18-20px，正文 15-16px 行高 1.75，图表标注 11-12px。
  【间距与形状】
   - 极其慷慨的页边距（不小于页面宽度的 8%）和段落间距；正文栏宽不超过 640px。
   - 全部直角或 2px 圆角；不用阴影和卡片边框；分组只靠 1px 细线与留白。
  【组件特征】
   ${PAGE_RULE}
   - 核心数据：醒目的大号衬线数字 + 一行解释，取代密集的传统表格；一页不超过 4 组。
   - 图表：用 HTML/CSS 绘制的柱状、条形和折线图，只有两档颜色（主系列墨绿、对比系列浅绿），最新一期高亮，坐标标注从简。
   - 指标行：页面底部一排 3-4 组“衬线数字 + 说明”，上方压一条细线。
   - 引言页：高管寄语用大号衬线引文 + 署名；案例页为“图片 + 小标题 + 一段故事”。
   - 页眉：全大写的小字栏目名（字距 0.25em）；页脚：报告名与页码。
  【版式池】封面 / 致辞与引言 / 年度亮点数字 / 章节扉页 / 图表 + 解读 / 案例故事 / 数据附表 / 展望与承诺。
  【禁忌】不用高饱和的撞色和渐变；不把所有数据堆进一张大表；图表不超过两种颜色。
  【布局原则】单页突出一个核心洞察，内容结构化且叙事清晰；数字先行，解释紧随其后。`,
  },
  {
    id: "academic-paper",
    name: "学术论文",
    category: "文档知识/学术论文",
    accent: "#374151",
    description: "论文式阅读排版，摘要、章节、脚注、图表题注和参考文献清晰",
    previewHtml: canvas(
      `background:#e5e7eb;font-family:${SONGTI};color:#111827;`,
      abs(
        `left:50px;right:50px;top:16px;bottom:-30px;box-sizing:border-box;background:#ffffff;box-shadow:0 10px 30px rgba(17,24,39,0.14);padding:22px 30px;`,
        `<div style="text-align:center;font-size:16px;font-weight:700;line-height:1.4;">基于注意力机制的长文本摘要方法研究</div>` +
          `<div style="text-align:center;font-size:9px;margin-top:6px;">林澈<sup>1</sup>　周宁<sup>2</sup></div>` +
          `<div style="text-align:center;font-size:7px;color:#6b7280;margin-top:3px;">1. 计算机科学与技术学院　2. 人工智能研究院</div>` +
          `<div style="margin:11px 26px 0;display:flex;gap:6px;"><b style="font-size:8px;flex:none;">摘　要</b><div style="flex:1;padding-top:3px;">${textLines([100, 100, 100, 62], "#d1d5db", 3, 5)}</div></div>` +
          `<div style="margin:7px 26px 0;font-size:7px;"><b>关键词</b>　文本摘要；注意力机制；预训练模型</div>` +
          `<div style="height:1px;background:#111827;margin:11px 0 10px;"></div>` +
          `<div style="display:flex;gap:16px;">` +
          `<div style="flex:1;"><div style="font-size:9px;font-weight:700;margin-bottom:7px;">1　引言</div>${textLines([100, 100, 96, 100, 100, 70], "#d1d5db", 3, 5)}</div>` +
          `<div style="flex:1;"><div style="border:1px solid #9ca3af;padding:6px 6px 2px;">${lineChart([12, 18, 17, 26, 31, 38, 41], { width: 140, height: 34, stroke: "#374151", strokeWidth: 1.5 })}</div><div style="text-align:center;font-size:7px;color:#374151;margin-top:4px;">图 1　不同模型的 ROUGE 得分</div></div>` +
          `</div>`,
      ),
    ),
    style: `【视觉主题】学术论文与研究手稿：严谨、安静、为长文阅读和打印而排
  【色彩系统】
   - 底色：纸面纯白 #ffffff（页面外背景 #e5e7eb，打印时不显示）。
   - 文本：正文 #111827，作者单位、题注和脚注 #6b7280，表格与分隔线 #9ca3af / #111827。
   - 强调色：中性深灰 #374151 或深蓝 #1e3a8a（仅用于链接、引用编号和图表主线），整页保持黑白灰的印刷感。
  【字体与字号】
   - 中文正文用宋体，标题用黑体或加粗宋体，摘要与图表题注可用楷体或小一号宋体；英文与数字用 Times New Roman；公式用斜体变量。
   - 字号阶梯（屏幕阅读）：论文标题 24-28px 字重 700 居中，作者 14px，单位 12px，一级标题 18px，二级 16px，正文 15-16px 行高 1.8、两端对齐、首行缩进两字，摘要 14px，题注与脚注 12-13px。
  【间距与形状】
   - 页面定宽 A4 比例，正文栏宽 680-720px，页边距不小于 56px；可选双栏正文（栏间距 24-32px）。
   - 全部直角，不用卡片、底色块和阴影；分隔只用 1px 黑线。
  【组件特征】
   ${PAGE_RULE}
   - 题头：居中标题 → 作者（上标编号）→ 单位 → 摘要（“摘　要”加粗，正文左右各缩进两字）→ 关键词（分号分隔）→ 一条通栏细线。
   - 章节编号：“1　引言”“1.1　研究背景”，编号与标题之间空一格全角空格。
   - 图：1px 边框内放图，题注在图的下方（“图 1　……”）；表：三线表（顶线、栏目线、底线），题注在表的上方（“表 1　……”）。
   - 公式居中并右对齐编号；引用用方括号数字 [1]；脚注置于页面底部并用短横线隔开。
   - 参考文献按出现顺序编号，悬挂缩进，字号小一号。
  【页面结构】题头（标题、作者、单位、摘要、关键词）→ 引言 → 相关工作 → 方法 → 实验与结果（图表）→ 讨论 → 结论 → 致谢 → 参考文献。
  【禁忌】不做装饰卡片、彩色标签和图标；不用彩色背景突出段落；题注不能离开对应的图表。
  【布局原则】适合研究摘要、论文预印本、学术报告；优先阅读和打印，不追求视觉冲击。`,
  },
  {
    id: "product-spec",
    name: "产品规格书",
    category: "文档知识/产品文档",
    accent: "#2563eb",
    description: "PRD/规格书风格，目录、需求表、状态标签、流程和验收标准完整",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#111827;`,
      abs(
        `left:0;right:0;top:0;height:68px;box-sizing:border-box;border-bottom:1px solid #e2e8f0;padding:14px 22px;`,
        `<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:${MONO};font-size:9px;color:#2563eb;background:#eff6ff;border-radius:4px;padding:2px 7px;">PRD-2026-018</span><span style="font-size:9px;font-weight:700;color:#b45309;background:#fef3c7;border-radius:999px;padding:2px 8px;">评审中</span><span style="margin-left:auto;font-size:9px;color:#64748b;">v1.2 · 负责人 林澈</span></div>` +
          `<div style="font-size:17px;font-weight:700;margin-top:7px;">会员等级体系 2.0 需求规格</div>`,
      ) +
        abs(
          `left:32px;top:84px;width:92px;font-size:10px;line-height:2.15;color:#64748b;`,
          ["1 背景与目标", "2 用户故事", "3 需求列表", "4 业务流程", "5 验收标准", "6 开放问题"]
            .map((t, i) => `<div style="${i === 2 ? "color:#2563eb;font-weight:700;border-left:2px solid #2563eb;padding-left:8px;margin-left:-10px;" : ""}">${t}</div>`)
            .join(""),
        ) +
        abs(
          `left:140px;right:22px;top:84px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;font-size:9px;`,
          `<div style="display:grid;grid-template-columns:38px 1fr 40px 50px;gap:8px;padding:7px 10px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;color:#64748b;"><span>编号</span><span>需求</span><span>优先级</span><span>状态</span></div>` +
            (
              [
                ["R-01", "成长值规则重构", "P0", "已评审"],
                ["R-02", "等级权益配置后台", "P0", "开发中"],
                ["R-03", "降级保护期", "P1", "开发中"],
                ["R-04", "等级勋章展示", "P2", "待定"],
                ["R-05", "历史数据迁移", "P1", "已评审"],
              ] as Array<[string, string, "P0" | "P1" | "P2", "已评审" | "开发中" | "待定"]>
            )
              .map(([id, n, p, s]) => {
                const pc = { P0: "color:#dc2626;background:#fee2e2;", P1: "color:#b45309;background:#fef3c7;", P2: "color:#475569;background:#f1f5f9;" }[p];
                const sc = { 已评审: "color:#15803d;background:#dcfce7;", 开发中: "color:#1d4ed8;background:#dbeafe;", 待定: "color:#475569;background:#f1f5f9;" }[s];
                return `<div style="display:grid;grid-template-columns:38px 1fr 40px 50px;gap:8px;align-items:center;padding:7px 10px;border-bottom:1px solid #f1f5f9;"><span style="font-family:${MONO};color:#64748b;">${id}</span><span style="font-weight:600;">${n}</span><span><b style="${pc}border-radius:4px;padding:1px 6px;">${p}</b></span><span><b style="${sc}border-radius:999px;padding:1px 7px;font-weight:600;">${s}</b></span></div>`;
              })
              .join(""),
        ),
    ),
    style: `【视觉主题】产品规格书与 PRD：结构化、可评审、可执行，让团队一眼看懂范围、状态和下一步
  【色彩系统】
   - 底色：白 #ffffff，辅助区块 #f8fafc，描边 #e2e8f0，行分隔 #f1f5f9。
   - 文本：主文本 #111827，说明 #64748b。
   - 强调色：蓝 #2563eb（浅底 #eff6ff），用于文档编号、当前目录项、链接和流程主线。
   - 状态与优先级（浅底配同色系深字，全篇统一）：P0 红 #dc2626 / #fee2e2，P1 琥珀 #b45309 / #fef3c7，P2 灰 #475569 / #f1f5f9；已评审绿 #15803d / #dcfce7，开发中蓝 #1d4ed8 / #dbeafe，待定灰。
  【字体与字号】
   - 现代无衬线体；文档编号、需求编号、字段名和接口路径用等宽字体。
   - 字号阶梯：文档标题 26-30px 字重 700，一级标题 20-22px（带编号“1 背景与目标”），二级 16-18px，正文 14-15px 行高 1.7，表格 13-14px，标签 12px。
  【间距与形状】
   - 圆角：表格与区块 8px，优先级标签 4px，状态标签全圆角。
   - 表格和区块用 1px 描边，不用阴影；表头浅灰底、加粗、灰字。
   - 长文为“左侧目录 + 右侧定宽阅读区（760-840px）”；章节间距 40px。
  【组件特征】
   ${PAGE_RULE}
   - 文档头：等宽编号徽标 + 状态徽标 + 版本与负责人 → 文档标题 → 一条分隔线；其后可跟变更记录表。
   - 目录：带编号的章节列表，当前章节用 2px 左侧蓝线和蓝色加粗文字标出。
   - 需求表：列为“编号 / 需求 / 优先级 / 状态 / 负责人”，每行一个需求，说明不超过两行。
   - 用户故事卡：“作为…我希望…以便…”；流程图用圆角步骤块加箭头，以 HTML/CSS 绘制。
   - 验收标准：可勾选的清单，按“给定…当…那么…”书写；风险提示块用琥珀色左边线；开放问题列表标明提出人和截止日期。
  【页面结构】文档头与变更记录 → 背景与目标（含成功指标）→ 用户故事 → 需求列表 → 业务流程 → 界面与交互说明 → 验收标准 → 风险与依赖 → 开放问题。
  【禁忌】不写没有编号、无法追踪的需求；状态色不挪作装饰；不用营销式大标题和插画。
  【布局原则】适合产品方案、技术规格、项目需求；表格信息密度适中，每个需求都能定位、能验收。`,
  },
  {
    id: "gov-doc",
    name: "公文排版",
    category: "文档知识/公文文档",
    accent: "#c0202c",
    description: "符合 GB/T 9704-2012 标准的党政机关公文排版，红头文件、发文字号、密级标注、仿宋正文",
    previewHtml: canvas(
      `background:#e5e7eb;font-family:${FANGSONG};color:#000000;`,
      abs(
        `left:70px;right:70px;top:16px;bottom:-30px;box-sizing:border-box;background:#ffffff;box-shadow:0 10px 30px rgba(17,24,39,0.14);padding:20px 30px;`,
        `<div style="display:flex;justify-content:space-between;font-family:${SANS};font-size:8px;"><span>000018</span><span style="font-weight:700;">特急</span></div>` +
          `<div style="text-align:center;font-family:${SONGTI};font-size:27px;font-weight:700;color:#c0202c;letter-spacing:3px;margin-top:14px;white-space:nowrap;">××市人民政府文件</div>` +
          `<div style="text-align:center;font-size:10px;margin-top:14px;">×政发〔2026〕18 号</div>` +
          `<div style="height:2px;background:#c0202c;margin-top:8px;"></div>` +
          `<div style="text-align:center;font-family:${SONGTI};font-size:14px;font-weight:700;line-height:1.5;margin-top:16px;">关于印发《数字化转型三年<br>行动方案》的通知</div>` +
          `<div style="font-size:10px;margin-top:12px;">各区人民政府，市政府各部门：</div>` +
          `<div style="margin-top:9px;padding-left:20px;">${textLines([100], "#9ca3af", 3, 7)}</div>` +
          `<div style="margin-top:7px;">${textLines([100, 100, 60], "#9ca3af", 3, 7)}</div>`,
      ),
    ),
    style: `【视觉主题】党政机关公文：参照 GB/T 9704-2012《党政机关公文格式》，庄重、规范、适合打印归档
  【色彩系统】
   - 纸面纯白 #ffffff；页面外背景浅灰（打印时不显示）。
   - 公文红 #c0202c：只用于发文机关标志（红头）、红色分隔线和印章。
   - 其余文字一律纯黑 #000000，不使用灰色、彩色和任何背景色块。
  【字体与字号】（屏幕上按 1 磅约等于 1.333px 换算）
   - 发文机关标志：小标宋体或宋体加粗，红色，居中，字号以美观醒目为准（约 26-35 磅），可适当加字距。
   - 公文标题：2 号小标宋体或宋体加粗（约 29px），居中，可分多行，回行时词意完整、排列对称。
   - 正文：3 号仿宋（约 21px），字体栈为 FangSong, 仿宋, STFangsong, serif；每行约 28 字、每页约 22 行，行距固定 28-30 磅，两端对齐，首行缩进两字。
   - 层次序数依次为“一、”“（一）”“1.”“（1）”：第一层用黑体，第二层用楷体，第三、四层用仿宋。
   - 份号、密级、紧急程度用 3 号黑体；发文字号、主送机关、落款用 3 号仿宋。
  【间距与形状】
   - 页面为 A4 竖版（210mm × 297mm），页边距上 37mm、下 35mm、左 28mm、右 26mm；屏幕上用定宽容器等比呈现。
   - 全部直角，没有卡片、阴影、圆角和装饰线；唯一的线是发文字号下方的通栏红色分隔线（约 2px）和版记中的黑色细线。
  【组件特征】（全部用标准 HTML 标签和内联 CSS 实现，不要使用任何自定义标签）
   ${PAGE_RULE}
   - 版头：左上角顶格依次为份号、密级和保密期限、紧急程度（没有可省略）→ 居中的红色发文机关标志 → 空两行后居中的发文字号（如“×政发〔2026〕18 号”，年份用六角括号）→ 红色分隔线。上行文在发文字号同一行右侧标注“签发人：姓名”。
   - 主体：标题（居中）→ 主送机关（左顶格，末尾用全角冒号）→ 正文 → 附件说明（正文下空一行，左空两字“附件：1. ……”）→ 发文机关署名与成文日期（右对齐，日期用阿拉伯数字，如“2026年9月12日”）→ 印章（红色圆形，压在署名与日期上，可用 CSS 圆环示意）。
   - 版记：页面底部，抄送机关、印发机关和印发日期，上下各有一条黑色细线。
   - 页码：4 号半角宋体数字，两侧各一条一字线（如“— 1 —”），单页居右、双页居左。
  【页面结构】版头 → 标题 → 主送机关 → 正文（缘由、事项、要求）→ 附件说明 → 落款与印章 → 版记。
  【禁忌】不加任何网页式装饰（图标、色块、渐变、阴影）；不改动红头与正文的字体分工；不用“您好”“谢谢”等书信用语；标题中除法规名称加书名号外一般不用标点。
  【布局原则】严格遵循公文格式规范，适合打印、归档、正式发文；补充 @media print 并设置 @page 的纸张与页边距。`,
  },
];
