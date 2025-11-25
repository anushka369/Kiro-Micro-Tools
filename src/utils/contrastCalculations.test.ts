import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateContrastRatio, meetsWCAG_AA, meetsWCAG_AAA } from './contrastCalculations';
import type { RGB } from '../types';

describe('Contrast Calculations Property Tests', () => {
  /**
   * Feature: color-palette-picker, Property 16: WCAG classification is correct
   * Validates: Requirements 6.2
   * 
   * For any two colors, the WCAG classification functions should correctly
   * classify the contrast ratio according to the WCAG standards
   */
  it('should correctly classify WCAG AA compliance (ratio >= 4.5)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r1, g1, b1, r2, g2, b2) => {
          const color1: RGB = { r: r1, g: g1, b: b1 };
          const color2: RGB = { r: r2, g: g2, b: b2 };
          
          const ratio = calculateContrastRatio(color1, color2);
          const meetsAA = meetsWCAG_AA(ratio);
          
          // Verify the classification matches the threshold
          if (ratio >= 4.5) {
            expect(meetsAA).toBe(true);
          } else {
            expect(meetsAA).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly classify WCAG AAA compliance (ratio >= 7.0)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r1, g1, b1, r2, g2, b2) => {
          const color1: RGB = { r: r1, g: g1, b: b1 };
          const color2: RGB = { r: r2, g: g2, b: b2 };
          
          const ratio = calculateContrastRatio(color1, color2);
          const meetsAAA = meetsWCAG_AAA(ratio);
          
          // Verify the classification matches the threshold
          if (ratio >= 7.0) {
            expect(meetsAAA).toBe(true);
          } else {
            expect(meetsAAA).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure AAA compliance implies AA compliance', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r1, g1, b1, r2, g2, b2) => {
          const color1: RGB = { r: r1, g: g1, b: b1 };
          const color2: RGB = { r: r2, g: g2, b: b2 };
          
          const ratio = calculateContrastRatio(color1, color2);
          
          // If it meets AAA, it must also meet AA (since 7.0 >= 4.5)
          if (meetsWCAG_AAA(ratio)) {
            expect(meetsWCAG_AA(ratio)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure contrast ratio is symmetric', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r1, g1, b1, r2, g2, b2) => {
          const color1: RGB = { r: r1, g: g1, b: b1 };
          const color2: RGB = { r: r2, g: g2, b: b2 };
          
          const ratio1 = calculateContrastRatio(color1, color2);
          const ratio2 = calculateContrastRatio(color2, color1);
          
          // Contrast ratio should be the same regardless of order
          expect(ratio1).toBeCloseTo(ratio2, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure contrast ratio is always between 1 and 21', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r1, g1, b1, r2, g2, b2) => {
          const color1: RGB = { r: r1, g: g1, b: b1 };
          const color2: RGB = { r: r2, g: g2, b: b2 };
          
          const ratio = calculateContrastRatio(color1, color2);
          
          // Contrast ratio must be in valid range
          expect(ratio).toBeGreaterThanOrEqual(1);
          expect(ratio).toBeLessThanOrEqual(21);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Contrast Calculations Unit Tests', () => {
  describe('calculateContrastRatio', () => {
    it('should calculate 21:1 ratio for black and white', () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      
      const ratio = calculateContrastRatio(black, white);
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should calculate 21:1 ratio for white and black (order independent)', () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      
      const ratio = calculateContrastRatio(white, black);
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should calculate 1:1 ratio for identical colors', () => {
      const color: RGB = { r: 128, g: 128, b: 128 };
      
      const ratio = calculateContrastRatio(color, color);
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should calculate correct ratio for red and white', () => {
      const red: RGB = { r: 255, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      
      const ratio = calculateContrastRatio(red, white);
      expect(ratio).toBeCloseTo(3.998, 2);
    });

    it('should calculate correct ratio for blue and yellow', () => {
      const blue: RGB = { r: 0, g: 0, b: 255 };
      const yellow: RGB = { r: 255, g: 255, b: 0 };
      
      const ratio = calculateContrastRatio(blue, yellow);
      expect(ratio).toBeCloseTo(8.592, 2);
    });
  });

  describe('meetsWCAG_AA', () => {
    it('should return true for ratio >= 4.5', () => {
      expect(meetsWCAG_AA(4.5)).toBe(true);
      expect(meetsWCAG_AA(5.0)).toBe(true);
      expect(meetsWCAG_AA(21.0)).toBe(true);
    });

    it('should return false for ratio < 4.5', () => {
      expect(meetsWCAG_AA(4.4)).toBe(false);
      expect(meetsWCAG_AA(3.0)).toBe(false);
      expect(meetsWCAG_AA(1.0)).toBe(false);
    });
  });

  describe('meetsWCAG_AAA', () => {
    it('should return true for ratio >= 7.0', () => {
      expect(meetsWCAG_AAA(7.0)).toBe(true);
      expect(meetsWCAG_AAA(8.0)).toBe(true);
      expect(meetsWCAG_AAA(21.0)).toBe(true);
    });

    it('should return false for ratio < 7.0', () => {
      expect(meetsWCAG_AAA(6.9)).toBe(false);
      expect(meetsWCAG_AAA(5.0)).toBe(false);
      expect(meetsWCAG_AAA(1.0)).toBe(false);
    });
  });
});
