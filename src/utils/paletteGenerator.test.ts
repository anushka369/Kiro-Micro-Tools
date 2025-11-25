import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateRandomPalette } from './paletteGenerator';
import type { Palette, Color } from '../types';

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
  colors: fc.array(colorArbitrary, { minLength: 0, maxLength: 5 }),
  harmonyRule: fc.constantFrom('analogous', 'complementary', 'triadic', 'tetradic', 'monochromatic'),
});

describe('Palette Generation', () => {
  /**
   * Feature: color-palette-picker, Property 1: Palette generation produces valid palettes
   * Validates: Requirements 1.2
   */
  it('Property 1: generates palettes with exactly 5 valid colors', () => {
    fc.assert(
      fc.property(fc.option(paletteArbitrary, { nil: undefined }), (currentPalette) => {
        const palette = generateRandomPalette(currentPalette);
        
        // Must have exactly 5 colors
        expect(palette.colors).toHaveLength(5);
        
        // Each color must have valid structure
        palette.colors.forEach(color => {
          // Valid hex format
          expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
          
          // Valid RGB values
          expect(color.rgb.r).toBeGreaterThanOrEqual(0);
          expect(color.rgb.r).toBeLessThanOrEqual(255);
          expect(color.rgb.g).toBeGreaterThanOrEqual(0);
          expect(color.rgb.g).toBeLessThanOrEqual(255);
          expect(color.rgb.b).toBeGreaterThanOrEqual(0);
          expect(color.rgb.b).toBeLessThanOrEqual(255);
          
          // Valid HSL values
          expect(color.hsl.h).toBeGreaterThanOrEqual(0);
          expect(color.hsl.h).toBeLessThanOrEqual(360);
          expect(color.hsl.s).toBeGreaterThanOrEqual(0);
          expect(color.hsl.s).toBeLessThanOrEqual(100);
          expect(color.hsl.l).toBeGreaterThanOrEqual(0);
          expect(color.hsl.l).toBeLessThanOrEqual(100);
          
          // Has locked property
          expect(typeof color.locked).toBe('boolean');
        });
        
        // Must have a harmony rule
        expect(palette.harmonyRule).toBeDefined();
        expect(['analogous', 'complementary', 'triadic', 'tetradic', 'monochromatic']).toContain(palette.harmonyRule);
      }),
      { numRuns: 100 }
    );
  });
});

  /**
   * Feature: color-palette-picker, Property 2: Generated palettes follow harmony rules
   * Validates: Requirements 1.3
   */
  it('Property 2: generated palettes follow harmony rules', () => {
    fc.assert(
      fc.property(fc.option(paletteArbitrary, { nil: undefined }), (currentPalette) => {
        const palette = generateRandomPalette(currentPalette);
        
        // Get the harmony rule
        const rule = palette.harmonyRule;
        expect(rule).toBeDefined();
        
        // For palettes without locked colors, verify harmony relationships
        if (!currentPalette || currentPalette.colors.every(c => !c.locked)) {
          const hues = palette.colors.map(c => c.hsl.h);
          
          switch (rule) {
            case 'analogous': {
              // Analogous colors should have hues within ±30° of each other
              const minHue = Math.min(...hues);
              const maxHue = Math.max(...hues);
              const hueRange = maxHue - minHue;
              expect(hueRange).toBeLessThanOrEqual(60);
              break;
            }
            
            case 'complementary': {
              // Should have colors with ~180° hue difference
              const uniqueHues = [...new Set(hues.map(h => Math.round(h / 10) * 10))];
              if (uniqueHues.length >= 2) {
                const hasComplementary = uniqueHues.some((h1, i) => 
                  uniqueHues.slice(i + 1).some(h2 => {
                    const diff = Math.abs(h1 - h2);
                    return diff >= 160 && diff <= 200;
                  })
                );
                expect(hasComplementary).toBe(true);
              }
              break;
            }
            
            case 'triadic': {
              // Should have colors with ~120° spacing
              const uniqueHues = [...new Set(hues.map(h => Math.round(h / 10) * 10))];
              if (uniqueHues.length >= 3) {
                const hasTriadic = uniqueHues.some((h1, i) => 
                  uniqueHues.slice(i + 1).some(h2 => {
                    const diff = Math.abs(h1 - h2);
                    return (diff >= 100 && diff <= 140) || (diff >= 220 && diff <= 260);
                  })
                );
                expect(hasTriadic).toBe(true);
              }
              break;
            }
            
            case 'tetradic': {
              // Should have colors with ~90° spacing
              const uniqueHues = [...new Set(hues.map(h => Math.round(h / 10) * 10))];
              if (uniqueHues.length >= 4) {
                const hasTetradic = uniqueHues.some((h1, i) => 
                  uniqueHues.slice(i + 1).some(h2 => {
                    const diff = Math.abs(h1 - h2);
                    return (diff >= 80 && diff <= 100) || (diff >= 170 && diff <= 190) || (diff >= 260 && diff <= 280);
                  })
                );
                expect(hasTetradic).toBe(true);
              }
              break;
            }
            
            case 'monochromatic': {
              // All colors should have the same hue (within tolerance)
              const baseHue = hues[0];
              const allSameHue = hues.every(h => Math.abs(h - baseHue) <= 5);
              expect(allSameHue).toBe(true);
              break;
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-picker, Property 4: Locked colors are preserved during generation
   * Validates: Requirements 2.2, 2.3
   */
  it('Property 4: locked colors are preserved during palette generation', () => {
    fc.assert(
      fc.property(paletteArbitrary, (currentPalette) => {
        // Ensure we have some colors and at least one is locked
        if (currentPalette.colors.length === 0) {
          return true; // Skip empty palettes
        }
        
        // Mark at least one color as locked
        const paletteWithLocks = {
          ...currentPalette,
          colors: currentPalette.colors.map((color, index) => ({
            ...color,
            locked: index === 0 ? true : color.locked, // Ensure at least first is locked
          })),
        };
        
        const lockedColors = paletteWithLocks.colors.filter(c => c.locked);
        
        if (lockedColors.length === 0) {
          return true; // Skip if no locked colors
        }
        
        const newPalette = generateRandomPalette(paletteWithLocks);
        
        // Check that all locked colors are preserved
        lockedColors.forEach(lockedColor => {
          const found = newPalette.colors.some(
            newColor => newColor.hex === lockedColor.hex && newColor.locked === true
          );
          expect(found).toBe(true);
        });
        
        // Verify the palette still has exactly 5 colors
        expect(newPalette.colors).toHaveLength(5);
      }),
      { numRuns: 100 }
    );
  });
