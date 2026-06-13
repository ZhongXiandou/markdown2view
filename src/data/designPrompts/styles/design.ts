import type { RawDesignStyle } from '../types';

export const designStyles: RawDesignStyle[] = [
  {
      id: "apple",
      name: "高级留白 · Apple",
      category: "设计创意/品牌叙事",
      accent: "#0071e3",
      description: "SF Pro 风格，超大留白，居中叙事，电影感大标题",
      previewHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f7; padding: 16px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
    <div style="font-size: 18px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.5px; margin-bottom: 4px;">Pro cameras.</div>
    <div style="font-size: 18px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.5px; margin-bottom: 8px;">Pro display.</div>
    <div style="font-size: 8px; color: #86868b; margin-bottom: 12px;">The most advanced system yet.</div>
    <div style="background: #0071e3; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 6px; font-weight: 500;">Buy</div>
  </div>`,
      style: `【视觉主题】极简、高级、电影感叙事（参考 Apple 官网）
  【色彩系统】
   - 基础底色：纯净白底或极浅灰 #f5f5f7
   - 文本颜色：深黑 #1d1d1f，次要灰 #86868b
   - 强调色：苹果蓝 #0071e3
  【排版规则】
   - 字体：SF Pro 风格现代无衬线体
   - 层级：超大居中大标题（字重 600，字距紧凑），配小巧精致的副标题
  【组件特征】
   - 卡片：圆润边角（18px+），白色背景，近乎无边界或柔和微投影。
   - 按钮：经典蓝色胶囊形（全圆角）。
  【布局原则】超大垂直留白（120px+），居中对齐为主，产品图极其突出。`,
    },
  {
      id: "figma",
      name: "创意工具 · Figma",
      category: "设计创意/设计工具",
      accent: "#0d99ff",
      description: "纯白底，纯黑字，鲜艳纯色点缀，粗边框与工具感面板",
      previewHtml: `<div style="font-family: sans-serif; background: #f5f5f5; border: 1px solid #e2e8f0; height: 100%; display: flex; box-sizing: border-box;">
    <div style="width: 32px; background: #fff; border-right: 1px solid #e2e8f0; padding: 8px 4px; display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: space-between;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="width: 16px; height: 16px; border-radius: 3px; background: #0d99ff; display: flex; justify-content: center; align-items: center; color: #fff; font-size: 8px; font-weight: bold;">⌘</div>
        <div style="width: 16px; height: 16px; border-radius: 3px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; color: #555; font-size: 8px;">T</div>
      </div>
      <div style="width: 16px; height: 16px; border-radius: 50%; background: #f24e1e;"></div>
    </div>
    <div style="flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
      <div style="border: 1px dashed #0d99ff; border-radius: 4px; padding: 8px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size: 10px; font-weight: bold; color: #000; margin-bottom: 2px;">Card Frame</div>
        <div style="font-size: 8px; color: #666; line-height: 1.3;">Designing micro components inside Figma mockup...</div>
      </div>
      <div style="position: absolute; bottom: 16px; right: 24px; display: flex; gap: 4px; align-items: center;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#1abc9c" stroke="#1abc9c" style="transform: rotate(-45deg);"><polygon points="5 3 19 12 12 14 5 3"/></svg>
        <span style="background: #1abc9c; color: #fff; font-size: 7px; padding: 1px 4px; border-radius: 3px;">Alex</span>
      </div>
      <div style="font-size: 8px; color: #999;">Canvas: 80%</div>
    </div>
  </div>`,
      style: `【视觉主题】设计工具面板，极其紧凑且充满创造力（参考 Figma）
  【色彩系统】
   - 基础底色：纯白 #ffffff 与工具面板灰 #f5f5f5
   - 文本颜色：纯黑 #000000
   - 强调色：多色纯粹饱和（蓝 #0d99ff、粉 #f24e1e、绿 #1abc9c）
  【排版规则】
   - 字体：系统极简字体 Inter。字号整体偏小。
  【组件特征】
   - 面板：极细分割线，偶尔出现深色带有小尾巴的气泡提示（Tooltip）。
  【布局原则】UI 元素极度靠近，紧凑型网格。`,
    },
  {
      id: "airbnb",
      name: "亲和旅行 · Airbnb",
      category: "设计创意/消费品牌",
      accent: "#ff385c",
      description: "圆润大字重，柔和投影，标志性粉红，以图为主",
      previewHtml: `<div style="font-family: sans-serif; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; box-sizing: border-box; padding-bottom: 12px;">
    <div style="height: 52%; background: linear-gradient(135deg, #ff385c, #ff5a5f); display: flex; justify-content: center; align-items: center; color: #fff; font-size: 20px; font-weight: bold; position: relative;">
      ✈️
      <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.3); color: #fff; font-size: 8px; padding: 2px 6px; border-radius: 10px;">★ 4.95</div>
    </div>
    <div style="padding: 0 12px; margin-top: auto; display: flex; flex-direction: column; gap: 2px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; font-weight: bold; color: #222;">京都 · 隐世木屋</span>
        <span style="font-size: 10px; font-weight: bold; color: #ff385c;">¥580 / 晚</span>
      </div>
      <div style="font-size: 9px; color: #717171; line-height: 1.3;">庭院樱花盛开，步行 5 分钟到地铁站，体验传统日式生活。</div>
    </div>
  </div>`,
      style: `【视觉主题】温暖、友善的高质量消费界面（参考 Airbnb）
  【色彩系统】
   - 基础底色：纯净白
   - 文本颜色：深黑与中灰
   - 强调色：珊瑚粉红 #ff385c
  【排版规则】
   - 字体：现代圆润无衬线。
   - 标题使用极粗的字重（800），充满安全感和亲和力。
  【组件特征】
   - 卡片：无硬边框，极其宽泛弥散的柔和投影。
  【布局原则】注重超大图片的展示力。`,
    },
  {
      id: "framer",
      name: "丝滑动效 · Framer",
      category: "设计创意/建站动效",
      accent: "#0055ff",
      description: "高对比度，柔和发光，精美卡片悬浮，顶级建站审美",
      previewHtml: `<div style="font-family: sans-serif; background: #000; color: #fff; padding: 14px; height: 100%; border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; position: relative; overflow: hidden; border: 1px solid #111;">
    <div style="position: absolute; top: -30px; left: -30px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(0,85,255,0.4) 0%, rgba(0,0,0,0) 70%); pointer-events: none;"></div>
    <div style="display: flex; justify-content: space-between; align-items: center; z-index: 1;">
      <span style="font-size: 11px; font-weight: bold; color: #fff; letter-spacing: 0.5px;">⚡ Framer Pro</span>
      <span style="font-size: 8px; border: 1px solid #0055ff; color: #0055ff; padding: 1px 4px; border-radius: 10px; font-weight: bold;">PUBLISHED</span>
    </div>
    <div style="z-index: 1; margin-top: 10px; margin-bottom: auto;">
      <div style="font-size: 16px; font-weight: 800; line-height: 1.1; margin-bottom: 4px; background: linear-gradient(90deg, #fff, #0055ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Build websites, faster.</div>
      <div style="font-size: 9px; color: #888; line-height: 1.3;">Design with canvas, publish with speed.</div>
    </div>
    <div style="display: flex; gap: 6px; z-index: 1;">
      <div style="background: #0055ff; color: #fff; font-size: 9px; padding: 3px 8px; border-radius: 6px; font-weight: 600;">Remix</div>
      <div style="background: #111; border: 1px solid #222; color: #aaa; font-size: 9px; padding: 3px 8px; border-radius: 6px;">Preview</div>
    </div>
  </div>`,
      style: `【视觉主题】顶级现代建站的视觉冲击力（参考 Framer 官网）
  【色彩系统】
   - 基础底色：纯净深黑或纯白。
   - 强调色：电光蓝 #0055ff，以及不规则的渐变色晕（radial-gradient）。
  【排版规则】
   - 字体：极具设计感的大字号无衬线。
  【组件特征】
   - 大圆角（24px+），卡片叠加或交织。
  【布局原则】自由但极度考究的留白比例。`,
    },
  {
      id: "arc",
      name: "多彩卡片 · Arc Browser",
      category: "设计创意/系统体验",
      accent: "#ff8a8a",
      description: "侧边栏布局，柔和多彩粉彩，极大圆角，拟物玻璃",
      previewHtml: `<div style="font-family: sans-serif; background: linear-gradient(135deg, #ffafbd 0%, #ffc3a0 100%); padding: 10px; height: 100%; border-radius: 12px; display: flex; gap: 8px; box-sizing: border-box;">
    <div style="width: 30%; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 8px; padding: 8px 4px; display: flex; flex-direction: column; gap: 6px; border: 1px solid rgba(255,255,255,0.2);">
      <div style="width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.4); margin-bottom: 4px;"></div>
      <div style="height: 3px; width: 80%; background: rgba(255,255,255,0.5); border-radius: 1px;"></div>
      <div style="height: 3px; width: 60%; background: rgba(255,255,255,0.5); border-radius: 1px;"></div>
    </div>
    <div style="flex: 1; background: #fff; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.3);">
      <div style="font-size: 10px; font-weight: bold; color: #333;">Arc Browser</div>
      <div style="font-size: 8.5px; color: #666; line-height: 1.35;">A new internet experience with smart vertical tabs.</div>
      <div style="font-size: 8px; color: #ff8a8a; text-align: right; font-weight: bold;">v1.2.0</div>
    </div>
  </div>`,
      style: `【视觉主题】多彩、透明、灵动现代的新型操作系统（参考 Arc 浏览器）
  【色彩系统】
   - 基础底色：低饱和度粉彩（淡紫、淡蓝、淡黄）与半透明。
  【排版规则】
   - 字体较小且精致。
  【组件特征】
   - 极其夸张的大圆角或完全胶囊状。带有玻璃质感与反光。
  【布局原则】卡片拼接排列（侧边与中央区块）。`,
    },
  {
      id: "poster",
      name: "平面海报",
      category: "设计创意/平面海报",
      accent: "#ff3366",
      description: "硬核平面海报美学，Bento网格，超大标题展示，视觉冲击力极强",
      previewHtml: `<div style="font-family: 'Arial Black', sans-serif; background: #ff3366; color: #000; padding: 14px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; border: 1px solid #d61845; position: relative;">
    <div style="position: absolute; bottom: 8px; right: 8px; width: 60px; height: 60px; background: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff3366; font-size: 12px; font-weight: 900; transform: rotate(-15deg); box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
      NEW ART
    </div>
    <div>
      <div style="font-size: 26px; font-weight: 900; line-height: 0.9; letter-spacing: -1.5px;">TYPO<br>GRID<br>POSTER</div>
      <div style="font-size: 11px; font-weight: bold; background: #000; color: #ff3366; display: inline-block; padding: 2px 6px; margin-top: 6px; border-radius: 2px;">2026 EVENT</div>
    </div>
    <div style="font-family: sans-serif; font-size: 9px; line-height: 1.3; font-weight: bold; max-width: 60%;">
      BREAKING RULES OF MODERN LAYOUTS AND GRID SYSTEMS.
    </div>
  </div>`,
      style: `【视觉主题】极具表现力、打破常规的网页海报（Modern Poster）
  【色彩系统】
   - 基础底色：极高对比度的背景（纯黑底色，或极鲜艳纯色背景）。
   - 文本颜色：与背景形成极端反差。
  【排版规则】
   - 字体层级：主标题使用极具个性的超大展示字体（Display Font），甚至文字字距收紧、填满容器边缘。正文则配以规整微小的无衬线体，形成极端的字号大小对比。
   - 对齐：倾向于硬切分的网格对齐（CSS Bento Grid 或 Template Areas）或刻意的非对称不对齐。
  【组件特征】
   - 容器尺寸：如果是多张海报，每一张必须使用 \`<section class="page">\` 包装，并推荐赋予其明确的版面比例（如 \`.page{width:100%; aspect-ratio:3/4; overflow:hidden;}\`）。
   - 装饰元素：常用几何色块拼贴，以及利用粗细不一的纯色线条（border）切割版面空间。
  【布局原则】完全不同于普通网页，将屏幕视作一张实体画布，排版张力优先于常规阅读流。`,
    },
  {
      id: "swiss-grid",
      previewHtml: `<div style="font-family: Helvetica, Inter, sans-serif; background: #ffffff; padding: 16px; height: 100%; border: 1px solid #111111; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
    <div style="display: flex; gap: 8px; align-items: flex-start; height: 100%;">
      <div style="flex: 1.2; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
        <div>
          <div style="width: 14px; height: 14px; background: #e11d48; margin-bottom: 12px;"></div>
          <div style="font-size: 18px; font-weight: 900; color: #111111; line-height: 1.1; letter-spacing: -0.8px;">SWISS DESIGN SYSTEM</div>
        </div>
        <div style="font-size: 8px; color: #e11d48; font-weight: bold; font-family: monospace;">ZÜRICH 2026</div>
      </div>
      <div style="flex: 0.8; border-left: 1px solid #111111; padding-left: 8px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
        <div>
          <div style="font-size: 8px; font-weight: bold; color: #111111; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">Order / Logic</div>
          <div style="font-size: 9px; color: #666666; line-height: 1.3;">A rigid grid layout provides visual cohesion across complex documents and pages.</div>
        </div>
        <div style="font-size: 8px; color: #111111; font-weight: bold; text-align: right;">P.09</div>
      </div>
    </div>
  </div>`,
      name: "瑞士网格",
      category: "设计创意/网格排版",
      accent: "#e11d48",
      description: "Swiss Style，非对称网格、强字号对比、红黑白秩序感",
      style: `【视觉主题】瑞士国际主义平面设计，冷静、秩序、强网格
  【色彩系统】
   - 基础底色：纯白 #ffffff 或极浅灰 #f5f5f5。
   - 文本颜色：纯黑 #111111，辅助文字 #666666。
   - 强调色：瑞士红 #e11d48，必须节制使用。
  【排版规则】
   - 字体：Helvetica / Inter 风格无衬线体；标题可极大但必须贴合网格。
   - 对齐：严格使用 12 栏或 6 栏网格，允许非对称布局，但边界必须对齐。
  【组件特征】
   - 装饰：粗细对比的线条、编号、坐标、栏目标签；禁止柔和阴影和卡通插画。
   - 图片：如使用图片，必须矩形裁切并与网格线对齐。
  【布局原则】适合海报、展览介绍、品牌规范、课程封面；信息像海报一样有视觉张力。`,
    },
  {
      id: "bauhaus-composition",
      previewHtml: `<div style="font-family: sans-serif; background: #f5f1e8; padding: 16px; height: 100%; border: 1.5px solid #111111; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; box-sizing: border-box;">
    <div style="position: absolute; right: -10px; top: -10px; width: 60px; height: 60px; border-radius: 50%; background: #e11d48; opacity: 0.95; z-index: 1;"></div>
    <div style="position: absolute; right: 20px; top: 25px; width: 40px; height: 40px; border-radius: 50%; background: #2563eb; opacity: 0.85; z-index: 1;"></div>
    <div style="position: absolute; right: 10px; top: 60px; width: 50px; height: 10px; background: #facc15; z-index: 2;"></div>
    <div style="position: absolute; left: 0; right: 0; bottom: 35px; height: 4px; background: #111111; z-index: 1;"></div>
    
    <div style="z-index: 3; max-width: 70%;">
      <div style="font-size: 20px; font-weight: 900; color: #111111; line-height: 1.0; letter-spacing: -0.5px; text-transform: uppercase;">BAUHAUS</div>
      <div style="font-size: 11px; font-weight: 700; color: #111111; margin-top: 4px; letter-spacing: 1px;">构成设计</div>
    </div>
    
    <div style="z-index: 3; display: flex; justify-content: space-between; align-items: flex-end;">
      <div style="font-size: 8px; color: #111111; font-weight: bold; line-height: 1.2;">
        WEIMAR<br>DESAU
      </div>
      <div style="font-size: 14px; font-weight: 900; color: #111111;">1919</div>
    </div>
  </div>`,
      name: "包豪斯构成",
      category: "设计创意/几何构成",
      accent: "#facc15",
      description: "包豪斯几何构成，红黄蓝黑基础形，适合创意海报和展览页",
      style: `【视觉主题】包豪斯平面构成，几何、理性、色块鲜明
  【色彩系统】
   - 基础底色：米白 #f5f1e8 或纯白。
   - 主色：红 #e11d48、黄 #facc15、蓝 #2563eb、黑 #111111。
   - 颜色规则：一屏最多使用 3 个主色，避免彩虹化。
  【排版规则】
   - 字体：几何无衬线体，标题可使用强字重和垂直/横向排版。
   - 层级：用数字、短词、粗线和几何形建立阅读路径。
  【组件特征】
   - 装饰：圆形、半圆、矩形、粗线条和网格块必须服务布局，不要随机漂浮。
   - 容器：海报或多页卡片必须使用 \`<section class="page">\` 包裹并固定比例。
  【布局原则】适合艺术展、设计课程、品牌海报；视觉张力优先，但正文仍要可读。`,
    },
];
