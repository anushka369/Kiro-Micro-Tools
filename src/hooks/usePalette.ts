import { useState, useEffect, useCallback } from 'react';
import type { Palette, Color } from '../types';
import { generateRandomPalette } from '../utils/paletteGenerator';
import { encodePaletteToUrl, decodePaletteFromUrl } from '../utils/urlState';

/**
 * Custom hook for managing palette state with URL synchronization
 */
export function usePalette() {
  // Initialize palette from URL or generate random
  const [palette, setPalette] = useState<Palette>(() => {
    // Try to load from URL hash
    const urlPalette = decodePaletteFromUrl(window.location.hash);
    if (urlPalette) {
      return urlPalette;
    }
    // Generate random palette if no URL state
    return generateRandomPalette();
  });

  // Sync palette changes to URL
  useEffect(() => {
    const hash = encodePaletteToUrl(palette);
    window.location.hash = hash;
  }, [palette]);

  /**
   * Generate a new palette while respecting locked colors
   */
  const generatePalette = useCallback(() => {
    const newPalette = generateRandomPalette(palette);
    setPalette(newPalette);
  }, [palette]);

  /**
   * Toggle the lock state of a color at the specified index
   */
  const toggleLock = useCallback((index: number) => {
    setPalette(prevPalette => {
      if (index < 0 || index >= prevPalette.colors.length) {
        return prevPalette;
      }

      const newColors = [...prevPalette.colors];
      newColors[index] = {
        ...newColors[index],
        locked: !newColors[index].locked,
      };

      return {
        ...prevPalette,
        colors: newColors,
      };
    });
  }, []);

  /**
   * Update a color at the specified index
   */
  const updateColor = useCallback((index: number, color: Color) => {
    setPalette(prevPalette => {
      if (index < 0 || index >= prevPalette.colors.length) {
        return prevPalette;
      }

      const newColors = [...prevPalette.colors];
      newColors[index] = color;

      return {
        ...prevPalette,
        colors: newColors,
      };
    });
  }, []);

  return {
    palette,
    generatePalette,
    toggleLock,
    updateColor,
  };
}
