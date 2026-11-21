import type { RawDesignStyle } from "../types";
import { MONO, SANS, SERIF, abs, barChart, canvas, el, lineChart } from "../previewKit";

export const dataStyles: RawDesignStyle[] = [
  {
    id: "dashboard",
    name: "现代仪表盘",
    category: "数据分析/仪表盘",
    accent: "#3b82f6",
    description: "B 端现代数据面板，Bento 网格布局，清晰的信息层级与微交互",
    previewHtml: canvas(
      `background:#f8fafc;font-family:${SANS};color:#0f172a;padding:16px 18px;`,
      `<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:15px;font-weight:700;">经营总览</span><span style="font-size:9px;color:#64748b;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:3px 8px;">近 30 天</span><div style="margin-left:auto;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#6366f1);"></div></div>` +
        el(
          `margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;`,
          [
            ["销售额", "¥128.4万", "↑ 12.0%", true],
            ["订单数", "8,420", "↑ 5.3%", true],
            ["转化率", "3.42%", "↓ 0.4%", false],
            ["客单价", "¥152", "↑ 2.1%", true],
          ]
            .map(
              ([k, v, d, up]) =>
                `<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:9px 10px;"><div style="font-size:9px;color:#64748b;">${k}</div><div style="font-size:16px;font-weight:800;letter-spacing:-0.5px;margin:3px 0 5px;">${v}</div><span style="font-size:8px;font-weight:700;border-radius:4px;padding:1px 5px;${up ? "color:#059669;background:#d1fae5;" : "color:#dc2626;background:#fee2e2;"}">${d}</span></div>`,
            )
            .join(""),
        ) +
        el(
          `margin-top:8px;display:grid;grid-template-columns:1.7fr 1fr;gap:8px;height:138px;`,
          el(
            `box-sizing:border-box;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px 0;overflow:hidden;`,
            `<div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;margin-bottom:8px;">收入趋势<span style="font-weight:400;color:#64748b;">单位：万元</span></div>` +
              lineChart([22, 28, 25, 34, 31, 40, 38, 47, 52, 49, 61], { width: 244, height: 92, stroke: "#3b82f6", fill: "rgba(59,130,246,0.12)", strokeWidth: 2 }),
          ) +
            el(
              `box-sizing:border-box;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;`,
              `<div style="font-size:10px;font-weight:700;margin-bottom:10px;">渠道占比</div>` +
                [
                  ["小程序", 62, "#3b82f6"],
                  ["App", 26, "#93c5fd"],
                  ["官网", 12, "#cbd5e1"],
                ]
                  .map(
                    ([n, p, c]) =>
                      `<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:9px;color:#64748b;margin-bottom:4px;"><span>${n}</span><span style="color:#0f172a;font-weight:600;">${p}%</span></div><div style="height:6px;border-radius:3px;background:#f1f5f9;"><div style="width:${p}%;height:100%;border-radius:3px;background:${c};"></div></div></div>`,
                  )
                  .join(""),
            ),
        ),
    ),
    style: `【视觉主题】现代 B 端数据仪表盘：少即是多，打开就能回答“现在怎么样、哪里变了”
  【色彩系统】
   - 底色：浅灰蓝全局背景 #f8fafc，数据卡片纯白 #ffffff，描边 #e2e8f0，图表轨道 #f1f5f9。
   - 文本：核心数值 #0f172a，指标标题与说明 #64748b，占位 #94a3b8。
   - 强调色：蓝 #3b82f6 用于图表主系列和当前选中；同色相的浅档 #93c5fd 与中性灰 #cbd5e1 用于次要系列。
   - 语义色（浅底配深字）：上升或达标绿 #059669 / #d1fae5，下降或异常红 #dc2626 / #fee2e2，预警琥珀 #d97706 / #fef3c7。颜色只表达语义，严禁彩虹色图表。
  【字体与字号】
   - 极简无衬线体；所有数字使用等宽数字（font-variant-numeric: tabular-nums）以保证纵向对齐。
   - 字号阶梯：页面标题 20-24px 字重 700，卡片标题 14px 字重 600，KPI 数值 28-36px 字重 800、字距 -0.02em，趋势标签 12px 字重 700，正文与表格 13-14px，图表标注 11-12px。
  【间距与形状】
   - 卡片圆角 12px，1px 描边或极浅阴影（0 1px 2px rgba(15,23,42,0.05)），二者取其一；趋势标签圆角 4px，筛选胶囊 6px。
   - 用 CSS Grid 的 Bento 网格切分版面，卡片间距 12-16px，卡片内边距 16-20px；同一行的卡片等高。
  【组件特征】
   - 顶栏：页面标题 + 时间范围选择 + 右侧用户头像或导出按钮。
   - KPI 卡：指标名 → 超大加粗数值 → 带底色的趋势标签（如“↑ 12.0%”），可附一条迷你趋势线。
   - 趋势图卡：标题 + 单位说明 + 面积折线图（主线 2px，面积填充透明度 12%）。
   - 占比卡：每个分类一行“名称 + 百分比 + 6px 进度条”，按数值降序排列，不用饼图切很多块。
   - 明细表：表头浅灰底、数字右对齐、状态用小圆点 + 文字；空状态给出说明而不是空白图表。
   - 所有图表用纯 HTML/CSS 或内联 SVG 绘制，不依赖外部图表库。
  【页面结构】顶栏与筛选 → 一行 3-4 张 KPI 卡 → 主趋势图 + 占比卡 → 对比或排行卡片行 → 明细表 → 数据更新时间与口径说明。
  【禁忌】不用深色大屏风和发光效果；不放没有数据的占位图表；一屏不超过 8 张卡片；不用 3D 图表。
  【布局原则】顶部放核心数据卡，下方放详细图表或表格，整体高度对齐，减少认知负荷。`,
  },
  {
    id: "data-command-center",
    name: "数据指挥舱",
    category: "数据分析/实时监控",
    accent: "#06b6d4",
    description: "深色实时数据大屏，指标卡片、网格背景、告警与趋势模块清晰分区",
    previewHtml: (() => {
      const panel = (css: string, title: string, inner: string) =>
        abs(
          `${css}box-sizing:border-box;background:rgba(15,27,45,0.88);border:1px solid rgba(6,182,212,0.3);border-radius:6px;padding:9px 11px;`,
          `<div style="font-size:9px;font-weight:700;color:#8aa4bf;letter-spacing:1px;margin-bottom:8px;border-left:2px solid #06b6d4;padding-left:6px;">${title}</div>${inner}`,
        );
      return canvas(
        `background-color:#06111f;background-image:linear-gradient(rgba(6,182,212,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.07) 1px,transparent 1px);background-size:24px 24px;font-family:${SANS};color:#e5f2ff;`,
        abs(`left:0;right:0;top:9px;text-align:center;font-size:15px;font-weight:700;letter-spacing:4px;`, "运营指挥中心") +
          abs(`left:14px;top:20px;width:130px;height:1px;background:linear-gradient(90deg,rgba(6,182,212,0),#06b6d4);`) +
          abs(`right:14px;top:20px;width:130px;height:1px;background:linear-gradient(90deg,#06b6d4,rgba(6,182,212,0));`) +
          abs(`left:14px;top:5px;display:flex;align-items:center;gap:5px;font-size:9px;color:#22c55e;`, `<i style="width:6px;height:6px;border-radius:50%;background:#22c55e;"></i>实时`) +
          abs(`right:14px;top:5px;font-family:${MONO};font-size:9px;color:#8aa4bf;`, "14:32:08") +
          panel(
            `left:14px;top:40px;width:128px;height:120px;`,
            "核心指标",
            `<div style="font-size:8px;color:#8aa4bf;">在线设备（台）</div><div style="font-family:${MONO};font-size:20px;font-weight:700;line-height:1.3;">12,480</div>` +
              `<div style="font-size:8px;color:#8aa4bf;margin-top:6px;">今日告警（条）</div><div style="font-family:${MONO};font-size:20px;font-weight:700;line-height:1.3;color:#f97316;">7</div>`,
          ) +
          panel(
            `left:14px;top:168px;width:128px;height:118px;`,
            "区域负载",
            [
              ["华东", 82],
              ["华南", 64],
              ["华北", 47],
            ]
              .map(
                ([n, p]) =>
                  `<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;font-size:9px;"><span style="color:#8aa4bf;">${n}</span><div style="flex:1;height:5px;border-radius:3px;background:rgba(6,182,212,0.15);"><div style="width:${p}%;height:100%;border-radius:3px;background:#06b6d4;"></div></div><span style="font-family:${MONO};">${p}%</span></div>`,
              )
              .join(""),
          ) +
          panel(
            `left:150px;top:40px;width:180px;height:246px;`,
            "系统健康度",
            `<div style="width:104px;height:104px;border-radius:50%;margin:4px auto 0;background:conic-gradient(#06b6d4 0 98.2%,rgba(6,182,212,0.15) 98.2% 100%);box-shadow:0 0 18px rgba(6,182,212,0.25);display:flex;align-items:center;justify-content:center;"><div style="width:82px;height:82px;border-radius:50%;background:#0f1b2d;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="font-family:${MONO};font-size:20px;font-weight:700;">98.2%</span><span style="font-size:8px;color:#22c55e;margin-top:1px;">运行正常</span></div></div>` +
              `<div style="font-size:8px;color:#8aa4bf;margin:12px 0 6px;">近 12 小时吞吐量（万次）</div>` +
              barChart([40, 52, 48, 66, 74, 62, 80, 92, 70, 84, 76, 88], { height: 52, color: "rgba(6,182,212,0.45)", highlight: "#06b6d4", gap: 4, radius: 1 }),
          ) +
          panel(
            `right:14px;top:40px;width:128px;height:246px;`,
            "告警列表",
            [
              ["#f97316", "机房 B 温度偏高", "14:28"],
              ["#ef4444", "支付网关超时", "14:11"],
              ["#22c55e", "主从同步已恢复", "13:52"],
              ["#f97316", "磁盘使用率 85%", "13:40"],
              ["#22c55e", "证书续期完成", "12:05"],
            ]
              .map(
                ([c, t, tm]) =>
                  `<div style="display:flex;gap:6px;padding:6px 0;border-bottom:1px solid rgba(138,164,191,0.15);"><i style="width:6px;height:6px;border-radius:50%;background:${c};flex:none;margin-top:3px;"></i><div><div style="font-size:9px;">${t}</div><div style="font-family:${MONO};font-size:8px;color:#8aa4bf;margin-top:1px;">${tm}</div></div></div>`,
              )
              .join(""),
          ),
      );
    })(),
    style: `【视觉主题】深色实时数据大屏：像一间指挥舱，远看能抓住状态，近看每个数都有单位和含义
  【色彩系统】
   - 底色：深蓝黑 #06111f，可叠加 24px 间距、透明度 7% 的青色网格；面板 #0f1b2d（可带 88% 不透明度）。
   - 文本：主文本 #e5f2ff，次要文本与标签 #8aa4bf。
   - 强调色：青色 #06b6d4，用于图表主系列、面板描边（透明度 30%）和标题装饰线。
   - 状态色（全屏统一）：正常绿 #22c55e，告警橙 #f97316，严重红 #ef4444；每个状态色旁必须有文字说明，不能只靠颜色。
  【字体与字号】
   - 现代无衬线体；所有数字、时间和编号使用等宽字体与等宽数字。
   - 字号阶梯（按 1920px 宽大屏，可用 vw 等比缩放）：大屏标题 32-40px 字重 700、字距 0.25em，面板标题 16-18px 字重 700，核心 KPI 44-64px 字重 700，次级数值 24-28px，标签与单位 13-14px，列表 14-15px。
  【间距与形状】
   - 面板圆角 4-6px，1px 青色半透明描边，可加一圈很弱的外发光（0 0 18px rgba(6,182,212,0.25) 以内）；禁止大面积光晕。
   - 整屏为固定的栅格（常见三列：左右窄、中间宽），面板间距 8-12px，面板内边距 12-16px；所有面板对齐成整齐的矩阵。
  【组件特征】
   - 顶部标题栏：居中的大屏标题，两侧各一条向外渐隐的青色细线；左侧实时状态点，右侧当前时间。
   - 面板标题：左侧 2px 青色竖线 + 标题文字。
   - KPI：“指标名（含单位）+ 等宽大数字”，异常值用状态色。
   - 环形仪表：conic-gradient 圆环 + 中心百分比与状态文字。
   - 条形负载（名称 + 进度条 + 百分比）、柱状趋势（最新一期高亮）、折线近似，全部用 HTML/CSS 或内联 SVG 绘制。
   - 告警列表：状态点 + 事件描述 + 等宽时间，按时间倒序；滚动列表需保证静态状态下前几条完整可读。
  【页面结构】标题栏 → 左列（核心指标、区域或分类负载）→ 中列（健康度仪表、主趋势图或地图示意）→ 右列（告警列表、排行）→ 底部状态条（数据更新时间与来源）。
  【禁忌】不放没有数据的装饰图表和旋转地球；不用超过三种状态色；任何数据模块都不能缺标题、单位和状态含义。
  【布局原则】适合运营监控、设备状态、业务大屏；核心 KPI 最大，趋势和告警次之，说明文字最弱。`,
  },
  {
    id: "data-journalism",
    name: "数据新闻",
    category: "数据分析/数据叙事",
    accent: "#0f766e",
    description: "数据新闻风，图表与解释并重，适合研究结论和公众传播",
    previewHtml: canvas(
      `background:#fbfbf8;font-family:${SANS};color:#1f2937;padding:20px 28px;`,
      `<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:#0f766e;">数据说 · 2026 城市通勤报告</div>` +
        `<div style="font-family:${SERIF};font-size:20px;font-weight:700;line-height:1.36;margin-top:7px;">一线城市平均通勤 47 分钟，<br>五年来首次缩短</div>` +
        el(
          `position:relative;margin-top:14px;`,
          [
            ["北京", 52, true],
            ["上海", 49, false],
            ["广州", 45, false],
            ["深圳", 42, false],
            ["成都", 39, false],
          ]
            .map(
              ([n, v, hl]) =>
                `<div style="display:flex;align-items:center;gap:10px;height:22px;"><span style="width:28px;font-size:10px;color:#4b5563;">${n}</span><div style="flex:1;"><div style="width:${(Number(v) / 56) * 100}%;height:13px;background:${hl ? "#0f766e" : "#cbd5d0"};"></div></div><span style="width:44px;font-size:10px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums;">${v} 分钟</span></div>`,
            )
            .join("") +
            abs(`left:calc(38px + (100% - 92px) * 0.643);top:-4px;bottom:-4px;width:0;border-left:1.5px dashed #d97706;`, abs(`left:6px;bottom:-12px;font-size:8px;font-weight:700;color:#d97706;white-space:nowrap;`, "全国均值 36 分钟")),
        ) +
        abs(`left:28px;right:28px;bottom:14px;border-top:1px solid #d1d5db;padding-top:6px;font-size:8px;color:#6b7280;`, "数据来源：2026 年城市通勤监测报告 · 口径：单程平均通勤时间"),
    ),
    style: `【视觉主题】数据新闻：用故事解释数据，而不是堆仪表盘；每一张图都先说结论
  【色彩系统】
   - 底色：柔和白 #fbfbf8，图表与说明区块底 #f3f4f0，分隔线 #d1d5db。
   - 文本：正文 #1f2937，图表标签 #4b5563，注释与来源 #6b7280。
   - 强调色：墨绿 #0f766e，只给“这张图想让你看的那一项”上色；其余数据用中性灰绿 #cbd5d0。
   - 辅助色：琥珀 #d97706，专用于注释标线、参考值和需要提醒的拐点；全篇图表最多出现这两种彩色。
  【字体与字号】
   - 标题用衬线体（Georgia / Noto Serif SC / 宋体加粗）增加报道感；正文与图表标签用高可读的无衬线体；数字使用等宽数字。
   - 字号阶梯：主标题 36-44px 行高 1.3，图表标题（结论句）20-24px 字重 700，导语 18-20px，正文 16-17px 行高 1.8，图表标签 13-14px（不为密度牺牲可读性），来源与口径 12-13px，栏目标签 12px 字重 700、字距 0.12em。
  【间距与形状】
   - 全部直角；图表不加边框、阴影和背景网格，只保留必要的基线。
   - 正文栏宽 680px 左右；图表可与正文同宽或略宽；每张图上下各留 32-40px。
   - 条形高度 12-16px、间距 8-10px；数值直接标在条形末端，省去坐标轴刻度。
  【组件特征】
   - 图表单元（固定结构）：结论式标题 → 一行说明（可选）→ 图表 → “数据来源 / 口径说明”一行小字，上方压一条细线。
   - 条形排名图：类别名左对齐，条形按数值降序，最需要关注的一项用墨绿，其余用灰绿。
   - 注释标线：琥珀色虚线标出均值、目标或政策节点，并在线旁直接写明含义。
   - 对比卡（两个大数字并排，写明差值）、小型多图（同一刻度的多个小图并列）、排名表（数字右对齐）。
   - 关键数字段：正文中的重要数字加粗，并在首次出现时说明统计口径。
   - 所有图表用 HTML/CSS 或内联 SVG 绘制，不依赖外部图表库。
  【页面结构】栏目标签与主标题 → 导语（一句话结论）→ 第一张图（最重要的发现）→ 解释段落 → 第二、三张图各带解释 → 人物或案例 → 方法与数据说明 → 资料来源。
  【禁忌】不用饼图切很多块、双纵轴和 3D 图表；不出现没有来源的数据；不要一屏堆多张图却没有文字解释；颜色不用于装饰。
  【布局原则】适合调研报告、行业数据解读、年度盘点；阅读顺序固定为“结论 → 图表 → 解释 → 来源”。`,
  },
];
