import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
} from './colorConversions';
import type { RGB, HSL } from '../types';

describe('Color Conversion Property Tests', () => {
  /**
   * Feature: color-palette-picker, Property 13 (adapted): Color conversion round-trips
   * Validates: Requirements 3.3, 3.4
   * 
   * For any valid color, converting through different formats and back should preserve the color
   */
  it('should preserve color through hex -> rgb -> hex round-trip', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r, g, b) => {
          const originalHex = rgbToHex({ r, g, b });
          const rgb = hexToRgb(originalHex);
          const resultHex = rgbToHex(rgb);
          
          expect(resultHex).toBe(originalHex);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve color through rgb -> hsl -> rgb round-trip', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r, g, b) => {
          const originalRgb: RGB = { r, g, b };
          const hsl = rgbToHsl(originalRgb);
          const resultRgb = hslToRgb(hsl);
          
          // Allow small rounding differences (±2 for very dark/light colors)
          expect(Math.abs(resultRgb.r - originalRgb.r)).toBeLessThanOrEqual(2);
          expect(Math.abs(resultRgb.g - originalRgb.g)).toBeLessThanOrEqual(2);
          expect(Math.abs(resultRgb.b - originalRgb.b)).toBeLessThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve color through hsl -> rgb -> hsl round-trip', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 360 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (h, s, l) => {
          const originalHsl: HSL = { h, s, l };
          const rgb = hslToRgb(originalHsl);
          const resultHsl = rgbToHsl(rgb);
          
          // For very low saturation or extreme lightness, hue can vary
          // so we only check hue when saturation and lightness are reasonable
          if (s > 5 && l > 5 && l < 95) {
            expect(Math.abs(resultHsl.h - originalHsl.h)).toBeLessThanOrEqual(2);
          }
          expect(Math.abs(resultHsl.s - originalHsl.s)).toBeLessThanOrEqual(2);
          expect(Math.abs(resultHsl.l - originalHsl.l)).toBeLessThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve color through hex -> hsl -> hex round-trip', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r, g, b) => {
          const originalHex = rgbToHex({ r, g, b });
          const hsl = hexToHsl(originalHex);
          const resultHex = hslToHex(hsl);
          
          // Convert both to RGB to compare (allows for small rounding differences)
          const originalRgb = hexToRgb(originalHex);
          const resultRgb = hexToRgb(resultHex);
          
          expect(Math.abs(resultRgb.r - originalRgb.r)).toBeLessThanOrEqual(2);
          expect(Math.abs(resultRgb.g - originalRgb.g)).toBeLessThanOrEqual(2);
          expect(Math.abs(resultRgb.b - originalRgb.b)).toBeLessThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('Color Conversion Unit Tests', () => {
  describe('hexToRgb', () => {
    it('should convert red hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert green hex to RGB', () => {
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert blue hex to RGB', () => {
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle hex without # prefix', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert black', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert white', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert gray', () => {
      expect(hexToRgb('#808080')).toEqual({ r: 128, g: 128, b: 128 });
    });
  });

  describe('rgbToHex', () => {
    it('should convert red RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#FF0000');
    });

    it('should convert green RGB to hex', () => {
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00FF00');
    });

    it('should convert blue RGB to hex', () => {
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000FF');
    });

    it('should convert black', () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    });

    it('should convert white', () => {
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#FFFFFF');
    });

    it('should convert gray', () => {
      expect(rgbToHex({ r: 128, g: 128, b: 128 })).toBe('#808080');
    });

    it('should clamp values above 255', () => {
      expect(rgbToHex({ r: 300, g: 0, b: 0 })).toBe('#FF0000');
    });

    it('should clamp values below 0', () => {
      expect(rgbToHex({ r: -10, g: 0, b: 0 })).toBe('#000000');
    });
  });

  describe('rgbToHsl', () => {
    it('should convert red RGB to HSL', () => {
      const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('should convert black to HSL', () => {
      const hsl = rgbToHsl({ r: 0, g: 0, b: 0 });
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBe(0);
    });

    it('should convert white to HSL', () => {
      const hsl = rgbToHsl({ r: 255, g: 255, b: 255 });
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBe(100);
    });

    it('should convert gray to HSL', () => {
      const hsl = rgbToHsl({ r: 128, g: 128, b: 128 });
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBeCloseTo(50, 0);
    });
  });

  describe('hslToRgb', () => {
    it('should convert red HSL to RGB', () => {
      const rgb = hslToRgb({ h: 0, s: 100, l: 50 });
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
    });

    it('should convert black HSL to RGB', () => {
      const rgb = hslToRgb({ h: 0, s: 0, l: 0 });
      expect(rgb.r).toBe(0);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
    });

    it('should convert white HSL to RGB', () => {
      const rgb = hslToRgb({ h: 0, s: 0, l: 100 });
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(255);
      expect(rgb.b).toBe(255);
    });

    it('should convert gray HSL to RGB', () => {
      const rgb = hslToRgb({ h: 0, s: 0, l: 50 });
      expect(rgb.r).toBeCloseTo(128, 0);
      expect(rgb.g).toBeCloseTo(128, 0);
      expect(rgb.b).toBeCloseTo(128, 0);
    });
  });

  describe('hexToHsl and hslToHex', () => {
    it('should convert hex to HSL', () => {
      const hsl = hexToHsl('#FF0000');
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('should convert HSL to hex', () => {
      expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe('#FF0000');
    });
  });
});
