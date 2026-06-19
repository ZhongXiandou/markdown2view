import type { RawDesignStyle } from '../types';

export const presentationStyles: RawDesignStyle[] = [
  {
      id: "ppt-slide",
      name: "基础幻灯片",
      category: "演示汇报/基础幻灯",
      accent: "#2563eb",
      description: "通用 16:9 横版幻灯片，适合作为空白起点",
      previewHtml: `<div style="font-family: sans-serif; background: #002FA7; color: #fff; padding: 18px; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; justify-content: space-between;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">
      <span style="font-size: 11px; font-weight: bold; letter-spacing: 1.5px;">PRESENTATION</span>
      <span style="font-size: 11px; opacity: 0.6;">01</span>
    </div>
    <div style="margin: auto 0;">
      <div style="font-size: 22px; font-weight: 700; line-height: 1.15; margin-bottom: 8px; letter-spacing: -0.3px;">构建纯前端渲染工作台</div>
      <div style="font-size: 12px; opacity: 0.75; line-height: 1.4;">An elegant way to export PDF and PNG files.</div>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
      <span style="font-size: 10px; opacity: 0.6;">Antigravity Design</span>
      <div style="display: flex; gap: 5px;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #fff;"></div>
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #fff; opacity: 0.35;"></div>
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #fff; opacity: 0.35;"></div>
      </div>
    </div>
  </div>`,
      style: `【视觉主题】专业商务幻灯片，演示大屏展示
  【色彩系统】
   - 基础底色：深蓝商务底色或纯白底
   - 强调色：可信蓝 #2563eb
  【排版规则】
   - 字体：现代无衬线体，极大字号以保证远距离可读。
   - 层级：标题层级极度分明。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹。
   - 页面尺寸：固定比例 16:9 横板。
  【布局原则】单页信息极少，大面积留白。封面居中，内容页分左右栏或上下结构。`,
    },
  {
      id: "keynote-cinematic",
      name: "电影发布会",
      category: "演示汇报/发布会",
      accent: "#f59e0b",
      description: "Keynote 式大屏演示，深色舞台、超大标题、强节奏单页信息",
      previewHtml: `<div style="font-family: sans-serif; background: radial-gradient(circle at center, #1b2030 0%, #05070c 100%); color: #fff; padding: 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; text-align: center; align-items: center;">
    <div style="font-size: 12px; font-weight: bold; color: #f59e0b; letter-spacing: 2.5px; text-transform: uppercase;">SPECIAL EVENT</div>
    <div style="margin: auto 0;">
      <div style="font-size: 26px; font-weight: 700; line-height: 1.1; letter-spacing: -0.5px; margin-bottom: 8px;">ONE MORE THING.</div>
      <div style="font-size: 12px; color: #cbd5e1; font-weight: 300; line-height: 1.4;">The next generation of web publishing starts today.</div>
    </div>
    <div style="font-size: 10px; opacity: 0.55; letter-spacing: 1px;">LIVE FROM THE THEATER</div>
  </div>`,
      style: `【视觉主题】电影级产品发布会幻灯片，适合大屏演讲与发布稿
  【色彩系统】
   - 基础底色：深黑蓝 #05070c 或暗灰渐变。
   - 文本颜色：主标题近白 #f8fafc，说明文字 #cbd5e1。
   - 强调色：金色 #f59e0b 或电光蓝 #38bdf8，只用于关键词和页码。
  【排版规则】
   - 字体：超大标题，字重 700-800；正文少而有力，行高宽松。
   - 单页限制：每张 slide 只表达一个观点，最多 1 个主标题、1 个副标题、3 个要点。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 视觉：允许大幅背景图、产品剪影、光束式渐变，但文字必须始终清晰。
  【布局原则】封面强冲击，内容页大留白，结尾页突出一句总结或行动口号。`,
    },
  {
      id: "consulting-deck",
      name: "咨询汇报",
      category: "演示汇报/咨询顾问",
      accent: "#1d4ed8",
      description: "咨询公司式汇报页，结论先行、矩阵图、分栏和数据证据清楚",
      previewHtml: `<div style="font-family: sans-serif; background: #ffffff; padding: 16px; height: 100%; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #1d4ed8; padding-bottom: 6px; margin-bottom: 10px;">
        <span style="font-size: 13px; font-weight: bold; color: #0f172a;">2x2 Matrix Strategy</span>
        <span style="font-size: 10px; color: #64748b; font-weight: bold;">CONSULTING</span>
      </div>
      <div style="font-size: 11px; font-weight: bold; color: #1d4ed8; margin-bottom: 8px;">Market Attractiveness vs Competency</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div style="background: rgba(29,78,216,0.07); border: 1px solid rgba(29,78,216,0.2); padding: 8px; font-size: 11px; border-radius: 4px; font-weight: 600;">★ Stars</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; border-radius: 4px;">? Question</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; border-radius: 4px;">💵 Cash Cow</div>
        <div style="background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); padding: 8px; font-size: 11px; border-radius: 4px; color: #dc2626; font-weight: 600;">🚯 Dogs</div>
      </div>
    </div>
    <div style="font-size: 10px; color: #94a3b8; text-align: right;">Page 12 / Source: Industry Research</div>
  </div>`,
      style: `【视觉主题】咨询公司董事会汇报，结论先行、结构严谨、证据可追踪
  【色彩系统】
   - 基础底色：纯白 #ffffff，辅助背景 #f8fafc。
   - 文本颜色：标题 #111827，正文 #374151，注释 #6b7280。
   - 强调色：商务蓝 #1d4ed8，风险或下降使用克制红 #dc2626。
  【排版规则】
   - 字体：现代无衬线体；标题像汇报结论而不是章节名。
   - 层级：每页顶部一行“核心结论”，下方用图表、矩阵或表格证明。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 图表：2x2 矩阵、瀑布图、关键数字、路线图用 HTML/CSS 绘制，表格要有清晰表头。
  【布局原则】适合战略汇报、经营复盘、项目方案；不要做花哨动画，重点是专业可信。`,
    },
  {
      id: "startup-pitch",
      name: "创业路演",
      category: "演示汇报/年轻路演",
      accent: "#ff4d8d",
      description: "年轻清爽的 Pitch Deck，故事线、市场机会和产品证据突出",
      previewHtml: `<div style="font-family: sans-serif; background: #171329; color: #fff; padding: 16px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid #2d264d; border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 12px; font-weight: bold; color: #ff4d8d;">PITCH DECK</span>
      <span style="background: rgba(34,211,238,0.2); color: #22d3ee; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: bold;">SERIES A</span>
    </div>
    <div style="margin: 12px 0 auto 0;">
      <div style="font-size: 20px; font-weight: 800; line-height: 1.2; color: #fff;">Disrupting SaaS Workflows</div>
      <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px;">Market Size: $42B / CAGR: 24%</div>
    </div>
    <div style="display: flex; align-items: flex-end; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
      <span style="font-size: 11px; color: #8b5cf6;">Traction Graph 📈</span>
      <span style="font-size: 12px; font-weight: bold; color: #22d3ee;">10x Growth</span>
    </div>
  </div>`,
      style: `【视觉主题】年轻创业团队路演，清爽、有冲劲、但仍然可信
  【色彩系统】
   - 基础底色：亮白 #ffffff 或深紫灰 #171329。
   - 强调色：玫红 #ff4d8d、靛紫 #8b5cf6、亮青 #22d3ee，单页最多使用两种。
   - 文本颜色：深色背景用 #ffffff / #cbd5e1，浅色背景用 #111827 / #4b5563。
  【排版规则】
   - 字体：现代圆润无衬线体，标题短促有力，正文用证据支撑。
   - 单页限制：每页只讲一个路演问题，如痛点、方案、市场、商业模式、增长、团队。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 可使用大号数字、机会卡片、增长曲线、产品 mockup 框、投资亮点标签。
  【布局原则】适合融资 BP、Demo Day、创新项目汇报；视觉年轻，但信息结构必须稳。`,
    },
  {
      id: "neon-tech-launch",
      name: "科技产品发布",
      category: "演示汇报/科技发布",
      accent: "#00e5ff",
      description: "高科技发布会风，深色舞台、产品能力、规格参数和路线图清晰",
      previewHtml: `<div style="font-family: monospace; background: #050816; color: #00e5ff; padding: 14px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid rgba(0,229,255,0.25); border-radius: 6px;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(0,229,255,0.25); padding-bottom: 6px;">
      <span style="font-size: 11px; font-weight: bold;">DEVICE::PRO_X1</span>
      <span style="font-size: 11px; color: #8b5cf6;">STATUS: READY</span>
    </div>
    <div style="margin: auto 0; padding: 6px 0;">
      <div style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; font-family: sans-serif;">NEON SPECIFICATIONS</div>
      <div style="font-size: 12px; color: #00e5ff; line-height: 1.5;">
        - CPU: 12-Core CyberEngine<br>
        - GPU: RayTrace Ultra v2<br>
        - Memory: 64GB Unified
      </div>
    </div>
    <div style="font-size: 10px; color: rgba(0,229,255,0.55); border-top: 1px dashed rgba(0,229,255,0.25); padding-top: 6px; text-align: right;">v2.04-patch</div>
  </div>`,
      style: `【视觉主题】高科技产品发布会，未来感来自结构、节奏和产品中心
  【色彩系统】
   - 基础底色：深黑蓝 #050816 或 #08111f。
   - 强调色：电青 #00e5ff、冷蓝 #3b82f6、克制紫 #8b5cf6。
   - 边框与高光：使用细描边和局部高光，禁止大面积刺眼光晕。
  【排版规则】
   - 字体：几何无衬线体；参数、版本号、规格值使用等宽字体。
   - 层级：产品名最大，能力模块次之，参数说明必须清晰可读。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：能力芯片、规格矩阵、产品框线、版本路线图可用 HTML/CSS 绘制。
  【布局原则】适合 AI、新硬件、SaaS 新功能发布；发布感来自清楚的节奏，不靠随机装饰。`,
    },
  {
      id: "growth-review",
      name: "增长战报",
      category: "演示汇报/增长复盘",
      accent: "#22c55e",
      description: "活跃的数据复盘演示，增长指标、实验结果、行动清单一页讲透",
      previewHtml: `<div style="font-family: sans-serif; background: #ffffff; padding: 16px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid #e2e8f0; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; font-weight: bold; color: #0f172a;">Growth Review</span>
      <span style="font-size: 11px; background: rgba(34,197,94,0.12); color: #22c55e; padding: 3px 8px; border-radius: 12px; font-weight: bold;">+182% QTD</span>
    </div>
    <div style="margin: 12px 0 auto 0; display: flex; flex-direction: column; gap: 6px;">
      <div style="font-size: 13px; font-weight: bold; color: #1e293b;">Key Experiment: A/B Checkout V2</div>
      <div style="font-size: 11px; color: #64748b; line-height: 1.4;">Conversion Rate improved from 2.1% to 3.8% with statistical significance.</div>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 8px;">
      <span style="font-size: 10px; color: #94a3b8;">Owner: Growth Team</span>
      <span style="font-size: 11px; color: #2563eb; font-weight: bold;">Next Actions ➜</span>
    </div>
  </div>`,
      style: `【视觉主题】增长团队复盘战报，积极、清爽、行动导向
  【色彩系统】
   - 基础底色：浅色 #f8fafc 或纯白 #ffffff。
   - 强调色：增长绿 #22c55e、行动蓝 #2563eb、提醒橙 #f97316。
   - 语义色：上涨用绿、下降或风险用红 #ef4444，中性指标用灰蓝。
  【排版规则】
   - 字体：现代无衬线体，数字使用 tabular-nums 保持对齐。
   - 层级：每页顶部必须有一句结论，下面用指标和实验结果支撑。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：KPI 卡、实验 A/B 对照、漏斗、行动看板、下周计划列表用 CSS 实现。
  【布局原则】适合增长复盘、运营周报、营销战报；年轻活跃但必须数据清楚、结论明确。`,
    },
  {
      id: "developer-conf",
      name: "开发者大会",
      category: "演示汇报/技术大会",
      accent: "#38bdf8",
      description: "开发者大会技术分享，深色代码感、架构图、API 示例和路线图并重",
      previewHtml: `<div style="font-family: sans-serif; background: #0b1020; color: #e5e7eb; padding: 16px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid #1c274c; border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 12px; font-weight: bold; color: #38bdf8; letter-spacing: 0.5px;">DEVCONF 2026</span>
      <span style="font-size: 10px; color: #a78bfa;">TRACK A</span>
    </div>
    <div style="margin: 10px 0 auto 0;">
      <div style="font-size: 18px; font-weight: 800; line-height: 1.2; color: #fff; margin-bottom: 8px;">Scalable State with Zustand</div>
      <div style="background: #111827; border-radius: 4px; padding: 6px 8px; font-family: monospace; font-size: 11px; color: #a78bfa; border: 1px solid #1f2937;">
        const useStore = create((set) => ({...}))
      </div>
    </div>
    <div style="font-size: 10px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">Presenter: Antigravity / Senior Architect</div>
  </div>`,
      style: `【视觉主题】开发者大会技术分享，专业、清晰、带舞台科技感
  【色彩系统】
   - 基础底色：深色 IDE 背景 #0b1020，辅助面板 #111827。
   - 文本颜色：主文本 #e5e7eb，注释 #94a3b8。
   - 强调色：天空蓝 #38bdf8、紫色 #a78bfa、成功绿 #34d399。
  【排版规则】
   - 字体：标题用现代无衬线，代码块与 API 参数使用 JetBrains Mono / Fira Code。
   - 层级：概念标题要短，代码示例必须留足行距并可读。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：终端窗口、代码片段、架构节点、发布路线图、API 请求/响应卡片。
  【布局原则】适合技术大会、SDK 发布、工程方案分享；不要把代码塞满整页，观众要能在远处看懂。`,
    },
  {
      id: "project-kickoff-rally",
      name: "项目启动动员",
      category: "演示汇报/项目动员",
      accent: "#f97316",
      description: "启动会动员风，目标、角色、节奏、里程碑和团队士气都要有画面感",
      previewHtml: `<div style="font-family: sans-serif; background: #fff7ed; padding: 16px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid #ffedd5; border-radius: 8px;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 12px; font-weight: bold; color: #f97316; letter-spacing: 0.5px;">🚀 KICKOFF MEETING</span>
      <span style="font-size: 11px; font-weight: bold; color: #0ea5e9;">Sprint #01</span>
    </div>
    <div style="margin: 10px 0 auto 0;">
      <div style="font-size: 18px; font-weight: 800; line-height: 1.25; color: #1f2937; margin-bottom: 8px;">攻坚行动：排版引擎升级</div>
      <div style="display: flex; flex-direction: column; gap: 5px; font-size: 11px; color: #4b5563;">
        <div>☑ 确立里程碑：2周内核心跑通</div>
        <div>☐ 团队承诺：零阻塞，高协同</div>
      </div>
    </div>
    <div style="font-size: 11px; color: #f97316; font-weight: bold; text-align: right; border-top: 1px dashed #fed7aa; padding-top: 8px;">目标：完美交付 🎯</div>
  </div>`,
      style: `【视觉主题】项目启动会与团队动员，热烈、有方向感、带行动召集感
  【色彩系统】
   - 基础底色：暖白 #fff7ed 或深色 #1c1917，避免传统公文蓝。
   - 强调色：活力橙 #f97316、琥珀黄 #f59e0b、清爽蓝 #0ea5e9。
   - 文本颜色：标题 #1f2937 或 #ffffff，正文 #4b5563 或 #d6d3d1。
  【排版规则】
   - 字体：标题要有力量，短句化；正文使用短段落和行动列表。
   - 叙事顺序：为什么做 / 要做到什么 / 谁负责 / 怎么推进 / 第一周行动。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：目标旗帜、角色卡、里程碑跑道、启动清单、风险护栏、团队承诺墙。
  【布局原则】适合 Kickoff、专项行动、攻坚项目启动；氛围要鼓舞人，但不要变成鸡血海报。`,
    },
  {
      id: "roadmap-planning",
      name: "项目路线图",
      category: "演示汇报/项目规划",
      accent: "#6366f1",
      description: "规划路线图风，阶段目标、依赖关系、优先级与资源安排清晰",
      previewHtml: `<div style="font-family: sans-serif; background: #f8fafc; padding: 16px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid #e2e8f0; border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
      <span style="font-size: 13px; font-weight: bold; color: #0f172a;">Project Roadmap</span>
      <span style="font-size: 11px; color: #6366f1; font-weight: bold;">2026 OKR</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin: 10px 0 auto 0;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; color: #64748b; width: 24px; font-weight: 600;">Q1</span>
        <div style="flex: 1; background: #eef2ff; border-radius: 4px; height: 16px; position: relative; overflow: hidden; border: 1px solid #e0e7ff;">
          <div style="width: 70%; background: #6366f1; height: 100%;"></div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; color: #64748b; width: 24px; font-weight: 600;">Q2</span>
        <div style="flex: 1; background: #ecfdf5; border-radius: 4px; height: 16px; position: relative; overflow: hidden; border: 1px solid #d1fae5;">
          <div style="width: 45%; background: #10b981; height: 100%;"></div>
        </div>
      </div>
    </div>
    <div style="font-size: 11px; color: #94a3b8; text-align: right;">Timeline status: On Track</div>
  </div>`,
      style: `【视觉主题】项目规划与路线图，清楚、有节奏、能让团队对齐预期
  【色彩系统】
   - 基础底色：冷白 #f8fafc 或淡靛蓝 #eef2ff。
   - 强调色：靛蓝 #6366f1、蓝 #2563eb、薄荷绿 #10b981。
   - 状态色：已完成用绿，进行中用蓝，风险用橙，阻塞用红。
  【排版规则】
   - 字体：现代无衬线体，阶段名称要短，说明文字不超过两行。
   - 结构：用季度/月度/阶段分栏，所有里程碑必须有时间、负责人或交付物。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：时间轴、泳道图、优先级矩阵、资源看板、依赖箭头、关键决策点。
  【布局原则】适合项目计划、产品路线图、OKR 拆解；风格轻快但必须可执行。`,
    },
  {
      id: "project-retro",
      name: "项目总结复盘",
      category: "演示汇报/项目总结",
      accent: "#14b8a6",
      description: "项目复盘风，结果、经验、问题、改进动作一屏说清，避免流水账",
      previewHtml: `<div style="font-family: sans-serif; background: #ffffff; padding: 16px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid #e2e8f0; border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; font-weight: bold; color: #0f172a;">Retro: Engine Upgrade</span>
      <span style="font-size: 10px; background: rgba(20,184,166,0.12); color: #14b8a6; padding: 3px 8px; border-radius: 10px; font-weight: bold;">COMPLETE</span>
    </div>
    <div style="display: flex; gap: 12px; margin: 14px 0; padding: 6px 0;">
      <div style="flex: 1; border-left: 3px solid #ef4444; padding-left: 8px;">
        <div style="font-size: 10px; color: #ef4444; font-weight: 600;">Before (Lags)</div>
        <div style="font-size: 16px; font-weight: bold; color: #374151; margin-top: 2px;">1.2s Render</div>
      </div>
      <div style="flex: 1; border-left: 3px solid #14b8a6; padding-left: 8px;">
        <div style="font-size: 10px; color: #14b8a6; font-weight: 600;">After (Boost)</div>
        <div style="font-size: 16px; font-weight: bold; color: #111827; margin-top: 2px;">0.1s Fast</div>
      </div>
    </div>
    <div style="font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 8px;">Key Lesson: Decouple CM Re-render extensions.</div>
  </div>`,
      style: `【视觉主题】项目总结与复盘，坦诚、清晰、重视经验沉淀
  【色彩系统】
   - 基础底色：白 #ffffff 或浅青灰 #f0fdfa。
   - 强调色：青绿 #14b8a6、深蓝 #1e40af、提醒橙 #f97316。
   - 文本颜色：主文本 #0f172a，次要文本 #64748b。
  【排版规则】
   - 字体：干净无衬线体；标题直接写结论，例如“提前 2 周完成核心交付”。
   - 结构：目标回顾 / 结果数据 / 做对了什么 / 暴露了什么 / 下一步改进。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：结果仪表、Before/After 对比、经验卡、问题清单、改进行动表。
  【布局原则】适合项目收口、阶段验收、复盘分享；要有真实感，不要只报喜。`,
    },
  {
      id: "annual-story-review",
      previewHtml: `<div style="font-family: sans-serif; background: #171024; color: #fffaf5; padding: 16px; height: 100%; border: 1.5px solid #f59e0b; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(245,158,11,0.25); padding-bottom: 8px;">
      <span style="font-size: 12px; color: #f59e0b; font-weight: bold; letter-spacing: 1px;">ANNUAL STORY</span>
      <span style="font-size: 11px; color: #a855f7; font-weight: bold;">2026</span>
    </div>
    <div style="margin-top: 10px;">
      <div style="font-size: 18px; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 6px;">攀登者：向光而行，聚沙成塔</div>
      <div style="font-size: 11px; color: #a855f7; font-weight: 600; margin-bottom: 10px;">年度关键词：突破 · 协同 · 坚韧</div>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <div style="flex: 1; background: rgba(168,85,247,0.15); padding: 8px; border-radius: 4px; border: 1px solid rgba(168,85,247,0.35);">
          <div style="font-size: 10px; color: #a855f7;">核心战役</div>
          <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 3px;">业务出海</div>
        </div>
        <div style="flex: 1; background: rgba(245,158,11,0.15); padding: 8px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.35);">
          <div style="font-size: 10px; color: #f59e0b;">用户规模</div>
          <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 3px;">+145%</div>
        </div>
      </div>
    </div>
    <div style="font-size: 10px; color: rgba(255,250,245,0.65); border-top: 1px dashed rgba(255,255,255,0.12); padding-top: 8px; text-align: right;">致敬每一位努力的伙伴</div>
  </div>`,
      name: "年终故事总结",
      category: "演示汇报/年终总结",
      accent: "#a855f7",
      description:
        "年终总结叙事风，年度主题、关键战役、数据成果和团队瞬间更有温度",
      style: `【视觉主题】年终总结与年度回顾，既有成绩单，也有故事和温度
  【色彩系统】
   - 基础底色：深紫黑 #171024、暖白 #fffaf5 或柔和渐变。
   - 强调色：紫 #a855f7、金 #f59e0b、玫红 #ec4899。
   - 文本颜色：深色底用 #f8fafc，浅色底用 #111827。
  【排版规则】
   - 字体：标题可更有庆典感，正文仍保持清晰；数字使用大号展示。
   - 结构：年度关键词 / 关键战役 / 成果数据 / 团队成长 / 下一年展望。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：年度时间胶片、荣誉墙、关键数字、团队语录、里程碑地图、展望卡片。
  【布局原则】适合部门年终、项目年度总结、团队述职；不要像财务报表一样僵硬，要有叙事节奏。`,
    },
  {
      id: "proposal-lab",
      previewHtml: `<div style="font-family: sans-serif; background: #f1f5f9; padding: 16px; height: 100%; border: 1px solid #cbd5e1; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
        <span style="background: #0ea5e9; color: #fff; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: bold;">PROPOSAL</span>
        <span style="font-size: 11px; color: #64748b;">Strategy Lab v1.2</span>
      </div>
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 8px;">全渠道用户数字化增长方案</div>
      <div style="font-size: 11px; color: #475569; line-height: 1.45; background: #fff; padding: 8px; border-radius: 4px; border-left: 3px solid #0ea5e9;">
        <strong>核心洞察：</strong>当前存量用户活跃度下滑 15%，急需精细化社群运营切入。
      </div>
    </div>
    <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 11px; color: #64748b;">
      <span>预期 ROI: <strong>3.5x</strong></span>
      <span style="color: #0ea5e9; font-weight: bold;">查看路线图 ➜</span>
    </div>
  </div>`,
      name: "方案提案",
      category: "演示汇报/方案提案",
      accent: "#0ea5e9",
      description: "提案实验室风，问题洞察、方案架构、价值证明和落地路径有说服力",
      style: `【视觉主题】方案提案与创意提案，像一间清爽的策略实验室
  【色彩系统】
   - 基础底色：白 #ffffff、浅蓝灰 #f1f5f9，允许局部淡色渐变。
   - 强调色：天空蓝 #0ea5e9、青绿 #10b981、亮紫 #8b5cf6。
   - 文本颜色：标题 #0f172a，正文 #475569，注释 #64748b。
  【排版规则】
   - 字体：现代无衬线体，标题用“观点句”而不是抽象名词。
   - 结构：问题洞察 / 核心策略 / 方案模块 / 价值证明 / 资源与时间计划。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：洞察卡、方案架构图、价值阶梯、投入产出表、实施路线图、决策页。
  【布局原则】适合客户提案、内部方案评审、创新方案推荐；要有设计感，但逻辑必须能说服决策者。`,
    },
  {
      id: "workshop-canvas",
      previewHtml: `<div style="font-family: sans-serif; background: #fffbeb; padding: 16px; height: 100%; border: 1px dashed #eab308; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <span style="font-size: 12px; font-weight: bold; color: #854d0e; background: #fef08a; padding: 3px 8px; border-radius: 10px;">⚡ 共创工作坊</span>
      <span style="font-size: 10px; color: #fb7185; font-weight: bold; border: 1px solid #fb7185; padding: 2px 6px; border-radius: 4px;">⏱️ 15 Mins</span>
    </div>
    <div style="font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 10px;">议题：如何优化新用户首周体验？</div>
    <div style="display: flex; gap: 8px; margin-top: auto;">
      <div style="flex: 1; background: #fff9db; padding: 8px 7px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(0,0,0,0.06); transform: rotate(-1.5deg);">
        <div style="font-size: 11px; font-weight: bold; color: #854d0e; margin-bottom: 3px;">痛点</div>
        <div style="font-size: 10px; color: #4b5563; line-height: 1.3;">注册流程验证码延迟高</div>
      </div>
      <div style="flex: 1; background: #ffe4e6; padding: 8px 7px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(0,0,0,0.06); transform: rotate(1deg);">
        <div style="font-size: 11px; font-weight: bold; color: #9f1239; margin-bottom: 3px;">创意</div>
        <div style="font-size: 10px; color: #4b5563; line-height: 1.3;">微信一键快捷登录</div>
      </div>
      <div style="flex: 1; background: #ecfeff; padding: 8px 7px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(0,0,0,0.06); transform: rotate(-0.5deg);">
        <div style="font-size: 11px; font-weight: bold; color: #0891b2; margin-bottom: 3px;">行动</div>
        <div style="font-size: 10px; color: #4b5563; line-height: 1.3;">开发快捷登录接口</div>
      </div>
    </div>
  </div>`,
      name: "共创工作坊",
      category: "演示汇报/共创工作坊",
      accent: "#eab308",
      description: "工作坊引导风，议程、分组任务、讨论模板和产出看板轻松但有秩序",
      style: `【视觉主题】团队共创工作坊，轻松、开放、适合讨论和协作
  【色彩系统】
   - 基础底色：柔和米白 #fffbeb 或浅灰 #f8fafc。
   - 强调色：黄 #eab308、湖蓝 #06b6d4、珊瑚红 #fb7185，作为标签和分组识别。
   - 文本颜色：主文本 #1f2937，辅助文本 #64748b。
  【排版规则】
   - 字体：圆润无衬线体，标题友好但不幼稚。
   - 结构：目标 / 议程 / 分组任务 / 讨论模板 / 投票规则 / 输出物。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 组件：分组任务卡、计时器、讨论看板、投票点、问题引导卡、成果模板。
  【布局原则】适合工作坊、头脑风暴、需求共创、复盘会；轻松但必须整齐可执行。`,
    },
  {
      id: "editorial-ink-deck",
      previewHtml: `<div style="font-family: Georgia, serif; background: #f1efea; padding: 16px; height: 100%; border: 1px solid #dcdad5; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #0a1f3d; padding-bottom: 6px; margin-bottom: 10px;">
      <span style="font-size: 10px; font-weight: bold; color: #0a1f3d; letter-spacing: 1.5px; font-family: monospace;">INK & PIXEL</span>
      <span style="font-size: 10px; color: #6e6b64;">CHAPTER 02</span>
    </div>
    <div style="display: flex; gap: 10px; align-items: stretch; margin-bottom: auto;">
      <div style="flex: 1.2;">
        <div style="font-size: 19px; font-weight: 700; color: #0a1f3d; line-height: 1.15; margin-bottom: 8px; font-family: Georgia, serif;">重塑阅读的温度与节奏</div>
        <div style="font-size: 11px; color: #2e2d2a; line-height: 1.45; text-align: justify; font-family: sans-serif;">
          在这个信息爆炸的时代，我们试图通过电子杂志的墨水屏质感，为读者寻回那份克制且有呼吸感的深度阅读体验。
        </div>
      </div>
      <div style="flex: 0.8; min-height: 90px; background: #0a1f3d; border-radius: 2px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
        <div style="font-size: 28px; color: #f1efea; font-style: italic; font-weight: bold; opacity: 0.35;">Ink</div>
      </div>
    </div>
    <div style="font-size: 10px; color: #8a867c; border-top: 1px dashed #dcdad5; padding-top: 8px; font-family: monospace; display: flex; justify-content: space-between;">
      <span>ESTABLISHED 2026</span>
      <span>P. 18</span>
    </div>
  </div>`,
      name: "电子杂志",
      category: "演示汇报/杂志演讲",
      accent: "#0a1f3d",
      description:
        "电子杂志式网页 PPT，衬线大标题、纸感底色、叙事节奏和图片证据并重",
      style: `【视觉主题】电子杂志 × 电子墨水，像一份可演示的深度杂志专题
  【色彩系统】
   - 基础底色：暖纸白 #f1efea、瓷白 #f1f3f5 或沙色 #f0e6d2，整份作品只选一套。
   - 文本颜色：墨黑、深靛蓝或炭灰，避免纯彩色正文。
   - 强调色：只用于页眉、编号、关键词和数据标记，不做大面积装饰。
  【排版规则】
   - 字体：大标题使用高质感衬线体，正文使用清晰无衬线体，元数据和编号使用等宽字体。
   - 主题节奏：先规划每页的 hero / light / dark 节奏，每 3-4 页插入封面、章节幕封、大引用或问题页。
   - 单页限制：每页只承载一个叙事动作，长内容拆成“钩子 -> 背景 -> 证据 -> 转折 -> 收束”。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 页面组件：杂志页眉、衬线大标题、导语、数据大字报、图文分栏、图片网格、引用页和收束页。
   - 图片：图片是第一公民，使用 16:10、4:3、3:2、1:1 或 16:9 等标准比例；优先只裁底部，保留顶部和左右关键信息。
  【布局原则】适合观点分享、行业观察、人文叙事、产品故事和私享会演讲；克制优于炫技，结构优于装饰。`,
    },
  {
      id: "swiss-presentation-system",
      previewHtml: `<div style="font-family: Inter, Helvetica, sans-serif; background: #fafaf8; padding: 16px; height: 100%; border: 1.5px solid #0a0a0a; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #0a0a0a; padding-bottom: 8px; margin-bottom: 10px;">
      <span style="font-size: 14px; font-weight: 900; color: #002FA7; letter-spacing: -0.5px;">SWISS GRID SYSTEM</span>
      <span style="font-size: 10px; font-family: monospace; color: #737373;">GRID STACK</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: auto;">
      <div style="font-size: 18px; font-weight: 300; color: #0a0a0a; line-height: 1.15; letter-spacing: -0.5px;">
        MAXIMUM INFORMATION.<br>MINIMUM EMBELLISHMENT.
      </div>
      <div style="display: flex; gap: 12px; border-top: 1px solid #d4d4d2; padding-top: 8px;">
        <div style="flex: 1;">
          <div style="font-size: 22px; font-weight: 200; color: #002FA7;">01</div>
          <div style="font-size: 10px; font-weight: 700; color: #0a0a0a; margin-top: 3px;">SYSTEM ORDER</div>
        </div>
        <div style="flex: 1; border-left: 1px solid #d4d4d2; padding-left: 12px;">
          <div style="font-size: 22px; font-weight: 200; color: #0a0a0a;">960</div>
          <div style="font-size: 10px; font-weight: 700; color: #737373; margin-top: 3px;">BASE WIDTH</div>
        </div>
      </div>
    </div>
    <div style="font-size: 10px; font-weight: bold; color: #0a0a0a; letter-spacing: 0.5px; border-top: 1px solid #0a0a0a; padding-top: 6px;">
      SEC. 04 / DATA REPORT
    </div>
  </div>`,
      name: "瑞士国际主义",
      category: "演示汇报/瑞士国际主义",
      accent: "#002FA7",
      description:
        "瑞士国际主义网页 PPT，12 栏网格、单一锚点色、直角纯色和超强字号对比",
      style: `【视觉主题】瑞士国际主义系统，信息驱动、冷静、强秩序
  【色彩系统】
   - 基础底色：极浅暖白 #fafaf8，辅助灰阶 #f0f0ee / #d4d4d2 / #737373。
   - 文本颜色：近黑 #0a0a0a，高对比优先。
   - 单一锚点色（克莱因蓝 #002FA7 等）只能做画龙点睛的单点高亮（如 KPI 数字、小编号、栏目徽章），在全页视觉占比控制在 5% 以下，绝对禁止作为大面积背景、边框或让大段文本高亮。
  【排版与防溢出规则】
   - 字体：全程无衬线，优先 Inter / Helvetica / Noto Sans SC；代码和标签可用等宽字体.
   - 字号阶梯：越大的字越轻，主标题和 KPI 使用 200-300 字重，小标签和图表标注使用 500-600 字重。
   - 防折行溢出：中文大标题禁止使用死大字号，必须配合双向视口比例约束（如 \`font-size: min(5.2vw, 9.2vh)\`），以防页面被长标题折行撑爆。
   - 外层间距限制：\`.canvas-card\` 外层包裹容器的内边距设置为 \`padding: 32px 24px 24px\`（上32px，左右24px，下24px）。顶部页眉 \`.chrome-min\` 必须设置 \`margin-bottom: 16px\` 以内，底部页脚 \`.foot-min\` 必须设置 \`margin-top: 14px\` 以内。
   - 垂直高度预算：每页幻灯片的主内容区可用高度不能超过 \`380px\`。禁止使用大间距（如 \`gap-10\` / \`gap-12\`，网格列 gap 建议控制在 \`12px - 20px\`，绝对不能多层嵌套）。
  【组件特征】
   - **强制分页容器**：每一页必须使用 \`<section class="slide">\` 包裹，16:9 比例。
   - 极简代码块：多卡片或幻灯片中的代码块行数必须控制在 **12行** 以内，若超出则精简。必须采用紧凑样式：\`.swiss-code-block\`，且具体样式声明为 \`font-size: 11px; line-height: 1.45; padding: 12px 16px;\` 以防垂直高度超出。
   - 版式：优先使用登记过的 12 栏结构，如封面、statement、KPI tower、横向时间线、duo compare、矩阵、系统图、规格表和 image hero。
   - 几何：直角、纯色块、1px 发丝线、点阵或网格背景；禁止渐变、阴影、圆角、玻璃拟态和随意图标堆叠。
   - 图片：主图优先 21:9，多图统一 21:9 或 16:10；同组图片比例、高度、边距和标题样式必须一致。
  【布局原则】适合数据汇报、产品方法论、工程分享、年度总结和技术发布；视觉冲击来自网格、留白、字号对比和单一锚点色，而不是装饰。`,
    },
];
