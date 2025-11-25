import { useState } from 'react';
import styled from 'styled-components';
import type { Color, ColorFormat, HSL } from '../types';
import { hslToHex, hslToRgb } from '../utils/colorConversions';

interface ColorSwatchProps {
  color: Color;
  format: ColorFormat;
  onToggleLock: () => void;
  onCopy: (value: string) => Promise<boolean>;
  onColorChange: (color: Color) => void;
}

const SwatchContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  &:focus-within {
    outline: 3px solid #4a90e2;
    outline-offset: 2px;
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
`;

const ColorDisplay = styled.div<{ $color: string }>`
  background-color: ${props => props.$color};
  height: 200px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.5s ease;
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const LockIndicator = styled.button<{ $locked: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  padding: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
`;

const ColorValue = styled.button`
  padding: 12px;
  background: white;
  text-align: center;
  font-family: monospace;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  border: none;
  width: 100%;
  
  &:hover {
    background: #f0f0f0;
  }
  
  &:active {
    background: #e0e0e0;
  }
  
  &:focus {
    outline: 2px solid #4a90e2;
    outline-offset: -2px;
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CopyConfirmation = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(76, 175, 80, 0.95);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  white-space: nowrap;
  z-index: 10;
`;

const AdjustmentControls = styled.div<{ $visible: boolean }>`
  background: white;
  padding: 16px;
  max-height: ${props => props.$visible ? '300px' : '0'};
  opacity: ${props => props.$visible ? 1 : 0};
  overflow: hidden;
  border-top: 1px solid #e0e0e0;
  transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
  padding: ${props => props.$visible ? '16px' : '0 16px'};
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    max-height: ${props => props.$visible ? '300px' : '0'};
  }
`;

const SliderGroup = styled.div`
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SliderLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #666;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  
  &:focus {
    outline: 2px solid #4a90e2;
    outline-offset: 2px;
  }
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #333;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  &:focus::-webkit-slider-thumb {
    transform: scale(1.2);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #333;
    cursor: pointer;
    border: none;
    transition: transform 0.2s ease;
  }
  
  &:focus::-moz-range-thumb {
    transform: scale(1.2);
  }
  
  @media (prefers-reduced-motion: reduce) {
    &::-webkit-slider-thumb {
      transition: none;
    }
    &::-moz-range-thumb {
      transition: none;
    }
  }
`;

export function ColorSwatch({ color, format, onToggleLock, onCopy, onColorChange }: ColorSwatchProps) {
  const [showControls, setShowControls] = useState(false);
  const [hsl, setHsl] = useState<HSL>(color.hsl);
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  const formatColorValue = (color: Color, format: ColorFormat): string => {
    switch (format) {
      case 'HEX':
        return color.hex;
      case 'RGB':
        return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
      case 'HSL':
        return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
    }
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLock();
  };

  const handleValueClick = async () => {
    const value = formatColorValue(color, format);
    const success = await onCopy(value);
    
    if (success) {
      setShowCopyConfirmation(true);
      setTimeout(() => setShowCopyConfirmation(false), 1500);
    }
  };

  const handleSliderChange = (property: keyof HSL, value: number) => {
    const newHsl = { ...hsl, [property]: value };
    setHsl(newHsl);
    
    // Convert HSL to hex and RGB
    const hex = hslToHex(newHsl);
    const rgb = hslToRgb(newHsl);
    
    // Auto-lock when adjusted
    const updatedColor: Color = {
      hex,
      rgb,
      hsl: newHsl,
      locked: true,
    };
    
    onColorChange(updatedColor);
  };

  return (
    <SwatchContainer
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onFocus={() => setShowControls(true)}
      onBlur={(e) => {
        // Only hide if focus is leaving the container entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setShowControls(false);
        }
      }}
      role="group"
      aria-label={`Color swatch ${formatColorValue(color, format)}, ${color.locked ? 'locked' : 'unlocked'}`}
    >
      <ColorDisplay $color={color.hex}>
        <LockIndicator 
          $locked={color.locked} 
          onClick={handleLockClick}
          data-testid="lock-indicator"
          aria-label={color.locked ? 'Unlock color' : 'Lock color'}
          aria-pressed={color.locked}
          title={color.locked ? 'Unlock this color' : 'Lock this color'}
        >
          <span aria-hidden="true">{color.locked ? '🔒' : '🔓'}</span>
        </LockIndicator>
      </ColorDisplay>
      
      <ColorValue 
        onClick={handleValueClick} 
        data-testid="color-value"
        aria-label={`Copy color value ${formatColorValue(color, format)} to clipboard`}
        title="Click to copy color value"
      >
        {formatColorValue(color, format)}
        <CopyConfirmation 
          $visible={showCopyConfirmation} 
          data-testid="copy-confirmation"
          role="status"
          aria-live="polite"
        >
          Copied!
        </CopyConfirmation>
      </ColorValue>
      
      <AdjustmentControls $visible={showControls}>
        <SliderGroup>
          <SliderLabel htmlFor={`hue-${color.hex}`}>
            Hue: {hsl.h}°
          </SliderLabel>
          <Slider
            id={`hue-${color.hex}`}
            type="range"
            min="0"
            max="360"
            value={hsl.h}
            onChange={(e) => handleSliderChange('h', parseInt(e.target.value))}
            aria-label={`Adjust hue, current value ${hsl.h} degrees`}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={hsl.h}
          />
        </SliderGroup>
        
        <SliderGroup>
          <SliderLabel htmlFor={`saturation-${color.hex}`}>
            Saturation: {hsl.s}%
          </SliderLabel>
          <Slider
            id={`saturation-${color.hex}`}
            type="range"
            min="0"
            max="100"
            value={hsl.s}
            onChange={(e) => handleSliderChange('s', parseInt(e.target.value))}
            aria-label={`Adjust saturation, current value ${hsl.s} percent`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={hsl.s}
          />
        </SliderGroup>
        
        <SliderGroup>
          <SliderLabel htmlFor={`lightness-${color.hex}`}>
            Lightness: {hsl.l}%
          </SliderLabel>
          <Slider
            id={`lightness-${color.hex}`}
            type="range"
            min="0"
            max="100"
            value={hsl.l}
            onChange={(e) => handleSliderChange('l', parseInt(e.target.value))}
            aria-label={`Adjust lightness, current value ${hsl.l} percent`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={hsl.l}
          />
        </SliderGroup>
      </AdjustmentControls>
    </SwatchContainer>
  );
}
