import type { Palette, Color, HarmonyRule } from '../types';
import { hexToRgb, rgbToHsl } from './colorConversions';

/**
 * Encodes a palette to URL hash parameters
 * @param palette - The palette to encode
 * @returns URL hash string (without the # prefix)
 */
export function encodePaletteToUrl(palette: Palette): string {
  const params = new URLSearchParams();
  
  // Encode colors as hex values (without #)
  const colorHexes = palette.colors.map(color => color.hex.replace('#', ''));
  params.set('colors', colorHexes.join(','));
  
  // Encode locked states as binary string (1 = locked, 0 = unlocked)
  const locks = palette.colors.map(color => color.locked ? '1' : '0').join('');
  params.set('locks', locks);
  
  // Encode harmony rule if present
  if (palette.harmonyRule) {
    params.set('harmony', palette.harmonyRule);
  }
  
  return params.toString();
}

/**
 * Decodes a palette from URL hash parameters
 * @param urlHash - The URL hash string (with or without # prefix)
 * @returns Decoded palette or null if invalid
 */
export function decodePaletteFromUrl(urlHash: string): Palette | null {
  try {
    // Remove # prefix if present
    const cleanHash = urlHash.replace(/^#/, '');
    
    // Handle empty hash
    if (!cleanHash) {
      return null;
    }
    
    const params = new URLSearchParams(cleanHash);
    
    // Get colors parameter
    const colorsParam = params.get('colors');
    if (!colorsParam) {
      return null;
    }
    
    // Parse hex colors
    const hexColors = colorsParam.split(',');
    if (hexColors.length !== 5) {
      return null;
    }
    
    // Validate and convert hex colors
    const colors: Color[] = [];
    for (const hex of hexColors) {
      // Validate hex format (6 characters, valid hex digits)
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return null;
      }
      
      const fullHex = `#${hex.toUpperCase()}`;
      const rgb = hexToRgb(fullHex);
      const hsl = rgbToHsl(rgb);
      
      colors.push({
        hex: fullHex,
        rgb,
        hsl,
        locked: false, // Will be set below
      });
    }
    
    // Parse lock states
    const locksParam = params.get('locks');
    if (locksParam) {
      // Validate locks format (5 characters, only 0 or 1)
      if (!/^[01]{5}$/.test(locksParam)) {
        // Invalid locks format, but we can continue with all unlocked
        // This handles gracefully
      } else {
        for (let i = 0; i < 5; i++) {
          colors[i].locked = locksParam[i] === '1';
        }
      }
    }
    
    // Parse harmony rule
    const harmonyParam = params.get('harmony');
    let harmonyRule: HarmonyRule | undefined;
    
    if (harmonyParam) {
      const validRules: HarmonyRule[] = ['analogous', 'complementary', 'triadic', 'tetradic', 'monochromatic'];
      if (validRules.includes(harmonyParam as HarmonyRule)) {
        harmonyRule = harmonyParam as HarmonyRule;
      }
      // If invalid harmony rule, just omit it (graceful handling)
    }
    
    return {
      colors,
      harmonyRule,
    };
  } catch (error) {
    // Handle any parsing errors gracefully
    return null;
  }
}
