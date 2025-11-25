import type { Color, HSL } from '../types';
import { hslToHex, hexToRgb, rgbToHsl } from './colorConversions';

/**
 * Normalizes hue to 0-360 range
 */
function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/**
 * Creates a Color object from HSL values
 */
function createColorFromHsl(hsl: HSL, locked: boolean = false): Color {
  const hex = hslToHex(hsl);
  const rgb = hexToRgb(hex);
  return {
    hex,
    rgb,
    hsl,
    locked,
  };
}

/**
 * Generates an analogous color palette (±30° hue variations)
 * @param baseColor - The base color to generate palette from
 * @returns Array of 5 colors with analogous harmony
 */
export function generateAnalogousPalette(baseColor: Color): Color[] {
  const baseHsl = baseColor.hsl;
  const hueOffsets = [-30, -15, 0, 15, 30];
  
  return hueOffsets.map(offset => {
    const newHue = normalizeHue(baseHsl.h + offset);
    return createColorFromHsl({
      h: newHue,
      s: baseHsl.s,
      l: baseHsl.l,
    });
  });
}

/**
 * Generates a complementary color palette (180° hue offset)
 * @param baseColor - The base color to generate palette from
 * @returns Array of 5 colors with complementary harmony
 */
export function generateComplementaryPalette(baseColor: Color): Color[] {
  const baseHsl = baseColor.hsl;
  const complementaryHue = normalizeHue(baseHsl.h + 180);
  
  // Generate 3 variations of base color and 2 of complementary
  return [
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: Math.max(20, baseHsl.l - 20) }),
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: Math.min(80, baseHsl.l + 20) }),
    createColorFromHsl({ h: complementaryHue, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: complementaryHue, s: baseHsl.s, l: Math.min(80, baseHsl.l + 15) }),
  ];
}

/**
 * Generates a triadic color palette (120° hue spacing)
 * @param baseColor - The base color to generate palette from
 * @returns Array of 5 colors with triadic harmony
 */
export function generateTriadicPalette(baseColor: Color): Color[] {
  const baseHsl = baseColor.hsl;
  const hue2 = normalizeHue(baseHsl.h + 120);
  const hue3 = normalizeHue(baseHsl.h + 240);
  
  return [
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: Math.min(80, baseHsl.l + 15) }),
    createColorFromHsl({ h: hue2, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: hue3, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: hue2, s: baseHsl.s, l: Math.max(20, baseHsl.l - 15) }),
  ];
}

/**
 * Generates a tetradic color palette (90° hue spacing)
 * @param baseColor - The base color to generate palette from
 * @returns Array of 5 colors with tetradic harmony
 */
export function generateTetradicPalette(baseColor: Color): Color[] {
  const baseHsl = baseColor.hsl;
  const hue2 = normalizeHue(baseHsl.h + 90);
  const hue3 = normalizeHue(baseHsl.h + 180);
  const hue4 = normalizeHue(baseHsl.h + 270);
  
  return [
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: hue2, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: hue3, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: hue4, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: Math.min(80, baseHsl.l + 15) }),
  ];
}

/**
 * Generates a monochromatic color palette (same hue, varied saturation/lightness)
 * @param baseColor - The base color to generate palette from
 * @returns Array of 5 colors with monochromatic harmony
 */
export function generateMonochromaticPalette(baseColor: Color): Color[] {
  const baseHsl = baseColor.hsl;
  
  return [
    createColorFromHsl({ h: baseHsl.h, s: Math.max(10, baseHsl.s - 20), l: Math.max(20, baseHsl.l - 20) }),
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: Math.max(30, baseHsl.l - 10) }),
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: baseHsl.l }),
    createColorFromHsl({ h: baseHsl.h, s: baseHsl.s, l: Math.min(70, baseHsl.l + 10) }),
    createColorFromHsl({ h: baseHsl.h, s: Math.min(90, baseHsl.s + 20), l: Math.min(80, baseHsl.l + 20) }),
  ];
}
