import type { RGB } from '../types';

/**
 * Calculates the relative luminance of an RGB color according to WCAG formula
 * @param rgb - RGB object with values 0-255
 * @returns Relative luminance value between 0 and 1
 */
function getRelativeLuminance(rgb: RGB): number {
  // Convert RGB values to 0-1 range
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance using WCAG formula
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the contrast ratio between two RGB colors using WCAG formula
 * @param rgb1 - First RGB color
 * @param rgb2 - Second RGB color
 * @returns Contrast ratio between 1 and 21
 */
export function calculateContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if the contrast ratio meets WCAG AA standard (4.5:1)
 * @param ratio - Contrast ratio value
 * @returns True if ratio >= 4.5
 */
export function meetsWCAG_AA(ratio: number): boolean {
  return ratio >= 4.5;
}

/**
 * Checks if the contrast ratio meets WCAG AAA standard (7.0:1)
 * @param ratio - Contrast ratio value
 * @returns True if ratio >= 7.0
 */
export function meetsWCAG_AAA(ratio: number): boolean {
  return ratio >= 7.0;
}
