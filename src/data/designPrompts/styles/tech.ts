import type { RawDesignStyle } from "../types";
import { MONO, SANS, SERIF, abs, barChart, canvas, codeLines, el, textLines } from "../previewKit";

export const techStyles: RawDesignStyle[] = [
  {
    id: "vercel",
    name: "极简黑白 · Vercel",
    category: "科技产品/极简工程",
    accent: "#000000",
    description: "黑白精确主义，大留白，无衬线极简体，锐利分割线",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#171717;`,
      abs(
        `left:0;right:0;top:0;height:40px;box-sizing:border-box;border-bottom:1px solid #ebebeb;display:flex;align-items:center;padding:0 22px;gap:16px;`,
        `<div style="width:14px;height:14px;background:#171717;transform:rotate(45deg);"></div>` +
          [36, 30, 40].map((w) => `<div style="width:${w}px;height:5px;border-radius:3px;background:#d4d4d4;"></div>`).join("") +
          `<div style="margin-left:auto;background:#171717;color:#ffffff;font-size:10px;font-weight:500;padding:5px 13px;border-radius:999px;">部署</div>`,
      ) +
        abs(`left:0;right:0;top:64px;text-align:center;font-size:38px;font-weight:700;letter-spacing:-2px;line-height:1.1;`, "开发。预览。发布。") +
        abs(`left:0;right:0;top:118px;text-align:center;font-size:13px;color:#666666;`, "为前端团队打造的云平台") +
        abs(
          `left:0;right:0;top:150px;display:flex;justify-content:center;gap:10px;font-size:11px;font-weight:500;`,
          `<span style="background:#171717;color:#ffffff;padding:8px 16px;border-radius:6px;">开始部署</span><span style="border:1px solid #ebebeb;padding:7px 16px;border-radius:6px;">预约演示</span>`,
        ) +
        abs(
          `left:22px;right:22px;bottom:0;height:84px;box-sizing:border-box;display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #ebebeb;border-bottom:none;border-radius:8px 8px 0 0;`,
          [
            ["01", "即时预览"],
            ["02", "边缘网络"],
            ["03", "一键回滚"],
          ]
            .map(
              ([n, t], i) =>
                `<div style="padding:13px 14px;${i ? "border-left:1px solid #ebebeb;" : ""}"><div style="font-family:${MONO};font-size:9px;color:#888888;">${n}</div><div style="font-size:13px;font-weight:600;margin:5px 0 8px;">${t}</div>${textLines([92, 60], "#e5e5e5", 4, 5)}</div>`,
            )
            .join(""),
        ),
    ),
    style: `【视觉主题】黑白精确主义：极简工程师审美，冷静、锐利、没有一处多余（参考 Vercel）
  【色彩系统】
   - 底色：纯白 #ffffff，分区底 #fafafa。
   - 文本：标题与主按钮近黑 #171717，正文 #4d4d4d，弱说明 #888888。
   - 分割线与描边：#ebebeb；链接蓝 #0070f3 只用于行内链接。
   - 强调色就是黑色本身；整页不出现第二种彩色（状态色除外：成功蓝 #0070f3、错误红 #ee0000、警告 #f5a623）。
  【字体与字号】
   - 无衬线体，优先 Geist / Inter；技术标签、编号和代码使用等宽字体。
   - 字号阶梯：主标题 48px 字重 600-700、字距 -0.05em，二级标题 32px（字距 -0.04em），三级 24px，正文 16px 行高 1.5，小字 14px，标签 12px 等宽。
  【间距与形状】
   - 圆角：卡片与按钮 6-8px，标签和导航按钮用全圆角胶囊。
   - 卡片只用 1px #ebebeb 描边，严格禁止阴影；相邻卡片可共用描边形成表格状网格。
   - 间距取 8px 倍数，区块之间留白 96-128px。
  【组件特征】
   - 按钮：主按钮黑底白字，次按钮白底 1px 描边，高度 40px。
   - 功能网格：三列等宽单元，单元内为“等宽编号 + 标题 + 两行说明”。
   - 代码块：白底或 #fafafa 底，1px 描边，不用深色主题。
  【页面结构】顶栏（标志 + 导航 + 胶囊按钮）→ 居中主标题与两个按钮 → 三列功能网格 → 左文右图的特性段落 → 数据或客户引用 → 页脚。
  【禁忌】不用阴影、渐变背景和彩色图标；不用圆润的大圆角；标题不超过两行。
  【布局原则】大量留白，所有元素严格对齐到同一套网格，呈现绝对的冷静与精确。`,
  },
  {
    id: "stripe",
    name: "紫色渐变 · Stripe",
    category: "科技产品/金融科技",
    accent: "#635bff",
    description: "标志性紫色渐变，轻盈优雅的细字重，斜切色块",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#0d253d;`,
      abs(`left:-40px;right:-40px;top:-150px;height:232px;transform:skewY(-9deg);background:linear-gradient(100deg,#a960ee 0%,#ff5996 32%,#ffcb57 58%,#90e0ff 88%);`) +
        abs(
          `left:28px;right:28px;top:20px;display:flex;align-items:center;gap:14px;`,
          `<span style="font-size:16px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">payflow</span>` +
            [30, 36, 28].map((w) => `<div style="width:${w}px;height:5px;border-radius:3px;background:rgba(255,255,255,0.7);"></div>`).join(""),
        ) +
        abs(`left:28px;top:122px;font-size:30px;font-weight:500;line-height:1.2;letter-spacing:-0.8px;`, "面向互联网的<br>金融基础设施") +
        abs(`left:28px;top:204px;font-size:12px;color:#64748d;`, "收款、付款与资金管理，一套接口完成") +
        abs(`left:28px;bottom:24px;background:#533afd;color:#ffffff;font-size:11px;font-weight:600;padding:8px 16px;border-radius:999px;`, "立即开始 ›") +
        abs(
          `right:28px;top:62px;width:172px;height:206px;box-sizing:border-box;padding:16px;background:#ffffff;border-radius:14px;box-shadow:0 22px 44px -12px rgba(50,50,93,0.32),0 10px 18px -10px rgba(0,0,0,0.22);`,
          `<div style="font-size:10px;color:#64748d;">订单合计</div><div style="font-size:23px;font-weight:600;letter-spacing:-0.5px;margin-top:2px;">¥1,280.00</div>` +
            `<div style="height:1px;background:#e3e8ee;margin:11px 0;"></div>` +
            textLines([100, 70], "#e3e8ee", 5, 7) +
            `<div style="margin-top:12px;border:1px solid #e3e8ee;border-radius:6px;padding:8px;display:flex;align-items:center;gap:7px;"><div style="width:22px;height:14px;border-radius:3px;background:#0d253d;"></div><div style="flex:1;height:5px;border-radius:3px;background:#e3e8ee;"></div></div>` +
            `<div style="margin-top:10px;background:#533afd;color:#ffffff;font-size:11px;font-weight:600;text-align:center;padding:8px 0;border-radius:6px;">支付</div>`,
        ),
    ),
    style: `【视觉主题】科技与优雅融合的金融科技质感：值得信任、轻盈、精密（参考 Stripe）
  【色彩系统】
   - 底色：纯白 #ffffff，分区底 #f6f9fc。
   - 文本：标题深海军蓝 #0d253d，正文 #273951，弱说明 #64748d。
   - 强调色：靛紫 #533afd（按下 #4434d4），用于主按钮、链接和关键数字。
   - 标志性渐变：紫 #a960ee → 粉 #ff5996 → 黄 #ffcb57 → 浅蓝 #90e0ff，只出现在页面顶部的斜切色带上。
   - 描边 #e3e8ee。
  【字体与字号】
   - 现代无衬线体，标题用偏细的字重（300-500）并收紧字距，显得轻盈高级；数字使用 tabular-nums。
   - 字号阶梯：主标题 48-56px 字重 300-500、字距 -0.02em，二级 32px，三级 22-26px，正文 16px 行高 1.4-1.6，标签 12-13px。
  【间距与形状】
   - 圆角：卡片 12-16px，输入框与小按钮 6px，主按钮全圆角胶囊。
   - 阴影是层级的主要手段：0 20px 40px -12px rgba(50,50,93,0.25) 叠加 0 8px 16px -8px rgba(0,0,0,0.2)，带一点蓝紫色倾向。
   - 顶部色带用 skewY(-9deg) 斜切，占首屏上方三分之一。
  【组件特征】
   - 主按钮：靛紫胶囊，白字，文字后带“›”。
   - 浮起的产品卡片：支付表单、订单金额、代码片段等界面模型压在渐变色带与白底的交界处。
   - 代码块：深海军蓝底 #0d253d，等宽字体，淡彩色高亮。
   - 客户标志行（灰度）、三列功能说明（图标 + 标题 + 说明）、数据条（大数字 + 说明）。
  【页面结构】斜切渐变顶栏与导航 → 左标题右产品卡的首屏 → 客户标志行 → 交错的图文特性段落 → 代码与接口展示 → 数据条 → 行动号召 → 页脚。
  【禁忌】渐变不要铺满整页或用在正文区；不要粗黑标题；不要直角硬边卡片。
  【布局原则】首屏靠渐变色带和浮起的卡片建立辨识度，往下逐渐回到干净的白底与细致的信息排布。`,
  },
  {
    id: "linear",
    name: "精密深色 · Linear",
    category: "科技产品/精密工具",
    accent: "#5e6ad2",
    description: "极简深色界面，精密网格，淡紫强调色，极致克制",
    previewHtml: canvas(
      `background:#08090a;font-family:${SANS};color:#f7f8f8;`,
      abs(`left:70px;right:70px;top:-90px;height:190px;background:radial-gradient(ellipse at center,rgba(94,106,210,0.4),rgba(94,106,210,0) 70%);`) +
        abs(`left:0;right:0;top:28px;text-align:center;font-size:27px;font-weight:600;letter-spacing:-0.8px;line-height:1.22;`, "为现代产品团队打造的<br>规划与构建工具") +
        abs(`left:0;right:0;top:104px;text-align:center;font-size:11px;color:#8a8f98;`, "从路线图到发布，一处追踪") +
        abs(
          `left:40px;right:40px;top:136px;bottom:-10px;background:#0f1011;border:1px solid #23252a;border-radius:10px 10px 0 0;display:flex;overflow:hidden;`,
          `<div style="width:92px;box-sizing:border-box;border-right:1px solid #23252a;padding:12px 10px;display:flex;flex-direction:column;gap:10px;">` +
            [
              ["#5e6ad2", 44],
              ["#34343a", 36],
              ["#34343a", 50],
              ["#34343a", 30],
            ]
              .map(([c, w]) => `<div style="display:flex;align-items:center;gap:6px;"><div style="width:9px;height:9px;border-radius:3px;background:${c};"></div><div style="width:${w}px;height:4px;border-radius:2px;background:#34343a;"></div></div>`)
              .join("") +
            `</div>` +
            `<div style="flex:1;padding:10px 12px;"><div style="font-size:10px;color:#8a8f98;margin-bottom:6px;">进行中 · 4</div>` +
            [
              ["#f2c94c", "ENG-128", 62, false],
              ["#5e6ad2", "ENG-131", 78, true],
              ["#62666d", "ENG-140", 54, false],
              ["#27a644", "ENG-142", 68, false],
            ]
              .map(
                ([c, id, w, on]) =>
                  `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;${on ? "background:rgba(94,106,210,0.16);" : ""}"><div style="width:10px;height:10px;box-sizing:border-box;border-radius:50%;border:2px solid ${c};"></div><span style="font-family:${MONO};font-size:9px;color:#62666d;">${id}</span><div style="width:${w}%;max-width:150px;height:4px;border-radius:2px;background:${on ? "#d0d6e0" : "#3e3e44"};"></div><div style="margin-left:auto;width:12px;height:12px;border-radius:50%;background:#34343a;"></div></div>`,
              )
              .join("") +
            `</div>`,
        ),
    ),
    style: `【视觉主题】精密深色界面：冷峻、密集、低调奢华，像软件工艺的说明书（参考 Linear）
  【色彩系统】
   - 底色：近黑 #08090a（最深处可到 #010102）；面板逐级提亮 #0f1011 / #141516 / #18191a。
   - 文本：主文本 #f7f8f8，次要 #d0d6e0，说明 #8a8f98，弱标注 #62666d。
   - 描边：发丝线 #23252a，强调描边 #34343a。
   - 强调色：淡靛紫 #5e6ad2（悬停 #828fff），是唯一的彩色，只用于标志、选中态、焦点环和个别按钮；状态色仅限成功绿 #27a644 和进行中黄 #f2c94c。
  【字体与字号】
   - 紧凑的无衬线体，字距收紧；编号、快捷键用等宽字体。
   - 字号阶梯：主标题 56-80px 字重 600、字距 -0.03em，二级 40px，三级 28px，卡片标题 22px 字重 500，正文 16px 行高 1.5，界面内文字 12-13px。
  【间距与形状】
   - 圆角：面板 10-12px，按钮与输入 6-8px，标签全圆角。
   - 面板 = 深色底 + 1px 发丝线描边，几乎不用阴影；层级靠底色逐级提亮。
   - 首屏顶部可有一团淡紫色径向光晕（透明度 40% 以下），是唯一的氛围装饰。
  【组件特征】
   - 产品界面框：把真实感的应用界面（侧栏 + 列表）装在深色面板里展示，底部可被页面裁切。
   - 任务行：状态圆环 + 等宽编号 + 标题 + 头像，选中行用淡紫半透明底。
   - 按钮：主按钮浅色底深字或淡紫底白字，次按钮透明底加描边。
   - 快捷键徽标、更新日志条目、三列特性卡。
  【页面结构】极简顶栏 → 居中标题与一句说明 → 产品界面大图 → 三列特性卡 → 交错的功能详解（左文右界面）→ 更新日志或客户引用 → 行动号召。
  【禁忌】不用彩色渐变、插画和大面积强调色；不用纯白大色块；不用粗大的装饰图标。
  【布局原则】精密网格，所有边缘严格对齐；用产品界面本身而不是氛围图来说服读者。`,
  },
  {
    id: "terminal",
    name: "开发者代码 · Terminal",
    category: "科技产品/开发极客",
    accent: "#00ff9c",
    description: "等宽字体、命令片段、API 示例和调试信息清晰排布",
    previewHtml: canvas(
      `background:#0f1115;font-family:${SANS};color:#e5e7eb;padding:20px 22px;`,
      `<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:17px;font-weight:700;color:#ffffff;">命令行快速上手</span><span style="font-family:${MONO};font-size:9px;color:#4ade80;border:1px solid rgba(74,222,128,0.4);border-radius:4px;padding:2px 7px;">v2.4</span></div>` +
        el(
          `margin-top:12px;display:flex;gap:12px;height:214px;`,
          el(
            `flex:1.5;background:#161a22;border:1px solid #262b36;border-radius:8px;overflow:hidden;`,
            `<div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid #262b36;"><div style="width:8px;height:8px;border-radius:50%;background:#f87171;"></div><div style="width:8px;height:8px;border-radius:50%;background:#fbbf24;"></div><div style="width:8px;height:8px;border-radius:50%;background:#4ade80;"></div><span style="margin-left:6px;font-family:${MONO};font-size:9px;color:#6b7280;">zsh — deploy</span></div>` +
              el(
                `padding:12px 14px;font-family:${MONO};font-size:11px;line-height:1.95;white-space:nowrap;`,
                `<div><span style="color:#4ade80;">$</span> m2v deploy --prod</div>` +
                  `<div style="color:#9ca3af;">&gt; 构建中…</div>` +
                  `<div><span style="color:#4ade80;">✓</span> 构建完成 <span style="color:#6b7280;">12.4s</span></div>` +
                  `<div><span style="color:#4ade80;">✓</span> 上传 38 个文件</div>` +
                  `<div><span style="color:#38bdf8;">→</span> https://m2v.app</div>` +
                  `<div><span style="color:#4ade80;">$</span> <span style="display:inline-block;width:7px;height:13px;background:#4ade80;vertical-align:middle;"></span></div>`,
              ),
          ) +
            el(
              `flex:1;box-sizing:border-box;background:#161a22;border:1px solid #262b36;border-radius:8px;padding:10px 12px;`,
              `<div style="display:flex;justify-content:space-between;font-family:${MONO};font-size:9px;"><span style="color:#9ca3af;">响应</span><span style="color:#4ade80;">200 OK</span></div>` +
                el(
                  `margin-top:14px;`,
                  codeLines(
                    [
                      [0, [8, "#6b7280"]],
                      [10, [26, "#38bdf8"], [44, "#fbbf24"]],
                      [10, [34, "#38bdf8"], [30, "#4ade80"]],
                      [10, [22, "#38bdf8"], [8, "#6b7280"]],
                      [20, [30, "#38bdf8"], [36, "#fbbf24"]],
                      [20, [24, "#38bdf8"], [20, "#4ade80"]],
                      [10, [8, "#6b7280"]],
                      [0, [8, "#6b7280"]],
                    ],
                    6,
                    10,
                  ),
                ),
            ),
        ),
    ),
    style: `【视觉主题】开发者代码工作台：清晰、克制、可信，一切为了读得懂、抄得走
  【色彩系统】
   - 底色：整份作品二选一，深灰 #0f1115（面板 #161a22，描边 #262b36）或冷白 #f8fafc（面板 #ffffff，描边 #e2e8f0）。
   - 文本：深底主文本 #e5e7eb、注释 #9ca3af、弱标注 #6b7280；浅底主文本 #0f172a、注释 #64748b。
   - 强调色：青绿 #4ade80（浅底用 #16a34a），只用于命令提示符、成功状态和关键参数；辅助蓝 #38bdf8 表示键名与链接，黄 #fbbf24 表示字符串与警告，红 #f87171 表示错误。
  【字体与字号】
   - 代码、命令、参数、文件名使用 JetBrains Mono / Fira Code 等等宽字体；说明文字使用现代无衬线体。
   - 字号阶梯：页标题 28-32px 字重 700，小节标题 18-20px，正文 15-16px 行高 1.7，代码 13-14px 行高 1.7，标签 11-12px。
  【间距与形状】
   - 面板圆角 8px、1px 描边、无阴影、无发光装饰。
   - 代码块内边距 12px 16px；段落与代码块间距 16px，小节间距 40px。
  【组件特征】
   - 终端窗口：顶栏三个圆点 + 标题，内容区每行以提示符 $ 开头，输出行用注释色，成功行前加 ✓。
   - 代码块：带文件名或语言标签，长行横向滚动；需要读者替换的值用尖括号占位并高亮。
   - 请求/响应对照卡：左请求右响应，响应卡右上角显示状态码。
   - 提示块（提示 / 注意 / 危险）用 3px 左侧色条区分；环境变量、参数用表格。
  【页面结构】标题与版本徽标 → 一句话说明 → 安装命令 → 最小可运行示例 → 分步骤说明（步骤号 + 命令 + 输出）→ 参数表 → 常见错误 → 下一步链接。
  【禁忌】不要满屏代码没有解释；不要把命令做成图片；不要发光和扫描线一类的装饰。
  【布局原则】适合命令行教程、SDK 说明、调试记录、技术方案附录；先给结论，再给命令、输出和解释。`,
  },
  {
    id: "claude",
    name: "克制温和 · Claude",
    category: "科技产品/AI 助手",
    accent: "#d97757",
    description: "暖白底色，衬线标题搭配无衬线正文，温和克制的 AI 助手气质",
    previewHtml: canvas(
      `background:#faf9f5;font-family:${SANS};color:#141413;`,
      abs(
        `left:224px;top:30px;width:32px;height:32px;`,
        [0, 45, 90, 135].map((r) => `<div style="position:absolute;left:14px;top:0;width:4px;height:32px;border-radius:2px;background:#cc785c;transform:rotate(${r}deg);"></div>`).join(""),
      ) +
        abs(`left:0;right:0;top:80px;text-align:center;font-family:${SERIF};font-size:29px;line-height:1.3;letter-spacing:-0.5px;`, "下午好，想聊点什么？") +
        abs(
          `left:60px;right:60px;top:136px;height:86px;box-sizing:border-box;background:#ffffff;border:1px solid #e6dfd8;border-radius:16px;box-shadow:0 4px 16px rgba(20,20,19,0.05);padding:14px 16px;`,
          `<div style="font-size:13px;color:#8e8b82;">帮我把这份调研整理成一页摘要…</div>` +
            abs(
              `left:16px;bottom:12px;display:flex;gap:6px;font-size:10px;color:#6c6a64;`,
              `<span style="border:1px solid #e6dfd8;border-radius:8px;padding:3px 9px;">附件</span><span style="border:1px solid #e6dfd8;border-radius:8px;padding:3px 9px;">深度思考</span>`,
            ) +
            abs(
              `right:14px;bottom:10px;width:28px;height:28px;border-radius:8px;background:#cc785c;display:flex;align-items:center;justify-content:center;`,
              `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
            ),
        ) +
        abs(
          `left:0;right:0;top:242px;display:flex;justify-content:center;gap:8px;`,
          ["写作", "学习", "代码", "生活"].map((t) => `<span style="background:#f5f0e8;border:1px solid #e6dfd8;border-radius:999px;padding:5px 13px;font-size:11px;color:#3d3d3a;">${t}</span>`).join(""),
        ),
    ),
    style: `【视觉主题】克制、温和、富有书卷气的 AI 助手：像一张暖色信纸，而不是冷色仪表盘（参考 Claude）
  【色彩系统】
   - 底色：暖奶油白 #faf9f5；表面逐级加深 #f5f0e8 / #efe9de / #e8e0d2；输入框与卡片可用纯白 #ffffff。
   - 文本：墨色 #141413，正文 #3d3d3a，说明 #6c6a64，占位 #8e8b82。
   - 描边：暖灰 #e6dfd8。
   - 强调色：陶土珊瑚 #cc785c（按下 #a9583e），只用于主按钮、标志和关键链接。
   - 深色表面：代码与产品展示区用暖黑 #181715，其上文字 #faf9f5。
  【字体与字号】
   - 标题用优雅的衬线体（Copernicus / Tiempos / Georgia / 宋体），字重 400，不加粗；正文与界面文字用无衬线体。
   - 字号阶梯：主标题 48-64px 行高 1.1、字距 -0.02em，二级 36px，三级 28px，小标题 18-22px 字重 500，正文 16px 行高 1.55。
  【间距与形状】
   - 圆角：卡片 12-16px，按钮与输入 8px，标签全圆角。
   - 阴影极淡（0 4px 16px rgba(20,20,19,0.05)），更多依靠 1px 暖灰描边和底色层次。
   - 段落留白宽松，正文栏宽不超过 680px。
  【组件特征】
   - 对话输入框：白底大圆角卡片，占位文字 + 左下功能小标签 + 右下珊瑚色发送按钮。
   - 对话气泡：用户消息为 #efe9de 底的圆角块，助手回复不加气泡、直接排版。
   - 建议胶囊：#f5f0e8 底、1px 描边的全圆角标签。
   - 代码块：暖黑底、等宽字体；引用块用 2px 左侧暖灰竖线。
  【页面结构】居中的标志与衬线问候语 → 对话输入框 → 建议胶囊 → 能力说明（衬线小标题 + 短段落）→ 深色产品展示区 → 行动号召。
  【禁忌】不用冷蓝、霓虹色和渐变；标题不用粗黑体；不堆叠图标和徽章。
  【布局原则】居中、单栏、无多余装饰，对话体阅读体验优先。`,
  },
  {
    id: "supabase",
    name: "开源极客 · Supabase",
    category: "科技产品/开源数据",
    accent: "#3ecf8e",
    description: "深灰背景，亮绿强调，等宽字体点缀，暗黑开源风",
    previewHtml: canvas(
      `background:#1c1c1c;font-family:${SANS};color:#ededed;`,
      abs(`left:26px;top:24px;display:flex;align-items:center;gap:7px;`, `<div style="width:14px;height:14px;border-radius:3px;background:#3ecf8e;"></div><span style="font-size:12px;font-weight:600;">basekit</span>`) +
        abs(`left:26px;top:60px;font-size:28px;font-weight:500;line-height:1.22;letter-spacing:-0.8px;`, `一个周末上线<br><span style="color:#3ecf8e;">扩展到百万用户</span>`) +
        abs(`left:26px;top:140px;width:196px;font-size:11px;line-height:1.65;color:#9a9a9a;`, "开源的后端平台：数据库、认证、存储与实时订阅") +
        abs(
          `left:26px;top:194px;display:flex;gap:8px;font-size:11px;font-weight:500;`,
          `<span style="background:#3ecf8e;color:#171717;padding:7px 14px;border-radius:6px;">开始项目</span><span style="border:1px solid #3e3e3e;padding:6px 14px;border-radius:6px;">查看文档</span>`,
        ) +
        abs(`left:26px;bottom:20px;font-family:${MONO};font-size:9px;color:#707070;letter-spacing:0.5px;`, "postgres · auth · storage · realtime") +
        abs(
          `right:-22px;top:44px;width:232px;height:222px;background:#202020;border:1px solid #2e2e2e;border-radius:10px;overflow:hidden;`,
          `<div style="display:flex;border-bottom:1px solid #2e2e2e;font-family:${MONO};font-size:9px;"><span style="padding:8px 12px;color:#ededed;border-bottom:2px solid #3ecf8e;">users</span><span style="padding:8px 12px;color:#707070;">orders</span></div>` +
            `<div style="display:grid;grid-template-columns:30px 1fr 62px;gap:8px;padding:7px 12px;border-bottom:1px solid #2a2a2a;font-family:${MONO};font-size:8px;color:#707070;"><span>id</span><span>email</span><span>status</span></div>` +
            [
              [1, 70, true],
              [2, 54, true],
              [3, 78, false],
              [4, 62, true],
              [5, 48, true],
            ]
              .map(
                ([id, w, on]) =>
                  `<div style="display:grid;grid-template-columns:30px 1fr 62px;gap:8px;align-items:center;padding:9px 12px;border-bottom:1px solid #2a2a2a;"><span style="font-family:${MONO};font-size:9px;color:#707070;">${id}</span><div style="width:${w}%;height:5px;border-radius:3px;background:#3a3a3a;"></div><span style="display:flex;align-items:center;gap:4px;font-family:${MONO};font-size:8px;color:${on ? "#3ecf8e" : "#707070"};"><i style="width:5px;height:5px;border-radius:50%;background:${on ? "#3ecf8e" : "#707070"};display:inline-block;"></i>${on ? "active" : "idle"}</span></div>`,
              )
              .join(""),
        ),
    ),
    style: `【视觉主题】暗色开源极客：安静的技术感，近乎单色的界面里只有一抹翠绿（参考 Supabase）
  【色彩系统】
   - 底色：深灰 #1c1c1c，面板 #202020，更深的代码区 #171717。
   - 文本：主文本 #ededed，说明 #9a9a9a，弱标注 #707070。
   - 描边：#2e2e2e，分隔线 #2a2a2a，次按钮描边 #3e3e3e。
   - 强调色：翠绿 #3ecf8e（深一档 #24b47e），是页面上唯一的彩色事件：主按钮、标题中的一个关键短语、状态点和选中下划线；主按钮上的文字用深色 #171717。
  【字体与字号】
   - 人文无衬线体，标题字重 500、不加粗；表名、字段、命令、数据值使用等宽字体。
   - 字号阶梯：主标题 48-64px 行高 1.1、字距 -0.03em，二级 36px，三级 28px，小标题 18-22px，正文 16px 行高 1.5，等宽标注 12-13px。
  【间距与形状】
   - 圆角：面板 8-12px，按钮 6px，状态标签全圆角。
   - 面板 = 深色底 + 1px 描边，不用阴影和发光。
   - 文档式排版：内容区最大宽度 1200px，栅格间距 16-24px。
  【组件特征】
   - 产品界面模型：表格编辑器（标签页 + 表头 + 数据行 + 状态点）、SQL 编辑器、接口示例，叠放在首屏一侧并可被页面边缘裁切。
   - 按钮：主按钮翠绿底深字，次按钮透明底加描边。
   - 功能卡：图标 + 名称 + 一句说明，六宫格排列；每张卡底部可带一行等宽的技术关键词。
   - 代码块：深底、等宽、绿色表示字符串与成功状态。
  【页面结构】顶栏 → 左标题（第二行为绿色）+ 说明 + 两个按钮，右侧产品界面 → 技术关键词行 → 六宫格功能卡 → 代码示例与框架标签 → 社区数据 → 行动号召。
  【禁忌】绿色不用于大面积背景和正文；不用多彩渐变和插画；不用大圆角卡片。
  【布局原则】严谨的开发者文档式排版，用真实的产品界面和代码建立可信度。`,
  },
  {
    id: "raycast",
    name: "毛玻璃 · Raycast",
    category: "科技产品/系统工具",
    accent: "#ff6363",
    description: "深色悬浮窗，macOS 原生质感，搜索框驱动的命令面板",
    previewHtml: canvas(
      `background:#07080a;font-family:${SANS};color:#f4f4f6;`,
      abs(`left:-40px;top:-70px;width:560px;height:210px;background:repeating-linear-gradient(115deg,rgba(255,99,99,0) 0 22px,rgba(255,99,99,0.3) 22px 30px);filter:blur(6px);transform:skewY(-6deg);`) +
        abs(`left:0;right:0;top:0;bottom:0;background:linear-gradient(180deg,rgba(7,8,10,0) 0%,#07080a 64%);`) +
        abs(
          `left:56px;right:56px;top:30px;height:248px;box-sizing:border-box;background:rgba(18,18,18,0.94);border:1px solid rgba(255,255,255,0.12);border-radius:14px;box-shadow:0 30px 60px rgba(0,0,0,0.6);overflow:hidden;`,
          `<div style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.08);font-size:13px;color:#6a6b6c;">搜索应用和命令…</div>` +
            `<div style="padding:8px 8px 0;"><div style="font-size:9px;color:#6a6b6c;padding:2px 8px 6px;">建议</div>` +
            [
              ["#ff6363", "剪贴板历史", "命令", true],
              ["#57c1ff", "窗口管理", "命令", false],
              ["#59d499", "截图标注", "扩展", false],
              ["#ffc531", "快速笔记", "扩展", false],
            ]
              .map(
                ([c, n, t, on]) =>
                  `<div style="display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:8px;${on ? "background:rgba(255,255,255,0.08);" : ""}"><div style="width:20px;height:20px;border-radius:6px;background:${c};"></div><span style="font-size:12px;">${n}</span><span style="margin-left:auto;font-size:10px;color:#6a6b6c;">${t}</span></div>`,
              )
              .join("") +
            `</div>` +
            abs(
              `left:0;right:0;bottom:0;height:34px;box-sizing:border-box;border-top:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);display:flex;align-items:center;padding:0 12px;font-size:10px;color:#9c9c9d;`,
              `<div style="width:14px;height:14px;border-radius:4px;background:#ff6363;"></div><span style="margin-left:auto;display:flex;align-items:center;gap:6px;">打开命令<span style="background:rgba(255,255,255,0.1);border-radius:4px;padding:1px 6px;">↵</span></span>`,
            ),
        ),
    ),
    style: `【视觉主题】macOS 悬浮命令面板：整张页面像一张放大的产品截图，深色、精细、键盘优先（参考 Raycast）
  【色彩系统】
   - 底色：近黑 #07080a；表面 #0d0d0d / #101111 / #121212。
   - 文本：主文本 #f4f4f6，正文 #cdcdcd，说明 #9c9c9d，占位与弱标注 #6a6b6c。
   - 描边：发丝线 rgba(255,255,255,0.08)，强调描边 rgba(255,255,255,0.16)。
   - 强调色：品牌红 #ff6363 只用于标志和首屏的斜向光带；类别色（蓝 #57c1ff、绿 #59d499、黄 #ffc531）只用于命令图标的小方块。
   - 主按钮为白底黑字的胶囊，不使用彩色按钮。
  【字体与字号】
   - Inter 或系统无衬线体；界面内文字偏小且对齐精细，快捷键用等宽字体。
   - 字号阶梯：主标题 56-64px 字重 600，二级 24px 字重 500，小标题 18-20px，正文 16px 行高 1.6，面板内文字 12-13px，分组小标题 11px。
  【间距与形状】
   - 圆角：面板 14-16px，列表行与图标 6-8px，按钮全圆角。
   - 面板 = 半透明近黑底（可加 backdrop-filter: blur(20px)）+ 1px 浅色描边 + 一层很深的投影。
   - 列表行高 32-36px，行间不留缝；面板内边距 8px。
  【组件特征】
   - 命令面板：顶部搜索栏（占位文字）→ 分组小标题 → 命令行（彩色图标方块 + 名称 + 右侧类型）→ 底部操作栏（左标志，右“动作名 + 快捷键徽标”）；当前选中行用 rgba(255,255,255,0.08) 底。
   - 快捷键徽标：深色小圆角方块，内含 ⌘、↵ 等符号。
   - 扩展卡片：图标 + 名称 + 作者 + 下载量，三到四列网格。
  【页面结构】首屏斜向红色光带背景 → 居中标题与白色胶囊按钮 → 命令面板大图 → 扩展卡片网格 → 功能分节（每节一张界面截图式面板）→ 行动号召。
  【禁忌】不用浅色背景和大面积彩色；光带只出现在首屏且不压文字；不用圆润卡通图标。
  【布局原则】列表排布密集且克制，把界面本身当作主视觉。`,
  },
  {
    id: "mongodb",
    name: "企业数据 · MongoDB",
    category: "科技产品/企业数据",
    accent: "#00ed64",
    description: "深蓝底色，几何粗体，标志性亮绿点缀，企业级数据平台质感",
    previewHtml: canvas(
      `background:#001e2b;font-family:${SANS};color:#ffffff;`,
      abs(
        `left:26px;top:22px;display:flex;align-items:center;gap:7px;`,
        `<div style="width:10px;height:20px;background:#00ed64;border-radius:50% 50% 50% 50% / 62% 62% 38% 38%;"></div><span style="font-size:12px;font-weight:600;">数据平台</span>`,
      ) +
        abs(`left:26px;top:60px;font-size:29px;font-weight:500;line-height:1.24;letter-spacing:-0.5px;`, "为下一代应用<br>而生的数据平台") +
        abs(`left:26px;top:144px;width:200px;font-size:11px;line-height:1.65;color:#b8c4c2;`, "文档模型、向量检索与流处理，统一在一个平台") +
        abs(`left:26px;top:194px;background:#00ed64;color:#001e2b;font-size:11px;font-weight:600;padding:8px 18px;border-radius:999px;`, "免费开始") +
        abs(
          `right:26px;top:46px;width:194px;box-sizing:border-box;background:#112733;border:1px solid #1c3b4a;border-radius:12px;padding:13px 16px;font-family:${MONO};font-size:10px;line-height:1.9;white-space:nowrap;`,
          `<div style="color:#5c6c75;">// orders</div><div>{</div>` +
            `<div>&nbsp;&nbsp;<span style="color:#00ed64;">"_id"</span>: ObjectId(…),</div>` +
            `<div>&nbsp;&nbsp;<span style="color:#00ed64;">"customer"</span>: <span style="color:#ffc66d;">"林澈"</span>,</div>` +
            `<div>&nbsp;&nbsp;<span style="color:#00ed64;">"total"</span>: <span style="color:#7bc8f6;">1280</span>,</div>` +
            `<div>&nbsp;&nbsp;<span style="color:#00ed64;">"items"</span>: [ … ]</div><div>}</div>`,
        ) +
        abs(
          `left:26px;right:26px;bottom:16px;display:flex;gap:30px;border-top:1px solid #1c3b4a;padding-top:10px;`,
          [
            ["99.995%", "可用性承诺"],
            ["115+", "云区域"],
            ["3 朵云", "自由迁移"],
          ]
            .map(([v, k]) => `<div><div style="font-size:14px;font-weight:600;">${v}</div><div style="font-size:9px;color:#889397;margin-top:1px;">${k}</div></div>`)
            .join(""),
        ),
    ),
    style: `【视觉主题】稳重、强大的企业数据平台：深青色大色块与雪白文档面交替，一抹亮绿点题（参考 MongoDB）
  【色彩系统】
   - 深色面：深青蓝 #001e2b（首屏与重点区块），其上的面板 #112733，描边 #1c3b4a。
   - 浅色面：纯白 #ffffff 与 #f9fbfa（文档、定价、说明区块）。
   - 文本：深色面上 #ffffff / #b8c4c2 / #889397；浅色面上 #001e2b / #3d4f58 / #5c6c75。
   - 强调色：亮绿 #00ed64，用于胶囊主按钮、标志和代码中的键名；按钮上的文字用 #001e2b。深绿 #00684a 用于浅色面上的链接和次要强调。
  【字体与字号】
   - 几何无衬线体（Euclid Circular / Inter），标题字重 500；代码和数据使用等宽字体。
   - 字号阶梯：主标题 56-72px 行高 1.1、字距 -0.02em，二级 36-48px，三级 28px，小标题 18-22px，正文 16-18px 行高 1.5。
  【间距与形状】
   - 圆角：卡片 12-16px，大区块 24px，主按钮全圆角胶囊。
   - 深浅区块整段交替，区块之间不留缝；区块内上下留白 80-96px。
   - 深色面上的面板用 1px 描边，不用阴影；浅色面上的卡片可用极浅阴影。
  【组件特征】
   - 绿色胶囊按钮：页面上最显眼的元素，每个区块最多一个。
   - 文档卡：深色面板里展示一段 JSON 文档，键名绿色、字符串暖黄、数字浅蓝。
   - 数据条：一行 3-4 组“大数字 + 说明”，上方一条细线。
   - 三档定价或方案对比卡、行业场景卡（图标 + 标题 + 说明 + 链接）。
  【页面结构】深色首屏（左标题与按钮，右文档卡）→ 数据条 → 白底能力介绍（三列卡）→ 深色的开发者区块（代码）→ 白底方案对比 → 深色行动号召。
  【禁忌】亮绿不用于大面积背景和正文；不用紫蓝渐变；深浅区块不要混成中间灰。
  【布局原则】大版面、块状分明，靠深浅对比和几何字形传达力量感。`,
  },
  {
    id: "github",
    name: "开源协作 · GitHub",
    category: "科技产品/开源协作",
    accent: "#2f81f7",
    description: "经典浅色冷灰底，蓝色链接，代码原生的开源协作感",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#1f2328;`,
      abs(
        `left:0;right:0;top:0;height:74px;box-sizing:border-box;background:#f6f8fa;border-bottom:1px solid #d0d7de;`,
        abs(
          `left:22px;top:14px;display:flex;align-items:center;gap:7px;font-size:14px;`,
          `<div style="width:14px;height:14px;box-sizing:border-box;border:1.5px solid #656d76;border-radius:3px;"></div><span style="color:#0969da;">octo-org</span><span style="color:#656d76;">/</span><span style="color:#0969da;font-weight:600;">design-system</span><span style="border:1px solid #d0d7de;border-radius:999px;font-size:9px;color:#656d76;padding:1px 7px;">Public</span>`,
        ) +
          abs(
            `left:22px;bottom:0;display:flex;gap:18px;font-size:11px;color:#656d76;`,
            `<span style="padding:0 2px 8px;border-bottom:2px solid #fd8c73;font-weight:600;color:#1f2328;">代码</span><span>议题 <b style="background:#eaeef2;border-radius:999px;padding:0 6px;font-size:9px;font-weight:600;color:#1f2328;">12</b></span><span>拉取请求 <b style="background:#eaeef2;border-radius:999px;padding:0 6px;font-size:9px;font-weight:600;color:#1f2328;">3</b></span><span>讨论</span>`,
          ),
      ) +
        abs(
          `left:22px;top:90px;width:290px;box-sizing:border-box;border:1px solid #d0d7de;border-radius:6px;overflow:hidden;`,
          `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f6f8fa;border-bottom:1px solid #d0d7de;"><div style="width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#54aeff,#8250df);"></div><span style="font-size:10px;font-weight:600;">lin-che</span><div style="flex:1;height:4px;border-radius:2px;background:#d8dee4;"></div><span style="font-family:${MONO};font-size:9px;color:#656d76;">a1b2c3d</span></div>` +
            [
              [true, "src", "3 天前"],
              [true, "docs", "上周"],
              [false, "README.md", "2 小时前"],
              [false, "package.json", "昨天"],
              [false, "LICENSE", "去年"],
            ]
              .map(
                ([dir, n, t], i) =>
                  `<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;font-size:11px;${i < 4 ? "border-bottom:1px solid #d8dee4;" : ""}"><div style="width:13px;height:10px;box-sizing:border-box;border-radius:2px;${dir ? "background:#54aeff;" : "border:1.5px solid #656d76;"}"></div><span style="width:84px;">${n}</span><div style="flex:1;height:4px;border-radius:2px;background:#eaeef2;"></div><span style="font-size:9px;color:#656d76;">${t}</span></div>`,
              )
              .join(""),
        ) +
        abs(
          `right:22px;top:90px;width:124px;`,
          `<div style="background:#1f883d;color:#ffffff;font-size:11px;font-weight:600;text-align:center;padding:6px 0;border-radius:6px;">克隆仓库</div>` +
            `<div style="font-size:11px;font-weight:600;margin:14px 0 8px;">关于</div>` +
            textLines([100, 76], "#d8dee4", 4, 6) +
            `<div style="display:flex;gap:5px;margin-top:10px;font-size:9px;font-weight:600;color:#0969da;"><span style="background:#ddf4ff;border-radius:999px;padding:2px 8px;">react</span><span style="background:#ddf4ff;border-radius:999px;padding:2px 8px;">tokens</span></div>` +
            `<div style="font-size:11px;font-weight:600;margin:14px 0 7px;">语言</div>` +
            `<div style="display:flex;height:6px;border-radius:3px;overflow:hidden;"><i style="flex:62;background:#3178c6;"></i><i style="flex:26;background:#f1e05a;"></i><i style="flex:12;background:#e34c26;"></i></div>`,
        ),
    ),
    style: `【视觉主题】冷色、逻辑分明、代码原生的开源协作环境：一切都是带描边的盒子（参考 GitHub）
  【色彩系统】
   - 浅色方案：页面白 #ffffff，区块底 #f6f8fa，描边 #d0d7de，行分隔 #d8dee4；文本 #1f2328，说明 #656d76；链接蓝 #0969da。
   - 深色方案：页面 #0d1117，区块底 #161b22，描边 #30363d；文本 #e6edf3，说明 #8d96a0；链接蓝 #2f81f7。整份作品只选一套。
   - 语义色：主操作绿 #1f883d，已合并紫 #8250df，关闭或危险红 #cf222e，提醒黄 #9a6700；选中标签页下划线为橙 #fd8c73。
  【字体与字号】
   - 系统无衬线字体栈；提交哈希、文件路径、代码使用等宽字体。
   - 字号阶梯：页标题 24-32px 字重 600，小节标题 20px（下方带 1px 分隔线），正文 14-16px 行高 1.5，辅助文字 12px。
  【间距与形状】
   - 圆角统一 6px；标签与计数徽标为全圆角。
   - 所有容器都是 1px 描边的盒子，不用阴影；盒子头部用区块底色与内容区分。
   - 间距取 8px 倍数，列表行高 36-40px。
  【组件特征】
   - 仓库头：图标 + “组织 / 仓库名”蓝色链接 + 可见性徽标；下方标签页（代码、议题、拉取请求），当前页带橙色下划线和计数徽标。
   - 文件列表盒：头部为最近提交（头像 + 作者 + 说明 + 哈希），下面逐行“图标 + 文件名 + 提交说明 + 时间”。
   - 侧栏：关于、主题标签（浅蓝胶囊）、语言占比条（多色分段）。
   - 按钮：主按钮绿底白字，次按钮浅灰底加描边；议题与评论用带头像的时间线盒子。
   - README 正文按文档规范排版：标题带下划线、代码块灰底、表格带描边。
  【页面结构】仓库头与标签页 → 左侧文件列表盒 + 右侧信息侧栏 → README 正文盒 → 贡献者与发布记录。
  【禁忌】不用渐变、大圆角和阴影；不用装饰性插画；颜色只表达状态和链接。
  【布局原则】极其规整的盒子模型，主内容约占 3/4 宽，侧栏约占 1/4 宽。`,
  },
  {
    id: "openai",
    name: "未来黑白 · OpenAI",
    category: "科技产品/前沿 AI",
    accent: "#10a37f",
    description: "纯黑白对比，优雅细体或宋体，微弱绿色点缀，未来极简",
    previewHtml: canvas(
      `background:#000000;font-family:${SANS};color:#ffffff;`,
      abs(`left:30px;top:26px;display:flex;align-items:center;gap:8px;font-size:11px;color:#a3a3a3;`, `<i style="width:7px;height:7px;border-radius:50%;background:#10a37f;display:inline-block;"></i>研究 · 2026 年 9 月`) +
        abs(`left:30px;right:40px;top:62px;font-size:32px;font-weight:400;line-height:1.3;letter-spacing:-0.8px;`, "我们相信，智能应当<br>惠及每一个人。") +
        abs(`left:30px;right:30px;top:168px;height:1px;background:#262626;`) +
        abs(
          `left:30px;right:30px;top:184px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px;`,
          [
            ["01", "模型能力"],
            ["02", "安全研究"],
            ["03", "开放平台"],
          ]
            .map(([n, t]) => `<div><div style="font-size:10px;color:#737373;">${n}</div><div style="font-size:14px;margin:6px 0 10px;">${t}</div>${textLines([100, 64], "#262626", 4, 6)}</div>`)
            .join(""),
        ) +
        abs(`left:30px;bottom:20px;font-size:11px;border-bottom:1px solid #ffffff;padding-bottom:2px;`, "阅读全文 ↗"),
    ),
    style: `【视觉主题】前沿科技的极致极简：大面积的黑或白、从容的大字和几乎为零的装饰（参考 OpenAI 官网）
  【色彩系统】
   - 底色：整份作品以纯黑 #000000 或纯白 #ffffff 为主，可在章节之间整段切换，不使用中间灰作底。
   - 文本：黑底上 #ffffff / #a3a3a3 / #737373；白底上 #0d0d0d / #5d5d5d / #8f8f8f。
   - 分隔线：黑底 #262626，白底 #e5e5e5。
   - 强调色：青绿 #10a37f，极度节制，只用作一个小圆点、一条状态标记或个别链接的悬停色；整页面积不超过 1%。
  【字体与字号】
   - 标题用偏细的无衬线体（字重 400）或有书籍感的衬线体，二选一；不使用粗体标题。
   - 字号阶梯：主标题 48-72px 行高 1.2-1.3、字距 -0.02em，二级 32-40px，三级 20-24px，正文 16-18px 行高 1.6，栏目标签 12-13px。
  【间距与形状】
   - 没有卡片、没有描边盒子、没有阴影；分组只靠留白和 1px 通栏细线。
   - 区块上下留白 120-160px，栅格列间距 24-32px；图片为直角或 8px 圆角。
  【组件特征】
   - 栏目标签：小圆点 + “栏目 · 日期”。
   - 编号索引：三列“编号 + 标题 + 两行说明”，上方一条通栏细线。
   - 文字链接：正文色文字加 1px 下划线，文末可带 ↗；主按钮为白底黑字（或黑底白字）的全圆角胶囊，全页最多两个。
   - 大图：整幅出血的抽象图像或产品画面，上下各留一个栅格间距。
  【页面结构】栏目标签 → 一句从容的大标题 → 通栏细线 → 三列编号索引 → 整幅大图 → 长文正文（单栏，最大宽度 720px）→ 相关阅读列表。
  【禁忌】不用渐变、图标堆叠、彩色标签和卡片网格；不要把留白填满；绿色不要用于标题和按钮底色。
  【布局原则】用大面积的空旷建立未来感与高级感，一屏只说一件事。`,
  },
  {
    id: "tailwind",
    name: "现代实用 · Tailwind CSS",
    category: "科技产品/开发框架",
    accent: "#38bdf8",
    description: "系统级字体栈，柔和弥散阴影，蓝青主色，标准实用主义",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#0f172a;`,
      abs(`left:-70px;top:-90px;width:320px;height:240px;background:radial-gradient(ellipse at center,rgba(56,189,248,0.24),rgba(56,189,248,0) 70%);`) +
        abs(`left:28px;top:28px;background:#f0f9ff;color:#0284c7;font-size:10px;font-weight:600;padding:4px 11px;border-radius:999px;`, "v4.0 已发布 ›") +
        abs(`left:28px;top:62px;width:236px;font-size:25px;font-weight:800;line-height:1.26;letter-spacing:-0.6px;`, `不离开 HTML，<br>快速构建<span style="color:#0ea5e9;">现代网站</span>`) +
        abs(`left:28px;top:140px;width:204px;`, textLines([100, 88, 60], "#cbd5e1", 5, 7)) +
        abs(
          `left:28px;top:190px;display:flex;gap:8px;font-size:11px;font-weight:600;`,
          `<span style="background:#0f172a;color:#ffffff;padding:8px 15px;border-radius:8px;">快速开始</span><span style="background:#ffffff;box-shadow:0 0 0 1px #e2e8f0,0 1px 2px rgba(15,23,42,0.06);padding:8px 12px;border-radius:8px;color:#64748b;font-family:${MONO};font-weight:400;font-size:10px;">npm i tailwindcss</span>`,
        ) +
        abs(
          `right:26px;top:34px;width:186px;height:150px;box-sizing:border-box;background:#0f172a;border-radius:12px;box-shadow:0 20px 25px -5px rgba(15,23,42,0.22),0 8px 10px -6px rgba(15,23,42,0.2);padding:14px;`,
          `<div style="display:flex;gap:5px;margin-bottom:13px;"><i style="width:7px;height:7px;border-radius:50%;background:#334155;"></i><i style="width:7px;height:7px;border-radius:50%;background:#334155;"></i><i style="width:7px;height:7px;border-radius:50%;background:#334155;"></i></div>` +
            codeLines(
              [
                [0, [14, "#94a3b8"], [26, "#f472b6"], [30, "#38bdf8"], [44, "#86efac"]],
                [12, [14, "#94a3b8"], [22, "#f472b6"], [34, "#38bdf8"], [38, "#86efac"]],
                [24, [60, "#e2e8f0"]],
                [12, [14, "#94a3b8"], [22, "#f472b6"]],
                [12, [14, "#94a3b8"], [16, "#f472b6"], [30, "#38bdf8"], [52, "#86efac"]],
                [24, [84, "#e2e8f0"]],
                [12, [14, "#94a3b8"], [16, "#f472b6"]],
                [0, [14, "#94a3b8"], [26, "#f472b6"]],
              ],
              5,
              8,
            ),
        ) +
        abs(
          `right:46px;bottom:22px;width:180px;box-sizing:border-box;background:#ffffff;border-radius:14px;box-shadow:0 20px 25px -5px rgba(15,23,42,0.14),0 8px 10px -6px rgba(15,23,42,0.1),0 0 0 1px rgba(15,23,42,0.05);padding:12px;display:flex;align-items:center;gap:10px;`,
          `<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#38bdf8,#6366f1);flex:none;"></div><div style="flex:1;">${textLines([86, 56], "#e2e8f0", 5, 6)}</div><div style="background:#0ea5e9;color:#ffffff;font-size:10px;font-weight:600;padding:5px 10px;border-radius:6px;">购买</div>`,
        ),
    ),
    style: `【视觉主题】实用主义的现代网页标杆：标准、通用、处处得体的商业组件范式（参考 Tailwind UI）
  【色彩系统】
   - 底色：白 #ffffff，分区底 #f8fafc / #f1f5f9。
   - 文本：石板色阶，标题 #0f172a，正文 #334155，说明 #64748b，占位 #94a3b8。
   - 描边：#e2e8f0；需要更轻时用 0 0 0 1px rgba(15,23,42,0.05) 的环形阴影代替描边。
   - 强调色：天空蓝 #38bdf8（文字与按钮用更深的 #0ea5e9 / #0284c7），辅以靛蓝 #6366f1 做渐变；浅色标签底 #f0f9ff。
   - 深色表面：代码区用 #0f172a，语法色为粉 #f472b6、天蓝 #38bdf8、浅绿 #86efac、浅灰 #e2e8f0。
  【字体与字号】
   - 系统级无衬线字体栈（Inter 优先）；代码用等宽字体。
   - 字号阶梯严格沿用标准刻度：12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60px；主标题 48-60px 字重 800、字距 -0.025em，小节标题 30-36px，正文 16-18px 行高 1.75。
  【间距与形状】
   - 间距取 4px 倍数的标准刻度（8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px）。
   - 圆角：按钮与输入 8px，卡片 12-16px，标签全圆角。
   - 标志性的弥散阴影分三档：小 0 1px 2px rgba(15,23,42,0.06)；中 0 4px 6px -1px rgba(15,23,42,0.1)；大 0 20px 25px -5px rgba(15,23,42,0.14) 叠加 0 8px 10px -6px rgba(15,23,42,0.1)。
  【组件特征】
   - 首屏：浅蓝胶囊公告条 → 粗体标题（一个关键词着天蓝色）→ 说明 → 深色主按钮 + 等宽的安装命令框。
   - 代码卡：深色圆角卡 + 大阴影，旁边叠放一张由这段代码渲染出的白色界面卡。
   - 功能网格：三列卡片，每张为“渐变小图标 + 标题 + 说明”。
   - 定价卡、客户评价卡、常见问题折叠列表、页脚多列链接。
  【页面结构】顶栏 → 首屏（左文右代码与界面卡）→ 客户标志行 → 三列功能网格 → 交错的图文段落 → 评价 → 定价 → 行动号召 → 页脚。
  【禁忌】不要自创刻度外的尺寸和颜色；不用纯黑和高饱和撞色；阴影不叠超过两层。
  【布局原则】最大宽度 1280px 的居中容器，12 栏栅格，一切对齐到标准刻度。`,
  },
  {
    id: "ai-console",
    name: "智能控制台",
    category: "科技产品/智能控制台",
    accent: "#7c3aed",
    description: "AI 产品控制台，深浅混合界面，模型状态、任务流和提示词面板清晰分区",
    previewHtml: canvas(
      `background:#f8fafc;font-family:${SANS};color:#0f172a;display:flex;`,
      `<div style="width:46px;flex:none;background:#0f172a;display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:14px;"><div style="width:22px;height:22px;border-radius:7px;background:linear-gradient(135deg,#7c3aed,#06b6d4);"></div>` +
        [true, false, false, false].map((on) => `<div style="width:22px;height:22px;border-radius:6px;background:${on ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"};"></div>`).join("") +
        `</div>` +
        `<div style="flex:1;min-width:0;padding:14px;">` +
        `<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:14px;font-weight:700;">客服质检 · 模型评测</span><span style="display:flex;align-items:center;gap:4px;font-size:9px;font-weight:600;color:#7c3aed;background:#ede9fe;border-radius:999px;padding:2px 8px;"><i style="width:5px;height:5px;border-radius:50%;background:#7c3aed;display:inline-block;"></i>运行中</span></div>` +
        [
          ["#10b981", "数据集加载", "1,200 条", 100],
          ["#7c3aed", "批量推理", "842 / 1,200", 70],
          ["#cbd5e1", "自动评分", "等待中", 0],
        ]
          .map(
            ([c, n, m, p]) =>
              `<div style="margin-top:8px;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:9px 11px;"><div style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:600;"><i style="width:7px;height:7px;border-radius:50%;background:${c};display:inline-block;"></i>${n}<span style="margin-left:auto;font-family:${MONO};font-size:9px;font-weight:400;color:#64748b;">${m}</span></div><div style="margin-top:7px;height:4px;border-radius:2px;background:#f1f5f9;"><div style="width:${p}%;height:100%;border-radius:2px;background:${c};"></div></div></div>`,
          )
          .join("") +
        `<div style="margin-top:8px;background:#0f172a;border-radius:8px;padding:8px 10px;font-family:${MONO};font-size:9px;line-height:1.7;color:#94a3b8;white-space:nowrap;overflow:hidden;"><div><span style="color:#22d3ee;">12:04:31</span> batch 17 完成 · 2.1s</div><div><span style="color:#22d3ee;">12:04:33</span> tokens 48,210 / 120,000</div></div>` +
        `</div>` +
        `<div style="width:128px;flex:none;box-sizing:border-box;border-left:1px solid #e2e8f0;background:#ffffff;padding:14px 12px;">` +
        `<div style="font-size:10px;font-weight:700;color:#64748b;letter-spacing:1px;">参数</div>` +
        `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:10px;color:#64748b;">模型<span style="font-family:${MONO};font-size:9px;color:#0f172a;background:#f1f5f9;border-radius:4px;padding:2px 6px;">m2-large</span></div>` +
        `<div style="display:flex;justify-content:space-between;margin-top:10px;font-size:10px;color:#64748b;">温度<span style="font-family:${MONO};color:#0f172a;">0.7</span></div>` +
        `<div style="position:relative;margin-top:6px;height:4px;border-radius:2px;background:#e2e8f0;"><div style="width:70%;height:100%;border-radius:2px;background:#7c3aed;"></div><div style="position:absolute;left:66%;top:-4px;width:12px;height:12px;box-sizing:border-box;border-radius:50%;background:#ffffff;border:2px solid #7c3aed;"></div></div>` +
        `<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#64748b;letter-spacing:1px;">通过率</div>` +
        `<div style="font-size:25px;font-weight:800;color:#7c3aed;letter-spacing:-0.5px;margin:2px 0 8px;">91.4%</div>` +
        barChart([52, 64, 58, 76, 70, 88, 91], { height: 44, color: "#ddd6fe", highlight: "#7c3aed", gap: 4, radius: 2 }) +
        `</div>`,
    ),
    style: `【视觉主题】面向 AI 产品的专业控制台：有实验室的严谨，也有工具的可操作性，强调可控、可审计、可复用
  【色彩系统】
   - 底色：冷白 #f8fafc，面板纯白 #ffffff，描边 #e2e8f0；侧边导航与日志区用深灰蓝 #0f172a。深浅混合，不做整页黑底。
   - 文本：主文本 #0f172a，次要 #64748b；深色区 #f8fafc / #94a3b8。
   - 强调色：紫 #7c3aed（浅底 #ede9fe、中间档 #ddd6fe）用于当前步骤、进度和主按钮；青 #06b6d4 / #22d3ee 用于时间戳、链接和次要数据。
   - 状态色：成功绿 #10b981，运行中紫 #7c3aed，等待灰 #cbd5e1，失败红 #ef4444，警告橙 #f59e0b。
  【字体与字号】
   - 现代无衬线体；模型名、参数值、时间戳、token 计数使用等宽字体。
   - 字号阶梯：页面标题 20-24px 字重 700，面板标题 14-16px 字重 600，正文与表单 13-14px，标签 11-12px（分区标题加 0.08em 字距），关键指标 28-36px 字重 800。
  【间距与形状】
   - 圆角：面板 10-12px，输入与按钮 8px，状态标签全圆角。
   - 面板 = 白底 + 1px 描边，不用阴影；面板间距 8-12px，内边距 12-16px。
  【组件特征】
   - 三栏结构：左侧窄图标导航（约 56px）/ 中央工作流 / 右侧参数检查器（约 280px）。
   - 工作流步骤卡：状态点 + 步骤名 + 右侧等宽的进度说明 + 4px 进度条。
   - 运行日志块：深底等宽，每行以青色时间戳开头。
   - 参数检查器：模型选择、温度滑杆、最大长度输入、系统提示词文本框；下方为关键指标与小型趋势柱。
   - 提示词面板：变量用花括号并高亮；结果对比用左右分栏。
  【页面结构】顶部任务标题与运行状态 → 中央步骤流 → 结果或日志区 → 右侧参数与指标；长页面可在下方追加评测结果表和样本明细。
  【禁忌】不要空白的装饰图表；不要纯黑整页和发光渐变；一个界面里紫色主按钮不超过一个。
  【布局原则】适合 AI 工作台、模型评测、自动化流程页面；任务目标在最上方，参数小而精确，结果区保持高可读性。`,
  },
  {
    id: "blueprint-tech",
    name: "蓝图科技",
    category: "科技产品/蓝图架构",
    accent: "#2563eb",
    description: "工程蓝图风，细网格、结构线，系统架构与模块说明清晰直观",
    previewHtml: (() => {
      const node = (x: number, y: number, w: number, h: number, num: string, title: string) =>
        abs(
          `left:${x}px;top:${y}px;width:${w}px;height:${h}px;box-sizing:border-box;border:1px solid #3b82f6;background:rgba(37,99,235,0.14);border-radius:4px;padding:6px 10px;`,
          `<div style="font-family:${MONO};font-size:8px;color:#22d3ee;">${num}</div><div style="font-size:12px;font-weight:600;color:#ffffff;margin-top:1px;">${title}</div>`,
        );
      const line = (css: string) => abs(`background:#22d3ee;${css}`);
      return canvas(
        `background-color:#08111f;background-image:linear-gradient(rgba(37,99,235,0.14) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.14) 1px,transparent 1px);background-size:20px 20px;font-family:${SANS};color:#e2e8f0;`,
        abs(`left:24px;top:18px;font-family:${MONO};font-size:9px;letter-spacing:2px;color:#22d3ee;`, "SYSTEM ARCHITECTURE / REV 1.3") +
          abs(`left:24px;top:36px;font-size:20px;font-weight:700;color:#ffffff;`, "订单系统架构总览") +
          node(24, 90, 96, 44, "01", "客户端") +
          node(160, 90, 96, 44, "02", "接入网关") +
          node(296, 76, 96, 38, "03", "订单服务") +
          node(296, 122, 96, 38, "04", "库存服务") +
          node(296, 168, 96, 38, "05", "支付服务") +
          node(160, 208, 96, 44, "06", "消息队列") +
          node(24, 208, 96, 44, "07", "数据库") +
          line(`left:120px;top:112px;width:40px;height:1px;`) +
          line(`left:256px;top:112px;width:20px;height:1px;`) +
          line(`left:276px;top:95px;width:1px;height:93px;`) +
          line(`left:276px;top:95px;width:20px;height:1px;`) +
          line(`left:276px;top:141px;width:20px;height:1px;`) +
          line(`left:276px;top:187px;width:20px;height:1px;`) +
          abs(`left:208px;top:134px;width:0;height:74px;border-left:1px dashed #22d3ee;`) +
          abs(`left:120px;top:230px;width:40px;height:0;border-top:1px dashed #22d3ee;`) +
          abs(`left:406px;top:72px;font-family:${MONO};font-size:8px;line-height:46px;color:#94a3b8;white-space:nowrap;`, "P99 &lt; 120ms<br>QPS 12k<br>SLA 99.95%") +
          abs(
            `right:24px;bottom:16px;display:flex;align-items:center;gap:6px;font-family:${MONO};font-size:8px;color:#64748b;`,
            `<i style="width:16px;height:1px;background:#22d3ee;display:inline-block;"></i>同步调用<i style="width:16px;height:0;border-top:1px dashed #22d3ee;display:inline-block;margin-left:8px;"></i>异步消息`,
          ),
      );
    })(),
    style: `【视觉主题】工程蓝图与系统架构说明：理性、清晰、技术可信，像一张可以直接交付的工程图
  【色彩系统】
   - 底色：整份作品二选一，深海军蓝 #08111f 或冷白 #f8fbff。
   - 网格线：rgba(37,99,235,0.14) 的 1px 细线，间距 20px；不要更密。
   - 文本：深底标题 #ffffff、正文 #e2e8f0、标注 #94a3b8、弱标注 #64748b；浅底标题 #0f172a、正文 #334155。
   - 强调色：科技蓝 #2563eb / #3b82f6 用于节点描边和填充（填充透明度 12%-16%），青色 #22d3ee 用于连线、编号和技术标签。
  【字体与字号】
   - 标题使用几何无衬线体；编号、技术标签、指标、图例使用等宽字体并全大写。
   - 字号阶梯：页标题 28-36px 字重 700，模块标题 16-18px 字重 600，正文 14-15px 行高 1.6，等宽标注 11-12px、字距 0.1em。
  【间距与形状】
   - 节点为 4px 小圆角矩形 + 1px 描边 + 半透明填充，所有节点对齐到 20px 网格。
   - 连线只用水平和垂直线段，实线表示同步调用，虚线表示异步消息；不画斜线和曲线。
   - 页面内边距 24-32px；模块说明控制在 2-3 行。
  【组件特征】
   - 图纸题栏：左上角等宽的“图名 / 版本号”，其下为中文标题。
   - 架构图：编号节点（01、02…）+ 正交连线 + 右侧对齐的指标标注（延迟、吞吐、可用性）+ 右下角图例。
   - 模块说明卡：编号 + 模块名 + 职责 + 接口；接口表列出方法、路径、说明。
   - 流程图、时序条、部署拓扑全部用 HTML/CSS 的边框和网格绘制，禁止用图片占位。
  【页面结构】题栏与标题 → 架构总览图 → 按编号展开的模块说明 → 关键流程（时序或步骤）→ 接口表 → 非功能指标 → 版本与变更记录。
  【禁忌】不用渐变、发光和立体效果；不用手绘风图标；节点不要大小不一、随意摆放。
  【布局原则】适合技术方案、产品架构、接口能力介绍；一级标题简短，模块用编号串联，图与文一一对应。`,
  },
];
