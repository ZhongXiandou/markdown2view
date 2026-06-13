import type { RawDesignStyle } from '../types';

export const techStyles: RawDesignStyle[] = [
  {
      id: "vercel",
      name: "极简黑白 · Vercel",
      category: "科技产品/极简工程",
      accent: "#000000",
      description: "黑白精确主义，大留白，Geist 风格无衬线，锐利分割线",
      previewHtml: `<div style="font-family: Geist, Inter, sans-serif; background: #fff; padding: 16px; height: 100%; border: 1px solid #eaeaea; display: flex; flex-direction: column;">
    <div style="font-size: 14px; font-weight: 700; color: #000; margin-bottom: 8px;">Vercel Deploy</div>
    <div style="font-size: 8px; color: #666; margin-bottom: auto;">Push your code and deploy instantly.</div>
    <div style="margin-top: 12px; display: flex; gap: 6px;">
      <div style="background: #000; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 6px; font-weight: 500;">Deploy</div>
      <div style="border: 1px solid #eaeaea; color: #666; padding: 4px 8px; border-radius: 6px; font-size: 6px;">Cancel</div>
    </div>
  </div>`,
      style: `【视觉主题】黑白精确主义，极简工程师审美（参考 Vercel）
  【色彩系统】
   - 基础底色：纯白 #ffffff
   - 文本颜色：主标题纯黑 #000000，次要文本中灰 #666666
   - 分割线与边框：极浅灰 #eaeaea
   - 强调色：纯黑 #000000
  【排版规则】
   - 字体：无衬线体（优先 Geist / Inter）
   - 层级：标题字重 700 且字距收紧，正文字重 400 行高 1.6
  【组件特征】
   - 卡片：纯白背景，6px 极小圆角，1px #eaeaea 边框，**严格禁止使用阴影**。
   - 按钮：纯黑背景，纯白文字，6px 圆角。
  【布局原则】大量留白，元素间距严格对齐，视觉呈现绝对的冷静与精确。`,
    },
  {
      id: "stripe",
      name: "紫色渐变 · Stripe",
      category: "科技产品/金融科技",
      accent: "#635bff",
      description: "标志性紫色渐变，weight-300 轻盈优雅，斜切色块",
      previewHtml: `<div style="font-family: sans-serif; background: #fff; padding: 16px; height: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(99,91,255,0.1); display: flex; flex-direction: column;">
    <div style="font-size: 14px; font-weight: 400; color: #30313d; margin-bottom: 8px;">Payment</div>
    <div style="font-size: 8px; color: #425466; margin-bottom: auto;">Secure processing with Stripe.</div>
    <div style="background: linear-gradient(90deg, #635bff, #00d4ff); color: #fff; padding: 6px; border-radius: 12px; font-size: 8px; font-weight: 600; text-align: center; margin-top: 12px;">Pay $120</div>
  </div>`,
      style: `【视觉主题】科技与优雅融合，顶级金融科技质感（参考 Stripe）
  【色彩系统】
   - 基础底色：纯白 #ffffff 或极浅灰
   - 文本颜色：深灰标题 #30313d，正文偏蓝灰 #425466
   - 强调色：标志性紫色 #635bff 及其渐变（蓝紫到青色）
  【排版规则】
   - 字体：现代无衬线体
   - 层级：标题常用细字重（300-500），显得轻盈高级，正文行距宽松
  【组件特征】
   - 卡片：白底，柔和大圆角（12-16px），伴有轻微且柔和的彩色投影（如 rgba(99, 91, 255, 0.1)）。
   - 按钮：紫色渐变或纯色填充，大圆角或完全胶囊形。
  【布局原则】常伴随斜切的背景色块或柔和的渐变光晕，具备极强的信任感与高级感。`,
    },
  {
      id: "linear",
      name: "精密深色 · Linear",
      category: "科技产品/精密工具",
      accent: "#5e6ad2",
      description: "超极简深色，精密网格，淡紫强调，克制动效",
      previewHtml: `<div style="font-family: Inter, sans-serif; background: linear-gradient(180deg, #1c1c1f, #08090a); padding: 16px; height: 100%; border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column;">
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
      <div style="width: 8px; height: 8px; border-radius: 50%; border: 1px solid #5e6ad2;"></div>
      <div style="font-size: 10px; font-weight: 600; color: #f7f8f8;">LIN-128</div>
    </div>
    <div style="font-size: 12px; font-weight: 600; color: #f7f8f8; margin-bottom: 4px;">Update API</div>
    <div style="font-size: 8px; color: #8a8f98;">Implement the new v2 endpoints.</div>
  </div>`,
      style: `【视觉主题】精密深色界面，冷峻的工程师审美（参考 Linear）
  【色彩系统】
   - 基础底色：深色底（#08090a ~ #1c1c1f 渐变）
   - 文本颜色：高亮白 #f7f8f8 与次要灰 #8a8f98
   - 强调色：淡靛紫 #5e6ad2
   - 边框色：微亮边框 rgba(255,255,255,0.08)
  【排版规则】
   - 字体：紧凑无衬线体，字距略收紧
   - 层级：标题字重 600，高对比度
  【组件特征】
   - 卡片：半透明深色面板，1px 微亮边框，细腻低调的暗投影。
   - 按钮：极简深灰底色或淡紫底色。
  【布局原则】精密网格，所有元素边缘对齐极致严谨，极度克制。`,
    },
  {
      id: "terminal",
      name: "开发者代码 · Terminal",
      category: "科技产品/开发极客",
      accent: "#00ff9c",
      description: "等宽字体、命令片段、API 示例和调试信息清晰排布",
      previewHtml: `<div style="font-family: Consolas, Monaco, monospace; background: #0f1115; color: #a9b1d6; padding: 14px; height: 100%; border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; box-sizing: border-box;">
    <div style="display: flex; gap: 5px; margin-bottom: 10px;">
      <div style="width: 6px; height: 6px; border-radius: 50%; background: #ff5f56;"></div>
      <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffbd2e;"></div>
      <div style="width: 6px; height: 6px; border-radius: 50%; background: #27c93f;"></div>
    </div>
    <div style="font-size: 12px; color: #00ff9c; margin-bottom: 4px;">$ npm run dev</div>
    <div style="font-size: 11px; color: #787c99; margin-bottom: auto; line-height: 1.4;">
      > markdown2view@1.0.0 dev<br>
      > vite --port 3000<br>
      <span style="color: #3b82f6;">➜</span> Local: http://localhost:3000
    </div>
    <div style="font-size: 10px; color: #565f89; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px; text-align: right;">UTF-8</div>
  </div>`,
      style: `【视觉主题】开发者代码工作台，清晰、克制、可信
  【色彩系统】
   - 基础底色：深灰 #0f1115 或冷白 #f8fafc，按内容密度选择。
   - 文本颜色：主文本高对比，注释与辅助信息使用中性灰。
   - 强调色：青绿 #22c55e 或蓝 #38bdf8，仅用于命令提示、状态和关键参数。
  【排版规则】
   - 字体：代码、命令、参数使用 JetBrains Mono / Fira Code；说明文字使用现代无衬线体。
   - 层级：先给结论，再给命令、输出、解释，避免满屏代码。
  【组件特征】
   - 代码块：带标题、语言标签、行号或输出区，边框清晰，不使用发光装饰。
   - 信息块：API 请求、响应、环境变量、错误提示分别用稳定区块表达。
  【布局原则】适合 CLI 教程、SDK 说明、调试记录、技术方案附录；重点是可读和可复制。`,
    },
  {
      id: "claude",
      name: "克制温和 · Claude",
      category: "科技产品/AI 助手",
      accent: "#d97757",
      description: "暖白底，衬线体标题搭配无衬线正文，阅读体验极佳的温和科技感",
      previewHtml: `<div style="font-family: Georgia, serif; background: #faf9f8; padding: 14px; height: 100%; border: 1px solid #e5e5db; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: auto;">
      <div style="width: 18px; height: 18px; border-radius: 4px; background: #d97757; color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: bold; shrink: 0; font-family: sans-serif;">C</div>
      <div style="flex: 1;">
        <div style="font-size: 11px; font-weight: bold; color: #1a1a1a; font-family: Georgia, serif; margin-bottom: 4px;">Claude's Perspective</div>
        <div style="font-size: 10px; color: #444; line-height: 1.4; text-align: justify;">This layout prioritizes long-form readability, warm editorial spacing, and elegant serif typography. It feels thoughtful, human, and balanced.</div>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e5db; padding-top: 8px; margin-top: 8px;">
      <span style="font-size: 8px; color: #8a8a80;">Model: Sonnet 3.5</span>
      <span style="font-size: 8px; background: #f0ede6; color: #6e6e65; padding: 1px 4px; border-radius: 4px;">1.4k tokens</span>
    </div>
  </div>`,
      style: `【视觉主题】克制、温和、富有书卷气的 AI 对话窗（参考 Claude）
  【色彩系统】
   - 基础底色：暖白 #fdfdfc 或 #faf9f8
   - 文本颜色：深灰偏暖 #2a2a2a
   - 强调色：古典陶土红/深橘 #d97757
  【排版规则】
   - 字体：标题优雅衬线体（Tiempos/宋体），正文无衬线。
  【组件特征】
   - 卡片：圆角适中（8-12px），淡淡的灰边框或阴影。
  【布局原则】无多余装饰，对话体阅读体验极佳。`,
    },
  {
      id: "supabase",
      name: "开源极客 · Supabase",
      category: "科技产品/开源数据",
      accent: "#3ecf8e",
      description: "深灰背景，亮绿强调，等宽字体点缀，暗黑开源风",
      previewHtml: `<div style="font-family: Consolas, monospace; background: #1c1c1c; color: #ededed; padding: 14px; height: 100%; border: 1px solid #2e2e2e; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2e2e2e; padding-bottom: 6px; margin-bottom: 8px;">
        <span style="color: #3ecf8e; font-size: 11px; font-weight: bold;">⚡ supabase</span>
        <span style="color: #666; font-size: 8px;">active</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 10px; color: #888;">SELECT * FROM profiles;</div>
        <div style="background: #242424; border: 1px solid #333; border-radius: 4px; padding: 4px; font-size: 9px;">
          <span style="color: #3ecf8e;">id:</span> 1 &nbsp;
          <span style="color: #3ecf8e;">name:</span> "Antigravity"<br>
          <span style="color: #3ecf8e;">role:</span> "Developer"
        </div>
      </div>
    </div>
    <div style="font-size: 9px; color: #555; text-align: right;">PostgreSQL 15.1</div>
  </div>`,
      style: `【视觉主题】暗色极客，现代开源数据库（参考 Supabase）
  【色彩系统】
   - 基础底色：极深灰/近黑 #1c1c1c
   - 文本颜色：灰白 #ededed
   - 强调色：高亮翠绿 #3ecf8e
  【排版规则】
   - 字体：代码和数据大量穿插等宽字体。
  【组件特征】
   - 面板：1px 反光内描边，常带有微弱的绿色泛光。
  【布局原则】严谨的开发者文档式排版。`,
    },
  {
      id: "raycast",
      name: "毛玻璃 · Raycast",
      category: "科技产品/系统工具",
      accent: "#ff6363",
      description: "macOS 原生感，深色毛玻璃，悬浮搜索框，极致动效",
      previewHtml: `<div style="font-family: sans-serif; background: #18181b; padding: 12px; height: 100%; border: 1px solid #27272a; border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="background: #27272a; border-radius: 6px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between;">
      <span style="color: #d4d4d8; font-size: 11px;">Search commands...</span>
      <span style="background: #3f3f46; color: #a1a1aa; font-size: 9px; padding: 1px 4px; border-radius: 3px;">⌘ K</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px; flex: 1;">
      <div style="background: rgba(255,99,99,0.1); border-radius: 4px; padding: 4px 8px; display: flex; align-items: center; justify-content: space-between;">
        <span style="color: #ff6363; font-size: 10px; font-weight: bold;">Create Snippet</span>
        <span style="color: #71717a; font-size: 8px;">Extension</span>
      </div>
      <div style="padding: 4px 8px; display: flex; align-items: center; justify-content: space-between;">
        <span style="color: #a1a1aa; font-size: 10px;">Clear Clipboard History</span>
        <span style="color: #71717a; font-size: 8px;">System</span>
      </div>
    </div>
  </div>`,
      style: `【视觉主题】极致丝滑的 macOS 悬浮窗口（参考 Raycast）
  【色彩系统】
   - 基础底色：深色毛玻璃（rgba(0,0,0,0.5) 配合 blur(20px)）
   - 强调色：红色或高亮蓝。
  【排版规则】
   - 极简苹果原生系统字体，小字号，精细对齐。
  【组件特征】
   - 带有内反光（rgba(255,255,255,0.1)）的精美卡片。
   - 深色小标签高亮快捷键。
  【布局原则】列表排布密集且克制。`,
    },
  {
      id: "mongodb",
      name: "企业数据 · MongoDB",
      category: "科技产品/企业数据",
      accent: "#00ed64",
      description: "深蓝色/乳白底，几何粗体，标志性亮绿，企业信任感",
      previewHtml: `<div style="font-family: sans-serif; background: #001e2b; padding: 14px; height: 100%; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid rgba(0,237,100,0.15);">
    <div>
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
        <div style="width: 14px; height: 14px; border-radius: 3px; background: #00ed64; display: flex; align-items: center; justify-content: center; font-size: 9px;">🍃</div>
        <span style="color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">MongoDB Atlas</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-family: monospace; font-size: 9.5px;">
        <div style="color: #88a4bf;">db.users.find({ status: "active" })</div>
        <div style="color: #00ed64; padding-left: 8px;">➜ [ 128 documents found ]</div>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px;">
      <span style="color: #88a4bf; font-size: 8px;">Cluster0.primary</span>
      <div style="width: 6px; height: 6px; border-radius: 50%; background: #00ed64; box-shadow: 0 0 6px #00ed64;"></div>
    </div>
  </div>`,
      style: `【视觉主题】稳重、强大的企业数据平台（参考 MongoDB）
  【色彩系统】
   - 基础底色：午夜深蓝 #001e2b 或 乳白底
   - 强调色：极其明亮的树叶绿 #00ed64
  【排版规则】
   - 字体：几何感极强的粗壮无衬线体。
  【组件特征】
   - 大块深色和浅色的截然对比，力量感强。
  【布局原则】大版面，块状分明。`,
    },
  {
      id: "github",
      name: "开源协作 · GitHub",
      category: "科技产品/开源协作",
      accent: "#2f81f7",
      description: "经典浅色/深灰，冷色边框，蓝色链接，代码原生感",
      previewHtml: `<div style="font-family: sans-serif; background: #fff; padding: 14px; height: 100%; border: 1px solid #d0d7de; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: bold; color: #0969da;">ZhongXiandou/markdown2view</span>
        <span style="border: 1px solid #d0d7de; font-size: 9px; padding: 1px 5px; border-radius: 10px; color: #57606a;">Public</span>
      </div>
      <div style="font-size: 10px; color: #57606a; line-height: 1.3; margin-bottom: 10px;">A pure frontend, zero backend workspace to render and export Markdown files.</div>
    </div>
    <div style="display: flex; gap: 3px; align-items: center; margin-bottom: 4px;">
      <div style="width: 10px; height: 10px; background: #ebedf0; border-radius: 2px;"></div>
      <div style="width: 10px; height: 10px; background: #9be9a8; border-radius: 2px;"></div>
      <div style="width: 10px; height: 10px; background: #40c463; border-radius: 2px;"></div>
      <div style="width: 10px; height: 10px; background: #30a14e; border-radius: 2px;"></div>
      <div style="width: 10px; height: 10px; background: #216e39; border-radius: 2px;"></div>
      <span style="font-size: 8px; color: #57606a; margin-left: 4px;">142 commits</span>
    </div>
  </div>`,
      style: `【视觉主题】冷色、逻辑性、代码原生的开源环境（参考 GitHub）
  【色彩系统】
   - 基础底色：纯白配浅灰区块，或深黑 #0d1117。
   - 边框色：冷灰色 #d0d7de 或 #30363d。
   - 强调色：克莱因蓝 #2f81f7
  【排版规则】
   - 系统级无衬线体，代码段落紧密镶嵌。
  【组件特征】
   - 大量浅色精细边框切分区域。按钮多为冷灰白底。
  【布局原则】极其规整的盒子模型。`,
    },
  {
      id: "openai",
      name: "未来黑白 · OpenAI",
      category: "科技产品/前沿 AI",
      accent: "#10a37f",
      description: "纯黑白对比，优雅细体或宋体，微弱绿色点缀，未来极简",
      previewHtml: `<div style="font-family: sans-serif; background: #000; color: #fff; padding: 16px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div style="font-size: 18px; font-weight: 300; letter-spacing: -0.5px; line-height: 1.2; margin-top: 10px;">
      Introducing GPT-4o.<br>
      Our most advanced model.
    </div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #222; padding-top: 10px;">
      <span style="font-size: 10px; color: #888;">AI Frontier Research</span>
      <span style="font-size: 10px; color: #10a37f; font-weight: bold;">Learn more ➜</span>
    </div>
  </div>`,
      style: `【视觉主题】前沿科技、充满哲学与神秘感的极致极简（参考 OpenAI 官网）
  【色彩系统】
   - 基础底色：极致纯黑 #000000 或 纯白。
   - 强调色：极度节制的特有青绿 #10a37f
  【排版规则】
   - 优雅的中文字体（黑体或具有书籍感的衬线）。
  【组件特征】
   - 没有任何多余边框或阴影。
  【布局原则】大面积空旷带来的未来压迫感与高级感。`,
    },
  {
      id: "tailwind",
      name: "现代实用 · Tailwind CSS",
      category: "科技产品/开发框架",
      accent: "#38bdf8",
      description: "系统化字体，柔和阴影，蓝青主色，标准实用主义",
      previewHtml: `<div style="font-family: ui-sans-serif, system-ui; background: #f9fafb; padding: 16px; height: 100%; display: flex; flex-direction: column;">
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">Beautiful UI</div>
      <div style="font-size: 8px; color: #475569; margin-bottom: 12px;">Built with utility classes.</div>
      <div style="background: #38bdf8; color: #fff; padding: 6px; border-radius: 6px; font-size: 7px; font-weight: 500; text-align: center;">Get Started</div>
    </div>
  </div>`,
      style: `【视觉主题】完美的实用主义现代网页标杆（参考 Tailwind UI）
  【色彩系统】
   - 基础底色：白 #ffffff 配 浅灰 #f9fafb。
   - 文本颜色：石板灰 #1e293b 到 #475569。
   - 强调色：天空蓝 #38bdf8 或 靛蓝 #6366f1。
  【排版规则】
   - 规整平衡的字体缩放。
  【组件特征】
   - 标志性的精美弥散阴影层级（shadow-md/xl）。
  【布局原则】标准、通用、无可挑剔的商业组件范式。`,
    },
  {
      id: "ai-console",
      name: "智能控制台",
      category: "科技产品/智能控制台",
      accent: "#7c3aed",
      description:
        "AI 产品控制台，深浅混合界面，模型状态、任务流和提示词面板清晰分区",
      previewHtml: `<div style="font-family: sans-serif; background: #0f172a; padding: 12px; height: 100%; display: flex; gap: 8px; box-sizing: border-box; border: 1px solid #1e293b; border-radius: 8px;">
    <div style="width: 25%; border-right: 1px solid #1e293b; padding-right: 6px; display: flex; flex-direction: column; gap: 6px;">
      <div style="width: 14px; height: 14px; border-radius: 4px; background: #7c3aed;"></div>
      <div style="height: 4px; width: 100%; background: #1e293b; border-radius: 1px;"></div>
      <div style="height: 4px; width: 70%; background: #1e293b; border-radius: 1px;"></div>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: bold; color: #cbd5e1;">Model Panel</span>
          <span style="font-size: 8px; color: #34d399;">● Online</span>
        </div>
        <div style="background: #1e293b; padding: 4px; border-radius: 4px; font-size: 9px; color: #38bdf8; font-family: monospace;">Claude 3.5 Sonnet</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 16px;">
        <div style="width: 15%; height: 30%; background: #7c3aed; border-radius: 1px;"></div>
        <div style="width: 15%; height: 60%; background: #7c3aed; border-radius: 1px;"></div>
        <div style="width: 15%; height: 45%; background: #7c3aed; border-radius: 1px;"></div>
        <div style="width: 15%; height: 80%; background: #7c3aed; border-radius: 1px;"></div>
        <div style="width: 15%; height: 95%; background: #7c3aed; border-radius: 1px;"></div>
      </div>
    </div>
  </div>`,
      style: `【视觉主题】面向 AI 产品的专业控制台，兼具实验室感与可操作性
  【色彩系统】
   - 基础底色：冷白 #f8fafc 或深灰 #0f172a；不要做单纯黑底。
   - 文本颜色：主文本 #0f172a / #f8fafc，次要文本 #64748b。
   - 强调色：紫色 #7c3aed 与青色 #06b6d4，用于状态、进度与关键按钮。
  【排版规则】
   - 字体：现代无衬线体，代码、模型名、参数值使用等宽字体。
   - 层级：顶部任务目标清晰，参数标签小而精确，结果区域保持高可读性。
  【组件特征】
   - 面板：左侧导航 / 中央工作流 / 右侧参数检查器三栏结构，边框细、圆角 10-12px。
   - 状态：使用小型状态点、进度条、token 计数、运行日志块，不要空白图表。
  【布局原则】适合 AI 工作台、模型评测、自动化流程页面；强调“可控、可审计、可复用”。`,
    },
  {
      id: "blueprint-tech",
      name: "蓝图科技",
      category: "科技产品/蓝图架构",
      accent: "#2563eb",
      description: "工程蓝图风，细网格、结构线、系统架构 and 模块说明特别清晰",
      previewHtml: `<div style="font-family: sans-serif; background: #08111f; color: #22d3ee; padding: 14px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid #112640; border-radius: 8px; position: relative; background-image: radial-gradient(rgba(37,99,235,0.15) 1px, transparent 1px); background-size: 10px 10px;">
    <div>
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(34,211,238,0.2); padding-bottom: 4px; margin-bottom: 8px;">
        <span style="font-size: 10px; font-weight: bold; letter-spacing: 1px;">ARCHITECT-v2</span>
        <span style="font-size: 8px; color: rgba(34,211,238,0.5);">GRID: 10px</span>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; margin-top: 10px;">
        <div style="border: 1px solid #22d3ee; border-radius: 4px; padding: 4px 6px; font-size: 9px; font-family: monospace;">Module A</div>
        <span style="font-size: 10px; color: rgba(34,211,238,0.5);">━━━━▶</span>
        <div style="border: 1px dashed #22d3ee; border-radius: 4px; padding: 4px 6px; font-size: 9px; font-family: monospace;">Module B</div>
      </div>
    </div>
    <div style="font-size: 9px; color: rgba(34,211,238,0.5); text-align: right;">SYSTEM TOPOLOGY SCHEMA</div>
  </div>`,
      style: `【视觉主题】工程蓝图与系统架构说明，理性、清晰、技术可信
  【色彩系统】
   - 基础底色：深海军蓝 #08111f 或冷白 #f8fbff。
   - 网格线：rgba(37,99,235,0.12) 的细线，不要过密。
   - 强调色：科技蓝 #2563eb，辅助色青色 #22d3ee。
  【排版规则】
   - 字体：标题使用几何无衬线体，技术标签和编号使用等宽字体。
   - 层级：一级标题简短，模块标题用编号，正文说明控制在 2-3 行内。
  【组件特征】
   - 模块：架构卡、连接线、编号节点、接口表、流程箭头都用 CSS 边框和网格实现。
   - 图示：可用纯 HTML/CSS 绘制流程图和系统拓扑，禁止依赖图片占位。
  【布局原则】适合技术方案、产品架构、API 能力介绍；视觉像一张可交付的工程说明图。`,
    },
];
