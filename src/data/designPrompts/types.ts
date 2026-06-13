export interface DesignStyle {
  id: string;
  name: string;
  category: string;
  accent: string;
  description: string;
  outputType: OutputType;
  visualTone: VisualTone;
  family: string;
  displayLevel: DisplayLevel;
  style: string;
  /** 可选的微型 HTML 预览片段，用于缩略图展示 */
  previewHtml?: string;
}

export const OUTPUT_TYPES = [
  "幻灯片",
  "长页",
  "卡片",
  "报告",
  "仪表盘",
  "文档",
] as const;

export const VISUAL_TONES = [
  "极简",
  "编辑",
  "科技",
  "数据",
  "温暖",
  "代码",
] as const;

export type OutputType = (typeof OUTPUT_TYPES)[number];
export type VisualTone = (typeof VISUAL_TONES)[number];
export type DisplayLevel = "primary" | "basic";

export type DesignStyleMetadata = Pick<
  DesignStyle,
  "outputType" | "visualTone" | "family" | "displayLevel"
>;
export type RawDesignStyle = Omit<DesignStyle, keyof DesignStyleMetadata>;
