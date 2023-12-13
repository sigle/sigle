import tinycolor from 'tinycolor2';

export const colors = {
  pink: '#ff576a',
};

export const getContrastingColor = (data: string) => {
  if (!data) {
    return '#fff';
  }
  const col = toState({ data });
  if (col.hex === 'transparent') {
    return 'rgba(0,0,0,0.4)';
  }
  const yiq = (col.rgb.r * 299 + col.rgb.g * 587 + col.rgb.b * 114) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
};

const toState = ({ data, oldHue }: { data: any; oldHue?: string }) => {
  const color = data.hex ? tinycolor(data.hex) : tinycolor(data);
  const hsl = color.toHsl() as any;
  const hsv = color.toHsv() as any;
  const rgb = color.toRgb();
  const hex = color.toHex();
  if (hsl.s === 0) {
    hsl.h = oldHue || 0;
    hsv.h = oldHue || 0;
  }
  const transparent = hex === '000000' && rgb.a === 0;

  return {
    hsl,
    hex: transparent ? 'transparent' : `#${hex}`,
    rgb,
    hsv,
    oldHue: data.h || oldHue || hsl.h,
    source: data.source,
  };
};
