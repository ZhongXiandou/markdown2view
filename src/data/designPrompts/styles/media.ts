import type { RawDesignStyle } from '../types';

export const mediaStyles: RawDesignStyle[] = [
  {
      id: "spotify",
      name: "暗色霓虹 · Spotify",
      category: "媒体内容/音乐娱乐",
      accent: "#1db954",
      description: "深黑底霓虹绿，超粗大标题，专辑封面式视觉",
      previewHtml: `<div style="font-family: Circular, sans-serif; background: linear-gradient(180deg, #333, #121212); padding: 16px; height: 100%; border-radius: 8px; display: flex; flex-direction: column;">
    <div style="width: 100%; aspect-ratio: 1; background: #282828; border-radius: 4px; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);"></div>
    <div style="font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 4px; letter-spacing: -0.5px;">Daily Mix 1</div>
    <div style="font-size: 8px; color: #b3b3b3; line-height: 1.4;">Made for you</div>
    <div style="margin-top: auto; align-self: flex-end; width: 24px; height: 24px; border-radius: 50%; background: #1db954; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"></div>
  </div>`,
      style: `【视觉主题】暗色活力、音乐与情绪驱动（参考 Spotify）
  【色彩系统】
   - 基础底色：近黑 #121212 与深灰渐变
   - 文本颜色：纯白 #ffffff 与亮灰 #b3b3b3
   - 强调色：霓虹绿 #1db954
  【排版规则】
   - 字体：极粗大无衬线体
   - 层级：标题字重 800-900，视觉冲击极强
  【组件特征】
   - 卡片：深灰圆角面板，悬浮上浮互动，常配大图。
   - 按钮：鲜艳的绿色圆角或胶囊。
  【布局原则】卡片与图库排布紧凑，大面积暗色映衬彩色封面图，强调沉浸感。`,
    },
  {
      id: "editorial",
      name: "杂志编辑 · WIRED",
      category: "媒体内容/杂志编辑",
      accent: "#1a1aff",
      description: "报刊密度排版，自定义衬线大标题，墨蓝链接",
      style: `【视觉主题】科技杂志编辑风，印刷质感（参考 WIRED）
  【色彩系统】
   - 基础底色：纸白底 #fafafa
   - 文本颜色：纯黑正文 #111111，浅灰标注
   - 强调色：墨蓝或克莱因蓝 #1a1aff
  【排版规则】
   - 字体：大标题必须用极粗的现代衬线体（Georgia/Times 风格），正文使用衬线或清晰无衬线。
   - 层级：首字下沉，压紧的标题行距。
  【组件特征】
   - 装饰：利用粗细对比的实体横线（border-top/bottom）分隔小节。
   - 引用块：左侧竖线或极大引号标注。
  【布局原则】多栏排版，信息密度高，具备传统报刊的权威感。`,
    },
  {
      id: "xiaohongshu",
      name: "社媒卡片 · 小红书",
      category: "媒体内容/社交卡片",
      accent: "#ff2e4d",
      description: "竖屏卡片，柔和渐变，大圆角，亲切手账感",
      style: `【视觉主题】亲切、可爱、手账感的种草卡片（参考 小红书）
  【色彩系统】
   - 基础底色：柔和的粉彩或奶油渐变（如浅黄到浅粉）
   - 文本颜色：深灰近黑 #333333，次要灰 #999999
   - 强调色：明快红粉 #ff2e4d
  【排版规则】
   - 字体：圆润活泼的无衬线体。
   - 层级：标题字重 700 且经常搭配 Emoji。
  【组件特征】
   - 卡片：大圆角面板（20-24px），柔和宽泛的背景投影。
   - 标签：彩色背景小圆角 Tag，用于圈出重点。
  【布局原则】非常适合竖向浏览，分点排版，重点极其突出。`,
    },
  {
      id: "xhs-multipage",
      name: "小红书多页图文",
      category: "媒体内容/多页图文",
      accent: "#ff2e4d",
      description: "3:4 多页卡片：封面页 + N 张内容页",
      previewHtml: `<div style="font-family: sans-serif; background: #fffbeb; padding: 12px; height: 100%; border-radius: 12px; border: 1px solid #ffe3e6; display: flex; gap: 8px; box-sizing: border-box;">
    <div style="flex: 1; background: linear-gradient(135deg, #ff2e4d, #ff6b8b); border-radius: 8px; padding: 8px; display: flex; flex-direction: column; justify-content: space-between; color: #fff;">
      <div style="font-size: 10px; font-weight: bold;">COVER</div>
      <div style="font-size: 12px; font-weight: 900; line-height: 1.2;">小红书多页<br>排版秘籍</div>
      <div style="font-size: 9px; opacity: 0.8;">Page 1/3</div>
    </div>
    <div style="flex: 1; background: #fff; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #eaeaea;">
      <div style="font-size: 9px; font-weight: bold; color: #ff2e4d;">01/干货</div>
      <div style="font-size: 9px; color: #444; line-height: 1.3;">内容页展示：分步排版，左右滑动查看...</div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #999;">
        <span>Swipe ➜</span>
        <span>2/3</span>
      </div>
    </div>
  </div>`,
      style: `【视觉主题】小红书划动图文，多页独立卡片
  【色彩系统】
   - 封面底色：强视觉渐变或大图叠加
   - 内容底色：干净白底 #ffffff 辅以微小装饰
   - 强调色：主红 #ff2e4d
  【排版规则】
   - 字体：大字号无衬线加粗，强烈的情绪传递。
  【组件特征】
   - **强制分页容器**：每一张图必须使用 \`<section class="page">\` 包裹。
   - 页面尺寸：宽高固定比例 3:4（例如内部强制 height:100vh 或者 1440x1080 设定，需保证撑满一屏）。
  【布局原则】
   - 封面大标题居中 + 底部标签；
   - 内容页顶部小标题，中间内容，底部页码指示器。`,
    },
  {
      id: "discord",
      name: "游戏连麦 · Discord",
      category: "媒体内容/社区聊天",
      accent: "#5865F2",
      description: "深灰紫底色，标志性 Blurple，聊天对话流，年轻游戏感",
      previewHtml: `<div style="font-family: sans-serif; background: #2f3136; color: #fff; padding: 12px; height: 100%; display: flex; gap: 8px; box-sizing: border-box;">
    <div style="width: 20px; display: flex; flex-direction: column; gap: 6px; align-items: center; border-right: 1px solid rgba(255,255,255,0.05); padding-right: 4px;">
      <div style="width: 14px; height: 14px; border-radius: 50%; background: #5865F2; display: flex; align-items: center; justify-content: center; font-size: 7px; font-weight: bold;">D</div>
      <div style="width: 14px; height: 14px; border-radius: 50%; background: #3f4248;"></div>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="font-size: 9px; color: #8e9297; margin-bottom: 6px;"># general-chat</div>
        <div style="display: flex; gap: 6px; align-items: flex-start; margin-bottom: 6px;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #ff73fa; shrink: 0;"></div>
          <div>
            <div style="font-size: 9px; font-weight: bold; color: #fff;">GamerX <span style="font-size: 7px; color: #72767d; font-weight: normal;">12:04</span></div>
            <div style="font-size: 9px; color: #dcddde; line-height: 1.3;">Let's host a tech meetup tonight!</div>
          </div>
        </div>
      </div>
      <div style="background: #40444b; border-radius: 4px; padding: 4px 8px; font-size: 9px; color: #72767d;">Message #general-chat</div>
    </div>
  </div>`,
      style: `【视觉主题】年轻化、社群驱动的深色游戏平台（参考 Discord）
  【色彩系统】
   - 基础底色：深灰偏紫 #36393f / #2f3136
   - 强调色：专有蓝紫 Blurple #5865f2
  【排版规则】
   - 紧凑的对话流排版模式。
  【组件特征】
   - 圆形头像搭配状态小圆点，悬浮带有暗沉背景高亮。
  【布局原则】信息高密度但不杂乱。`,
    },
  {
      id: "newsroom-feature",
      previewHtml: `<div style="font-family: Georgia, serif; background: #fbfaf7; padding: 14px; height: 100%; border: 1.5px solid #111827; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div>
      <div style="text-align: center; border-bottom: 2px double #111827; padding-bottom: 4px; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 900; letter-spacing: 2px; color: #111827; text-transform: uppercase;">THE DAILY CHRONICLE</span>
      </div>
      <div style="font-size: 14px; font-weight: 900; color: #b91c1c; line-height: 1.2; margin-bottom: 6px; text-align: justify;">
        人工智能工作流席卷全球，零代码部署成为新常态
      </div>
      <div style="display: flex; gap: 8px;">
        <div style="flex: 1.2; font-size: 9px; color: #111827; line-height: 1.3; text-align: justify; font-family: serif;">
          <span style="font-size: 14px; font-weight: bold; float: left; line-height: 0.9; margin-right: 2px;">本</span>报讯：随着前端容器化技术成熟，静态 HTML 瞬间生成并导出的能力已极大解放了新一代创作者的生产力。
        </div>
        <div style="flex: 0.8; border-left: 1px solid #cbd5e1; padding-left: 6px; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-size: 8px; color: #6b7280; font-weight: bold;">【专题事实】</div>
          <div style="font-size: 8px; color: #111827; line-height: 1.2;">超 85% 企业表示将引入生成式提案流程。</div>
        </div>
      </div>
    </div>
    <div style="border-top: 1px solid #111827; padding-top: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #6b7280;">
      <span>VOL. CLXVIII No. 42</span>
      <span>JUNE 2026</span>
    </div>
  </div>`,
      name: "新闻专题",
      category: "媒体内容/新闻专题",
      accent: "#b91c1c",
      description: "严肃新闻专题页，强标题、导语、事实框、时间线和引用证据",
      style: `【视觉主题】严肃新闻与深度专题报道，克制、可信、有现场感
  【色彩系统】
   - 基础底色：新闻纸白 #fbfaf7 或纯白。
   - 文本颜色：正文近黑 #111827，说明文字 #6b7280。
   - 强调色：深红 #b91c1c，仅用于栏目、关键事实和链接。
  【排版规则】
   - 字体：标题使用强衬线体，正文使用高可读衬线或清晰无衬线。
   - 层级：标题、导语、署名/日期、事实摘要、正文分节必须完整。
  【组件特征】
   - 信息块：事实框、关键数字、时间线、人物引用、资料来源列表。
   - 图片：新闻图必须带图注，图注字号小且靠近图片。
  【布局原则】适合深度文章、事件复盘、行业报道；不要营销化，不要过度装饰。`,
    },
  {
      id: "documentary-scroll",
      previewHtml: `<div style="font-family: sans-serif; background: #0f0f0f; color: #f5f5f4; padding: 14px; height: 100%; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; background-image: linear-gradient(180deg, #18130f 0%, #0f0f0f 100%);">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 8px; color: #a8a29e; letter-spacing: 1px; font-family: monospace;">SCENE 03 / THE SEARCHERS</span>
      <span style="font-size: 8px; color: #f97316; font-weight: bold;">REC ●</span>
    </div>
    <div style="margin: auto 0; text-align: center;">
      <div style="font-size: 15px; font-weight: 300; color: #f5f5f4; letter-spacing: 1px; line-height: 1.4; margin-bottom: 8px;">
        “我们寻找的，往往是那些被时间遗忘的声音。”
      </div>
      <div style="display: inline-block; background: rgba(250,204,21,0.15); color: #facc15; font-size: 9px; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(250,204,21,0.3); font-family: serif; font-style: italic;">
        —— 纪录片《回响》· 镜头 14
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; font-size: 8px; color: #a8a29e; font-family: monospace;">
      <span>TC 10:14:32:08</span>
      <span>4K ULTRA HD</span>
    </div>
  </div>`,
      name: "纪录片叙事",
      category: "媒体内容/影像叙事",
      accent: "#f97316",
      description: "纪录片式滚动叙事，暗色剧照感、大段留白、章节镜头语言",
      style: `【视觉主题】纪录片式长页叙事，沉浸、克制、带镜头感
  【色彩系统】
   - 基础底色：炭黑 #0f0f0f 或暗棕黑 #18130f。
   - 文本颜色：主文本 #f5f5f4，次要文本 #a8a29e。
   - 强调色：暖橙 #f97316 或胶片黄 #facc15。
  【排版规则】
   - 字体：标题使用电影海报式大字号，正文行宽收窄。
   - 节奏：每个章节像一个镜头，使用短标题、导语、关键画面和旁白段落。
  【组件特征】
   - 媒体：大图或渐变背景可以 full-bleed，但必须保留文字安全区。
   - 卡片：少用普通卡片，多用字幕条、章节编号、片段引用、时间戳。
  【布局原则】适合品牌故事、人物专题、影像项目介绍；强调情绪和叙事推进。`,
    },
];
