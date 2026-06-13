import type { RawDesignStyle } from '../types';

export const docStyles: RawDesignStyle[] = [
  {
      id: "notion",
      name: "暖色极简 · Notion",
      category: "文档知识/知识文档",
      accent: "#0f0f0f",
      description: "暖白底，衬线标题，柔和表面，文档阅读优化",
      previewHtml: `<div style="font-family: -apple-system, sans-serif; background: #ffffff; padding: 16px 20px; height: 100%; display: flex; flex-direction: column;">
    <div style="font-family: Lyon-Text, Georgia, serif; font-size: 18px; font-weight: 700; color: #37352f; margin-bottom: 12px;">Project Spec</div>
    <div style="background: #f1f1ef; padding: 8px; border-radius: 4px; display: flex; gap: 6px; margin-bottom: 12px;">
      <span>💡</span>
      <div style="font-size: 8px; color: #37352f;">This is an important callout block.</div>
    </div>
    <div style="font-size: 8px; color: #787774; line-height: 1.6;">Start writing here...</div>
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
    <div style="width: 30%; background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 12px 8px; display: flex; flex-direction: column; gap: 8px; justify-content: space-between;">
      <div>
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #0891b2; margin-bottom: 6px;"></div>
        <div style="font-size: 11px; font-weight: bold; color: #0f172a;">张明华</div>
        <div style="font-size: 8px; color: #64748b; margin-bottom: 8px;">前端工程师</div>
      </div>
      <div style="font-size: 8px; color: #64748b; line-height: 1.4;">
        📍 深圳<br>
        ✉️ hi@jming.me<br>
        🔗 github.com
      </div>
    </div>
    <div style="flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 8px; justify-content: space-between;">
      <div>
        <div style="font-size: 9px; font-weight: bold; color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 4px;">工作经历</div>
        <div style="margin-bottom: 4px;">
          <div style="font-size: 9px; font-weight: bold; color: #0f172a;">深圳科技发展有限公司</div>
          <div style="font-size: 8px; color: #64748b;">高级前端 · 2024 - 至今</div>
        </div>
        <div style="font-size: 8px; color: #475569; line-height: 1.35;">主导重构核心排版引擎，将包体积减少 40%，实现完全纯前端导出 PDF。</div>
      </div>
      <div>
        <div style="font-size: 9px; font-weight: bold; color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 4px;">开源项目</div>
        <div style="font-size: 8px; color: #475569; font-weight: bold;">markdown2view ➜</div>
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
      description: "现代数字报告，适合数据叙事，暖白底自然色调，混搭字体",
      previewHtml: `<div style="font-family: Georgia, serif; background: #fffaf5; padding: 16px; height: 100%; border: 1px solid #ebdcc5; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="font-size: 8px; font-weight: 800; color: #2f4f4f; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">Annual Report 2026</div>
      <div style="font-size: 16px; font-weight: 900; color: #2f4f4f; line-height: 1.15; margin-bottom: 8px; border-bottom: 2px solid #2f4f4f; padding-bottom: 6px;">Data-Driven<br>Digital Economy</div>
    </div>
    <div style="display: flex; align-items: baseline; gap: 8px;">
      <span style="font-size: 24px; font-weight: 900; color: #2f4f4f;">+84%</span>
      <span style="font-size: 9.5px; color: #6b6359;">Year-over-Year User growth in APAC</span>
    </div>
    <div style="font-size: 8px; color: #8c8375; text-align: right; border-top: 1px solid #ebdcc5; padding-top: 6px;">PUBLISHED BY CONSULTING DEPT</div>
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
      previewHtml: `<div style="font-family: Georgia, serif; background: #ffffff; padding: 16px 20px; height: 100%; border: 1px solid #d1d5db; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; text-align: justify;">
    <div>
      <div style="text-align: center; margin-bottom: 8px;">
        <div style="font-size: 13px; font-weight: bold; color: #111827; font-family: Georgia, serif;">A Decoupled Client-Side Rendering Architecture for Markdown</div>
        <div style="font-size: 8px; color: #374151; font-style: italic; margin-top: 2px;">Dr. Alan Turing, DeepMind Team</div>
      </div>
      <div style="border-top: 1px solid #111827; border-bottom: 1px solid #111827; padding: 6px 0; margin-bottom: 8px;">
        <div style="font-size: 8px; font-weight: bold; color: #111827; margin-bottom: 2px;">Abstract</div>
        <div style="font-size: 7.5px; color: #374151; line-height: 1.3; font-family: serif;">
          We present a novel, zero-backend rendering framework that operates entirely within user space sandboxes. By bypassing server dependency layers, compilation speeds scale logarithmically with DOM tree depth.
        </div>
      </div>
      <div style="font-size: 8px; color: #111827; line-height: 1.3; font-family: sans-serif;">
        <strong>1. Introduction</strong><br>
        Let \(D\) represent the sandboxed DOM tree. Traditional rendering approaches introduce a network round-trip overhead of \(O(N)\) where \(N\) is node count...
      </div>
    </div>
    <div style="border-top: 0.5px solid #d1d5db; padding-top: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; color: #6b7280; font-family: sans-serif;">
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
      previewHtml: `<div style="font-family: -apple-system, sans-serif; background: #ffffff; padding: 14px; height: 100%; border: 1px solid #cbd5e1; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: bold; color: #1e293b;">PRD-2026 / 导出引擎规范</span>
        <span style="background: rgba(37,99,235,0.1); color: #2563eb; font-size: 8px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">DRAFT</span>
      </div>
      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">自由画布 HTML 预览缩略图开发</div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 8px;">
        <thead>
          <tr style="border-bottom: 1.5px solid #e2e8f0; text-align: left; color: #64748b;">
            <th style="padding: 3px 0;">需求描述</th>
            <th style="padding: 3px 0; text-align: center;">优先级</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9; color: #334155;">
            <td style="padding: 4px 0;">设计 13 套剩下的缩略图 HTML</td>
            <td style="padding: 4px 0; text-align: center;"><span style="background: #fee2e2; color: #ef4444; padding: 1px 4px; border-radius: 2px; font-weight: bold;">P0</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9; color: #334155;">
            <td style="padding: 4px 0;">验证打包编译没有任何 TypeScript 报错</td>
            <td style="padding: 4px 0; text-align: center;"><span style="background: #fef9c3; color: #ca8a04; padding: 1px 4px; border-radius: 2px; font-weight: bold;">P1</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="font-size: 8px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px; text-align: right;">最后修改人: Antigravity</div>
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
];
