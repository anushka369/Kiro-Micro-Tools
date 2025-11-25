import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaletteDisplay } from './PaletteDisplay';
import type { Palette } from '../types';

describe('PaletteDisplay', () => {
  const mockPalette: Palette = {
    colors: [
      {
        hex: '#FF0000',
        rgb: { r: 255, g: 0, b: 0 },
        hsl: { h: 0, s: 100, l: 50 },
        locked: false,
      },
      {
        hex: '#00FF00',
        rgb: { r: 0, g: 255, b: 0 },
        hsl: { h: 120, s: 100, l: 50 },
        locked: false,
      },
      {
        hex: '#0000FF',
        rgb: { r: 0, g: 0, b: 255 },
        hsl: { h: 240, s: 100, l: 50 },
        locked: false,
      },
      {
        hex: '#FFFF00',
        rgb: { r: 255, g: 255, b: 0 },
        hsl: { h: 60, s: 100, l: 50 },
        locked: false,
      },
      {
        hex: '#FF00FF',
        rgb: { r: 255, g: 0, b: 255 },
        hsl: { h: 300, s: 100, l: 50 },
        locked: false,
      },
    ],
    harmonyRule: 'analogous',
  };

  const mockProps = {
    palette: mockPalette,
    format: 'HEX' as const,
    onGeneratePalette: vi.fn(),
    onToggleLock: vi.fn(),
    onColorChange: vi.fn(),
    onCopy: vi.fn(),
  };

  it('renders all 5 color swatches', () => {
    render(<PaletteDisplay {...mockProps} />);
    
    // Check that all colors are displayed
    expect(screen.getByText('#FF0000')).toBeTruthy();
    expect(screen.getByText('#00FF00')).toBeTruthy();
    expect(screen.getByText('#0000FF')).toBeTruthy();
    expect(screen.getByText('#FFFF00')).toBeTruthy();
    expect(screen.getByText('#FF00FF')).toBeTruthy();
  });

  it('renders contrast indicators between adjacent colors', () => {
    render(<PaletteDisplay {...mockProps} />);
    
    // Should have 4 contrast indicators (between 5 colors)
    const indicators = screen.getAllByTestId('contrast-indicator');
    expect(indicators).toHaveLength(4);
  });

  it('renders generate button', () => {
    render(<PaletteDisplay {...mockProps} />);
    
    const button = screen.getByTestId('generate-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Generate New Palette');
  });

  it('calls onGeneratePalette when generate button is clicked', () => {
    render(<PaletteDisplay {...mockProps} />);
    
    const button = screen.getByTestId('generate-button');
    fireEvent.click(button);
    
    expect(mockProps.onGeneratePalette).toHaveBeenCalledTimes(1);
  });

  it('calls onGeneratePalette when spacebar is pressed', () => {
    const onGeneratePalette = vi.fn();
    render(<PaletteDisplay {...mockProps} onGeneratePalette={onGeneratePalette} />);
    
    // Simulate spacebar press on document body
    fireEvent.keyDown(document.body, { code: 'Space', key: ' ' });
    
    expect(onGeneratePalette).toHaveBeenCalledTimes(1);
  });

  it('does not trigger generation on other key presses', () => {
    const onGeneratePalette = vi.fn();
    render(<PaletteDisplay {...mockProps} onGeneratePalette={onGeneratePalette} />);
    
    // Try various other keys
    fireEvent.keyDown(document.body, { code: 'Enter', key: 'Enter' });
    fireEvent.keyDown(document.body, { code: 'KeyA', key: 'a' });
    fireEvent.keyDown(document.body, { code: 'Escape', key: 'Escape' });
    
    expect(onGeneratePalette).not.toHaveBeenCalled();
  });

  it('displays keyboard hint for spacebar', () => {
    render(<PaletteDisplay {...mockProps} />);
    
    expect(screen.getByText(/Press/)).toBeTruthy();
    expect(screen.getByText('Spacebar')).toBeTruthy();
  });
});
