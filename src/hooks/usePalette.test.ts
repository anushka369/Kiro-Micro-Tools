import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePalette } from './usePalette';
import type { Color } from '../types';

describe('usePalette', () => {
  beforeEach(() => {
    // Clear URL hash before each test
    window.location.hash = '';
  });

  it('should initialize with a random palette', () => {
    const { result } = renderHook(() => usePalette());
    
    expect(result.current.palette).toBeDefined();
    expect(result.current.palette.colors).toHaveLength(5);
    expect(result.current.palette.colors.every(c => !c.locked)).toBe(true);
  });

  it('should generate a new palette', () => {
    const { result } = renderHook(() => usePalette());
    const initialPalette = result.current.palette;
    
    act(() => {
      result.current.generatePalette();
    });
    
    expect(result.current.palette).not.toBe(initialPalette);
    expect(result.current.palette.colors).toHaveLength(5);
  });

  it('should toggle lock state', () => {
    const { result } = renderHook(() => usePalette());
    
    expect(result.current.palette.colors[0].locked).toBe(false);
    
    act(() => {
      result.current.toggleLock(0);
    });
    
    expect(result.current.palette.colors[0].locked).toBe(true);
    
    act(() => {
      result.current.toggleLock(0);
    });
    
    expect(result.current.palette.colors[0].locked).toBe(false);
  });

  it('should update a color', () => {
    const { result } = renderHook(() => usePalette());
    
    const newColor: Color = {
      hex: '#FF0000',
      rgb: { r: 255, g: 0, b: 0 },
      hsl: { h: 0, s: 100, l: 50 },
      locked: true,
    };
    
    act(() => {
      result.current.updateColor(0, newColor);
    });
    
    expect(result.current.palette.colors[0].hex).toBe('#FF0000');
    expect(result.current.palette.colors[0].locked).toBe(true);
  });

  it('should preserve locked colors when generating', () => {
    const { result } = renderHook(() => usePalette());
    
    const lockedColor = result.current.palette.colors[0];
    
    act(() => {
      result.current.toggleLock(0);
    });
    
    act(() => {
      result.current.generatePalette();
    });
    
    expect(result.current.palette.colors[0].hex).toBe(lockedColor.hex);
    expect(result.current.palette.colors[0].locked).toBe(true);
  });

  it('should sync palette to URL', () => {
    const { result } = renderHook(() => usePalette());
    
    // URL should be updated with palette data
    expect(window.location.hash).toContain('colors=');
  });

  it('should load palette from URL', () => {
    // Set up URL with palette data
    window.location.hash = 'colors=FF0000,00FF00,0000FF,FFFF00,FF00FF&locks=10100';
    
    const { result } = renderHook(() => usePalette());
    
    expect(result.current.palette.colors[0].hex).toBe('#FF0000');
    expect(result.current.palette.colors[0].locked).toBe(true);
    expect(result.current.palette.colors[1].locked).toBe(false);
    expect(result.current.palette.colors[2].locked).toBe(true);
  });
});
