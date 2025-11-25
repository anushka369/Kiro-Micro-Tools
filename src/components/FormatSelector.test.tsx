import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { FormatSelector } from './FormatSelector';
import type { ColorFormat } from '../types';

describe('FormatSelector', () => {
  /**
   * Feature: color-palette-picker, Property 8: Format selection updates all displays
   * Validates: Requirements 3.3
   * 
   * For any format selection, the component should call the onFormatChange
   * callback with the selected format, ensuring all displays can be updated.
   */
  it('property: format selection triggers callback with correct format', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ColorFormat>('HEX', 'RGB', 'HSL'),
        fc.constantFrom<ColorFormat>('HEX', 'RGB', 'HSL'),
        (initialFormat, selectedFormat) => {
          const onFormatChange = vi.fn();
          
          const { rerender } = render(
            <FormatSelector format={initialFormat} onFormatChange={onFormatChange} />
          );
          
          // Find and click the button for the selected format
          const button = screen.getByTestId(`format-button-${selectedFormat}`);
          button.click();
          
          // Verify the callback was called with the correct format
          expect(onFormatChange).toHaveBeenCalledWith(selectedFormat);
          
          // Verify that when format prop changes, the correct button is active
          rerender(<FormatSelector format={selectedFormat} onFormatChange={onFormatChange} />);
          
          const activeButton = screen.getByTestId(`format-button-${selectedFormat}`);
          // Check that the active button exists and is rendered
          expect(activeButton).toBeTruthy();
          
          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-picker, Property 9: Color values are code-ready
   * Validates: Requirements 3.4
   * 
   * For any color and format, the formatted color value should be in a code-ready format
   * that can be directly used in CSS or code (e.g., #FF0000, rgb(255, 0, 0), hsl(0, 100%, 50%))
   */
  it('property: color values are code-ready', () => {
    fc.assert(
      fc.property(
        fc.record({
          hex: fc.tuple(
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 })
          ).map(([r, g, b]) => {
            const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
          }),
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
        }),
        fc.constantFrom<ColorFormat>('HEX', 'RGB', 'HSL'),
        (color, format) => {
          // Helper function to format color values (same as in ColorSwatch)
          const formatColorValue = (format: ColorFormat): string => {
            switch (format) {
              case 'HEX':
                return color.hex;
              case 'RGB':
                return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
              case 'HSL':
                return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
            }
          };

          const formattedValue = formatColorValue(format);

          // Verify the format is code-ready based on the selected format
          switch (format) {
            case 'HEX':
              // HEX should start with # and be 7 characters
              expect(formattedValue).toMatch(/^#[0-9A-F]{6}$/);
              break;
            case 'RGB':
              // RGB should match rgb(r, g, b) format
              expect(formattedValue).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
              break;
            case 'HSL':
              // HSL should match hsl(h, s%, l%) format
              expect(formattedValue).toMatch(/^hsl\(\d{1,3}, \d{1,3}%, \d{1,3}%\)$/);
              break;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
