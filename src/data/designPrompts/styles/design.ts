import type { RawDesignStyle } from "../types";
import { MONO, SANS, abs, canvas, portraitPages, textLines } from "../previewKit";

const PAGE_RULE = '- **强制分页容器**：每一张必须使用 `<section class="page">` 包裹并固定比例（推荐 `.page{width:min(100vw,720px);aspect-ratio:3/4;overflow:hidden;margin:0 auto 24px;}`）。';

export const designStyles: RawDesignStyle[] = [
  {
    id: "apple",
    name: "高级留白 · Apple",
    category: "设计创意/品牌叙事",
    accent: "#0071e3",
    description: "SF Pro 风格，超大留白，居中叙事，电影感大标题",
    previewHtml: canvas(
      `background:#f5f5f7;font-family:${SANS};color:#1d1d1f;text-align:center;`,
      abs(`left:0;right:0;top:26px;font-size:12px;font-weight:600;color:#bf4800;`, "新品") +
        abs(`left:0;right:0;top:46px;font-size:36px;font-weight:600;letter-spacing:-0.8px;line-height:1.1;`, "轻。强。远超想象。") +
        abs(`left:0;right:0;top:96px;font-size:14px;color:#6e6e73;`, "全新一代，现已推出") +
        abs(
          `left:0;right:0;top:126px;display:flex;justify-content:center;align-items:center;gap:16px;font-size:12px;`,
          `<span style="background:#0071e3;color:#ffffff;padding:6px 15px;border-radius:999px;">购买</span><span style="color:#0066cc;">进一步了解 ›</span>`,
        ) +
        abs(
          `left:124px;top:176px;width:232px;height:150px;box-sizing:border-box;background:#1d1d1f;border-radius:12px 12px 0 0;padding:6px 6px 0;`,
          `<div style="height:100%;border-radius:7px 7px 0 0;background:radial-gradient(circle at 30% 20%,#7dd3fc,rgba(125,211,252,0) 55%),radial-gradient(circle at 80% 30%,#c084fc,rgba(192,132,252,0) 55%),linear-gradient(160deg,#1e3a8a,#be185d);"></div>`,
        ),
    ),
    style: `【视觉主题】极简、高级、有电影感的产品叙事：一屏一个主角，其余全是留白（参考 Apple 官网）
  【色彩系统】
   - 底色：纯白 #ffffff 与浅灰 #f5f5f7 整段交替；重点章节可整段切换为纯黑 #000000 或深灰 #1d1d1f。
   - 文本：浅底标题与正文 #1d1d1f，说明 #6e6e73；深底 #f5f5f7 / #a1a1a6。
   - 强调色：蓝 #0071e3（按钮）与 #0066cc（文字链接；深底上用 #2997ff），不出现其它彩色；“新品”小标可用橙 #bf4800。
   - 分隔线 #d2d2d7。
  【字体与字号】
   - SF Pro 风格的现代无衬线体，中文用苹方；标题字重 600，正文 400。
   - 字号阶梯：首屏标题 56px 行高 1.07、字距 -0.005em，章节标题 40-48px，导语 21-28px，正文 17px 行高 1.47，注释 12px。
  【间距与形状】
   - 章节上下留白 120px 以上；内容区最大宽度 980px 并居中。
   - 圆角：内容卡片 18px，按钮全圆角胶囊，图片 12-18px。
   - 卡片近乎无边界：纯色底，不描边，不加投影或只有极淡的投影。
  【组件特征】
   - 首屏：小标 → 超大居中标题 → 一行副标题 → “蓝色胶囊按钮 + 蓝色文字链接 ›” → 巨大的产品图，产品图可在屏幕底部被裁切。
   - 特性拼贴：两列或三列的圆角大卡片，每张为“标题 + 一句说明 + 图”，深浅卡片交替。
   - 参数对比：三列等宽，每列为图 + 名称 + 3-4 行关键参数，用细线分隔。
   - 页面底部的脚注区用 12px 灰色小字。
  【页面结构】首屏主角 → 一句话亮点的大字章节（每个章节一屏）→ 特性拼贴 → 参数对比 → 购买引导 → 脚注。
  【禁忌】不用渐变按钮、彩色图标和装饰线；一屏不超过一个标题；文字不要压在复杂图片上。
  【布局原则】居中对齐为主，产品图极其突出；靠字号、留白和明暗章节切换形成电影般的节奏。`,
  },
  {
    id: "figma",
    name: "创意工具 · Figma",
    category: "设计创意/设计工具",
    accent: "#0d99ff",
    description: "纯白底，纯黑字，鲜艳纯色点缀，粗边框与工具感面板",
    previewHtml: canvas(
      `background:#f5f5f5;font-family:${SANS};color:#000000;`,
      abs(
        `left:0;right:0;top:0;height:30px;box-sizing:border-box;background:#ffffff;border-bottom:1px solid #e6e6e6;display:flex;align-items:center;gap:8px;padding:0 12px;`,
        ["#0d99ff", "#e6e6e6", "#e6e6e6", "#e6e6e6"].map((c) => `<div style="width:13px;height:13px;border-radius:3px;background:${c};"></div>`).join("") +
          `<span style="margin:0 auto;font-size:10px;">首页 — 草稿</span>` +
          `<div style="width:16px;height:16px;border-radius:50%;background:#ff3d8b;border:2px solid #ffffff;"></div><div style="width:16px;height:16px;border-radius:50%;background:#1ea64a;border:2px solid #ffffff;margin-left:-12px;"></div>` +
          `<span style="background:#0d99ff;color:#ffffff;font-size:9px;font-weight:600;padding:4px 10px;border-radius:5px;">分享</span>`,
      ) +
        abs(
          `left:0;top:30px;bottom:0;width:92px;box-sizing:border-box;background:#ffffff;border-right:1px solid #e6e6e6;padding:10px 8px;`,
          `<div style="font-size:9px;font-weight:600;margin-bottom:8px;">图层</div>` +
            [
              [0, 50, false],
              [10, 44, true],
              [10, 36, false],
              [10, 48, false],
              [0, 40, false],
            ]
              .map(
                ([ind, w, on]) =>
                  `<div style="display:flex;align-items:center;gap:5px;padding:5px 5px;margin-left:${ind}px;border-radius:4px;${on ? "background:#e5f4ff;" : ""}"><div style="width:8px;height:8px;border-radius:2px;border:1.5px solid ${on ? "#0d99ff" : "#b3b3b3"};box-sizing:border-box;"></div><div style="width:${w}px;height:4px;border-radius:2px;background:${on ? "#0d99ff" : "#d9d9d9"};"></div></div>`,
              )
              .join(""),
        ) +
        abs(
          `right:0;top:30px;bottom:0;width:96px;box-sizing:border-box;background:#ffffff;border-left:1px solid #e6e6e6;padding:10px;font-size:9px;`,
          `<div style="font-weight:600;margin-bottom:8px;">设计</div>` +
            `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-family:${MONO};font-size:8px;color:#666666;"><span style="background:#f5f5f5;border-radius:4px;padding:4px 6px;">W 150</span><span style="background:#f5f5f5;border-radius:4px;padding:4px 6px;">H 104</span></div>` +
            `<div style="font-weight:600;margin:12px 0 7px;">填充</div>` +
            `<div style="display:flex;align-items:center;gap:6px;background:#f5f5f5;border-radius:4px;padding:4px 6px;font-family:${MONO};font-size:8px;"><i style="width:11px;height:11px;border-radius:2px;background:#dceeb1;display:inline-block;"></i>DCEEB1</div>` +
            `<div style="font-weight:600;margin:12px 0 7px;">圆角</div><div style="background:#f5f5f5;border-radius:4px;padding:4px 6px;font-family:${MONO};font-size:8px;color:#666666;">14</div>`,
        ) +
        abs(`left:112px;top:54px;width:150px;height:104px;border-radius:14px;background:#dceeb1;display:flex;align-items:center;justify-content:center;font-size:40px;`, "Aa") +
        abs(`left:210px;top:148px;width:150px;height:110px;border-radius:14px;background:#c5b0f4;`) +
        abs(`left:124px;top:192px;width:62px;height:62px;border-radius:50%;background:#f3c9b6;`) +
        abs(
          `left:110px;top:52px;width:154px;height:108px;box-sizing:border-box;border:1.5px solid #0d99ff;`,
          [
            "left:-4px;top:-4px;",
            "right:-4px;top:-4px;",
            "left:-4px;bottom:-4px;",
            "right:-4px;bottom:-4px;",
          ]
            .map((p) => `<div style="position:absolute;${p}width:7px;height:7px;box-sizing:border-box;background:#ffffff;border:1.5px solid #0d99ff;"></div>`)
            .join(""),
        ) +
        abs(`left:156px;top:165px;background:#0d99ff;color:#ffffff;font-family:${MONO};font-size:8px;padding:1px 6px;border-radius:3px;`, "150 × 104") +
        abs(
          `left:312px;top:112px;`,
          `<svg width="16" height="16" viewBox="0 0 16 16" style="display:block;"><path d="M1 1l5.5 13 1.8-5.2L13.5 7z" fill="#ff3d8b" stroke="#ffffff" stroke-width="1"/></svg><span style="position:absolute;left:13px;top:13px;background:#ff3d8b;color:#ffffff;font-size:9px;font-weight:600;padding:2px 8px;border-radius:0 999px 999px 999px;white-space:nowrap;">小林</span>`,
        ),
    ),
    style: `【视觉主题】设计工具的画布与面板：紧凑、直接、充满创作感，黑白界面上跳着几块纯色（参考 Figma）
  【色彩系统】
   - 底色：纯白 #ffffff，画布灰 #f5f5f5，面板分割线 #e6e6e6。
   - 文本：纯黑 #000000，说明 #666666，占位 #b3b3b3。
   - 选中与操作：蓝 #0d99ff（选区描边、主按钮、选中行底 #e5f4ff）。
   - 色块：一组低饱和的纯色块作为内容底色，柠绿 #dceeb1、淡紫 #c5b0f4、奶油 #f4ecd6、浅粉 #efd4d4、薄荷 #c8e6cd、珊瑚 #f3c9b6、深蓝 #1f1d3d；一屏用 2-3 种。
   - 协作光标色：品红 #ff3d8b、绿 #1ea64a。
  【字体与字号】
   - Inter 风格的无衬线体；大标题用偏细的字重（300-400）和极大的字号，界面文字整体偏小；数值用等宽字体。
   - 字号阶梯：展示标题 64-86px 行高 1.0-1.1、字距 -0.02em，小节标题 26px 字重 500，正文 16-20px 行高 1.4，界面与面板文字 11-13px。
  【间距与形状】
   - 圆角：色块与大卡片 24-32px，按钮 8px 或全圆角，面板控件 4-6px。
   - 面板之间只用 1px 分割线，不用阴影；工具面板内元素间距紧凑（4-8px）。
  【组件特征】
   - 工具界面：顶部工具条（工具图标 + 文件名 + 协作头像 + 蓝色“分享”按钮）、左侧图层树、右侧属性面板（尺寸、填充、圆角）。
   - 选区：1.5px 蓝色描边 + 四角白色小方块手柄 + 下方蓝色尺寸标签。
   - 协作光标：彩色箭头 + 同色的圆角名字标签。
   - 深色小气泡提示（黑底白字、带小尾巴）；色块卡片内放大字或图形。
  【页面结构】工具条式顶栏 → 超大细体标题与一句说明 → 纯色块拼贴的功能展示（带选区和协作光标）→ 两列功能说明 → 模板或社区作品网格 → 行动号召。
  【禁忌】不用渐变和投影堆叠；不用灰蒙蒙的中间色；色块不要超过三种同时出现。
  【布局原则】界面元素彼此靠近、对齐严密；把“正在被设计的画面”本身当作主视觉。`,
  },
  {
    id: "airbnb",
    name: "亲和旅行 · Airbnb",
    category: "设计创意/消费品牌",
    accent: "#ff385c",
    description: "圆润大字重，柔和投影，标志性粉红，以图为主",
    previewHtml: canvas(
      `background:#ffffff;font-family:${SANS};color:#222222;`,
      abs(
        `left:86px;right:86px;top:20px;height:44px;box-sizing:border-box;border:1px solid #dddddd;border-radius:999px;box-shadow:0 3px 12px rgba(0,0,0,0.1);display:flex;align-items:center;padding:0 7px 0 22px;font-size:11px;`,
        `<span style="font-weight:600;">任意地点</span><i style="width:1px;height:20px;background:#dddddd;margin:0 15px;"></i><span style="font-weight:600;">任意一周</span><i style="width:1px;height:20px;background:#dddddd;margin:0 15px;"></i><span style="color:#6a6a6a;">添加房客</span>` +
          `<div style="margin-left:auto;width:30px;height:30px;border-radius:50%;background:#ff385c;display:flex;align-items:center;justify-content:center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg></div>`,
      ) +
        abs(
          `left:24px;right:24px;top:86px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;`,
          [
            ["大理 · 洱海小院", "4.92", "距离湖边 200 米", "680", "linear-gradient(180deg,#fcd9a8 0%,#f59e7a 46%,#4b6cb7 47%,#182848 100%)"],
            ["三亚 · 海景公寓", "4.87", "步行可达沙滩", "920", "linear-gradient(180deg,#bde4f4 0%,#7cc6e8 52%,#2a9d8f 53%,#1b6f6a 100%)"],
            ["莫干山 · 木屋", "4.95", "被竹林环绕", "1,280", "linear-gradient(180deg,#d8e8c8 0%,#8fb98a 50%,#3f6b4f 51%,#1f3d2c 100%)"],
          ]
            .map(
              ([t, r, s, p, bg], i) =>
                `<div><div style="position:relative;height:118px;border-radius:14px;background:${bg};">` +
                (i === 0 ? `<span style="position:absolute;left:8px;top:8px;background:#ffffff;border-radius:999px;font-size:9px;font-weight:600;padding:3px 8px;box-shadow:0 1px 3px rgba(0,0,0,0.15);">房客推荐</span>` : "") +
                `<svg style="position:absolute;right:9px;top:8px;" width="16" height="16" viewBox="0 0 24 24" fill="rgba(0,0,0,0.35)" stroke="#ffffff" stroke-width="2"><path d="M12 21s-7-4.6-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 12C19 16.4 12 21 12 21z"/></svg>` +
                `<div style="position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;gap:4px;">${[1, 0.6, 0.6, 0.6].map((o) => `<i style="width:5px;height:5px;border-radius:50%;background:#ffffff;opacity:${o};"></i>`).join("")}</div>` +
                `</div><div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;"><span style="font-weight:600;">${t}</span><span>★ ${r}</span></div><div style="font-size:10px;color:#6a6a6a;margin-top:2px;">${s}</div><div style="font-size:11px;margin-top:3px;"><b>¥${p}</b> / 晚</div></div>`,
            )
            .join(""),
        ),
    ),
    style: `【视觉主题】温暖、友善、以图片为主角的高质量消费界面：让人想点进去看看（参考 Airbnb）
  【色彩系统】
   - 底色：纯白 #ffffff，分区底 #f7f7f7。
   - 文本：标题 #222222，正文 #3f3f3f，说明 #6a6a6a，占位 #929292。
   - 描边：#dddddd，更轻的分隔 #ebebeb。
   - 强调色：珊瑚粉红 #ff385c（按下 #e00b41），只用于主按钮、搜索按钮、收藏与关键链接；其余界面保持黑白灰，让图片提供色彩。
  【字体与字号】
   - 圆润的现代无衬线体；标题字重 600-700，正文 400；字号克制，不做夸张的大标题。
   - 字号阶梯：页面标题 26-32px 字重 700，小节标题 22px 字重 600，卡片标题 15-16px 字重 600，正文 16px 行高 1.5，说明 14px，徽标 12px。
  【间距与形状】
   - 圆角：图片与卡片 12-14px，大容器 20-32px，搜索条、标签和按钮全圆角。
   - 阴影柔和而宽：搜索条 0 3px 12px rgba(0,0,0,0.1)，浮层 0 6px 20px rgba(0,0,0,0.12)；卡片本身不描边、不加投影。
   - 卡片网格间距 16-24px，文字与图片间距 8-12px。
  【组件特征】
   - 胶囊搜索条：分段显示地点、日期、人数，右端一个粉红圆形搜索按钮。
   - 房源卡：大图（圆角，比例约 20:19）+ 右上角心形收藏 + 左上角白色胶囊徽标 + 底部轮播圆点；图下为“标题 + 评分”“一行说明”“加粗价格 / 单位”。
   - 分类条：一排“线性图标 + 文字”，当前项带 2px 下划线。
   - 评价卡（头像 + 姓名 + 日期 + 评语）、设施列表（图标 + 文字）、预订面板（白底大圆角 + 柔和阴影）。
  【页面结构】顶栏与胶囊搜索条 → 分类条 → 卡片网格 → 详情页为“标题 + 图片拼贴 → 左侧介绍与设施、右侧预订面板 → 评价 → 位置 → 须知”。
  【禁忌】不用硬边框卡片、深色大色块和渐变按钮；图片上不压大段文字；粉红不用于正文和背景。
  【布局原则】图片占每张卡片的 70% 以上；文字信息简短、分行清楚，让版面有安全感和亲和力。`,
  },
  {
    id: "framer",
    name: "丝滑动效 · Framer",
    category: "设计创意/建站动效",
    accent: "#0055ff",
    description: "高对比度，柔和发光效果，精美卡片悬浮，现代建站工具审美",
    previewHtml: canvas(
      `background:#090909;font-family:${SANS};color:#ffffff;text-align:center;`,
      abs(`left:-50px;top:120px;width:270px;height:270px;border-radius:50%;background:radial-gradient(circle,rgba(212,77,240,0.55),rgba(212,77,240,0) 68%);`) +
        abs(`right:-50px;top:110px;width:290px;height:290px;border-radius:50%;background:radial-gradient(circle,rgba(0,153,255,0.5),rgba(0,153,255,0) 68%);`) +
        abs(`left:140px;top:170px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(255,122,61,0.45),rgba(255,122,61,0) 68%);`) +
        abs(`left:0;right:0;top:28px;font-size:40px;font-weight:600;letter-spacing:-2px;line-height:1.05;`, "建站，从未如此流畅") +
        abs(`left:0;right:0;top:84px;font-size:12px;color:#999999;`, "设计、动效与发布，在同一张画布上完成") +
        abs(
          `left:0;right:0;top:114px;display:flex;justify-content:center;gap:8px;font-size:11px;font-weight:600;`,
          `<span style="background:#ffffff;color:#000000;padding:7px 16px;border-radius:999px;">免费开始</span><span style="background:rgba(255,255,255,0.1);padding:7px 16px;border-radius:999px;">观看演示</span>`,
        ) +
        abs(`left:62px;top:188px;width:150px;height:140px;border-radius:16px;background:#141414;border:1px solid #262626;transform:rotate(-8deg);`) +
        abs(`right:62px;top:188px;width:150px;height:140px;border-radius:16px;background:#141414;border:1px solid #262626;transform:rotate(8deg);`) +
        abs(
          `left:150px;top:166px;width:180px;height:160px;box-sizing:border-box;border-radius:18px;background:#1c1c1c;border:1px solid #333333;box-shadow:0 30px 60px rgba(0,0,0,0.6);padding:12px;text-align:left;`,
          `<div style="display:flex;align-items:center;gap:5px;margin-bottom:10px;"><div style="width:10px;height:10px;border-radius:3px;background:#ffffff;"></div><div style="width:28px;height:4px;border-radius:2px;background:#444444;"></div><div style="width:22px;height:4px;border-radius:2px;background:#444444;"></div><div style="margin-left:auto;width:34px;height:12px;border-radius:999px;background:#ffffff;"></div></div>` +
            `<div style="height:64px;border-radius:10px;background:linear-gradient(120deg,#6a4cf5,#d44df0 55%,#ff7a3d);"></div>` +
            `<div style="margin-top:10px;">${textLines([70, 46], "#444444", 4, 6)}</div>`,
        ),
    ),
    style: `【视觉主题】现代建站工具的视觉冲击力：纯黑画布、巨大的字和几团彩色光晕，卡片像在空中悬浮（参考 Framer 官网）
  【色彩系统】
   - 底色：近黑 #090909；表面 #141414 / #1c1c1c；描边 #262626，强调描边 #333333。
   - 文本：纯白 #ffffff，说明 #999999。
   - 强调色：电光蓝 #0099ff 用于链接和焦点；主按钮为白底黑字，不用彩色按钮。
   - 光晕：品红 #d44df0、紫 #6a4cf5、橙 #ff7a3d、珊瑚 #ff5577 的径向渐变（radial-gradient，透明度 45%-55%，向外衰减到 0），只作为标题下方或卡片背后的氛围，同屏不超过三团。
  【字体与字号】
   - 有设计感的几何无衬线体，标题字重 500-600、字距极紧（-0.05em）、行高 0.9-1.05；正文用 Inter。
   - 字号阶梯：展示标题 62-110px，章节标题 32-48px，小标题 22px 字重 700，正文 15-18px 行高 1.3-1.5，标签 12-13px。
  【间距与形状】
   - 圆角：卡片 16-20px，大容器 24-30px，按钮全圆角胶囊。
   - 卡片 = 深色表面 + 1px 描边；浮起的主卡片加深色大投影（0 30px 60px rgba(0,0,0,0.6)）。
   - 卡片允许轻微旋转（正负 8 度以内）并相互叠压，形成前后层次。
  【组件特征】
   - 首屏：超大居中标题 → 一句说明 → “白色胶囊按钮 + 半透明胶囊按钮” → 一组叠放的站点预览卡（中间一张正放并最亮）。
   - 站点预览卡：迷你导航 + 渐变主图 + 两行占位文字。
   - 功能卡网格：两到三列，深色卡片内放界面局部或渐变图形，卡片底部为标题与说明。
   - 模板墙：等宽卡片的多列瀑布，每张带标题与分类。
  【页面结构】极简顶栏 → 首屏大标题与叠放卡片 → 客户标志行 → 功能卡网格 → 交错的大图特性段落 → 模板墙 → 定价 → 行动号召。
  【禁忌】不用浅灰背景和细碎的小图标；光晕不能压住文字；不要每张卡片都旋转。
  【布局原则】自由但极度考究的留白比例；靠巨大的字号对比和前后层次制造冲击力，所有内容在初始状态即可见。`,
  },
  {
    id: "arc",
    name: "多彩卡片 · Arc Browser",
    category: "设计创意/系统体验",
    accent: "#ff8a8a",
    description: "侧边栏布局，柔和粉彩色调，极大圆角，半透明玻璃质感",
    previewHtml: canvas(
      `background:linear-gradient(135deg,#ffd6d6 0%,#e4d4ff 50%,#cfe4ff 100%);font-family:${SANS};color:#3b3552;`,
      abs(
        `left:22px;right:22px;top:20px;bottom:20px;border-radius:18px;background:rgba(255,255,255,0.45);border:1px solid rgba(255,255,255,0.8);box-shadow:0 20px 40px rgba(99,72,160,0.18);display:flex;gap:8px;padding:8px;box-sizing:border-box;`,
        `<div style="width:124px;flex:none;padding:6px 4px;">` +
          `<div style="display:flex;gap:5px;margin:2px 0 10px 4px;"><i style="width:8px;height:8px;border-radius:50%;background:#ff8a8a;"></i><i style="width:8px;height:8px;border-radius:50%;background:#ffd08a;"></i><i style="width:8px;height:8px;border-radius:50%;background:#9be29b;"></i></div>` +
          `<div style="background:rgba(255,255,255,0.6);border-radius:10px;padding:7px 10px;font-size:10px;color:#6b6585;">arc.design</div>` +
          `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:8px 0;">${["#ffb3b3", "#c9b6ff", "#a9d2ff", "#ffe08a"].map((c) => `<div style="height:24px;border-radius:8px;background:${c};"></div>`).join("")}</div>` +
          [
            ["#ff8a8a", "灵感收集", true],
            ["#a78bfa", "周会笔记", false],
            ["#60a5fa", "设计规范", false],
            ["#fbbf24", "旅行计划", false],
          ]
            .map(
              ([c, t, on]) =>
                `<div style="display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:9px;font-size:10px;${on ? "background:#ffffff;box-shadow:0 2px 6px rgba(99,72,160,0.12);font-weight:600;" : ""}"><i style="width:10px;height:10px;border-radius:4px;background:${c};"></i>${t}</div>`,
            )
            .join("") +
          `</div>` +
          `<div style="flex:1;background:#ffffff;border-radius:12px;padding:16px;box-sizing:border-box;">` +
          `<div style="font-size:17px;font-weight:700;color:#2a2540;">灵感收集</div><div style="font-size:10px;color:#8d87a6;margin:3px 0 12px;">本周收藏 · 12 条</div>` +
          `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${["#ffe1e1", "#ece2ff", "#dcebff", "#fff3c9"].map((c) => `<div style="height:62px;border-radius:14px;background:${c};padding:9px;box-sizing:border-box;">${textLines([70, 46], "rgba(59,53,82,0.22)", 4, 5)}</div>`).join("")}</div>` +
          `</div>`,
      ),
    ),
    style: `【视觉主题】多彩、通透、灵动的新型浏览器界面：粉彩渐变做底，内容装在圆润的卡片里（参考 Arc 浏览器）
  【色彩系统】
   - 底色：低饱和粉彩的斜向渐变，淡粉 #ffd6d6 → 淡紫 #e4d4ff → 淡蓝 #cfe4ff；整份作品只用这一组渐变做最外层背景。
   - 表面：外层窗口为半透明白 rgba(255,255,255,0.45) 加 1px 白色描边；内容区纯白 #ffffff；卡片底色用更浅的粉彩 #ffe1e1 / #ece2ff / #dcebff / #fff3c9。
   - 文本：标题深紫灰 #2a2540，正文 #3b3552，说明 #8d87a6（保证对比度，不用浅灰字）。
   - 强调色：珊瑚粉 #ff8a8a 为主，淡紫 #a78bfa、天蓝 #60a5fa、暖黄 #fbbf24 用于图标小方块和分类标记。
  【字体与字号】
   - 圆润的无衬线体；界面文字偏小而精致，标题字重 700。
   - 字号阶梯：页面标题 32-40px，小节标题 20-24px，卡片标题 15-16px 字重 600，正文 14-15px 行高 1.6，侧栏与标签 12-13px。
  【间距与形状】
   - 圆角极大：外层窗口 18-24px，内容区 12-16px，卡片 14-20px，侧栏条目 9-10px，按钮与地址栏全圆角或 10px。
   - 阴影带一点紫色调且很柔：0 20px 40px rgba(99,72,160,0.18)；选中条目用白底加极浅阴影。
   - 窗口内边距 8px，侧栏与内容区之间留 8px 的“缝”，露出底色。
  【组件特征】
   - 窗口：左侧栏（窗口圆点、地址胶囊、一排彩色快捷方块、标签列表）+ 右侧白色内容区。
   - 标签条目：彩色小方块 + 名称，当前项白底浮起。
   - 内容卡片：粉彩底色的大圆角卡片，两列或三列拼接，卡内为标题和两行说明。
   - 半透明浮层（可用 backdrop-filter: blur(16px)）用于命令栏或提示，文字下必须有足够不透明的底。
  【页面结构】粉彩渐变背景上的大窗口 → 侧栏导航 + 内容区标题与说明 → 粉彩卡片网格 → 分节的特性介绍（每节一个小窗口示意）→ 行动号召。
  【禁忌】不用高饱和纯色和纯黑；不用直角；半透明层上不放小号浅色文字。
  【布局原则】卡片拼接排列，侧边与中央区块分明；颜色负责情绪，白色内容区负责可读性。`,
  },
  {
    id: "poster",
    name: "平面海报",
    category: "设计创意/平面海报",
    accent: "#ff3366",
    description: "硬核平面海报美学，Bento 网格布局，超大标题，视觉冲击力极强",
    previewHtml: portraitPages("#e7e5e4", [
      [
        `background:#ff3366;color:#111111;font-family:${SANS};`,
        abs(`left:10px;top:10px;font-size:7px;font-weight:800;letter-spacing:1.5px;`, "DESIGN WEEK") +
          abs(`left:7px;top:26px;font-size:54px;font-weight:900;letter-spacing:-3px;line-height:1;`, "声浪") +
          abs(`left:10px;bottom:30px;font-size:23px;font-weight:900;letter-spacing:-1px;line-height:0.95;`, "SOUND<br>WAVE") +
          abs(`left:10px;right:10px;bottom:9px;border-top:2px solid #111111;padding-top:4px;font-size:7px;font-weight:700;`, "10.18 — 10.24 · 上海"),
      ],
      [
        `background:#111111;color:#ffffff;font-family:${SANS};`,
        abs(`right:-26px;top:74px;width:96px;height:96px;border-radius:50%;background:#ff3366;`) +
          abs(`left:8px;top:8px;font-size:64px;font-weight:900;letter-spacing:-4px;line-height:1;`, "2026") +
          abs(`left:10px;top:88px;font-size:15px;font-weight:800;line-height:1.25;`, "新视觉<br>年度大展") +
          abs(
            `left:10px;right:10px;bottom:10px;height:50px;display:grid;grid-template-columns:1.3fr 1fr;gap:4px;`,
            `<div style="background:#ff3366;color:#111111;font-size:14px;font-weight:900;display:flex;align-items:center;justify-content:center;">海报展</div><div style="border:1.5px solid #ffffff;font-family:${MONO};font-size:9px;display:flex;align-items:center;justify-content:center;">03 / 12</div>`,
          ),
      ],
      [
        `background:#f4f1ea;color:#111111;font-family:${SANS};`,
        abs(`left:-4px;top:-34px;font-size:150px;font-weight:900;line-height:1;`, "A") +
          abs(`left:0;right:0;top:94px;height:14px;background:#ff3366;`) +
          abs(`left:10px;bottom:24px;font-size:16px;font-weight:900;line-height:1.15;`, "字体<br>实验室") +
          abs(`left:10px;bottom:9px;font-family:${MONO};font-size:7px;letter-spacing:1px;`, "TYPE LAB / NO.7"),
      ],
    ]),
    style: `【视觉主题】极具表现力、打破常规的网页海报：把屏幕当作一张实体画布，排版张力优先
  【色彩系统】
   - 整份作品限定三色：一个高对比底色、一个文字色、一个强调色。推荐组合：黑 #111111 + 白 #ffffff + 玫红 #ff3366；或纸白 #f4f1ea + 黑 #111111 + 玫红 #ff3366。
   - 不同页面可以在这三色之间轮换底色（如玫红底黑字、黑底白字、纸白底黑字），形成系列感。
   - 文字与背景必须是极端反差；不使用灰色文字和半透明文字。
  【字体与字号】
   - 主标题用极具个性的超粗展示字（字重 900），字距收紧到 -0.04em 以内，行高 0.9-1.0，可以大到贴住甚至溢出容器边缘（溢出部分由页面裁切，但不得裁掉关键信息）。
   - 正文与信息行用规整的小号无衬线体或等宽字体，与标题形成极端的字号对比（至少 6 倍）。
   - 字号阶梯：巨型标题为页面宽度的 30%-45%（用 vw 或 cqw 并配合 clamp），副标题 20-28px 字重 800，信息行 11-13px 字重 700、字距 0.1em。
  【间距与形状】
   - 全部直角，不用阴影、渐变和圆角卡片；唯一允许的曲线是整圆或半圆色块。
   - 用 2-3px 的纯色粗线（border）切割版面；页面内边距 5%-7%。
   - 版面用硬切分的网格（CSS Grid 的 template areas 或 Bento 拼格），也可以刻意非对称。
  【组件特征】
   ${PAGE_RULE}
   - 巨型字：一个词或一个数字占据半个版面。
   - 几何色块拼贴：整圆、通栏色带、填色格子，与文字相互压叠。
   - Bento 信息格：底部 2-3 个格子，分别放活动名、编号、日期地点，其中一格填强调色。
   - 信息行：顶部小标 + 底部“日期 — 日期 · 地点”，上方压一条粗线。
  【版式池】巨型字封面 / 数字页 / 整圆 + 标题 / 通栏色带分割 / Bento 信息页 / 引言页 / 落款页。
  【禁忌】不要常规网页的导航、卡片和按钮；不要超过三种颜色；不要居中排满小字。
  【布局原则】每一张都是独立成立的海报；先定一个视觉主角（一个字、一个数或一个形），其余信息围绕它排布。`,
  },
  {
    id: "swiss-grid",
    name: "瑞士网格",
    category: "设计创意/网格排版",
    accent: "#e11d48",
    description: "瑞士国际主义平面设计，非对称网格、强字号对比、红黑白秩序感",
    previewHtml: portraitPages("#d9d9d6", [
      [
        `background:#ffffff;color:#111111;font-family:Helvetica, Arial, ${SANS};`,
        abs(`right:0;top:0;width:58px;height:58px;background:#e11d48;`) +
          abs(`left:10px;top:10px;font-size:6px;font-weight:700;letter-spacing:1px;`, "TYPOGRAPHIE") +
          abs(`left:6px;top:52px;font-size:80px;font-weight:700;letter-spacing:-5px;line-height:1;`, "Aa") +
          abs(`left:10px;right:10px;top:138px;height:1px;background:#111111;`) +
          abs(`left:10px;top:146px;width:50px;`, textLines([100, 80, 60], "#111111", 2, 4)) +
          abs(`right:10px;top:146px;width:50px;`, textLines([100, 70], "#999999", 2, 4)),
      ],
      [
        `background:#e11d48;color:#ffffff;font-family:Helvetica, Arial, ${SANS};background-image:linear-gradient(90deg,rgba(255,255,255,0.16) 1px,transparent 1px);background-size:25% 100%;`,
        abs(`left:10px;top:10px;font-size:7px;font-weight:700;letter-spacing:1.5px;`, "DIE NEUE GRAFIK") +
          abs(`left:9px;top:54px;font-size:46px;font-weight:700;letter-spacing:-2px;line-height:1.02;`, "网格<br>系统") +
          abs(`left:10px;right:10px;bottom:46px;height:1px;background:#ffffff;`) +
          abs(`left:10px;bottom:12px;font-size:7px;font-weight:700;letter-spacing:1px;line-height:1.5;`, "栏<br>COLUMNS") +
          abs(`right:10px;bottom:6px;font-size:34px;font-weight:300;letter-spacing:-1px;line-height:1;`, "12"),
      ],
      [
        `background:#ffffff;color:#111111;font-family:Helvetica, Arial, ${SANS};background-image:linear-gradient(90deg,rgba(17,17,17,0.08) 1px,transparent 1px);background-size:25% 100%;`,
        abs(`left:6px;top:0;font-size:98px;font-weight:200;letter-spacing:-5px;line-height:1.05;`, "12") +
          abs(`left:10px;right:10px;top:106px;height:3px;background:#111111;`) +
          abs(`left:10px;top:118px;width:52px;`, textLines([100, 84, 92, 50], "#111111", 2, 4)) +
          abs(`left:10px;bottom:10px;width:40%;height:9px;background:#e11d48;`),
      ],
    ]),
    style: `【视觉主题】瑞士国际主义平面设计：冷静、秩序、强网格，像一张印出来的展览海报
  【色彩系统】
   - 底色：纯白 #ffffff 或极浅灰 #f5f5f5；系列中允许个别页面整页铺瑞士红。
   - 文本：近黑 #111111，辅助文字 #666666。
   - 强调色：瑞士红 #e11d48，节制使用：一个色块、一条色带或一整页底色，同一页面上只出现一处。
   - 只有红、黑、白三色，不引入第四种颜色。
  【字体与字号】
   - Helvetica / Inter 风格的无衬线体，中文用黑体；不使用衬线体和手写体。
   - 标题可以极大（占页面宽度的 40%-60%），字重 700 或极细的 200-300，二者形成对比；字距收紧到 -0.04em。
   - 字号阶梯：巨型标题用 vw 或 cqw 配合 clamp，栏目标签 10-12px 字重 700、全大写、字距 0.12em，正文 13-15px 行高 1.5。
  【间距与形状】
   - 严格使用 12 栏或 6 栏网格（卡片内可简化为 4 栏），允许非对称布局，但所有元素的边界必须落在栏线上；可以把栏线画成 8% 透明度的细线作为版面肌理。
   - 全部直角；分隔用 1px 发丝线与 3px 粗线的对比；页面内边距 6%-8%。
   - 禁止柔和阴影、渐变、圆角和卡通插画。
  【组件特征】
   ${PAGE_RULE}
   - 栏目标签：页面左上角的全大写小字（如栏目名、期号）。
   - 巨型字或巨型数字：贴左对齐，与小字说明形成强对比。
   - 色块：正方形或通栏矩形，与网格对齐，常放在页面一角。
   - 编号、坐标、页码等小标注；图片必须矩形裁切并与栏线对齐。
  【版式池】巨型字封面 / 整页红底标题页 / 巨型数字 + 说明 / 左窄右宽的非对称图文 / 四栏文字页 / 时间表或目录页 / 落款页。
  【禁忌】不要居中对称的常规排版；不要装饰性图标；不要让任何元素游离在网格之外。
  【布局原则】适合海报、展览介绍、品牌规范、课程封面；信息按网格落位，靠字号对比和留白制造张力。`,
  },
  {
    id: "bauhaus-composition",
    name: "包豪斯构成",
    category: "设计创意/几何构成",
    accent: "#facc15",
    description: "包豪斯几何构成，红黄蓝黑基础形，适合创意海报和展览页",
    previewHtml: portraitPages("#d6d0c2", [
      [
        `background:#f5f1e8;color:#111111;font-family:${SANS};`,
        abs(`left:-16px;top:18px;width:86px;height:86px;border-radius:50%;background:#2563eb;`) +
          abs(`right:0;top:0;width:66px;height:66px;background:#e11d48;border-radius:0 0 0 66px;`) +
          abs(`left:56px;top:82px;width:44px;height:44px;background:#facc15;`) +
          abs(`left:12px;right:12px;top:138px;height:6px;background:#111111;`) +
          abs(`left:12px;bottom:10px;font-size:13px;font-weight:900;letter-spacing:3px;`, "BAUHAUS"),
      ],
      [
        `background:#111111;color:#ffffff;font-family:${SANS};`,
        abs(`left:28px;top:24px;width:100px;height:50px;background:#facc15;border-radius:100px 100px 0 0;`) +
          abs(`left:28px;top:80px;width:100px;height:14px;background:#e11d48;`) +
          abs(`right:14px;top:104px;width:38px;height:38px;border-radius:50%;background:#2563eb;`) +
          abs(`left:14px;bottom:26px;font-size:22px;font-weight:900;line-height:1.15;`, "形式<br>追随功能") +
          abs(`left:14px;bottom:10px;font-size:6px;font-weight:700;letter-spacing:1px;`, "FORM FOLLOWS FUNCTION"),
      ],
      [
        `background:#f5f1e8;color:#111111;font-family:${SANS};`,
        abs(
          `left:10px;right:10px;top:10px;height:110px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:4px;`,
          [
            "background:#e11d48;",
            "background:linear-gradient(#facc15 50%,#111111 50%);",
            "background:#2563eb;border-radius:0 100% 0 0;",
            "background:#111111;border-radius:50%;",
            "border:4px solid #111111;box-sizing:border-box;",
            "background:#e11d48;border-radius:100% 0 0 0;",
          ]
            .map((c) => `<div style="${c}"></div>`)
            .join(""),
        ) +
          abs(`left:10px;bottom:22px;font-size:15px;font-weight:900;line-height:1.15;`, "几何<br>构成课") +
          abs(`right:10px;bottom:10px;font-family:${MONO};font-size:7px;letter-spacing:1px;`, "KURS 04"),
      ],
    ]),
    style: `【视觉主题】包豪斯平面构成：几何、理性、色块鲜明，用最基础的形和最基础的色说话
  【色彩系统】
   - 底色：米白 #f5f1e8 或纯白；系列中可以有整页黑底 #111111 的页面。
   - 三原色加黑：红 #e11d48、黄 #facc15、蓝 #2563eb、黑 #111111，全部用实色平涂。
   - 一页最多使用三种颜色（黑白不计入），避免彩虹化；同一种形状在同一页只用一种颜色。
   - 文本：米白底上用黑 #111111，黑底上用白 #ffffff；不用灰色文字。
  【字体与字号】
   - 几何无衬线体，中文用黑体；标题字重 900，可横排也可竖排（writing-mode: vertical-rl）。
   - 字号阶梯：主标题用 vw 或 cqw 配合 clamp（约为页面宽度的 14%-20%），副标题 16-20px 字重 800，小标与编号 10-12px、全大写、字距 0.15em-0.3em，正文 13-15px 行高 1.6。
  【间距与形状】
   - 基础形只有四种：整圆、半圆或四分之一圆、正方形或矩形、粗线条；用 border-radius 和纯色块绘制，不用图片。
   - 所有形状都对齐到网格并承担布局职责（分区、指向、压住标题），不能随机漂浮。
   - 全部实色，无渐变、无阴影、无描边发光；页面内边距 6%-8%。
  【组件特征】
   ${PAGE_RULE}
   - 构成封面：2-3 个大几何形相互咬合 + 一条粗黑线 + 一行宽字距标题。
   - 形状拼格：2×3 或 3×3 的等大方格，每格放一个基础形，像一张图形字母表。
   - 标题块：超粗标题 + 一行宽字距的外文小标。
   - 数字与短词：用作阅读路径的节点（如 01、02、课程编号）。
  【版式池】构成封面 / 黑底宣言页 / 形状拼格 + 标题 / 左形右文 / 竖排标题页 / 课程或展览信息页 / 落款页。
  【禁忌】不要把形状做成装饰性的随机散点；不要写实插画和照片滤镜；不要超过三种彩色同屏。
  【布局原则】适合艺术展、设计课程、品牌海报；视觉张力优先，但正文仍要可读。`,
  },
];
