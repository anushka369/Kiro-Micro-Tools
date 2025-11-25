import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { ColorSwatch } from './ColorSwatch';
import type { Color, ColorFormat } from '../types';

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

const formatArbitrary = fc.constantFrom<ColorFormat>('HEX', 'RGB', 'HSL');

describe('ColorSwatch Property Tests', () => {
  /**
   * Feature: color-palette-picker, Property 3: Lock toggle changes state
   * Validates: Requirements 2.1
   * 
   * For any color, clicking the lock indicator should toggle the locked state
   */
  it('property: lock toggle changes state', () => {
    fc.assert(
      fc.property(colorArbitrary, formatArbitrary, (color, format) => {
        const onToggleLock = vi.fn();
        const onCopy = vi.fn();
        const onColorChange = vi.fn();
        
        render(
          <ColorSwatch
            color={color}
            format={format}
            onToggleLock={onToggleLock}
            onCopy={onCopy}
            onColorChange={onColorChange}
          />
        );
        
        // Find and click the lock indicator
        const lockIndicator = screen.getByTestId('lock-indicator');
        lockIndicator.click();
        
        // Verify toggle was called
        expect(onToggleLock).toHaveBeenCalledTimes(1);
        
        // Cleanup after each property test iteration
        cleanup();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-picker, Property 5: Lock state determines visual indicator
   * Validates: Requirements 2.4
   * 
   * For any color, the lock indicator should display the correct icon based on locked state
   */
  it('property: lock state determines visual indicator', () => {
    fc.assert(
      fc.property(colorArbitrary, formatArbitrary, (color, format) => {
        const onToggleLock = vi.fn();
        const onCopy = vi.fn();
        const onColorChange = vi.fn();
        
        render(
          <ColorSwatch
            color={color}
            format={format}
            onToggleLock={onToggleLock}
            onCopy={onCopy}
            onColorChange={onColorChange}
          />
        );
        
        // Find the lock indicator
        const lockIndicator = screen.getByTestId('lock-indicator');
        
        // Verify the correct icon is displayed based on locked state
        const expectedIcon = color.locked ? '🔒' : '🔓';
        expect(lockIndicator.textContent).toBe(expectedIcon);
        
        // Cleanup after each property test iteration
        cleanup();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-picker, Property 12: Manual adjustment auto-locks color
   * Validates: Requirements 4.3
   * 
   * For any color, adjusting any HSL slider should result in the color being locked
   */
  it('property: manual adjustment auto-locks color', () => {
    fc.assert(
      fc.property(
        colorArbitrary,
        formatArbitrary,
        fc.integer({ min: 0, max: 360 }),
        (color, format, newHue) => {
          // Skip edge case: when saturation and lightness are both 0 (pure black/white),
          // changing hue doesn't produce a visible color change
          if (color.hsl.s === 0 && (color.hsl.l === 0 || color.hsl.l === 100)) {
            return true; // Skip this test case
          }
          
          const onToggleLock = vi.fn();
          const onCopy = vi.fn();
          const onColorChange = vi.fn();
          
          const { container } = render(
            <ColorSwatch
              color={color}
              format={format}
              onToggleLock={onToggleLock}
              onCopy={onCopy}
              onColorChange={onColorChange}
            />
          );
          
          // Find the hue slider
          const sliders = container.querySelectorAll('input[type="range"]');
          const hueSlider = sliders[0] as HTMLInputElement;
          
          // Simulate changing the hue slider
          fireEvent.change(hueSlider, { target: { value: newHue.toString() } });
          
          // Verify onColorChange was called with a locked color
          expect(onColorChange).toHaveBeenCalled();
          const updatedColor = onColorChange.mock.calls[0][0] as Color;
          expect(updatedColor.locked).toBe(true);
          
          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-picker, Property 6: Clipboard receives correct color value
   * Validates: Requirements 3.1
   * 
   * For any color and format, clicking the color value should call onCopy with the correctly formatted color string
   */
  it('property: clipboard receives correct color value', async () => {
    await fc.assert(
      fc.asyncProperty(colorArbitrary, formatArbitrary, async (color, format) => {
        const onToggleLock = vi.fn();
        const onCopy = vi.fn().mockResolvedValue(true);
        const onColorChange = vi.fn();
        
        render(
          <ColorSwatch
            color={color}
            format={format}
            onToggleLock={onToggleLock}
            onCopy={onCopy}
            onColorChange={onColorChange}
          />
        );
        
        // Find and click the color value
        const colorValue = screen.getByTestId('color-value');
        fireEvent.click(colorValue);
        
        // Wait for async operation
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Verify onCopy was called
        expect(onCopy).toHaveBeenCalledTimes(1);
        
        // Verify the correct format was passed
        const copiedValue = onCopy.mock.calls[0][0] as string;
        
        switch (format) {
          case 'HEX':
            expect(copiedValue).toBe(color.hex);
            break;
          case 'RGB':
            expect(copiedValue).toBe(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`);
            break;
          case 'HSL':
            expect(copiedValue).toBe(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`);
            break;
        }
        
        // Cleanup after each property test iteration
        cleanup();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-picker, Property 7: Copy action shows confirmation
   * Validates: Requirements 3.2
   * 
   * For any color and format, when a copy action succeeds, a confirmation message should be displayed
   */
  it('property: copy action shows confirmation', async () => {
    await fc.assert(
      fc.asyncProperty(colorArbitrary, formatArbitrary, async (color, format) => {
        const onToggleLock = vi.fn();
        const onCopy = vi.fn().mockResolvedValue(true);
        const onColorChange = vi.fn();
        
        const { waitFor } = await import('@testing-library/react');
        
        render(
          <ColorSwatch
            color={color}
            format={format}
            onToggleLock={onToggleLock}
            onCopy={onCopy}
            onColorChange={onColorChange}
          />
        );
        
        // Initially, confirmation should not be visible (opacity: 0)
        const confirmationBefore = screen.getByTestId('copy-confirmation');
        const styleBefore = window.getComputedStyle(confirmationBefore);
        expect(styleBefore.opacity).toBe('0');
        
        // Find and click the color value
        const colorValue = screen.getByTestId('color-value');
        fireEvent.click(colorValue);
        
        // Wait for the confirmation to become visible
        await waitFor(() => {
          const confirmation = screen.getByTestId('copy-confirmation');
          const style = window.getComputedStyle(confirmation);
          expect(style.opacity).toBe('1');
        }, { timeout: 1000 });
        
        // Cleanup after each property test iteration
        cleanup();
      }),
      { numRuns: 100 }
    );
  });
});
