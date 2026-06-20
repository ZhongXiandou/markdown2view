import type { RawDesignStyle } from '../types';

export const docStyles: RawDesignStyle[] = [
  {
      id: "notion",
      name: "暖色极简 · Notion",
      category: "文档知识/知识文档",
      accent: "#0f0f0f",
      description: "暖白底色，衬线标题，柔和灰色区块，专注文档阅读体验",
      previewHtml: `<div style="font-family: -apple-system, sans-serif; background: #ffffff; padding: 18px 20px; height: 100%; display: flex; flex-direction: column; box-sizing: border-box;">
    <div style="font-family: Lyon-Text, Georgia, serif; font-size: 20px; font-weight: 700; color: #37352f; margin-bottom: 14px;">Project Spec</div>
    <div style="background: #f1f1ef; padding: 10px; border-radius: 4px; display: flex; gap: 8px; margin-bottom: 14px;">
      <span style="font-size: 14px;">💡</span>
      <div style="font-size: 11px; color: #37352f; line-height: 1.5;">This is an important callout block for key notes.</div>
    </div>
    <div style="font-size: 11px; color: #787774; line-height: 1.7;">Start writing your document here...</div>
    <div style="display: flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px;">
      <div style="width: 14px; height: 2px; background: #37352f;"></div>
      <span style="font-size: 11px; color: #37352f; font-weight: 600;">Toggle list</span>
    </div>
  </div>`,
      style: `【视觉主题】专注阅读与书写的暖色极简文档（参考 Notion）
  【色彩系统】
   - 基础底色：暖白 #ffffff 或 #f7f6f3
   - 文本颜色：深灰近黑 #37352f，次要文本 #787774
   - 背景块：极其柔和的浅灰色块（如 #f1f1ef）
  【排版规则】
   - 字体：标题强制使用优雅衬线体，正文使用无衬线体。
   - 层级：正文行高舒适（1.6-1.7），段落间距明显。
  【组件特征】
   - Callout 卡片：带有一侧边框或浅底色，前缀常带一个大 Emoji。
   - 引用块：左侧细竖线。
  【布局原则】左对齐或居中定宽，无冗余装饰。`,
    },
  {
      id: "resume",
      name: "简历 / 个人主页",
      category: "文档知识/个人简历",
      accent: "#0891b2",
      description: "单页简历，左右分栏，清晰层级，A4 打印友好",
      previewHtml: `<div style="font-family: sans-serif; background: #fff; border: 1px solid #e2e8f0; height: 100%; display: flex; box-sizing: border-box;">
    <div style="width: 32%; background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 14px 10px; display: flex; flex-direction: column; gap: 10px; justify-content: space-between;">
      <div>
        <div style="width: 30px; height: 30px; border-radius: 50%; background: #0891b2; margin-bottom: 8px;"></div>
        <div style="font-size: 13px; font-weight: bold; color: #0f172a;">张明华</div>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 10px;">前端工程师</div>
      </div>
      <div style="font-size: 10px; color: #64748b; line-height: 1.6;">
        📍 深圳<br>
        ✉️ hi@jming.me<br>
        🔗 github.com
      </div>
    </div>
    <div style="flex: 1; padding: 14px; display: flex; flex-direction: column; gap: 10px; justify-content: space-between;">
      <div>
        <div style="font-size: 11px; font-weight: bold; color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 6px;">工作经历</div>
        <div style="margin-bottom: 6px;">
          <div style="font-size: 11px; font-weight: bold; color: #0f172a;">深圳科技发展有限公司</div>
          <div style="font-size: 10px; color: #64748b;">高级前端 · 2024 - 至今</div>
        </div>
        <div style="font-size: 10px; color: #475569; line-height: 1.4;">主导重构核心排版引擎，包体积减少 40%。</div>
      </div>
      <div>
        <div style="font-size: 11px; font-weight: bold; color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 6px;">开源项目</div>
        <div style="font-size: 10px; color: #475569; font-weight: bold;">markdown2view ➜</div>
      </div>
    </div>
  </div>`,
      style: `【视觉主题】专业清晰的 A4 打印级简历
  【色彩系统】
   - 基础底色：纯白 #ffffff
   - 侧边栏色（可选）：浅灰 #f8fafc 或深青色
   - 强调色：商务青 #0891b2
  【排版规则】
   - 字体：现代无衬线体，阅读流畅。
   - 层级：经历时间线对齐，公司名加粗，职位名偏灰。
  【组件特征】
   - 容器：如果有多页请使用 \`<section class="page">\` 包裹，整体定宽 A4 比例。
   - 模块：时间轴节点（小圆点与左侧虚线）。
  【布局原则】典型的左右双栏结构，左窄右宽，高度紧凑，留白克制但绝不拥挤。`,
    },
  {
      id: "report",
      name: "年度报告",
      category: "文档知识/年度报告",
      accent: "#2f4f4f",
      description: "现代数字年度报告，暖白底自然色调，衬线与无衬线混搭，适合数据叙事",
      previewHtml: `<div style="font-family: Georgia, serif; background: #fffaf5; padding: 18px; height: 100%; border: 1px solid #ebdcc5; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="font-size: 10px; font-weight: 800; color: #2f4f4f; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Annual Report 2026</div>
      <div style="font-size: 19px; font-weight: 900; color: #2f4f4f; line-height: 1.15; margin-bottom: 8px; border-bottom: 2px solid #2f4f4f; padding-bottom: 8px;">Data-Driven<br>Digital Economy</div>
    </div>
    <div style="display: flex; align-items: baseline; gap: 10px;">
      <span style="font-size: 28px; font-weight: 900; color: #2f4f4f;">+84%</span>
      <span style="font-size: 11px; color: #6b6359; line-height: 1.4;">Year-over-Year User growth in APAC</span>
    </div>
    <div style="font-size: 10px; color: #8c8375; text-align: right; border-top: 1px solid #ebdcc5; padding-top: 8px;">PUBLISHED BY CONSULTING DEPT</div>
  </div>`,
      style: `【视觉主题】故事驱动的现代数字年度报告（Annual Report）
  【色彩系统】
   - 基础底色：暖调灰白/纸张色（如 #faf9f6 或 #f5f5f0），避免刺眼的纯白。
   - 文本颜色：深灰（非纯黑，如 #2c2c2c）以提供柔和的对比度。
   - 强调色：成熟、自然的色调（如森林绿、橄榄绿、大地色），用于重点数据和图表。
  【排版规则】
   - 字体：标题可混搭优雅的古典衬线体（传达权威感与人文感）与现代无衬线体。正文使用高可读性的无衬线体。
   - 留白：极其慷慨的段落间距和页边距，减轻视觉疲劳。
  【组件特征】
   - 核心数据：用醒目的大字号与强调色展示核心数字，取代密集的传统表格。
   - **强制分页容器**：如果是一份多页报告，每一页必须使用 \`<section class="page">\` 独立包裹，尺寸定宽（如 A4 或横屏幻灯片比例）。
  【布局原则】单页突出一个核心洞察，排版类似高端商业杂志，内容结构化且叙事清晰。`,
    },
  {
      id: "academic-paper",
      previewHtml: `<div style="font-family: Georgia, serif; background: #ffffff; padding: 18px 20px; height: 100%; border: 1px solid #d1d5db; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; text-align: justify;">
    <div>
      <div style="text-align: center; margin-bottom: 10px;">
        <div style="font-size: 14px; font-weight: bold; color: #111827; font-family: Georgia, serif; line-height: 1.25;">A Decoupled Client-Side Rendering Architecture</div>
        <div style="font-size: 10px; color: #374151; font-style: italic; margin-top: 3px;">Dr. Alan Turing, DeepMind Team</div>
      </div>
      <div style="border-top: 1px solid #111827; border-bottom: 1px solid #111827; padding: 8px 0; margin-bottom: 10px;">
        <div style="font-size: 10px; font-weight: bold; color: #111827; margin-bottom: 3px;">Abstract</div>
        <div style="font-size: 10px; color: #374151; line-height: 1.4; font-family: serif;">
          We present a novel, zero-backend rendering framework that operates entirely within user space sandboxes.
        </div>
      </div>
      <div style="font-size: 10px; color: #111827; line-height: 1.4; font-family: sans-serif;">
        <strong>1. Introduction</strong><br>
        Let D represent the sandboxed DOM tree. Traditional rendering introduces O(N) overhead...
      </div>
    </div>
    <div style="border-top: 0.5px solid #d1d5db; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #6b7280; font-family: sans-serif;">
      <span>arXiv:2606.12874 [cs.SE]</span>
      <span>Page 1 of 12</span>
    </div>
  </div>`,
      name: "学术论文",
      category: "文档知识/学术论文",
      accent: "#374151",
      description: "论文式阅读排版，摘要、章节、脚注、图表题注和参考文献清晰",
      style: `【视觉主题】学术论文与研究手稿，严谨、安静、长文友好
  【色彩系统】
   - 基础底色：纯白 #ffffff。
   - 文本颜色：正文 #111827，二级信息 #6b7280。
   - 强调色：中性灰 #374151 或深蓝 #1e3a8a，必须克制。
  【排版规则】
   - 字体：标题可用衬线体，正文使用高可读衬线或宋体风格。
   - 结构：标题、作者信息、摘要、关键词、章节、图表、参考文献必须层级明确。
  【组件特征】
   - 图表：题注必须靠近图表；表格使用细线和清晰表头。
   - 注释：脚注、引用编号、参考文献列表要整齐，不要做装饰卡片。
  【布局原则】适合研究摘要、论文预印本、学术报告；优先阅读和打印，不追求强视觉冲击。`,
    },
  {
      id: "product-spec",
      previewHtml: `<div style="font-family: -apple-system, sans-serif; background: #ffffff; padding: 16px; height: 100%; border: 1px solid #cbd5e1; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 12px; font-weight: bold; color: #1e293b;">PRD-2026 / 导出引擎规范</span>
        <span style="background: rgba(37,99,235,0.12); color: #2563eb; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: bold;">DRAFT</span>
      </div>
      <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">自由画布导出能力规格</div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px;">
        <thead>
          <tr style="border-bottom: 1.5px solid #e2e8f0; text-align: left; color: #64748b;">
            <th style="padding: 4px 0;">需求描述</th>
            <th style="padding: 4px 0; text-align: center;">优先级</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9; color: #334155;">
            <td style="padding: 6px 0;">支持 PDF / PNG 一键导出</td>
            <td style="padding: 6px 0; text-align: center;"><span style="background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 3px; font-weight: bold;">P0</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9; color: #334155;">
            <td style="padding: 6px 0;">保持 0 个 TypeScript 报错</td>
            <td style="padding: 6px 0; text-align: center;"><span style="background: #fef9c3; color: #ca8a04; padding: 2px 6px; border-radius: 3px; font-weight: bold;">P1</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: right;">最后修改人: Antigravity</div>
  </div>`,
      name: "产品规格书",
      category: "文档知识/产品文档",
      accent: "#2563eb",
      description: "PRD/规格书风格，目录、需求表、状态标签、流程和验收标准完整",
      style: `【视觉主题】产品规格书与 PRD，结构化、可评审、可执行
  【色彩系统】
   - 基础底色：白 #ffffff，辅助区块 #f8fafc。
   - 文本颜色：主文本 #111827，说明 #64748b。
   - 强调色：蓝 #2563eb，状态色绿/黄/红用于优先级和风险。
  【排版规则】
   - 字体：现代无衬线体；标题编号清楚，表格信息密度适中。
   - 层级：背景、目标、用户故事、需求列表、流程、验收标准必须分区。
  【组件特征】
   - 模块：需求表、优先级标签、流程步骤、状态徽标、风险提示和开放问题列表。
   - 文档容器：长文用定宽阅读区；多页输出可使用 \`<section class="page">\`。
  【布局原则】适合产品方案、技术规格、项目需求；重点是让团队一眼看懂范围、状态和下一步。`,
    },
  {
    id: "gov-doc",
    name: "公文排版",
    category: "文档知识/公文文档",
    accent: "#c0202c",
    description: "符合 GB/T 9704-2012 标准的党政机关公文排版，红头文件、发文字号、密级标注、仿宋正文",
    previewHtml: `<div style="font-family: 'FangSong', 'STFangsong', serif; background: #ffffff; padding: 18px 20px; height: 100%; display: flex; flex-direction: column; box-sizing: border-box;">
  <div style="text-align: left; font-size: 11px; color: #c0202c; font-weight: bold; margin-bottom: 4px;">绝密★保密期限</div>
  <div style="text-align: center; font-size: 22px; font-weight: bold; color: #c0202c; font-family: 'STSong', 'SimSun', serif; letter-spacing: 4px; margin-bottom: 6px;">XX市人民政府办公厅</div>
  <div style="text-align: center; font-size: 12px; color: #000; margin-bottom: 4px;">市政发〔2026〕第1号</div>
  <div style="height: 3px; background: #c0202c; margin-bottom: 14px;"></div>
  <div style="text-align: center; font-size: 16px; font-weight: bold; color: #000; font-family: 'STSong', 'SimSun', serif; margin-bottom: 12px;">关于推进数字经济发展的通知</div>
  <div style="font-size: 11px; color: #000; line-height: 1.8; text-indent: 2em; text-align: justify;">各区人民政府，市政府各委、办、局：为深入贯彻数字经济发展战略，现就有关事项通知如下...</div>
  <div style="margin-top: auto; text-align: right; font-size: 11px; color: #000; padding-top: 10px;">XX市人民政府办公厅<br>2026年6月20日</div>
</div>`,
    style: `【视觉主题】符合 GB/T 9704-2012 标准的党政机关公文排版
  【色彩系统】
   - 基础底色：纯白 #ffffff
   - 红头颜色：公文红 #c0202c（发文机关名称与分隔线）
   - 正文颜色：纯黑 #000000
   - 密级标注：红色 #c0202c
  【排版规则】
   - 字体：发文机关名称用宋体加粗红色；正文使用仿宋 GB2312 / FangSong，三号字。
   - 红头：发文机关名称居中，字号较大，下方红色分隔线。
   - 发文字号：居中，置于红头下方、分隔线上方。
   - 密级与紧急程度：左上角顶格，红色加粗。
   - 标题：居中，二号宋体加粗。
   - 主送机关：左顶格，后跟全角冒号。
   - 正文：首行缩进两字，两端对齐，行距 28-30 磅。
   - 落款：发文机关署名与日期右对齐，距正文两行。
  【组件特征】
   - 使用 <gov-header> 标签渲染公文头部（红头 + 发文字号 + 密级 + 签发人）。
   - 公文头部独占首页顶部，正文紧随其后。
  【布局原则】严格遵循公文格式规范，适合打印、归档、正式发文。`,
  },
];
