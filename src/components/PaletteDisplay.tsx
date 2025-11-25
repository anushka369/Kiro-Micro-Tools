import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { Palette, ColorFormat } from '../types';
import { ColorSwatch } from './ColorSwatch';
import { ContrastIndicator } from './ContrastIndicator';

interface PaletteDisplayProps {
  palette: Palette;
  format: ColorFormat;
  onGeneratePalette: () => void;
  onToggleLock: (index: number) => void;
  onColorChange: (index: number, color: any) => void;
  onCopy: (value: string) => Promise<boolean>;
}

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContrastRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 8px;
`;

const GenerateButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
  margin: 0 auto;
  
  &:hover {
    background: #555;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 3px solid #4a90e2;
    outline-offset: 3px;
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover {
      transform: none;
    }
    
    &:active {
      transform: none;
    }
  }
`;

const KeyboardHint = styled.div`
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
  color: #666;
`;

export function PaletteDisplay({
  palette,
  format,
  onGeneratePalette,
  onToggleLock,
  onColorChange,
  onCopy,
}: PaletteDisplayProps) {
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        onGeneratePalette();
        // Force re-render to ensure UI updates
        setForceUpdate(prev => prev + 1);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onGeneratePalette]);

  return (
    <Container role="main" aria-label="Color palette display">
      <PaletteGrid role="list" aria-label="Color swatches">
        {palette.colors.map((color, index) => (
          <div key={index} role="listitem">
            <ColorSwatch
              color={color}
              format={format}
              onToggleLock={() => onToggleLock(index)}
              onCopy={onCopy}
              onColorChange={(updatedColor) => onColorChange(index, updatedColor)}
            />
          </div>
        ))}
      </PaletteGrid>

      <ContrastRow role="region" aria-label="Contrast ratios between adjacent colors">
        {palette.colors.slice(0, -1).map((color, index) => (
          <ContrastIndicator
            key={`contrast-${index}`}
            color1={color}
            color2={palette.colors[index + 1]}
          />
        ))}
      </ContrastRow>

      <GenerateButton 
        onClick={onGeneratePalette} 
        data-testid="generate-button"
        aria-label="Generate new color palette (or press Spacebar)"
        title="Generate new color palette"
      >
        Generate New Palette
      </GenerateButton>
      
      <KeyboardHint aria-label="Keyboard shortcut: Press Spacebar to generate a new palette">
        Press <strong>Spacebar</strong> to generate a new palette
      </KeyboardHint>
    </Container>
  );
}
