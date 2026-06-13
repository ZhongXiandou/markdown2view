import type { DesignStyle, RawDesignStyle } from './types';
import { STYLE_METADATA } from './metadata';

import { techStyles } from './styles/tech';
import { designStyles } from './styles/design';
import { mediaStyles } from './styles/media';
import { dataStyles } from './styles/data';
import { docStyles } from './styles/doc';
import { presentationStyles } from './styles/presentation';

const RAW_DESIGN_STYLES: RawDesignStyle[] = [
  ...techStyles,
  ...designStyles,
  ...mediaStyles,
  ...dataStyles,
  ...docStyles,
  ...presentationStyles,
];

export const DESIGN_STYLES: DesignStyle[] = RAW_DESIGN_STYLES.map((style) => {
  const metadata = STYLE_METADATA[style.id];
  if (!metadata) {
    throw new Error(`Missing design style metadata: ${style.id}`);
  }
  return { ...style, ...metadata };
});

export * from './types';
export * from './utils';
