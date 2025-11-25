import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { encodePaletteToUrl, decodePaletteFromUrl } from './urlState';
import type { Palette, Color, HarmonyRule } from '../types';
import { hexToRgb, rgbToHsl } from './colorConversions';

// Arbitrary for generating valid hex colors
const hexColorArbitrary = fc
  .tuple(fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 }))
  .map(([r, g, b]) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

// Arbitrary for generating Color objects
const colorArbitrary = fc.record({
  hex: hexColorArbitrary,
  locked: fc.boolean(),
}).map(({ hex, locked }): Color => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return { hex, rgb, hsl, locked };
});

// Arbitrary for generating HarmonyRule
const harmonyRuleArbitrary: fc.Arbitrary<HarmonyRule> = fc.constantFrom(
  'analogous',
  'complementary',
  'triadic',
  'tetradic',
  'monochromatic'
);

// Arbitrary for generating Palette objects
const paletteArbitrary = fc.record({
  colors: fc.array(colorArbitrary, { minLength: 5, maxLength: 5 }),
  harmonyRule: fc.option(harmonyRuleArbitrary, { nil: undefined }),
});

describe('urlState', () => {
  describe('Property Tests', () => {
    /**
     * Property 13: URL encoding round-trip preserves palette
     * Validates: Requirements 5.1, 5.2
     */
    it('Property 13: URL encoding round-trip preserves palette', () => {
      fc.assert(
        fc.property(paletteArbitrary, (palette) => {
          // Encode palette to URL
          const encoded = encodePaletteToUrl(palette);
          
          // Decode back from URL
          const decoded = decodePaletteFromUrl(encoded);
          
          // Should successfully decode
          expect(decoded).not.toBeNull();
          
          if (decoded) {
            // Should have exactly 5 colors
            expect(decoded.colors).toHaveLength(5);
            
            // Each color should match
            for (let i = 0; i < 5; i++) {
              expect(decoded.colors[i].hex).toBe(palette.colors[i].hex);
              expect(decoded.colors[i].locked).toBe(palette.colors[i].locked);
              
              // RGB values should match (within rounding)
              expect(decoded.colors[i].rgb.r).toBe(palette.colors[i].rgb.r);
              expect(decoded.colors[i].rgb.g).toBe(palette.colors[i].rgb.g);
              expect(decoded.colors[i].rgb.b).toBe(palette.colors[i].rgb.b);
              
              // HSL values should match (within rounding tolerance)
              expect(Math.abs(decoded.colors[i].hsl.h - palette.colors[i].hsl.h)).toBeLessThanOrEqual(1);
              expect(Math.abs(decoded.colors[i].hsl.s - palette.colors[i].hsl.s)).toBeLessThanOrEqual(1);
              expect(Math.abs(decoded.colors[i].hsl.l - palette.colors[i].hsl.l)).toBeLessThanOrEqual(1);
            }
            
            // Harmony rule should match
            expect(decoded.harmonyRule).toBe(palette.harmonyRule);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests - Edge Cases', () => {
    it('should return null for empty URL hash', () => {
      expect(decodePaletteFromUrl('')).toBeNull();
      expect(decodePaletteFromUrl('#')).toBeNull();
    });

    it('should return null for malformed URL with missing colors parameter', () => {
      expect(decodePaletteFromUrl('locks=11111&harmony=analogous')).toBeNull();
    });

    it('should return null for URL with wrong number of colors', () => {
      expect(decodePaletteFromUrl('colors=FF0000,00FF00,0000FF')).toBeNull(); // Only 3 colors
      expect(decodePaletteFromUrl('colors=FF0000,00FF00,0000FF,FFFF00,FF00FF,00FFFF')).toBeNull(); // 6 colors
    });

    it('should return null for URL with invalid hex color format', () => {
      expect(decodePaletteFromUrl('colors=GGGGGG,00FF00,0000FF,FFFF00,FF00FF')).toBeNull(); // Invalid hex
      expect(decodePaletteFromUrl('colors=FF00,00FF00,0000FF,FFFF00,FF00FF')).toBeNull(); // Too short
      expect(decodePaletteFromUrl('colors=FF00000,00FF00,0000FF,FFFF00,FF00FF')).toBeNull(); // Too long
    });

    it('should handle URL with invalid locks parameter gracefully', () => {
      const result = decodePaletteFromUrl('colors=FF0000,00FF00,0000FF,FFFF00,FF00FF&locks=invalid');
      expect(result).not.toBeNull();
      if (result) {
        // Should default to all unlocked
        expect(result.colors.every(c => !c.locked)).toBe(true);
      }
    });

    it('should handle URL with invalid locks length gracefully', () => {
      const result = decodePaletteFromUrl('colors=FF0000,00FF00,0000FF,FFFF00,FF00FF&locks=111');
      expect(result).not.toBeNull();
      if (result) {
        // Should default to all unlocked
        expect(result.colors.every(c => !c.locked)).toBe(true);
      }
    });

    it('should handle URL with invalid harmony rule gracefully', () => {
      const result = decodePaletteFromUrl('colors=FF0000,00FF00,0000FF,FFFF00,FF00FF&harmony=invalid');
      expect(result).not.toBeNull();
      if (result) {
        // Should omit harmony rule
        expect(result.harmonyRule).toBeUndefined();
      }
    });

    it('should handle URL with missing locks parameter', () => {
      const result = decodePaletteFromUrl('colors=FF0000,00FF00,0000FF,FFFF00,FF00FF');
      expect(result).not.toBeNull();
      if (result) {
        // Should default to all unlocked
        expect(result.colors.every(c => !c.locked)).toBe(true);
      }
    });

    it('should handle URL with missing harmony parameter', () => {
      const result = decodePaletteFromUrl('colors=FF0000,00FF00,0000FF,FFFF00,FF00FF&locks=11111');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.harmonyRule).toBeUndefined();
      }
    });

    it('should handle URL with # prefix', () => {
      const result = decodePaletteFromUrl('#colors=FF0000,00FF00,0000FF,FFFF00,FF00FF&locks=10101&harmony=triadic');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.colors).toHaveLength(5);
        expect(result.colors[0].hex).toBe('#FF0000');
        expect(result.colors[0].locked).toBe(true);
        expect(result.colors[1].locked).toBe(false);
        expect(result.harmonyRule).toBe('triadic');
      }
    });

    it('should handle lowercase hex colors', () => {
      const result = decodePaletteFromUrl('colors=ff0000,00ff00,0000ff,ffff00,ff00ff');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.colors[0].hex).toBe('#FF0000');
        expect(result.colors[1].hex).toBe('#00FF00');
      }
    });

    it('should encode and decode a complete palette correctly', () => {
      const palette: Palette = {
        colors: [
          { hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, hsl: { h: 0, s: 100, l: 50 }, locked: true },
          { hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 }, hsl: { h: 120, s: 100, l: 50 }, locked: false },
          { hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, hsl: { h: 240, s: 100, l: 50 }, locked: true },
          { hex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 }, hsl: { h: 60, s: 100, l: 50 }, locked: false },
          { hex: '#FF00FF', rgb: { r: 255, g: 0, b: 255 }, hsl: { h: 300, s: 100, l: 50 }, locked: true },
        ],
        harmonyRule: 'complementary',
      };

      const encoded = encodePaletteToUrl(palette);
      const decoded = decodePaletteFromUrl(encoded);

      expect(decoded).not.toBeNull();
      if (decoded) {
        expect(decoded.colors).toHaveLength(5);
        expect(decoded.colors[0].hex).toBe('#FF0000');
        expect(decoded.colors[0].locked).toBe(true);
        expect(decoded.colors[1].locked).toBe(false);
        expect(decoded.colors[2].locked).toBe(true);
        expect(decoded.harmonyRule).toBe('complementary');
      }
    });
  });
});
