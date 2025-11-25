import type { RGB, HSL } from '../types';

/**
 * Clamps a number between min and max values
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts a hex color string to RGB
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns RGB object with values 0-255
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return {
    r: clamp(r, 0, 255),
    g: clamp(g, 0, 255),
    b: clamp(b, 0, 255),
  };
}

/**
 * Converts RGB to hex color string
 * @param rgb - RGB object with values 0-255
 * @returns Hex color string with # prefix
 */
export function rgbToHex(rgb: RGB): string {
  const r = clamp(Math.round(rgb.r), 0, 255);
  const g = clamp(Math.round(rgb.g), 0, 255);
  const b = clamp(Math.round(rgb.b), 0, 255);
  
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts RGB to HSL
 * @param rgb - RGB object with values 0-255
 * @returns HSL object with h: 0-360, s: 0-100, l: 0-100
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = clamp(rgb.r, 0, 255) / 255;
  const g = clamp(rgb.g, 0, 255) / 255;
  const b = clamp(rgb.b, 0, 255) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }
  
  return {
    h: clamp(Math.round(h * 360), 0, 360),
    s: clamp(Math.round(s * 100), 0, 100),
    l: clamp(Math.round(l * 100), 0, 100),
  };
}

/**
 * Converts HSL to RGB
 * @param hsl - HSL object with h: 0-360, s: 0-100, l: 0-100
 * @returns RGB object with values 0-255
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = clamp(hsl.h, 0, 360) / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  
  return {
    r: clamp(Math.round(r * 255), 0, 255),
    g: clamp(Math.round(g * 255), 0, 255),
    b: clamp(Math.round(b * 255), 0, 255),
  };
}

/**
 * Converts hex color string to HSL
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns HSL object with h: 0-360, s: 0-100, l: 0-100
 */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Converts HSL to hex color string
 * @param hsl - HSL object with h: 0-360, s: 0-100, l: 0-100
 * @returns Hex color string with # prefix
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}
