import type { RawDesignStyle } from "../types";
import { MONO, SANS, SERIF, abs, barChart, canvas, codeLines, el, lineChart, textLines } from "../previewKit";

const SLIDE_RULE = '- **强制分页容器**：每一页必须使用 `<section class="slide">` 包裹，16:9 比例。';
const FIT_RULE = "- 防溢出：大标题用 `clamp()` 或 `min(vw, vh)` 约束字号且不超过两行；单页主内容区高度不超过 380px，放不下就拆页。";

export const presentationStyles: RawDesignStyle[] = [
  {
    id: "ppt-slide",
    name: "基础幻灯片",
    category: "演示汇报/基础幻灯",
    accent: "#2563eb",
    description: "通用 16:9 横版幻灯片，适合作为空白起点",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#0f172a;`,
      abs(`left:0;top:0;bottom:0;width:10px;background:#2563eb;`) +
        abs(`left:44px;top:36px;font-size:11px;font-weight:700;letter-spacing:3px;color:#2563eb;`, "QUARTERLY REVIEW") +
        abs(`left:44px;top:72px;font-size:42px;font-weight:800;line-height:1.16;letter-spacing:-1px;`, "季度业务<br>汇报") +
        abs(`left:44px;top:192px;width:150px;`, textLines([100, 70], "#cbd5e1")) +
        abs(
          `right:36px;top:54px;width:176px;height:184px;box-sizing:border-box;padding:22px 20px;background:#eff6ff;border-radius:14px;display:flex;flex-direction:column;justify-content:space-between;`,
          [1, 2, 3]
            .map(
              (n) =>
                `<div style="display:flex;align-items:center;gap:12px;"><div style="width:30px;height:30px;border-radius:50%;background:#2563eb;color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;">${n}</div><div style="flex:1;">${textLines([100, 60], "#93c5fd", 5, 6)}</div></div>`,
            )
            .join(""),
        ) +
        abs(`left:44px;bottom:24px;font-size:11px;color:#94a3b8;letter-spacing:1px;`, "2026 · Q3") +
        abs(`right:36px;bottom:24px;font-size:11px;color:#94a3b8;`, "01 / 12"),
    ),
    style: `【视觉主题】通用商务幻灯片：干净、稳妥、信息清楚，可作为任何汇报的起点
  【色彩系统】
   - 底色：纯白 #ffffff；章节页可整页使用深蓝 #0f172a 并反白文字。
   - 表面：浅蓝 #eff6ff 用于要点卡和数据块，分割线 #e2e8f0。
   - 文本：标题 #0f172a，正文 #334155，注释 #94a3b8。
   - 强调色：可信蓝 #2563eb，只用于编号、关键数字、页眉标签和一条侧边色带。
  【字体与字号】
   - 全程现代无衬线体；标题字重 700-800，正文 400。
   - 字号阶梯：封面标题 clamp(32px, 5vw, 48px)，页标题 clamp(22px, 3.2vw, 30px)，正文 16-18px，注释 12px。
   ${FIT_RULE}
  【间距与形状】
   - 页面内边距左右 32px、上下 24-32px；卡片圆角 12px，不用阴影。
   - 间距按 8px 倍数取值，同级元素对齐到同一条左边线。
  【组件特征】
   ${SLIDE_RULE}
   - 页眉：左上角英文小标签（字距 2-3px），右下角页码“01 / 12”。
   - 要点列表：圆形编号 + 一句话要点，每页不超过 4 条。
   - 数据块：大数字 + 单位 + 一行说明。
  【版式池】封面（左标题、右要点卡）/ 目录 / 章节页（深蓝反白）/ 左文右图 / 三栏要点 / 数据大字 / 结束页。
  【禁忌】不要渐变背景、艺术字和剪贴画式图标；一页只讲一件事，正文超过 60 字就拆页。
  【布局原则】单页信息少而准，大面积留白；封面居左对齐，内容页用左右分栏或上下结构。`,
  },
  {
    id: "keynote-cinematic",
    name: "电影发布会",
    category: "演示汇报/发布会",
    accent: "#f59e0b",
    description: "Keynote 式大屏演示，深色舞台、超大标题、强节奏单页信息",
    previewHtml: canvas(
      `background:radial-gradient(ellipse 70% 60% at 50% 118%, rgba(245,158,11,0.45), rgba(245,158,11,0) 70%), linear-gradient(180deg,#05070c 0%,#0b1020 100%);font-family:${SANS};color:#f8fafc;text-align:center;`,
      abs(`left:0;right:0;top:42px;font-size:11px;font-weight:700;letter-spacing:5px;color:#f59e0b;`, "SPECIAL EVENT · 2026") +
        abs(`left:0;right:0;top:90px;font-size:52px;font-weight:800;letter-spacing:-1.5px;line-height:1.1;`, "One more thing.") +
        abs(`left:0;right:0;top:162px;font-size:15px;color:#cbd5e1;`, "下一代内容发布方式，从今天开始") +
        abs(`left:215px;top:206px;width:50px;height:2px;background:#f59e0b;`) +
        abs(`left:32px;bottom:22px;font-size:10px;letter-spacing:2px;color:#64748b;`, "LIVE FROM THE THEATER") +
        abs(`right:32px;bottom:22px;font-size:10px;letter-spacing:2px;color:#f59e0b;`, "01"),
    ),
    style: `【视觉主题】电影级产品发布会：深色舞台、一束光、一句话，适合大屏演讲与发布稿
  【色彩系统】
   - 底色：深黑蓝 #05070c，向 #0b1020 的纵向暗渐变；底部可有一束低饱和的舞台光晕。
   - 文本：主标题近白 #f8fafc，说明文字 #cbd5e1，角标 #64748b。
   - 强调色：金色 #f59e0b（或电光蓝 #38bdf8，二选一），只用于关键词、小标签、细线和页码。
  【字体与字号】
   - 无衬线粗体，标题字重 700-800、字距 -0.02em；小标签全大写、字距 0.3em。
   - 字号阶梯：主标题 clamp(40px, 7vw, 72px)，副标题 18-20px，角标 11px。
   ${FIT_RULE}
  【间距与形状】
   - 内容整体居中，四周留白不少于画面的 15%；不使用卡片和边框，靠留白分组。
   - 唯一的装饰是一条 2px 短横线或一束光，不叠加第二种装饰。
  【组件特征】
   ${SLIDE_RULE}
   - 单页限制：1 个主标题、1 个副标题，最多 3 个要点。
   - 数字页：一个巨大的数字 + 一行解释。
   - 图片页：整页出血大图 + 底部暗角，文字压在暗角上并保持清晰。
  【版式池】开场标题 / 一句话观点 / 巨型数字 / 产品特写 / 三项对比 / 引用页 / “One more thing” / 结尾口号。
  【禁忌】不要小字堆叠、表格和密集列表；不要多种强调色；光效不能压住文字。
  【布局原则】封面强冲击，内容页大留白，结尾页只留一句总结或行动口号。`,
  },
  {
    id: "consulting-deck",
    name: "咨询汇报",
    category: "演示汇报/咨询顾问",
    accent: "#1d4ed8",
    description: "咨询公司式汇报页，结论先行、矩阵图、分栏和数据证据清楚",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#111827;padding:26px 30px;`,
      el(`font-size:10px;font-weight:700;letter-spacing:2px;color:#1d4ed8;`, "核心结论") +
        el(`margin-top:6px;font-size:21px;font-weight:700;line-height:1.3;`, "华东市场贡献了 62% 的增量收入") +
        el(`margin-top:12px;height:2px;background:#1d4ed8;`) +
        el(
          `margin-top:16px;display:flex;gap:24px;`,
          el(
            `width:150px;height:140px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4px;`,
            el(`background:#f1f5f9;position:relative;`, abs(`left:22px;top:30px;width:10px;height:10px;border-radius:50%;background:#94a3b8;`)) +
              el(`background:#1d4ed8;position:relative;`, abs(`right:16px;top:14px;width:20px;height:20px;border-radius:50%;background:#ffffff;`)) +
              el(`background:#f1f5f9;position:relative;`, abs(`left:36px;top:20px;width:8px;height:8px;border-radius:50%;background:#94a3b8;`)) +
              el(`background:#e2e8f0;position:relative;`, abs(`left:20px;top:26px;width:14px;height:14px;border-radius:50%;background:#64748b;`)),
          ) +
            el(
              `flex:1;`,
              `<div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:36px;font-weight:800;color:#1d4ed8;letter-spacing:-1px;line-height:1;">+18.4%</span><span style="font-size:11px;color:#6b7280;">收入同比</span></div>` +
                `<div style="margin-top:14px;height:88px;display:flex;align-items:flex-end;gap:10px;border-bottom:1px solid #cbd5e1;">` +
                `<div style="flex:1;height:36px;background:#94a3b8;"></div>` +
                `<div style="flex:1;height:18px;margin-bottom:36px;background:#1d4ed8;"></div>` +
                `<div style="flex:1;height:16px;margin-bottom:54px;background:#1d4ed8;"></div>` +
                `<div style="flex:1;height:9px;margin-bottom:61px;background:#dc2626;"></div>` +
                `<div style="flex:1;height:61px;background:#111827;"></div>` +
                `</div>`,
            ),
        ) +
        abs(
          `left:30px;right:30px;bottom:16px;display:flex;justify-content:space-between;font-size:9px;color:#9ca3af;`,
          `<span>资料来源：2026 年内部经营数据</span><span>07</span>`,
        ),
    ),
    style: `【视觉主题】咨询公司董事会汇报：结论先行、结构严谨、每个判断都有证据
  【色彩系统】
   - 底色：纯白 #ffffff，辅助背景 #f8fafc / #f1f5f9。
   - 文本：标题 #111827，正文 #374151，注释 #6b7280，脚注 #9ca3af。
   - 强调色：商务蓝 #1d4ed8，用于结论标签、关键数字和图表主系列；风险或下降只用克制红 #dc2626。
  【字体与字号】
   - 现代无衬线体，数字使用 tabular-nums。
   - 字号阶梯：页标题（结论句）clamp(20px, 2.8vw, 28px) 字重 700，正文 14-16px，图表标注 11-12px，脚注 10px。
   ${FIT_RULE}
  【间距与形状】
   - 页面内边距 28-32px；标题下方一条 2px 蓝色通栏线，把结论与证据分开。
   - 直角或 2px 圆角，不用阴影；图表之间留 24px 间距。
  【组件特征】
   ${SLIDE_RULE}
   - 标题必须是完整结论句（如“华东市场贡献了 62% 的增量收入”），不能只写章节名。
   - 图表：2×2 矩阵、瀑布图、堆叠柱、路线图全部用 HTML/CSS 绘制；表格有清晰表头和右对齐数字。
   - 每页底部左侧写“资料来源”，右侧写页码。
  【版式池】执行摘要 / 结论 + 单图 / 左图右解读 / 2×2 矩阵 / 瀑布拆解 / 方案对比表 / 实施路线 / 下一步与决策项。
  【禁忌】不要装饰性图标、渐变和动画；一页不超过一个核心结论；不出现没有来源的数据。
  【布局原则】适合战略汇报、经营复盘、项目方案；自上而下是“结论 → 证据 → 来源”。`,
  },
  {
    id: "startup-pitch",
    name: "创业路演",
    category: "演示汇报/年轻路演",
    accent: "#ff4d8d",
    description: "年轻清爽的 Pitch Deck，故事线、市场机会和产品证据突出",
    previewHtml: canvas(
      `background:#171329;font-family:${SANS};color:#ffffff;`,
      abs(`right:-70px;top:-70px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(255,77,141,0.34),rgba(255,77,141,0) 70%);`) +
        abs(
          `left:32px;top:30px;padding:5px 12px;border-radius:999px;background:rgba(255,77,141,0.16);color:#ff4d8d;font-size:10px;font-weight:700;letter-spacing:2px;`,
          "SEED ROUND · 2026",
        ) +
        abs(
          `left:32px;top:72px;font-size:33px;font-weight:800;line-height:1.24;letter-spacing:-0.5px;`,
          `让每家小店<br>都有<span style="color:#ff4d8d;">增长引擎</span>`,
        ) +
        abs(`left:32px;top:170px;font-size:12px;color:#cbd5e1;`, "为 600 万线下门店提供智能经营助手") +
        abs(
          `right:30px;top:66px;text-align:right;`,
          `<div style="font-size:11px;color:#a5b4fc;letter-spacing:1px;">本轮融资</div><div style="font-size:38px;font-weight:800;letter-spacing:-1px;line-height:1.2;">$4.5M</div>`,
        ) +
        abs(`right:30px;top:140px;`, lineChart([8, 10, 13, 12, 18, 24, 31, 44], { width: 150, height: 46, stroke: "#ff4d8d", fill: "rgba(255,77,141,0.14)", strokeWidth: 2.5 })) +
        abs(
          `left:32px;right:30px;bottom:24px;display:flex;gap:10px;`,
          [
            ["市场规模", "¥120B"],
            ["月增长", "32%"],
            ["12 月留存", "68%"],
          ]
            .map(
              ([k, v]) =>
                `<div style="flex:1;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);"><div style="font-size:10px;color:#a5b4fc;">${k}</div><div style="font-size:17px;font-weight:800;margin-top:2px;">${v}</div></div>`,
            )
            .join(""),
        ),
    ),
    style: `【视觉主题】年轻创业团队路演：清爽、有冲劲，但每一页都站得住
  【色彩系统】
   - 底色：整份作品二选一，深紫灰 #171329 或亮白 #ffffff。
   - 表面：深底用 rgba(255,255,255,0.06) 加 1px rgba(255,255,255,0.1) 描边，浅底用 #f8f7ff。
   - 文本：深底 #ffffff / #cbd5e1，浅底 #111827 / #4b5563。
   - 强调色：玫红 #ff4d8d 为主，靛紫 #8b5cf6、亮青 #22d3ee 为辅，单页最多出现两种。
  【字体与字号】
   - 现代圆润无衬线体，标题字重 800、短促有力；数字比文字大一号。
   - 字号阶梯：封面标题 clamp(30px, 4.8vw, 48px)，页标题 clamp(22px, 3vw, 30px)，正文 15-16px，标签 11px。
   ${FIT_RULE}
  【间距与形状】
   - 卡片圆角 12px，标签用全圆角胶囊；页面内边距 32px。
   - 允许一处柔和的圆形色晕作为背景氛围，面积不超过画面四分之一。
  【组件特征】
   ${SLIDE_RULE}
   - 每页只回答一个路演问题：痛点、方案、市场、商业模式、增长、团队、融资。
   - 大号数字卡（指标名 + 数值）、增长曲线、产品界面框、投资亮点胶囊标签。
   - 市场规模用同心圆或三段条表达 TAM / SAM / SOM。
  【版式池】封面（一句话定位 + 融资额）/ 痛点 / 解决方案 / 产品演示 / 市场规模 / 增长数据 / 商业模式 / 团队 / 融资需求。
  【禁忌】不要空泛口号和没有出处的数据；不要多色堆叠和表情符号；团队页不放大段简历。
  【布局原则】适合融资 BP、Demo Day、创新项目汇报；视觉年轻，信息结构必须稳。`,
  },
  {
    id: "neon-tech-launch",
    name: "科技产品发布",
    category: "演示汇报/科技发布",
    accent: "#00e5ff",
    description: "高科技发布会风，深色舞台、产品能力、规格参数和路线图清晰",
    previewHtml: canvas(
      `background-color:#050816;background-image:linear-gradient(rgba(0,229,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.07) 1px,transparent 1px);background-size:30px 30px;font-family:${SANS};color:#e2e8f0;`,
      abs(`left:28px;top:24px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:2px;color:#00e5ff;`, "LAUNCH EVENT / 2026") +
        abs(`right:28px;top:22px;padding:3px 9px;border:1px solid rgba(0,229,255,0.5);border-radius:4px;font-family:${MONO};font-size:10px;color:#00e5ff;`, "v2.0") +
        abs(`left:28px;top:66px;font-size:50px;font-weight:800;letter-spacing:1px;line-height:1.1;color:#ffffff;`, "NOVA X1") +
        abs(`left:28px;top:128px;font-size:14px;color:#94a3b8;`, "新一代端侧 AI 工作站") +
        abs(
          `right:28px;top:62px;width:150px;height:100px;border:1px solid #00e5ff;border-radius:12px;box-shadow:0 0 24px rgba(0,229,255,0.25);`,
          abs(`left:12px;right:12px;top:12px;bottom:26px;border-radius:6px;background:linear-gradient(135deg,rgba(0,229,255,0.28),rgba(139,92,246,0.28));`) +
            abs(`left:55px;right:55px;bottom:11px;height:3px;border-radius:2px;background:#00e5ff;`),
        ) +
        abs(
          `left:28px;right:28px;bottom:24px;display:grid;grid-template-columns:repeat(4,1fr);border:1px solid rgba(0,229,255,0.25);border-radius:8px;background:rgba(5,8,22,0.8);`,
          [
            ["12 核", "处理器"],
            ["45 TOPS", "NPU"],
            ["22 h", "续航"],
            ["1.1 kg", "重量"],
          ]
            .map(
              ([v, k], i) =>
                `<div style="padding:10px 12px;${i ? "border-left:1px solid rgba(0,229,255,0.25);" : ""}"><div style="font-family:${MONO};font-size:15px;font-weight:700;color:#ffffff;">${v}</div><div style="font-size:10px;color:#64748b;margin-top:3px;">${k}</div></div>`,
            )
            .join(""),
        ),
    ),
    style: `【视觉主题】高科技产品发布会：未来感来自结构、节奏和产品本身，而不是装饰
  【色彩系统】
   - 底色：深黑蓝 #050816 或 #08111f，可叠加 30px 间距、透明度 7% 以下的细网格。
   - 文本：产品名纯白 #ffffff，正文 #e2e8f0，说明 #94a3b8，弱标注 #64748b。
   - 强调色：电青 #00e5ff 为主，冷蓝 #3b82f6、克制紫 #8b5cf6 只用于渐变和次要系列。
   - 边框与高光：1px 细描边加一圈弱外发光，禁止大面积刺眼光晕。
  【字体与字号】
   - 几何无衬线体；参数、版本号、规格值使用等宽字体。
   - 字号阶梯：产品名 clamp(40px, 7vw, 68px) 字重 800，能力标题 20-24px，参数值 16-20px 等宽，标注 11px。
   ${FIT_RULE}
  【间距与形状】
   - 圆角 8-12px，面板为半透明深色加 1px 电青描边（透明度 25%-50%）。
   - 页面内边距 28-32px，规格矩阵用等宽分栏和竖向细线分隔。
  【组件特征】
   ${SLIDE_RULE}
   - 产品框线：线框勾勒的设备或界面轮廓，内部用双色渐变填充。
   - 规格矩阵：一行 3-4 格，每格“数值 + 指标名”。
   - 能力芯片、版本角标、时间线路线图，全部用 HTML/CSS 绘制。
  【版式池】开场倒计时 / 产品亮相 / 核心能力三连 / 规格矩阵 / 性能对比柱 / 场景演示 / 版本路线图 / 价格与发售。
  【禁忌】不要随机光点、粒子和多色光带；不要把参数写成长段落；强调色不用于大段正文。
  【布局原则】适合 AI、新硬件、SaaS 新功能发布；层级是产品名最大、能力模块次之、参数清晰可读。`,
  },
  {
    id: "growth-review",
    name: "增长战报",
    category: "演示汇报/增长复盘",
    accent: "#22c55e",
    description: "活跃的数据复盘演示，增长指标、实验结果、行动清单一页讲透",
    previewHtml: canvas(
      `background:#f8fafc;font-family:${SANS};color:#0f172a;padding:22px 26px;`,
      `<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:10px;font-weight:700;letter-spacing:2px;color:#16a34a;">增长周报 · W36</span><span style="font-size:10px;font-weight:700;color:#15803d;background:#dcfce7;padding:3px 10px;border-radius:999px;">目标达成</span></div>` +
        el(`margin-top:8px;font-size:20px;font-weight:800;`, "本周结论：新客转化率提升 23%") +
        el(
          `margin-top:14px;display:flex;gap:10px;`,
          [
            ["新增用户", "12.8K", "+18%"],
            ["转化率", "4.6%", "+0.9pt"],
            ["获客成本", "¥38", "-12%"],
          ]
            .map(
              ([k, v, d]) =>
                `<div style="flex:1;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;"><div style="font-size:10px;color:#64748b;">${k}</div><div style="display:flex;align-items:baseline;gap:6px;margin-top:2px;"><span style="font-size:23px;font-weight:800;letter-spacing:-0.5px;">${v}</span><span style="font-size:11px;font-weight:700;color:#16a34a;">${d}</span></div></div>`,
            )
            .join(""),
        ) +
        el(
          `margin-top:12px;display:flex;gap:10px;`,
          el(`flex:1.3;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px 0;`, barChart([34, 42, 38, 55, 61, 58, 74, 92], { height: 90, color: "#bbf7d0", highlight: "#22c55e", gap: 7, radius: 3 })) +
            el(
              `flex:1;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;`,
              `<div style="font-size:10px;font-weight:700;color:#64748b;">A/B 实验</div>` +
                `<div style="display:flex;align-items:center;gap:8px;margin-top:10px;"><span style="font-size:10px;color:#64748b;width:10px;">A</span><div style="height:12px;width:58%;background:#cbd5e1;border-radius:3px;"></div><span style="font-size:10px;color:#64748b;">3.7%</span></div>` +
                `<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:10px;font-weight:700;width:10px;">B</span><div style="height:12px;width:74%;background:#22c55e;border-radius:3px;"></div><span style="font-size:10px;font-weight:700;color:#16a34a;">4.6%</span></div>`,
            ),
        ),
    ),
    style: `【视觉主题】增长团队复盘战报：积极、清爽、行动导向，数字一眼可读
  【色彩系统】
   - 底色：浅灰蓝 #f8fafc，卡片纯白 #ffffff，描边 #e2e8f0。
   - 文本：标题 #0f172a，正文 #334155，指标名 #64748b。
   - 强调色：增长绿 #22c55e（深一档 #16a34a 用于文字），行动蓝 #2563eb，提醒橙 #f97316。
   - 语义色：上涨和达成用绿，下降或风险用红 #ef4444，中性指标用灰蓝 #cbd5e1；颜色只表达语义，不做装饰。
  【字体与字号】
   - 现代无衬线体，所有数字使用 tabular-nums 保持对齐。
   - 字号阶梯：结论标题 clamp(20px, 2.8vw, 28px) 字重 800，KPI 数值 24-32px 字重 800，指标名 11-12px，正文 14px。
   ${FIT_RULE}
  【间距与形状】
   - 卡片圆角 10px、1px 描边、无阴影；卡片间距 10-12px，页面内边距 24-28px。
   - 状态标签用全圆角胶囊，浅色底配同色系深字。
  【组件特征】
   ${SLIDE_RULE}
   - 每页顶部必须是一句结论，下面用指标和实验结果支撑。
   - KPI 卡：指标名 + 大数值 + 环比变化（带正负号）。
   - 柱状趋势图突出最新一期；A/B 对照用两根横条加数值；漏斗用逐级收窄的条。
   - 行动看板：负责人 + 动作 + 截止日期，下周计划不超过 5 条。
  【版式池】一页结论 / KPI 总览 / 趋势拆解 / 渠道对比 / A/B 实验结果 / 漏斗诊断 / 行动看板 / 下周计划。
  【禁忌】不要只有数字没有结论；饼图不要切超过 5 块；不要用颜色之外的方式随意标重点。
  【布局原则】适合增长复盘、运营周报、营销战报；年轻活跃，但数据清楚、结论明确。`,
  },
  {
    id: "developer-conf",
    name: "开发者大会",
    category: "演示汇报/技术大会",
    accent: "#38bdf8",
    description: "开发者大会技术分享，深色代码感、架构图、API 示例和路线图并重",
    previewHtml: canvas(
      `background:#0b1020;font-family:${SANS};color:#e5e7eb;`,
      abs(`left:28px;top:26px;font-family:${MONO};font-size:10px;letter-spacing:2px;color:#38bdf8;`, "DEVCON 2026 · TRACK B") +
        abs(`left:28px;top:64px;font-size:30px;font-weight:800;line-height:1.26;color:#ffffff;`, "构建可观测的<br>边缘函数") +
        abs(
          `left:28px;top:156px;display:flex;align-items:center;gap:8px;`,
          `<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#a78bfa);"></div><span style="font-size:11px;color:#94a3b8;">林澈 · 平台工程</span>`,
        ) +
        abs(
          `left:28px;bottom:26px;display:flex;gap:8px;font-family:${MONO};font-size:10px;`,
          `<span style="padding:4px 9px;border:1px solid rgba(56,189,248,0.5);border-radius:5px;color:#38bdf8;">SDK v3</span><span style="padding:4px 9px;border:1px solid rgba(167,139,250,0.5);border-radius:5px;color:#a78bfa;">OpenTelemetry</span>`,
        ) +
        abs(
          `right:26px;top:40px;width:208px;height:216px;box-sizing:border-box;background:#111827;border:1px solid #1f2937;border-radius:10px;overflow:hidden;`,
          `<div style="display:flex;align-items:center;gap:6px;padding:9px 12px;border-bottom:1px solid #1f2937;"><div style="width:8px;height:8px;border-radius:50%;background:#f87171;"></div><div style="width:8px;height:8px;border-radius:50%;background:#fbbf24;"></div><div style="width:8px;height:8px;border-radius:50%;background:#34d399;"></div><span style="margin-left:6px;font-family:${MONO};font-size:9px;color:#64748b;">handler.ts</span></div>` +
            el(
              `padding:14px;`,
              codeLines(
                [
                  [0, [34, "#a78bfa"], [52, "#38bdf8"], [20, "#64748b"]],
                  [14, [28, "#a78bfa"], [40, "#e5e7eb"], [46, "#34d399"]],
                  [14, [22, "#a78bfa"], [70, "#e5e7eb"]],
                  [28, [48, "#38bdf8"], [58, "#fbbf24"]],
                  [28, [36, "#38bdf8"], [30, "#34d399"]],
                  [14, [16, "#64748b"]],
                  [14, [40, "#a78bfa"], [64, "#e5e7eb"]],
                  [0, [12, "#64748b"]],
                  [0, [96, "#475569"]],
                  [0, [30, "#a78bfa"], [44, "#38bdf8"], [36, "#fbbf24"]],
                ],
                6,
                9,
              ),
            ),
        ),
    ),
    style: `【视觉主题】开发者大会技术分享：专业、清晰，像一块调好配色的 IDE 投在舞台上
  【色彩系统】
   - 底色：深色 IDE 背景 #0b1020，面板 #111827，描边 #1f2937。
   - 文本：标题 #ffffff，正文 #e5e7eb，注释 #94a3b8，弱标注 #64748b。
   - 强调色：天空蓝 #38bdf8 为主，紫 #a78bfa 表示关键字，成功绿 #34d399，警示黄 #fbbf24；语法高亮沿用这四色。
  【字体与字号】
   - 标题用现代无衬线体；代码、API 路径、版本号、场次信息使用 JetBrains Mono / Fira Code 等等宽字体。
   - 字号阶梯：页标题 clamp(24px, 3.6vw, 36px) 字重 800，正文 15-16px，代码 13-14px 行高 1.6，角标 11px。
   ${FIT_RULE}
  【间距与形状】
   - 面板圆角 10px、1px 描边、无阴影；代码窗口顶部有三个圆点和文件名栏。
   - 页面内边距 28-32px，左文右码时两栏间距不小于 24px。
  【组件特征】
   ${SLIDE_RULE}
   - 代码窗口：单页不超过 12 行，只保留关键行，并高亮本页要讲的 1-2 行。
   - 架构图：圆角矩形节点 + 1px 连线 + 箭头，节点内只写名称。
   - API 请求/响应卡片、终端输出、发布路线图、演讲者信息条（头像 + 姓名 + 团队）。
  【版式池】主题封面 / 议程 / 问题背景 / 架构总览 / 左文右码 / 请求响应对照 / 性能对比 / 路线图 / 资源链接与问答。
  【禁忌】不要把代码塞满整页；不要截图贴代码；高亮色不超过四种。
  【布局原则】适合技术大会、SDK 发布、工程方案分享；概念标题要短，观众在远处也能看懂。`,
  },
  {
    id: "project-kickoff-rally",
    name: "项目启动动员",
    category: "演示汇报/项目动员",
    accent: "#f97316",
    description: "启动会动员风，目标、角色、节奏、里程碑和团队士气都要有画面感",
    previewHtml: canvas(
      `background:#fff7ed;font-family:${SANS};color:#1f2937;`,
      abs(`right:-90px;top:-150px;width:230px;height:230px;border-radius:40px;background:#f97316;transform:rotate(20deg);`) +
        abs(`right:44px;top:108px;width:30px;height:30px;border-radius:50%;background:#f59e0b;`) +
        abs(`left:30px;top:28px;font-size:10px;font-weight:800;letter-spacing:3px;color:#f97316;`, "PROJECT KICKOFF") +
        abs(`left:28px;top:52px;font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1.15;`, "攻坚 100 天") +
        abs(`left:30px;top:124px;font-size:14px;color:#4b5563;`, "把会员体系做成行业标杆") +
        abs(`left:38px;right:38px;top:186px;height:4px;border-radius:2px;background:#fed7aa;`) +
        abs(
          `left:30px;right:30px;top:178px;display:flex;justify-content:space-between;`,
          [
            ["W1", "启动"],
            ["W4", "内测"],
            ["W9", "灰度"],
            ["W14", "上线"],
          ]
            .map(
              ([w, t], i) =>
                `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;"><div style="width:20px;height:20px;box-sizing:border-box;border-radius:50%;background:${i === 0 ? "#f97316" : "#ffffff"};border:4px solid #f97316;"></div><div style="font-size:11px;font-weight:800;">${w}</div><div style="font-size:10px;color:#6b7280;margin-top:-4px;">${t}</div></div>`,
            )
            .join(""),
        ) +
        abs(
          `left:30px;bottom:20px;display:flex;align-items:center;`,
          ["#f97316", "#0ea5e9", "#f59e0b", "#1f2937"].map((c, i) => `<div style="width:22px;height:22px;border-radius:50%;background:${c};border:2px solid #fff7ed;margin-left:${i ? -7 : 0}px;"></div>`).join("") +
            `<span style="margin-left:10px;font-size:11px;color:#4b5563;">4 个小组 · 26 人</span>`,
        ),
    ),
    style: `【视觉主题】项目启动会与团队动员：热烈、有方向感，让人看完就知道第一周做什么
  【色彩系统】
   - 底色：暖白 #fff7ed；动员口号页可整页使用活力橙或深色 #1c1917。
   - 文本：标题 #1f2937，正文 #4b5563，弱标注 #6b7280；深底用 #ffffff / #d6d3d1。
   - 强调色：活力橙 #f97316 为主，琥珀黄 #f59e0b、清爽蓝 #0ea5e9 为辅；避免传统公文蓝。
  【字体与字号】
   - 无衬线粗黑体，标题字重 800-900、短句化；正文用短段落和行动列表。
   - 字号阶梯：口号标题 clamp(36px, 6vw, 60px)，页标题 clamp(22px, 3.2vw, 32px)，正文 15-16px，标签 11px。
   ${FIT_RULE}
  【间距与形状】
   - 大圆角色块（圆角 32-40px）可倾斜 15-20 度切入画面一角，作为唯一的大装饰。
   - 卡片圆角 12px，角色头像用圆形并可叠放；页面内边距 28-32px。
  【组件特征】
   ${SLIDE_RULE}
   - 里程碑跑道：一条横向轨道 + 等距节点，节点下写周次和交付物，当前节点实心。
   - 角色卡：头像 + 小组名 + 负责人 + 一句职责。
   - 启动清单（可勾选样式）、风险护栏（风险 + 应对）、团队承诺墙。
  【版式池】口号封面 / 为什么做 / 要做到什么（目标数字）/ 谁负责（角色卡）/ 怎么推进（里程碑跑道）/ 风险与护栏 / 第一周行动 / 承诺页。
  【禁忌】不要变成鸡血海报：每个口号后面都要有数字或动作；不要火焰、奖杯等陈旧图形。
  【布局原则】适合 Kickoff、专项行动、攻坚项目启动；叙事顺序固定为“为什么 → 目标 → 分工 → 节奏 → 第一周”。`,
  },
  {
    id: "roadmap-planning",
    name: "项目路线图",
    category: "演示汇报/项目规划",
    accent: "#6366f1",
    description: "规划路线图风，阶段目标、依赖关系、优先级与资源安排清晰",
    previewHtml: canvas(
      `background:#f8fafc;font-family:${SANS};color:#0f172a;padding:22px 26px;`,
      `<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:19px;font-weight:800;">2026 产品路线图</span><div style="display:flex;gap:12px;font-size:10px;color:#64748b;">` +
        [
          ["#10b981", "已完成"],
          ["#6366f1", "进行中"],
          ["#cbd5e1", "规划中"],
        ]
          .map(([c, t]) => `<span style="display:flex;align-items:center;gap:4px;"><i style="width:8px;height:8px;border-radius:2px;background:${c};display:inline-block;"></i>${t}</span>`)
          .join("") +
        `</div></div>` +
        el(
          `margin-top:14px;margin-left:52px;display:flex;gap:4px;`,
          ["Q1", "Q2", "Q3", "Q4"].map((q) => `<div style="flex:1;text-align:center;font-size:10px;font-weight:700;color:#6366f1;background:#eef2ff;border-radius:6px;padding:5px 0;">${q}</div>`).join(""),
        ) +
        el(
          `position:relative;margin-top:6px;`,
          (
            [
              ["平台", [[0, 30, "#10b981", "#ffffff", "账号体系"], [34, 40, "#6366f1", "#ffffff", "开放 API"]]],
              ["增长", [[12, 36, "#10b981", "#ffffff", "会员拉新"], [52, 46, "#e2e8f0", "#475569", "裂变 2.0"]]],
              ["体验", [[24, 50, "#6366f1", "#ffffff", "新版编辑器"], [78, 22, "#e2e8f0", "#475569", "移动端"]]],
            ] as Array<[string, Array<[number, number, string, string, string]>]>
          )
            .map(
              ([lane, bars]) =>
                `<div style="display:flex;align-items:center;height:52px;border-bottom:1px dashed #e2e8f0;"><div style="width:52px;font-size:11px;font-weight:700;">${lane}</div><div style="flex:1;position:relative;height:24px;">` +
                bars
                  .map(
                    ([l, w, bg, fg, t]) =>
                      `<div style="position:absolute;left:${l}%;width:${w}%;top:0;height:24px;box-sizing:border-box;border-radius:6px;background:${bg};color:${fg};font-size:10px;font-weight:600;line-height:24px;padding:0 8px;white-space:nowrap;overflow:hidden;">${t}</div>`,
                  )
                  .join("") +
                `</div></div>`,
            )
            .join("") +
            abs(
              `left:calc(52px + (100% - 52px) * 0.495);top:0;bottom:0;width:2px;background:#f97316;`,
              abs(`left:-3px;top:-4px;width:8px;height:8px;border-radius:50%;background:#f97316;`) + abs(`left:7px;bottom:2px;font-size:9px;font-weight:700;color:#f97316;white-space:nowrap;`, "今天"),
            ),
        ),
    ),
    style: `【视觉主题】项目规划与路线图：清楚、有节奏，让团队对“什么时候交付什么”达成一致
  【色彩系统】
   - 底色：冷白 #f8fafc，表头与分区 #eef2ff，卡片 #ffffff，网格线 #e2e8f0。
   - 文本：标题 #0f172a，正文 #334155，说明 #64748b。
   - 强调色：靛蓝 #6366f1 为主，蓝 #2563eb、薄荷绿 #10b981 为辅。
   - 状态色（全篇统一，并在页面上给出图例）：已完成绿 #10b981，进行中靛蓝 #6366f1，规划中灰 #cbd5e1，风险橙 #f97316，阻塞红 #ef4444。
  【字体与字号】
   - 现代无衬线体；阶段名称不超过 6 个字，说明文字不超过两行。
   - 字号阶梯：页标题 clamp(20px, 3vw, 30px) 字重 800，泳道名 13-14px 字重 700，任务条文字 12px，图例 11px。
   ${FIT_RULE}
  【间距与形状】
   - 任务条圆角 6px、高度 24-28px；表头格圆角 6px；泳道之间用 1px 虚线分隔。
   - 时间列等宽，任务条的起止位置必须与时间列对齐。
  【组件特征】
   ${SLIDE_RULE}
   - 泳道甘特：左侧泳道名，顶部季度/月份表头，任务条按状态着色，一条竖线标出“今天”。
   - 里程碑：菱形或圆点 + 日期 + 交付物；所有里程碑都要有时间、负责人或交付物。
   - 优先级矩阵（价值 × 成本）、资源看板、依赖箭头、关键决策点。
  【版式池】规划总览 / 年度泳道路线图 / 季度拆解 / 里程碑时间轴 / 优先级矩阵 / 资源与人力 / 依赖与风险 / 决策与下一步。
  【禁忌】不要没有时间刻度的“路线图”；不要超过 5 条泳道；状态色不得挪作装饰。
  【布局原则】适合项目计划、产品路线图、OKR 拆解；风格轻快，但每一项都可执行、可追踪。`,
  },
  {
    id: "project-retro",
    name: "项目总结复盘",
    category: "演示汇报/项目总结",
    accent: "#14b8a6",
    description: "项目复盘风，结果、经验、问题、改进动作一屏说清，避免流水账",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#0f172a;`,
      abs(
        `left:0;top:0;bottom:0;width:172px;background:#f0fdfa;`,
        abs(`left:26px;top:26px;font-size:10px;font-weight:700;letter-spacing:2px;color:#0d9488;`, "项目复盘") +
          abs(
            `left:38px;top:58px;width:96px;height:96px;border-radius:50%;background:conic-gradient(#14b8a6 0 92%,#ccfbf1 92% 100%);`,
            abs(`left:14px;top:14px;width:68px;height:68px;border-radius:50%;background:#f0fdfa;display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;`, "92%"),
          ) +
          abs(`left:0;right:0;top:170px;text-align:center;font-size:11px;color:#64748b;`, "目标达成率") +
          abs(`left:0;right:0;top:192px;text-align:center;font-size:15px;font-weight:800;`, "提前 2 周交付"),
      ) +
        abs(`left:196px;right:26px;top:26px;font-size:18px;font-weight:800;line-height:1.35;`, "三件做对的事，<br>两个要补的坑") +
        abs(
          `left:196px;right:26px;top:96px;display:flex;gap:16px;`,
          (
            [
              ["做对了", "#14b8a6", [[100, 62], [92, 50], [84, 70]]],
              ["待改进", "#f97316", [[96, 58], [88, 44]]],
            ] as Array<[string, string, number[][]]>
          )
            .map(
              ([title, color, rows]) =>
                `<div style="flex:1;"><div style="font-size:11px;font-weight:800;color:${color};padding-bottom:6px;border-bottom:2px solid ${color};">${title}</div>` +
                rows
                  .map((w) => `<div style="display:flex;gap:8px;margin-top:11px;"><div style="width:10px;height:10px;border-radius:50%;background:${color};flex:none;margin-top:1px;"></div><div style="flex:1;">${textLines(w, "#cbd5e1", 5, 5)}</div></div>`)
                  .join("") +
                `</div>`,
            )
            .join(""),
        ) +
        abs(
          `left:196px;right:26px;bottom:22px;padding:9px 14px;border-radius:8px;background:#0f172a;color:#ffffff;font-size:11px;display:flex;justify-content:space-between;`,
          `<span>下一步 · 建立灰度发布检查清单</span><span style="color:#5eead4;font-weight:700;">10/15</span>`,
        ),
    ),
    style: `【视觉主题】项目总结与复盘：坦诚、清晰，重点是把经验沉淀成下一次能用的动作
  【色彩系统】
   - 底色：纯白 #ffffff，分区底 #f0fdfa，描边 #e2e8f0。
   - 文本：主文本 #0f172a，次要文本 #64748b；深色行动条 #0f172a 反白。
   - 强调色：青绿 #14b8a6（文字用深一档 #0d9488）代表成果与做对的事，提醒橙 #f97316 代表问题与待改进，深蓝 #1e40af 用于中性数据。
  【字体与字号】
   - 干净的无衬线体；标题直接写结论，例如“提前 2 周完成核心交付”。
   - 字号阶梯：页标题 clamp(20px, 3vw, 30px) 字重 800，结果数字 28-40px 字重 800，正文 14-15px，标签 11px。
   ${FIT_RULE}
  【间距与形状】
   - 左侧可用一条占 1/3 宽的浅色结果栏承载核心指标，右侧放分析内容。
   - 卡片圆角 8px；分栏标题下用 2px 同色横线；列表项前用 10px 圆点。
  【组件特征】
   ${SLIDE_RULE}
   - 结果仪表：环形进度（conic-gradient）+ 中心百分比 + 一句结果。
   - 双栏对照：“做对了 / 待改进”各 2-3 条，每条一句事实加一句原因。
   - Before / After 对比条、问题清单（现象、根因、影响）、改进行动表（动作、负责人、日期）。
  【版式池】一页总结 / 目标回顾 / 结果数据 / 做对了什么 / 暴露了什么 / 根因分析 / 改进行动表 / 致谢。
  【禁忌】不要流水账式罗列过程；不要只报喜；每个问题都必须对应一条改进动作。
  【布局原则】适合项目收口、阶段验收、复盘分享；结构固定为“目标 → 结果 → 经验 → 问题 → 行动”。`,
  },
  {
    id: "annual-story-review",
    name: "年终故事总结",
    category: "演示汇报/年终总结",
    accent: "#a855f7",
    description: "年终总结叙事风，年度主题、关键战役、数据成果和团队瞬间更有温度",
    previewHtml: canvas(
      `background:linear-gradient(135deg,#171024 0%,#2a1445 60%,#3b1d4f 100%);font-family:${SANS};color:#f8fafc;`,
      abs(`left:30px;top:26px;font-size:10px;font-weight:700;letter-spacing:4px;color:#f59e0b;`, "ANNUAL REVIEW") +
        abs(
          `left:27px;top:40px;font-size:78px;font-weight:900;letter-spacing:-3px;line-height:1.1;background:linear-gradient(90deg,#f59e0b,#ec4899 55%,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent;`,
          "2026",
        ) +
        abs(`left:30px;top:136px;font-size:20px;font-weight:700;`, "年度关键词：破局") +
        abs(
          `right:30px;top:34px;text-align:right;`,
          `<div style="font-size:32px;font-weight:800;line-height:1.1;">128</div><div style="font-size:10px;color:#c4b5fd;">交付项目</div><div style="font-size:32px;font-weight:800;line-height:1.1;margin-top:10px;">36</div><div style="font-size:10px;color:#c4b5fd;">覆盖城市</div>`,
        ) +
        abs(
          `left:30px;right:30px;bottom:24px;height:70px;display:flex;gap:8px;`,
          [
            ["3 月", "linear-gradient(135deg,#f59e0b,#f97316)"],
            ["6 月", "linear-gradient(135deg,#ec4899,#be185d)"],
            ["9 月", "linear-gradient(135deg,#a855f7,#6d28d9)"],
            ["11 月", "linear-gradient(135deg,#6366f1,#312e81)"],
            ["12 月", "linear-gradient(135deg,#fbbf24,#ec4899)"],
          ]
            .map(([m, bg]) => `<div style="flex:1;border-radius:8px;background:${bg};position:relative;"><span style="position:absolute;left:8px;bottom:6px;font-size:10px;font-weight:700;color:#ffffff;">${m}</span></div>`)
            .join(""),
        ),
    ),
    style: `【视觉主题】年终总结与年度回顾：既有成绩单，也有故事和温度，像一部年度纪录短片
  【色彩系统】
   - 底色：深紫黑 #171024 到 #3b1d4f 的斜向渐变；数据页可切换为暖白 #fffaf5。
   - 文本：深底 #f8fafc，辅助文字淡紫 #c4b5fd；浅底 #111827 / #6b7280。
   - 强调色：紫 #a855f7、金 #f59e0b、玫红 #ec4899；三色只在年份大字、关键数字和时间胶片上组合成渐变。
  【字体与字号】
   - 无衬线体，年份和关键数字用 900 字重的超大字；正文保持清晰朴素。
   - 字号阶梯：年份大字 clamp(56px, 10vw, 96px)，页标题 clamp(22px, 3.2vw, 32px)，数字 28-40px，正文 15-16px，标签 11px。
   ${FIT_RULE}
  【间距与形状】
   - 图片与胶片格圆角 8-12px；卡片用半透明白 rgba(255,255,255,0.08)，不加描边。
   - 页面内边距 30-32px；深色页与浅色页交替出现，形成章节节奏。
  【组件特征】
   ${SLIDE_RULE}
   - 年度时间胶片：一排等宽图片格，每格标注月份和事件。
   - 关键数字墙：大数字 + 指标名，一页不超过 4 组。
   - 荣誉墙、团队语录（引号 + 署名）、里程碑地图、展望卡片。
  【版式池】年份封面 / 年度关键词 / 关键战役（每场一页）/ 数字成绩单 / 时间胶片 / 团队瞬间 / 遗憾与反思 / 下一年展望。
  【禁忌】不要像财务报表一样罗列；不要彩带、烟花等节庆贴图；渐变文字只用于年份和个别数字。
  【布局原则】适合部门年终、项目年度总结、团队述职；按“关键词 → 战役 → 数字 → 人 → 展望”推进。`,
  },
  {
    id: "proposal-lab",
    name: "方案提案",
    category: "演示汇报/方案提案",
    accent: "#0ea5e9",
    description: "提案实验室风，问题洞察、方案架构、价值证明和落地路径有说服力",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#0f172a;`,
      abs(`left:0;right:0;top:0;height:6px;background:linear-gradient(90deg,#0ea5e9,#10b981);`) +
        abs(
          `left:30px;top:30px;display:flex;align-items:center;gap:8px;`,
          `<span style="background:#0ea5e9;color:#ffffff;font-size:9px;font-weight:800;letter-spacing:1.5px;padding:3px 8px;border-radius:4px;">PROPOSAL</span><span style="font-size:10px;color:#64748b;">策略实验室 · v1.2</span>`,
        ) +
        abs(`left:30px;top:62px;font-size:30px;font-weight:800;line-height:1.24;letter-spacing:-0.5px;`, "全渠道会员<br>增长方案") +
        abs(
          `left:30px;top:150px;width:168px;box-sizing:border-box;padding:10px 12px;background:#f1f5f9;border-left:3px solid #0ea5e9;border-radius:0 6px 6px 0;`,
          `<div style="font-size:9px;font-weight:800;color:#0284c7;margin-bottom:7px;">核心洞察</div>` + textLines([100, 86, 58], "#cbd5e1", 5, 6),
        ) +
        abs(
          `left:30px;bottom:22px;display:flex;align-items:baseline;gap:8px;`,
          `<span style="font-size:28px;font-weight:800;color:#0ea5e9;letter-spacing:-1px;">3.5x</span><span style="font-size:10px;color:#64748b;">预期投入产出比</span>`,
        ) +
        abs(
          `right:30px;bottom:22px;width:204px;height:196px;display:flex;align-items:flex-end;gap:8px;`,
          [
            ["01", "洞察", 76, "#e0f2fe", "#0369a1"],
            ["02", "策略", 128, "#7dd3fc", "#0c4a6e"],
            ["03", "落地", 188, "#0ea5e9", "#ffffff"],
          ]
            .map(
              ([n, t, h, bg, fg]) =>
                `<div style="flex:1;height:${h}px;box-sizing:border-box;border-radius:8px 8px 0 0;background:${bg};color:${fg};padding:10px;"><div style="font-size:10px;font-weight:700;opacity:0.7;">${n}</div><div style="font-size:15px;font-weight:800;margin-top:2px;">${t}</div></div>`,
            )
            .join(""),
        ),
    ),
    style: `【视觉主题】方案提案与创意提案：像一间清爽的策略实验室，每一页都在推进决策
  【色彩系统】
   - 底色：纯白 #ffffff，分区底 #f1f5f9，描边 #e2e8f0；页面顶部可有一条 6px 的蓝绿渐变细带。
   - 文本：标题 #0f172a，正文 #475569，注释 #64748b。
   - 强调色：天空蓝 #0ea5e9 为主（文字用 #0284c7），青绿 #10b981、亮紫 #8b5cf6 为辅；同一色相用浅、中、深三档表达递进。
  【字体与字号】
   - 现代无衬线体；标题写“观点句”而不是抽象名词。
   - 字号阶梯：封面标题 clamp(28px, 4.5vw, 44px) 字重 800，页标题 clamp(20px, 3vw, 28px)，正文 14-16px，标签 10-11px 字重 800。
   ${FIT_RULE}
  【间距与形状】
   - 卡片圆角 8px；洞察卡为浅灰底加 3px 左侧强调色竖线。
   - 页面内边距 30-32px；左侧放论述、右侧放图示，比例约 4:5。
  【组件特征】
   ${SLIDE_RULE}
   - 洞察卡：小标签 + 2-3 行结论。
   - 价值阶梯：由低到高的台阶柱，逐级加深，表达“洞察 → 策略 → 落地”。
   - 方案架构图（分层方块）、投入产出表、实施路线图、决策页（需要对方确认的 2-3 个选项）。
  【版式池】提案封面 / 背景与问题 / 核心洞察 / 策略主张 / 方案架构 / 价值证明（数据或案例）/ 投入与排期 / 风险与对策 / 决策请求。
  【禁忌】不要只讲方案不讲收益；不要把所有模块画成一样大小的方块；不要没有下一步的结尾页。
  【布局原则】适合客户提案、内部方案评审、创新方案推荐；有设计感，但逻辑必须能说服决策者。`,
  },
  {
    id: "workshop-canvas",
    name: "共创工作坊",
    category: "演示汇报/共创工作坊",
    accent: "#eab308",
    description: "工作坊引导风，议程、分组任务、讨论模板和产出看板轻松但有秩序",
    previewHtml: canvas(
      `background:#fffbeb;font-family:${SANS};color:#1f2937;padding:22px 24px;`,
      `<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:18px;font-weight:800;">共创工作坊 · 用户旅程</span><span style="background:#1f2937;color:#fde047;font-family:${MONO};font-size:12px;font-weight:700;padding:4px 11px;border-radius:999px;">25:00</span></div>` +
        el(
          `margin-top:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;height:200px;`,
          (
            [
              ["发现", "#eab308", [["#fde047", -2, [100, 70]], ["#fef08a", 1.5, [90, 55]], ["#fde047", -1, [80]]]],
              ["定义", "#06b6d4", [["#67e8f9", 1.5, [100, 60]], ["#a5f3fc", -1.5, [86, 72]], ["#67e8f9", 1, [70]]]],
              ["构思", "#fb7185", [["#fda4af", -1.5, [96, 64]], ["#fecdd3", 2, [88]], ["#fda4af", -1, [100, 48]]]],
            ] as Array<[string, string, Array<[string, number, number[]]>]>
          )
            .map(
              ([title, dot, notes]) =>
                `<div style="box-sizing:border-box;background:rgba(255,255,255,0.7);border:1.5px dashed #e7d9a0;border-radius:12px;padding:10px;">` +
                `<div style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;margin-bottom:9px;"><i style="width:8px;height:8px;border-radius:50%;background:${dot};display:inline-block;"></i>${title}</div>` +
                notes
                  .map(
                    ([bg, rot, w]) =>
                      `<div style="background:${bg};border-radius:3px;padding:9px 9px 10px;margin-bottom:8px;transform:rotate(${rot}deg);box-shadow:0 2px 4px rgba(0,0,0,0.08);">${textLines(w, "rgba(31,41,55,0.35)", 4, 5)}</div>`,
                  )
                  .join("") +
                `</div>`,
            )
            .join(""),
        ),
    ),
    style: `【视觉主题】团队共创工作坊：轻松、开放、像一面整理好的便签墙，适合讨论和协作
  【色彩系统】
   - 底色：柔和米白 #fffbeb，看板底为半透明白，虚线描边 #e7d9a0。
   - 文本：主文本 #1f2937，辅助文本 #64748b。
   - 强调色：黄 #eab308、湖蓝 #06b6d4、珊瑚红 #fb7185，对应的便签色为 #fde047 / #67e8f9 / #fda4af；三色只用于区分分组或阶段，同一组始终用同一色。
  【字体与字号】
   - 圆润无衬线体，标题友好但不幼稚；计时器和编号使用等宽字体。
   - 字号阶梯：页标题 clamp(20px, 3vw, 30px) 字重 800，分栏标题 14px 字重 800，便签文字 13-14px，说明 12px。
   ${FIT_RULE}
  【间距与形状】
   - 看板列圆角 12px、1.5px 虚线描边；便签圆角 3px，带极浅投影，可轻微旋转（正负 2 度以内）。
   - 列间距 10-12px，便签间距 8px；页面内边距 24px。
  【组件特征】
   ${SLIDE_RULE}
   - 看板：3-4 列（如“发现 / 定义 / 构思”），列头为彩色圆点 + 名称。
   - 便签：一张只写一个观点，不超过 20 个字。
   - 计时器胶囊（深底黄字）、投票点、分组任务卡、问题引导卡、成果模板。
  【版式池】开场与目标 / 议程时间表 / 规则说明 / 分组任务卡 / 讨论看板 / 投票与收敛 / 成果模板 / 行动认领。
  【禁忌】不要手写体和卡通贴图；便签不要东倒西歪到看不清；一页不要超过 12 张便签。
  【布局原则】适合工作坊、头脑风暴、需求共创、复盘会；轻松，但必须整齐、可执行。`,
  },
  {
    id: "editorial-ink-deck",
    name: "电子杂志",
    category: "演示汇报/杂志演讲",
    accent: "#0a1f3d",
    description: "电子杂志式网页 PPT，衬线大标题、纸感底色、叙事节奏和图片证据并重",
    previewHtml: canvas(
      `background:#f1efea;font-family:${SERIF};color:#0a1f3d;padding:22px 30px;`,
      `<div style="display:flex;justify-content:space-between;align-items:baseline;"><span style="font-size:13px;font-weight:700;letter-spacing:3px;">INK &amp; PIXEL</span><span style="font-family:${MONO};font-size:9px;letter-spacing:1px;">ISSUE 04 · 2026</span></div>` +
        el(`margin-top:8px;border-top:3px double #0a1f3d;`) +
        el(
          `margin-top:18px;display:flex;gap:24px;`,
          el(
            `flex:1;`,
            `<div style="font-family:${MONO};font-size:9px;letter-spacing:1.5px;opacity:0.7;">CHAPTER 02 — 阅读</div>` +
              `<div style="margin-top:10px;font-size:30px;font-weight:700;line-height:1.28;">重塑阅读的<br>温度与节奏</div>` +
              `<div style="margin-top:16px;">${textLines([100, 94, 97, 62], "rgba(10,31,61,0.26)", 4, 7)}</div>`,
          ) +
            el(
              `width:150px;height:176px;background:#0a1f3d;color:#f1efea;position:relative;flex:none;`,
              abs(`left:0;right:0;top:44px;text-align:center;font-size:56px;font-style:italic;line-height:1.1;`, "Ink") + abs(`left:12px;bottom:10px;font-family:${MONO};font-size:8px;letter-spacing:1px;opacity:0.7;`, "FIG. 01 — 墨与纸"),
            ),
        ) +
        abs(
          `left:30px;right:30px;bottom:16px;display:flex;justify-content:space-between;font-family:${MONO};font-size:9px;opacity:0.6;`,
          `<span>编辑部 · 深度专题</span><span>P. 14</span>`,
        ),
    ),
    style: `【视觉主题】电子杂志 × 电子墨水：像一份可以翻页演示的深度杂志专题，墨纸印刷感，不要科技感
  【色彩系统】（整份作品只选一套，不混用）
   - 靛蓝瓷：墨色 #0a1f3d，纸色 #f1f3f5，纸色深一档 #e4e8ec。
   - 墨水经典：墨色 #0a0a0b，纸色 #f1efea，纸色深一档 #e8e5de。
   - 沙丘：墨色 #1f1a14，纸色 #f0e6d2，纸色深一档 #e3d7bf。
   - 正文一律用墨色，不用彩色正文；强调只靠墨色反白块、斜体和字号，不引入第二种彩色。
  【字体与字号】
   - 大标题用高质感衬线体（Georgia / Noto Serif SC / 宋体），正文用清晰的无衬线体，页眉、编号和图注用等宽字体。
   - 字号阶梯：封面标题 clamp(36px, 6vw, 64px)，页标题 clamp(26px, 4vw, 40px) 行高 1.25，导语 16-18px，正文 14-15px，元数据 10-11px 且字距 0.1em。
   ${FIT_RULE}
  【间距与形状】
   - 全部直角，不用阴影和圆角；分隔只用 1px 发丝线或 3px 双线。
   - 页面内边距 30-36px；图文分栏比例 3:2，栏间距 24px。
  【组件特征】
   ${SLIDE_RULE}
   - 杂志页眉：左刊名（全大写、字距 0.2em），右期号；下方一条双线。底部页脚：左栏目名，右页码。
   - 主题节奏：先规划每页的 hero / light / dark 节奏，每 3-4 页插入一张封面、章节幕封、大引用或提问页；深色页即墨色铺底、纸色文字。
   - 数据大字报、图文分栏、图片网格、引用页、收束页；图注统一写成“FIG. 01 — 说明”。
   - 图片是第一公民：使用 16:10、4:3、3:2、1:1 或 16:9 等标准比例，优先只裁底部，保留顶部和左右的关键信息。
  【版式池】刊头封面 / 章节幕封（反色）/ 导语页 / 图文分栏 / 数据大字 / 大引用 / 图片网格 / 提问页 / 收束页。
  【禁忌】不要渐变、图标堆叠和彩色标签；不要每页都是同一种版式；单页只承载一个叙事动作。
  【布局原则】适合观点分享、行业观察、人文叙事、产品故事和私享会演讲；长内容按“钩子 → 背景 → 证据 → 转折 → 收束”拆页，克制优于炫技。`,
  },
  {
    id: "swiss-presentation-system",
    name: "瑞士国际主义",
    category: "演示汇报/瑞士国际主义",
    accent: "#002FA7",
    description: "瑞士国际主义网页 PPT，12 栏网格、单一锚点色、直角纯色和超强字号对比",
    previewHtml: canvas(
      `background:#fafaf8;font-family:Helvetica, Arial, ${SANS};color:#0a0a0a;`,
      abs(`left:28px;right:28px;top:0;bottom:0;background-image:linear-gradient(90deg,rgba(10,10,10,0.055) 1px,transparent 1px);background-size:calc(100% / 12) 100%;`) +
        abs(
          `left:28px;right:28px;top:22px;display:flex;justify-content:space-between;align-items:baseline;`,
          `<span style="font-size:10px;font-weight:600;letter-spacing:2px;">SWISS GRID SYSTEM</span><span style="font-family:${MONO};font-size:9px;color:#737373;">SEC. 04</span>`,
        ) +
        abs(`left:28px;right:28px;top:42px;height:2px;background:#0a0a0a;`) +
        abs(`left:28px;top:60px;font-size:37px;font-weight:300;line-height:1.22;letter-spacing:-1px;`, "信息最大化。<br>装饰最小化。") +
        abs(`left:28px;right:28px;top:172px;height:1px;background:#d4d4d2;`) +
        abs(
          `left:28px;top:184px;display:flex;gap:46px;`,
          [
            ["01", "单一锚点色", "#002FA7"],
            ["12", "栏网格", "#0a0a0a"],
            ["960", "基准宽度", "#0a0a0a"],
          ]
            .map(([n, t, c]) => `<div><div style="font-size:40px;font-weight:200;line-height:1.1;letter-spacing:-1px;color:${c};">${n}</div><div style="font-size:9px;font-weight:600;letter-spacing:1.5px;margin-top:4px;">${t}</div></div>`)
            .join(""),
        ) +
        abs(`right:28px;bottom:22px;width:14px;height:14px;background:#002FA7;`) +
        abs(`left:28px;bottom:20px;font-family:${MONO};font-size:9px;color:#737373;`, "04 / DATA REPORT"),
    ),
    style: `【视觉主题】瑞士国际主义系统：信息驱动、冷静、强秩序，视觉冲击来自网格和字号对比
  【色彩系统】
   - 底色：极浅暖白 #fafaf8，辅助灰阶 #f0f0ee / #d4d4d2 / #737373。
   - 文本：近黑 #0a0a0a，高对比优先。
   - 单一锚点色：整份作品只选一种（克莱因蓝 #002FA7、柠檬黄 #FFD500、安全橙 #FF6B35 之一），只做单点高亮（KPI 数字、小编号、栏目徽章、一个小方块），在单页的视觉占比控制在 5% 以下；禁止用作大面积背景、边框或大段文字高亮。
  【字体与字号】
   - 全程无衬线体，优先 Inter / Helvetica / Noto Sans SC；代码和标签可用等宽字体。
   - 越大的字越轻：主标题和 KPI 数字字重 200-300，小标签和图表标注字重 500-600、全大写、字距 0.15em。
   - 防折行溢出：中文大标题禁止写死大字号，必须用双向视口约束（如 font-size: min(5.2vw, 9.2vh)），避免长标题折行撑爆页面。
  【间距与防溢出】
   - 12 栏网格，所有元素的左右边缘都落在栏线上。
   - 外层容器 .canvas-card 的内边距为 32px 24px 24px（上 32、左右 24、下 24）；页眉 .chrome-min 的下边距不超过 16px，页脚 .foot-min 的上边距不超过 14px。
   - 每页主内容区高度不超过 380px；网格列间距控制在 12-20px，禁止 40px 以上的大间距和多层嵌套。
  【组件特征】
   ${SLIDE_RULE}
   - 页眉：左栏目名、右章节号，下压一条 2px 黑线；页脚：左页码与栏目，右一个锚点色小方块。
   - 几何：直角、纯色块、1px 发丝线、点阵或网格背景。
   - 极简代码块：不超过 12 行，样式固定为 font-size: 11px; line-height: 1.45; padding: 12px 16px。
   - 图片：主图优先 21:9，多图统一 21:9 或 16:10；同组图片的比例、高度、边距和标题样式必须一致。
  【版式池】封面 / 宣言页（超大细体标题）/ KPI 塔 / 横向时间线 / 左右对比 / 2×3 六宫格 / 矩阵 / 系统图 / 规格表 / 通栏主图。
  【禁忌】禁止渐变、阴影、圆角、玻璃拟态和随意堆叠的图标；禁止第二种彩色。
  【布局原则】适合数据汇报、产品方法论、工程分享、年度总结和技术发布；靠网格、留白、字号对比和单一锚点色建立秩序，而不是装饰。`,
  },
];
