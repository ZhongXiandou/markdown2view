import type { RawDesignStyle } from "../types";
import { MONO, SANS, SERIF, abs, canvas, portraitPages, textLines } from "../previewKit";

const PAGE_RULE = '- **强制分页容器**：每一张图必须使用 `<section class="page">` 包裹，固定 3:4 比例（`.page{width:min(100vw,720px);aspect-ratio:3/4;overflow:hidden;margin:0 auto 24px;}`）。';

export const mediaStyles: RawDesignStyle[] = [
  {
    id: "spotify",
    name: "暗色霓虹 · Spotify",
    category: "媒体内容/音乐娱乐",
    accent: "#1db954",
    description: "深黑底霓虹绿，超粗大标题，专辑封面式视觉，沉浸暗色",
    previewHtml: canvas(
      `background:linear-gradient(180deg,#24553f 0%,#121212 58%);font-family:${SANS};color:#ffffff;`,
      abs(`left:24px;top:22px;width:100px;height:100px;border-radius:4px;background:linear-gradient(135deg,#f59e0b,#ec4899 55%,#7c3aed);box-shadow:0 10px 30px rgba(0,0,0,0.5);`) +
        abs(`left:142px;top:24px;font-size:9px;font-weight:700;`, "歌单") +
        abs(`left:139px;top:36px;font-size:46px;font-weight:900;letter-spacing:-2px;line-height:1.1;`, "深夜通勤") +
        abs(`left:142px;top:98px;font-size:10px;color:#b3b3b3;`, "为你推荐 · 48 首 · 2 小时 51 分") +
        abs(
          `left:24px;top:138px;display:flex;align-items:center;gap:16px;`,
          `<div style="width:40px;height:40px;border-radius:50%;background:#1ed760;display:flex;align-items:center;justify-content:center;"><div style="width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-left:13px solid #000000;margin-left:3px;"></div></div>` +
            `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" stroke-width="2"><path d="M12 21s-7-4.6-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 12C19 16.4 12 21 12 21z"/></svg>` +
            `<div style="display:flex;gap:3px;">${[0, 1, 2].map(() => `<i style="width:4px;height:4px;border-radius:50%;background:#b3b3b3;"></i>`).join("")}</div>`,
        ) +
        abs(
          `left:24px;right:24px;top:192px;`,
          [
            ["1", "#1ed760", "linear-gradient(135deg,#f59e0b,#ef4444)", 46, "3:42"],
            ["2", "#ffffff", "linear-gradient(135deg,#38bdf8,#6366f1)", 58, "4:05"],
            ["3", "#ffffff", "linear-gradient(135deg,#34d399,#0ea5e9)", 38, "2:58"],
          ]
            .map(
              ([n, c, bg, w, d]) =>
                `<div style="display:flex;align-items:center;gap:12px;height:36px;"><span style="width:10px;font-size:11px;color:${c === "#1ed760" ? c : "#b3b3b3"};">${n}</span><div style="width:26px;height:26px;border-radius:3px;background:${bg};"></div><div style="flex:1;"><div style="width:${w}%;height:5px;border-radius:3px;background:${c};"></div><div style="width:24%;height:4px;border-radius:2px;background:#535353;margin-top:6px;"></div></div><span style="font-size:10px;color:#b3b3b3;">${d}</span></div>`,
            )
            .join(""),
        ),
    ),
    style: `【视觉主题】沉浸的暗色音乐界面：近黑背景托起彩色封面，标题粗到有重量（参考 Spotify）
  【色彩系统】
   - 底色：近黑 #121212；卡片与面板 #181818，悬停或高亮 #282828；页面顶部可有一段从封面主色过渡到 #121212 的纵向渐变。
   - 文本：纯白 #ffffff，次要亮灰 #b3b3b3，弱标注 #535353。
   - 强调色：亮绿 #1ed760（品牌绿 #1db954），只用于播放按钮、正在播放的条目和关键开关；绿色按钮上的图标与文字用黑色。
   - 其它色彩全部来自封面图本身，界面不再添加装饰色。
  【字体与字号】
   - 粗壮的无衬线体，标题字重 800-900、字距 -0.04em；正文与列表字重 400-700。
   - 字号阶梯：页面主标题 48-96px（随标题长度缩小，用 clamp），分区标题 24px 字重 700，卡片标题 16px 字重 700，正文与列表 14px，说明 12-13px，类型小标 12px 字重 700。
  【间距与形状】
   - 圆角：封面 4px，卡片 8px，按钮与标签全圆角胶囊，播放按钮为正圆。
   - 封面使用深色大投影（0 10px 30px rgba(0,0,0,0.5)）；卡片不描边。
   - 卡片网格间距 16-24px，列表行高 56px，内容区左右留 24-32px。
  【组件特征】
   - 页头：左侧方形封面 + 右侧“类型小标 → 超粗标题 → 一行元信息（作者 · 数量 · 时长）”。
   - 操作行：绿色圆形播放按钮 + 收藏、更多等线性图标。
   - 曲目列表：序号 + 小封面 + 标题与作者 + 右对齐时长；当前播放行的序号和标题变绿。
   - 封面卡网格：方形封面 + 标题 + 一行说明，悬停时卡片底色变亮并浮出播放按钮（静态下内容完整可读）。
   - 筛选胶囊：深灰底胶囊，选中项为白底黑字。
  【页面结构】渐变页头（封面 + 标题）→ 操作行 → 曲目或内容列表 → “为你推荐”封面卡网格 → 相关歌单横向卡片行。
  【禁忌】不用浅色背景和细体标题；绿色不做大面积背景；不添加与封面无关的彩色装饰。
  【布局原则】卡片与图库排布紧凑，大面积暗色映衬彩色封面图，强调沉浸感。`,
  },
  {
    id: "editorial",
    name: "杂志编辑 · WIRED",
    category: "媒体内容/杂志编辑",
    accent: "#1a1aff",
    description: "报刊高密度排版，粗衬线大标题，墨蓝强调色，印刷质感",
    previewHtml: canvas(
      `background:#fafafa;font-family:${SERIF};color:#111111;padding:0 26px;`,
      `<div style="height:6px;background:#111111;margin:0 -26px;"></div>` +
        `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:9px 0 8px;border-bottom:1px solid #111111;"><span style="font-size:15px;font-weight:900;letter-spacing:2px;">THE EDITORIAL</span><span style="font-family:${SANS};font-size:9px;color:#757575;">第 128 期 · 2026.09</span></div>` +
        `<div style="display:flex;gap:20px;margin-top:14px;">` +
        `<div style="flex:1.45;">` +
        `<div style="font-family:${SANS};font-size:9px;font-weight:800;letter-spacing:1.5px;color:#1a1aff;">深度 / TECHNOLOGY</div>` +
        `<div style="font-size:31px;font-weight:900;line-height:1.14;letter-spacing:-1px;margin-top:7px;">当算法开始<br>为我们做选择</div>` +
        `<div style="font-size:10px;font-style:italic;color:#757575;margin:9px 0 10px;">撰文 林澈　摄影 周宁</div>` +
        `<div style="display:flex;gap:9px;"><span style="font-size:44px;font-weight:900;line-height:0.86;">在</span><div style="flex:1;padding-top:3px;">${textLines([100, 96, 100, 70], "#c4c4c4", 4, 6)}</div></div>` +
        `</div>` +
        `<div style="flex:1;">` +
        `<div style="height:104px;background:#1a1aff;background-image:radial-gradient(rgba(255,255,255,0.5) 1.5px,transparent 1.6px);background-size:9px 9px;"></div>` +
        `<div style="font-family:${SANS};font-size:8px;color:#757575;margin-top:5px;">图 / 推荐系统的隐形之手</div>` +
        `<div style="border-top:3px solid #111111;border-bottom:1px solid #111111;margin-top:11px;padding:8px 0;font-size:13px;font-weight:700;line-height:1.4;">“选择权正在悄悄转移。”</div>` +
        `</div>` +
        `</div>` +
        `<div style="display:flex;gap:20px;margin-top:16px;padding-top:10px;border-top:1px solid #111111;">` +
        ["01", "02", "03"].map((n) => `<div style="flex:1;"><div style="font-family:${SANS};font-size:9px;font-weight:800;color:#1a1aff;margin-bottom:6px;">${n}</div>${textLines([100, 64], "#c4c4c4", 4, 5)}</div>`).join("") +
        `</div>`,
    ),
    style: `【视觉主题】报刊杂志的编辑排版：高密度、强标题、带印刷质感的权威感（参考 WIRED）
  【色彩系统】
   - 底色：纸白 #fafafa 或纯白 #ffffff。
   - 文本：正文近黑 #111111，署名、图注与栏目信息 #757575，分隔线 #111111（强）与 #e0e0e0（弱）。
   - 强调色：墨蓝 #1a1aff，只用于栏目标签、链接和一块纯色图版；不使用其它彩色。
  【字体与字号】
   - 大标题必须用极粗的现代衬线体（Georgia / Times 风格，中文用宋体加粗），行距压紧到 1.1-1.15、字距 -0.02em；正文用衬线体或清晰的无衬线体；栏目标签、图注和署名用无衬线体。
   - 字号阶梯：头条标题 48-64px 字重 900，次级标题 26-32px，小标题 20px 字重 700，导语 19px，正文 16-17px 行高 1.7，图注与署名 12-13px，栏目标签 11-12px 字重 800、全大写、字距 0.12em。
  【间距与形状】
   - 全部直角，没有圆角、阴影和卡片；所有分组都靠横线完成。
   - 线的粗细对比是主要装饰：页面顶部 6px 黑色粗线，刊头下 1px 细线，引文上方 3px、下方 1px。
   - 多栏排版：头条区为“主栏 : 侧栏 ≈ 3 : 2”，正文区两到三栏（栏间距 20-28px）；信息密度高但行距充足。
  【组件特征】
   - 刊头：全大写的粗衬线刊名（字距 0.15em）+ 右侧期号与日期，上下由粗细线夹住。
   - 头条：栏目标签（蓝）→ 粗衬线大标题 → 斜体署名 → 首字下沉的正文（首字占三行高）。
   - 图版：纯色或网点肌理的矩形图片，下方跟一行小号图注（“图 / 说明”）。
   - 引文：上下双线夹住的加粗衬线短句，用直角引号。
   - 侧栏：编号列表式的“本期目录”或相关阅读，条目之间用细线分隔。
  【页面结构】顶部粗线与刊头 → 头条（主栏文字 + 侧栏图版与引文）→ 通栏细线 → 三栏次要文章 → 整幅图片故事 → 长文正文（单栏或双栏，穿插引文与图版）→ 页脚版权信息。
  【禁忌】不用圆角卡片、渐变、图标和彩色标签堆；标题不用细体无衬线；一屏之内不要没有横线。
  【布局原则】多栏排版，信息密度高，具备传统报刊的权威感；先用标题和线条搭好骨架，再填入正文。`,
  },
  {
    id: "xiaohongshu",
    name: "社媒卡片 · 小红书",
    category: "媒体内容/社交卡片",
    accent: "#ff2e4d",
    description: "竖屏卡片，柔和渐变，大圆角，亲切手账感",
    previewHtml: portraitPages("#fbe9e7", [
      [
        `background:linear-gradient(160deg,#fff6d6,#ffd9e1);color:#333333;font-family:${SANS};border-radius:14px;`,
        abs(`right:-18px;bottom:-18px;width:72px;height:72px;border-radius:50%;background:rgba(255,46,77,0.14);`) +
          abs(`left:10px;top:10px;background:#ff2e4d;color:#ffffff;font-size:7px;font-weight:700;padding:2px 7px;border-radius:999px;`, "干货预警") +
          abs(`left:10px;top:34px;font-size:21px;font-weight:800;line-height:1.32;`, `新手也能<br><span style="background:linear-gradient(transparent 58%,#ffe066 58%);">3 步学会</span><br>手冲咖啡`) +
          abs(`left:10px;top:126px;width:78px;`, textLines([100, 70], "rgba(51,51,51,0.28)", 3, 5)) +
          abs(`left:10px;bottom:10px;display:flex;align-items:center;gap:5px;font-size:7px;color:#666666;`, `<i style="width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#ff8fa3,#ffb347);"></i>@小林的日常`),
      ],
      [
        `background:#ffffff;color:#333333;font-family:${SANS};border-radius:14px;`,
        abs(`left:12px;top:12px;font-size:30px;font-weight:900;line-height:1;color:#ff2e4d;`, "01") +
          abs(`left:12px;top:46px;font-size:16px;font-weight:800;`, "选对豆子") +
          abs(
            `left:12px;right:12px;top:78px;`,
            [[100, 62], [92, 50], [84]].map((w) => `<div style="display:flex;gap:7px;margin-bottom:10px;"><i style="width:6px;height:6px;border-radius:50%;background:#ff2e4d;flex:none;margin-top:1px;"></i><div style="flex:1;">${textLines(w, "#d9d9d9", 4, 5)}</div></div>`).join(""),
          ) +
          abs(
            `left:12px;top:160px;display:flex;gap:5px;font-size:7px;font-weight:600;color:#ff2e4d;`,
            `<span style="background:#ffe4e9;border-radius:999px;padding:2px 7px;">#咖啡入门</span><span style="background:#ffe4e9;border-radius:999px;padding:2px 7px;">#手冲</span>`,
          ) +
          abs(`right:12px;bottom:10px;font-size:7px;color:#999999;`, "2 / 6"),
      ],
      [
        `background:#fff1f3;color:#333333;font-family:${SANS};border-radius:14px;`,
        abs(`left:10px;top:11px;font-size:9px;font-weight:800;`, `<span style="color:#ff2e4d;">02</span> 水温与比例`) +
          abs(
            `left:10px;right:10px;top:34px;height:84px;background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(255,46,77,0.12);text-align:center;`,
            `<div style="font-size:34px;font-weight:900;color:#ff2e4d;line-height:1;margin-top:17px;">1:15</div><div style="font-size:8px;color:#999999;margin-top:6px;">粉水比</div>`,
          ) +
          abs(`left:10px;right:10px;top:132px;`, textLines([100, 86, 60], "rgba(51,51,51,0.22)", 3, 6)),
      ],
    ]),
    style: `【视觉主题】小红书风格的竖版分享卡片：柔和、亲切、像一页精心排过的手账
  【色彩系统】
   - 底色：柔和的粉彩或奶油渐变（如奶黄 #fff6d6 → 浅粉 #ffd9e1），内容页可用纯白 #ffffff 或极浅粉 #fff1f3；整组卡片保持同一组底色。
   - 文本：深灰近黑 #333333，说明 #666666，页码与来源 #999999。
   - 强调色：明快红粉 #ff2e4d（浅底 #ffe4e9），用于序号、标签、关键数字；重点词用黄色荧光笔效果（下半部 #ffe066 的渐变底）。
  【字体与字号】（按 720px 宽的卡片）
   - 圆润活泼的无衬线体，标题字重 800-900；手机上看，小字必须够大。
   - 字号阶梯：封面标题 64-84px 行高 1.3（每行不超过 6 个字），内容页标题 44-52px，序号 80-96px 字重 900，正文 28-32px 行高 1.7，标签 22-24px，页码与署名 20px。
  【间距与形状】
   - 圆角：卡片内的面板 20-24px，标签全圆角；面板带柔和宽泛的同色系投影（0 8px 24px rgba(255,46,77,0.12)）。
   - 页面内边距 48-56px；一页只放一个重点，留白不少于三分之一。
   - 装饰只用圆形色块、荧光笔下划线和小圆点，放在角落且不压文字。
  【组件特征】
   ${PAGE_RULE}
   - 封面：角标胶囊（如“干货预警”“建议收藏”）→ 三行以内的大标题（一个词加荧光笔）→ 一行副标题 → 左下角头像与账号名。
   - 内容页：大号红色序号 + 小标题 → 3 条以内的要点（红色圆点 + 短句）→ 底部话题标签 → 右下角页码“2 / 6”。
   - 数字页：白色大圆角面板里一个巨大的数字或比例 + 一行解释。
   - 对比页（左右或上下两栏）、清单页（可勾选样式）、结尾页（总结 + 关注与收藏引导）。
  【版式池】封面 / 序号要点页 / 数字页 / 对比页 / 步骤页 / 清单页 / 总结页。
  【禁忌】不用深色背景和冷色调；一页不超过 60 个字；不用细小的正文字号；不用表情符号堆砌标题。
  【布局原则】为竖向翻页浏览设计，分点排版，重点极其突出；每一页单独截图也能看懂。`,
  },
  {
    id: "xhs-multipage",
    name: "小红书多页图文",
    category: "媒体内容/多页图文",
    accent: "#ff2e4d",
    description: "3:4 多页卡片：封面页 + N 张内容页",
    previewHtml: (() => {
      const dots = (active: number) =>
        abs(
          `left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:3px;`,
          [0, 1, 2, 3, 4, 5, 6].map((i) => `<i style="width:${i === active ? 10 : 4}px;height:4px;border-radius:2px;background:${i === active ? "#ff2e4d" : "#e0e0e0"};"></i>`).join(""),
        );
      const pill = (t: string) => abs(`left:12px;top:12px;background:#ff2e4d;color:#ffffff;font-size:8px;font-weight:700;padding:2px 8px;border-radius:999px;`, t);
      return portraitPages("#f1f1f1", [
        [
          `background:linear-gradient(150deg,#ff2e4d,#ff7a59);color:#ffffff;font-family:${SANS};border-radius:6px;`,
          abs(`right:10px;top:10px;background:rgba(0,0,0,0.25);font-size:7px;padding:1px 6px;border-radius:999px;`, "1/7") +
            abs(`left:10px;top:36px;font-size:21px;font-weight:900;line-height:1.3;`, "5 个习惯<br>让你告别<br>无效加班") +
            abs(`left:10px;top:128px;font-size:8px;opacity:0.9;`, "亲测有效 · 建议收藏") +
            abs(
              `left:10px;bottom:10px;display:flex;gap:4px;font-size:7px;font-weight:700;color:#ff2e4d;`,
              `<span style="background:#ffffff;border-radius:999px;padding:2px 7px;">职场</span><span style="background:#ffffff;border-radius:999px;padding:2px 7px;">效率</span>`,
            ),
        ],
        [
          `background:#ffffff;color:#222222;font-family:${SANS};border-radius:6px;`,
          pill("习惯 01") +
            abs(`left:12px;top:36px;font-size:16px;font-weight:800;`, "先做最难的事") +
            abs(`left:12px;right:12px;top:66px;box-sizing:border-box;background:#f7f7f7;border-left:3px solid #ff2e4d;border-radius:0 8px 8px 0;padding:9px 10px;`, textLines([100, 72], "#cfcfcf", 4, 5)) +
            abs(
              `left:12px;right:12px;top:116px;`,
              [1, 2, 3]
                .map(
                  (n) =>
                    `<div style="display:flex;align-items:center;gap:7px;margin-bottom:8px;"><i style="width:13px;height:13px;box-sizing:border-box;border-radius:50%;border:1.5px solid #ff2e4d;color:#ff2e4d;font-size:7px;font-weight:700;font-style:normal;display:flex;align-items:center;justify-content:center;flex:none;">${n}</i><div style="width:${[78, 62, 70][n - 1]}%;height:4px;border-radius:2px;background:#d9d9d9;"></div></div>`,
                )
                .join(""),
            ) +
            dots(1),
        ],
        [
          `background:#ffffff;color:#222222;font-family:${SANS};border-radius:6px;`,
          pill("习惯 02") +
            abs(`left:12px;top:36px;font-size:13px;font-weight:800;`, "给任务设截止时间") +
            abs(`left:12px;top:64px;font-size:26px;font-weight:900;color:#ff2e4d;line-height:1.1;`, "25 分钟") +
            abs(`left:12px;top:98px;font-size:8px;color:#999999;`, "一个番茄钟") +
            abs(`left:12px;right:12px;top:120px;`, textLines([100, 84, 56], "#d9d9d9", 3, 6)) +
            dots(2),
        ],
      ]);
    })(),
    style: `【视觉主题】小红书多页图文：一张强视觉封面带出 N 张结构一致的内容页，适合系列化的干货分享
  【色彩系统】
   - 封面：强视觉的品牌色渐变（如 #ff2e4d → #ff7a59）或大图叠加暗角，文字反白。
   - 内容页：干净白底 #ffffff，辅助底 #f7f7f7，文字 #222222，说明 #999999。
   - 强调色：主红 #ff2e4d，用于章节胶囊、序号、关键数字和页码指示；整组只用这一种强调色。
  【字体与字号】（按 720px 宽的页面）
   - 大字号无衬线加粗，传递明确的情绪；内容页保持统一的字号体系。
   - 字号阶梯：封面标题 68-88px 字重 900、行高 1.3，内容页标题 44-52px 字重 800，关键数字 80-96px 字重 900，正文 28-32px 行高 1.7，章节胶囊与页码 22-24px。
  【间距与形状】
   - 页面内边距 48-56px；每页的标题位置、正文起始位置和页码位置完全一致，翻页时不跳动。
   - 圆角：引用块与面板 16-20px，胶囊与标签全圆角；不用阴影堆叠。
  【组件特征】
   ${PAGE_RULE}
   - 页面固定 3:4 竖版，每页内容必须在一屏内放完，不出现滚动；内容多就拆页。
   - 封面页：右上角页码“1/7” → 三行以内的大标题 → 一行副标题（如“亲测有效 · 建议收藏”）→ 底部白色话题胶囊。
   - 内容页：左上角章节胶囊（如“习惯 01”）→ 小标题 → 引用块（灰底 + 红色左边线，放一句核心观点）→ 编号要点（红色圆圈数字 + 短句，不超过 3 条）→ 底部居中的页码指示条（当前页加长并变红）。
   - 数字页：章节胶囊 + 小标题 + 一个巨大的红色数字 + 一行解释。
   - 结尾页：三条总结 + 互动引导（关注、收藏、评论提问）。
  【版式池】封面 / 观点 + 要点页 / 数字页 / 对比页 / 步骤页 / 清单页 / 结尾页；内容页版式不超过三种，交替使用。
  【禁忌】不要每页换一套配色或字号；不要把长段落直接贴进页面；不要让文字贴边或被页码压住。
  【布局原则】封面负责吸引点击，内容页负责逐条交付；整组卡片从左滑到右，结构一眼可预期。`,
  },
  {
    id: "discord",
    name: "游戏连麦 · Discord",
    category: "媒体内容/社区聊天",
    accent: "#5865F2",
    description: "深灰偏紫底色，标志性蓝紫 Blurple，对话流排版，年轻社群感",
    previewHtml: (() => {
      const msg = (c: string, name: string, nc: string, time: string, w: number[], extra = "") =>
        `<div style="display:flex;gap:9px;margin-bottom:11px;"><div style="width:26px;height:26px;border-radius:50%;background:${c};flex:none;"></div><div style="flex:1;min-width:0;"><div style="font-size:10px;"><b style="color:${nc};">${name}</b><span style="font-size:8px;color:#949ba4;margin-left:6px;">${time}</span></div><div style="margin-top:5px;">${textLines(w, "#6d6f78", 4, 5)}</div>${extra}</div></div>`;
      const channel = (t: string, on = false) =>
        `<div style="display:flex;align-items:center;gap:5px;padding:5px 6px;border-radius:4px;font-size:10px;color:${on ? "#f2f3f5" : "#949ba4"};${on ? "background:#404249;" : ""}"><span style="font-size:12px;color:#80848e;">#</span>${t}</div>`;
      return canvas(
        `background:#313338;font-family:${SANS};color:#dbdee1;display:flex;`,
        `<div style="width:46px;flex:none;background:#1e1f22;display:flex;flex-direction:column;align-items:center;gap:8px;padding-top:12px;">` +
          [
            ["#5865f2", "10px", true],
            ["#3ba55c", "50%", false],
            ["#f0b232", "50%", false],
            ["#eb459e", "50%", false],
          ]
            .map(([c, r, on]) => `<div style="position:relative;width:30px;height:30px;border-radius:${r};background:${c};">${on ? `<i style="position:absolute;left:-8px;top:7px;width:4px;height:16px;border-radius:0 2px 2px 0;background:#ffffff;"></i>` : ""}</div>`)
            .join("") +
          `</div>` +
          `<div style="width:112px;flex:none;box-sizing:border-box;background:#2b2d31;padding:12px 8px;">` +
          `<div style="font-size:11px;font-weight:700;color:#f2f3f5;padding:0 6px 10px;border-bottom:1px solid #1f2023;margin-bottom:10px;">设计同好会</div>` +
          `<div style="font-size:8px;font-weight:700;color:#949ba4;padding:0 6px 5px;">文字频道</div>` +
          channel("公告") +
          channel("闲聊", true) +
          channel("作品分享") +
          `<div style="font-size:8px;font-weight:700;color:#949ba4;padding:10px 6px 5px;">语音频道</div>` +
          `<div style="padding:5px 6px;font-size:10px;color:#949ba4;">连麦画图</div>` +
          `<div style="display:flex;gap:4px;padding-left:16px;">${["#5865f2", "#3ba55c", "#eb459e"].map((c) => `<i style="width:14px;height:14px;box-sizing:border-box;border-radius:50%;background:${c};border:2px solid #3ba55c;"></i>`).join("")}</div>` +
          `</div>` +
          `<div style="flex:1;min-width:0;display:flex;flex-direction:column;">` +
          `<div style="padding:10px 14px;border-bottom:1px solid #26282c;font-size:11px;font-weight:700;color:#f2f3f5;"><span style="color:#80848e;margin-right:4px;">#</span>闲聊</div>` +
          `<div style="flex:1;padding:11px 14px 0;">` +
          msg("#5865f2", "林澈", "#f0b232", "今天 20:14", [78]) +
          msg(
            "#3ba55c",
            "周宁",
            "#3ba55c",
            "今天 20:16",
            [92, 54],
            `<div style="margin-top:7px;background:#2b2d31;border-left:3px solid #5865f2;border-radius:4px;padding:8px 10px;"><div style="font-size:9px;font-weight:700;color:#00a8fc;margin-bottom:6px;">周末线上速写活动</div>${textLines([86, 60], "#5c5e66", 3, 5)}</div>`,
          ) +
          msg("#eb459e", "阿树", "#eb459e", "今天 20:17", [56]) +
          `</div>` +
          `<div style="margin:0 14px 12px;background:#383a40;border-radius:8px;padding:8px 12px;font-size:10px;color:#6d6f78;">发消息到 #闲聊</div>` +
          `</div>`,
      );
    })(),
    style: `【视觉主题】年轻社群的聊天界面：深灰偏紫的夜间色调，信息密集却有条理，带一点游戏感（参考 Discord）
  【色彩系统】
   - 底色分三层：服务器栏最深 #1e1f22，频道栏 #2b2d31，聊天区 #313338；输入框 #383a40，选中或悬停 #404249。
   - 文本：标题与用户名高亮 #f2f3f5，正文 #dbdee1，说明与时间 #949ba4，占位 #6d6f78。
   - 强调色：蓝紫 Blurple #5865f2，用于主按钮、提及高亮、嵌入卡左边线和当前服务器；链接蓝 #00a8fc。
   - 状态与身份色：在线绿 #3ba55c，闲置黄 #f0b232，勿扰红 #ed4245，粉 #eb459e；用户名可按身份组着色。
  【字体与字号】
   - 圆润的无衬线体（gg sans / Noto Sans SC 风格）；标题字重 700-800，可用全大写的小标题。
   - 字号阶梯：落地页大标题 44-56px 字重 800，分区标题 20-24px，用户名 15-16px 字重 600，消息正文 15-16px 行高 1.4，频道名 15px，时间与分组小标 12px。
  【间距与形状】
   - 圆角：面板与嵌入卡 4-8px，输入框 8px，按钮 4px 或全圆角，头像与服务器图标为正圆（当前服务器变为 30% 圆角的方形）。
   - 不用阴影和描边卡片，层级完全靠三档底色区分；分隔线比底色略深（#26282c）。
   - 消息之间 12-16px，同一人连续发言合并头像；频道条目高 32px。
  【组件特征】
   - 三栏结构：窄的服务器图标栏（当前项左侧有白色指示条）/ 频道栏（服务器名、分组小标、“# 频道名”列表、语音频道及其在线头像）/ 聊天区。
   - 消息：圆形头像 + 彩色用户名 + 灰色时间 + 正文；被提及的消息整行淡蓝紫底并带左边线。
   - 嵌入卡：深一档底色 + 3px Blurple 左边线，内含蓝色标题、说明和缩略图。
   - 回应胶囊（小圆角、计数）、身份组标签、在线成员列表（头像右下角带状态圆点）、底部输入框（占位“发消息到 #频道”）。
  【页面结构】作为内容页时：顶部社群名称与简介 → 三栏聊天界面示意 → 公告或活动的嵌入卡列表 → 频道导览（每个频道一张说明卡）→ 加入引导按钮。
  【禁忌】不用纯黑和纯白大面积背景；不用细线描边堆叠；Blurple 不做整页底色（落地页首屏除外）。
  【布局原则】信息高密度但不杂乱；对话流自上而下，重要信息用嵌入卡而不是加粗长段落。`,
  },
  {
    id: "newsroom-feature",
    name: "新闻专题",
    category: "媒体内容/新闻专题",
    accent: "#b91c1c",
    description: "严肃新闻专题页，强标题、导语、事实框、时间线和引用证据",
    previewHtml: canvas(
      `background:#fbfaf7;font-family:${SERIF};color:#111827;padding:16px 28px;`,
      `<div style="display:flex;align-items:center;gap:10px;font-family:${SANS};"><span style="background:#b91c1c;color:#ffffff;font-size:9px;font-weight:700;padding:3px 8px;">深度报道</span><span style="font-size:9px;color:#6b7280;">2026 年 9 月 12 日 · 阅读 12 分钟</span></div>` +
        `<div style="font-size:24px;font-weight:700;line-height:1.25;margin-top:9px;">一座老工业城市的<br>新能源转型样本</div>` +
        `<div style="font-family:${SANS};font-size:11px;line-height:1.6;color:#4b5563;margin-top:8px;">三年间，这里关停了 14 座高炉，却新增了 2.3 万个就业岗位。</div>` +
        `<div style="height:1px;background:#111827;margin:10px 0;"></div>` +
        `<div style="display:flex;gap:22px;">` +
        `<div style="flex:1.1;background:#f3f1ea;border-top:3px solid #b91c1c;padding:10px 12px 5px;font-family:${SANS};"><div style="font-size:10px;font-weight:700;color:#b91c1c;margin-bottom:8px;">关键事实</div>` +
        [
          ["38%", "清洁能源占比"],
          ["2.3 万", "新增就业岗位"],
          ["14 座", "关停高炉"],
        ]
          .map(([v, k]) => `<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;"><b style="font-family:${SERIF};font-size:17px;width:58px;">${v}</b><span style="font-size:9px;color:#4b5563;">${k}</span></div>`)
          .join("") +
        `</div>` +
        `<div style="flex:1;font-family:${SANS};"><div style="font-size:10px;font-weight:700;margin-bottom:8px;">时间线</div>` +
        [
          ["2019", "启动产业规划"],
          ["2022", "首个风电基地并网"],
          ["2026", "转型样本全国推广"],
        ]
          .map(
            ([y, t]) =>
              `<div style="position:relative;margin-left:4px;padding:0 0 4px 16px;border-left:1px solid #d1d5db;"><i style="position:absolute;left:-4px;top:3px;width:7px;height:7px;border-radius:50%;background:#b91c1c;"></i><b style="font-size:10px;">${y}</b><div style="font-size:9px;color:#6b7280;margin-top:1px;">${t}</div></div>`,
          )
          .join("") +
        `</div>` +
        `</div>`,
    ),
    style: `【视觉主题】严肃的新闻专题页：克制、可信、以事实为骨架，读者能快速抓住“发生了什么、为什么重要”
  【色彩系统】
   - 底色：新闻纸白 #fbfaf7 或纯白；事实框与引用底 #f3f1ea。
   - 文本：正文近黑 #111827，导语 #4b5563，署名、图注与说明 #6b7280，分隔线 #111827（强）与 #d1d5db（弱）。
   - 强调色：深红 #b91c1c，只用于栏目标签、事实框顶线、时间线节点和链接；图表可另用一种中性蓝灰 #475569 作对比系列。
  【字体与字号】
   - 标题用有分量的衬线体（Georgia / Noto Serif SC / 宋体加粗）；正文用高可读的衬线体或清晰的无衬线体；栏目、署名、图注、数据标签用无衬线体。
   - 字号阶梯：主标题 40-52px 字重 700、行高 1.25，导语 19-21px 行高 1.6，小标题 24px，正文 17-18px 行高 1.8，事实数字 28-36px（衬线），图注与来源 13px，栏目标签 12-13px 字重 700。
  【间距与形状】
   - 全部直角；不用圆角卡片、阴影和渐变。
   - 正文栏宽 680px 左右并居中；事实框和图表可以略宽于正文栏；段落间距 1.2em。
   - 分隔用线：标题区下方一条 1px 黑线，事实框顶部 3px 红线。
  【组件特征】
   - 标题区（必须完整）：栏目标签（红底白字）+ 日期与阅读时长 → 主标题 → 导语（一到两句，概括核心事实）→ 署名（记者、摄影、编辑）→ 黑色细线。
   - 事实框：“关键事实”小标题 + 3-5 条“大号数字 + 说明”，浅底、红色顶线。
   - 时间线：竖线 + 红色圆点，每个节点为“时间（加粗）+ 一句事件”。
   - 人物引用：衬线大号引文 + 姓名与身份；资料来源列表置于文末并编号。
   - 新闻图片必须带图注（“说明。摄影 / 来源”），图注字号小且紧贴图片下方；图表标题写结论，下方注明数据来源与口径。
  【页面结构】标题区 → 关键事实与时间线 → 正文分节（每节一个小标题，穿插图片、引用和图表）→ 各方回应 → 背景链接 → 资料来源与更正说明。
  【禁忌】不要营销化的口号和夸张形容词；不要没有出处的数据；不要过度装饰和彩色标签堆。
  【布局原则】适合深度文章、事件复盘、行业报道；先事实后分析，重要信息不埋在长段落里。`,
  },
  {
    id: "documentary-scroll",
    name: "纪录片叙事",
    category: "媒体内容/影像叙事",
    accent: "#f97316",
    description: "纪录片式滚动叙事，暗色剧照感、大段留白、章节镜头语言",
    previewHtml: canvas(
      `background:#0f0f0f;font-family:${SANS};color:#f5f5f4;`,
      abs(`left:0;right:0;top:0;bottom:0;background:radial-gradient(circle at 74% 60%,rgba(249,115,22,0.6),rgba(249,115,22,0) 38%),linear-gradient(180deg,#1c1917 0%,#4a2c1b 64%,#18130f 100%);`) +
        abs(`left:0;right:0;top:198px;bottom:0;background:linear-gradient(180deg,#1a1512,#0c0a09);`) +
        abs(`left:346px;top:94px;width:16px;height:106px;background:#0c0a09;clip-path:polygon(22% 0,78% 0,100% 100%,0 100%);`) +
        abs(`left:343px;top:82px;width:22px;height:14px;background:#0c0a09;border-radius:3px 3px 0 0;`) +
        abs(`left:350px;top:86px;width:8px;height:6px;background:#facc15;box-shadow:0 0 18px 6px rgba(250,204,21,0.6);`) +
        abs(`left:0;right:0;top:0;height:24px;background:#000000;`) +
        abs(`left:0;right:0;bottom:0;height:24px;background:#000000;`) +
        abs(`left:28px;top:44px;font-family:${MONO};font-size:9px;letter-spacing:3px;color:#f97316;`, "CHAPTER 01 — 第一章") +
        abs(`left:26px;top:64px;font-size:46px;font-weight:800;line-height:1.14;letter-spacing:1px;`, "最后的<br>守灯人") +
        abs(`right:28px;top:44px;font-family:${MONO};font-size:9px;color:#a8a29e;`, "00:12:47") +
        abs(`left:0;right:0;bottom:38px;text-align:center;`, `<span style="background:rgba(0,0,0,0.6);font-size:11px;padding:4px 12px;">“海上的夜，比你想的要亮。”</span>`),
    ),
    style: `【视觉主题】纪录片式的滚动叙事：每一屏像一个镜头，暗色、缓慢、有呼吸，靠画面和旁白推进
  【色彩系统】
   - 底色：炭黑 #0f0f0f 或暗棕黑 #18130f；画面区用暖暗色的渐变或整幅图片。
   - 文本：主文本 #f5f5f4，旁白与说明 #a8a29e，弱标注 #78716c。
   - 强调色：暖橙 #f97316 或胶片黄 #facc15（整份作品二选一），只用于章节编号、时间码和关键词。
   - 字幕条：半透明黑 rgba(0,0,0,0.6) 衬底，保证文字在任何画面上都清晰。
  【字体与字号】
   - 标题用电影海报式的大字号粗体（无衬线或衬线均可，整份统一），字距略放宽；章节编号和时间码用等宽字体、全大写、字距 0.3em。
   - 字号阶梯：片名与章节标题 clamp(44px, 8vw, 96px) 行高 1.15，导语 20-22px，旁白正文 17-18px 行高 1.9、栏宽收窄到 560px 以内，字幕 15-16px，章节编号与时间码 12-13px。
  【间距与形状】
   - 章节之间留出接近一屏的留白；每个章节最小高度为一屏（min-height: 100vh），内容垂直居中或压在左下。
   - 画面可以整幅出血，上下加 5%-8% 高的纯黑遮幅条，形成宽银幕画幅；文字必须落在安全区内，不贴边。
   - 不用圆角卡片和描边盒子；少量分隔用 1px 的暗灰线 #292524。
  【组件特征】
   - 章节开场：等宽的章节编号（如“CHAPTER 01 — 第一章”）→ 巨大的章节标题 → 一句导语；右上角可放时间码。
   - 画面：用 CSS 渐变、剪影和光晕绘制的场景，或带暗角的整幅图片；需要文字的地方加自下而上的黑色渐变。
   - 字幕条：画面底部居中的一句话，半透明黑底，用直角引号。
   - 旁白段落：窄栏、宽行距，一段不超过四行；片段引用：大号引文 + 说话人与身份。
   - 资料卡：年份 / 地点 / 人物的三列小字信息；片尾为制作人员名单式的纵向列表。
  【页面结构】片名页（整幅画面 + 片名 + 一句引子）→ 第一章开场 → 旁白与画面交替 → 引用 → 第二章开场 → … → 尾声 → 片尾字幕。
  【禁忌】不用明亮的白底和彩色标签；不用普通的卡片网格；不要让文字压在画面的高亮处；滚动动画只作点缀，所有内容在初始状态即可见。
  【布局原则】适合品牌故事、人物专题、影像项目介绍；强调情绪和叙事推进，每屏只讲一个画面。`,
  },
];
