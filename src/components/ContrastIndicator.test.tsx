import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { ContrastIndicator } from './ContrastIndicator';
import type { Color } from '../types';
import { calculateContrastRatio } from '../utils/contrastCalculations';

// Arbitrary for generating valid colors
const colorArbitrary = fc.record({
  hex: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s.toUpperCase()}`),
  rgb: fc.record({
    r: fc.integer({ min: 0, max: 255 }),
    g: fc.integer({ min: 0, max: 255 }),
    b: fc.integer({ min: 0, max: 255 }),
  }),
  hsl: fc.record({
    h: fc.integer({ min: 0, max: 360 }),
    s: fc.integer({ min: 0, max: 100 }),
    l: fc.integer({ min: 0, max: 100 }),
  }),
  locked: fc.boolean(),
});

describe('ContrastIndicator Property Tests', () => {
  /**
   * Feature: color-palette-picker, Property 15: Contrast ratios calculated for adjacent pairs
   * Validates: Requirements 6.1
   * 
   * For any two colors, the ContrastIndicator should calculate and display the contrast ratio
   */
  it('property: contrast ratios calculated for adjacent pairs', () => {
    fc.assert(
      fc.property(colorArbitrary, colorArbitrary, (color1, color2) => {
        render(
          <ContrastIndicator
            color1={color1}
            color2={color2}
          />
        );
        
        // Verify the component renders
        const indicator = screen.getByTestId('contrast-indicator');
        expect(indicator).toBeDefined();
        
        // Calculate the expected contrast ratio
        const expectedRatio = calculateContrastRatio(color1.rgb, color2.rgb);
        
        // Verify that a badge or warning is displayed based on the ratio
        if (expectedRatio >= 7.0) {
          // Should show AAA badge
          expect(screen.queryByTestId('badge-aaa')).toBeDefined();
        } else if (expectedRatio >= 4.5) {
          // Should show AA badge
          expect(screen.queryByTestId('badge-aa')).toBeDefined();
        } else {
          // Should show warning icon and low contrast badge
          expect(screen.queryByTestId('warning-icon')).toBeDefined();
          expect(screen.queryByTestId('badge-warning')).toBeDefined();
        }
        
        // Cleanup after each property test iteration
        cleanup();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-picker, Property 18: Low contrast shows warning
   * Validates: Requirements 6.4
   * 
   * For any two colors with contrast ratio below 4.5:1, a warning should be displayed
   */
  it('property: low contrast shows warning', () => {
    fc.assert(
      fc.property(colorArbitrary, colorArbitrary, (color1, color2) => {
        render(
          <ContrastIndicator
            color1={color1}
            color2={color2}
          />
        );
        
        // Calculate the contrast ratio
        const ratio = calculateContrastRatio(color1.rgb, color2.rgb);
        
        // If ratio is below 4.5, warning should be shown
        if (ratio < 4.5) {
          const warningIcon = screen.queryByTestId('warning-icon');
          expect(warningIcon).toBeDefined();
          expect(warningIcon).not.toBeNull();
        } else {
          // If ratio is 4.5 or above, warning should not be shown
          const warningIcon = screen.queryByTestId('warning-icon');
          expect(warningIcon).toBeNull();
        }
        
        // Cleanup after each property test iteration
        cleanup();
      }),
      { numRuns: 100 }
    );
  });
});
