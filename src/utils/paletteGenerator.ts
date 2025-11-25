import type { Color, Palette, HarmonyRule } from '../types';
import {
  generateAnalogousPalette,
  generateComplementaryPalette,
  generateTriadicPalette,
  generateTetradicPalette,
  generateMonochromaticPalette,
} from './harmonyRules';
import { hexToRgb, rgbToHsl } from './colorConversions';

/**
 * Generates a random color
 */
function generateRandomColor(): Color {
  const randomHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const hex = `#${randomHex()}${randomHex()}${randomHex()}`.toUpperCase();
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  
  return {
    hex,
    rgb,
    hsl,
    locked: false,
  };
}

/**
 * Selects a random harmony rule
 */
function selectRandomHarmonyRule(): HarmonyRule {
  const rules: HarmonyRule[] = ['analogous', 'complementary', 'triadic', 'tetradic', 'monochromatic'];
  return rules[Math.floor(Math.random() * rules.length)];
}

/**
 * Generates a palette using the specified harmony rule
 */
function generatePaletteByRule(baseColor: Color, rule: HarmonyRule): Color[] {
  switch (rule) {
    case 'analogous':
      return generateAnalogousPalette(baseColor);
    case 'complementary':
      return generateComplementaryPalette(baseColor);
    case 'triadic':
      return generateTriadicPalette(baseColor);
    case 'tetradic':
      return generateTetradicPalette(baseColor);
    case 'monochromatic':
      return generateMonochromaticPalette(baseColor);
  }
}

/**
 * Generates a random palette that respects locked colors
 * @param currentPalette - Optional current palette with locked colors
 * @returns A new palette with exactly 5 colors
 */
export function generateRandomPalette(currentPalette?: Palette): Palette {
  const harmonyRule = selectRandomHarmonyRule();
  
  // If no current palette, generate completely new palette
  if (!currentPalette || currentPalette.colors.length === 0) {
    const baseColor = generateRandomColor();
    const colors = generatePaletteByRule(baseColor, harmonyRule);
    return { colors, harmonyRule };
  }
  
  // Find locked colors
  const lockedColors = currentPalette.colors.filter(color => color.locked);
  
  // If no locked colors, generate completely new palette
  if (lockedColors.length === 0) {
    const baseColor = generateRandomColor();
    const colors = generatePaletteByRule(baseColor, harmonyRule);
    return { colors, harmonyRule };
  }
  
  // If all colors are locked, return current palette
  if (lockedColors.length >= 5) {
    return { ...currentPalette, harmonyRule };
  }
  
  // Generate new palette based on first locked color
  const baseColor = lockedColors[0];
  const generatedColors = generatePaletteByRule(baseColor, harmonyRule);
  
  // Merge locked colors with generated colors
  const finalColors: Color[] = [];
  let generatedIndex = 0;
  
  for (let i = 0; i < 5; i++) {
    const currentColor = currentPalette.colors[i];
    
    if (currentColor && currentColor.locked) {
      // Keep locked color
      finalColors.push(currentColor);
    } else {
      // Use generated color, skip if it matches a locked position
      while (generatedIndex < generatedColors.length) {
        const genColor = generatedColors[generatedIndex];
        generatedIndex++;
        
        // Check if this generated color is not already used as a locked color
        const isAlreadyLocked = lockedColors.some(
          locked => locked.hex === genColor.hex
        );
        
        if (!isAlreadyLocked) {
          finalColors.push({ ...genColor, locked: false });
          break;
        }
      }
      
      // If we run out of generated colors, create a random one
      if (finalColors.length === i) {
        finalColors.push(generateRandomColor());
      }
    }
  }
  
  // Ensure exactly 5 colors
  while (finalColors.length < 5) {
    finalColors.push(generateRandomColor());
  }
  
  return {
    colors: finalColors.slice(0, 5),
    harmonyRule,
  };
}
