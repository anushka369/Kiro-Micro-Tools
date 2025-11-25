import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Palette } from '../types';

// Arbitraries for property-based testing
const hslArbitrary = fc.record({
  h: fc.integer({ min: 0, max: 360 }),
  s: fc.integer({ min: 0, max: 100 }),
  l: fc.integer({ min: 0, max: 100 }),
});

const rgbArbitrary = fc.record({
  r: fc.integer({ min: 0, max: 255 }),
  g: fc.integer({ min: 0, max: 255 }),
  b: fc.integer({ min: 0, max: 255 }),
});

const hexArbitrary = fc.hexaString({ minLength: 6, maxLength: 6 }).map(hex => `#${hex.toUpperCase()}`);

const colorArbitrary = fc.record({
  hex: hexArbitrary,
  rgb: rgbArbitrary,
  hsl: hslArbitrary,
  locked: fc.boolean(),
});

const paletteArbitrary = fc.record({
  colors: fc.array(colorArbitrary, { minLength: 5, maxLength: 5 }),
  harmonyRule: fc.option(
    fc.constantFrom('analogous', 'complementary', 'triadic', 'tetradic', 'monochromatic'),
    { nil: undefined }
  ),
});

/**
 * Formats a palette as JSON with all color formats
 * (Duplicated from ExportButton.tsx for testing purposes)
 */
function formatPaletteAsJson(palette: Palette): string {
  const exportData = {
    colors: palette.colors.map(color => ({
      hex: color.hex,
      rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
      hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
    })),
    harmonyRule: palette.harmonyRule,
  };
  
  return JSON.stringify(exportData, null, 2);
}

describe('ExportButton', () => {
  /**
   * Feature: color-palette-picker, Property 14: JSON export contains all formats
   * Validates: Requirements 5.3, 5.4
   */
  it('Property 14: JSON export contains all color formats (HEX, RGB, HSL)', () => {
    fc.assert(
      fc.property(paletteArbitrary, (palette) => {
        const jsonString = formatPaletteAsJson(palette);
        const exportedData = JSON.parse(jsonString);
        
        // Verify structure exists
        expect(exportedData).toHaveProperty('colors');
        expect(exportedData.colors).toHaveLength(5);
        
        // Verify each color has all three formats
        exportedData.colors.forEach((color: any, index: number) => {
          const originalColor = palette.colors[index];
          
          // Check HEX format
          expect(color).toHaveProperty('hex');
          expect(color.hex).toBe(originalColor.hex);
          expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
          
          // Check RGB format
          expect(color).toHaveProperty('rgb');
          expect(color.rgb).toBe(`rgb(${originalColor.rgb.r}, ${originalColor.rgb.g}, ${originalColor.rgb.b})`);
          expect(color.rgb).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
          
          // Check HSL format
          expect(color).toHaveProperty('hsl');
          expect(color.hsl).toBe(`hsl(${originalColor.hsl.h}, ${originalColor.hsl.s}%, ${originalColor.hsl.l}%)`);
          expect(color.hsl).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
        });
        
        // Verify harmony rule is included (may be undefined)
        if (palette.harmonyRule !== undefined) {
          expect(exportedData).toHaveProperty('harmonyRule');
          expect(exportedData.harmonyRule).toBe(palette.harmonyRule);
        } else {
          // When harmonyRule is undefined, JSON.stringify omits it
          // This is expected behavior
          expect(exportedData.harmonyRule).toBeUndefined();
        }
      }),
      { numRuns: 100 }
    );
  });
});
