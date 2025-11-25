import { useState } from 'react';
import styled from 'styled-components';
import type { Color } from '../types';
import { calculateContrastRatio, meetsWCAG_AA, meetsWCAG_AAA } from '../utils/contrastCalculations';

interface ContrastIndicatorProps {
  color1: Color;
  color2: Color;
}

const IndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  gap: 8px;
  position: relative;
  
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
    }
  }
`;

const Badge = styled.span<{ $type: 'AA' | 'AAA' | 'warning' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.$type) {
      case 'AAA':
        return '#22c55e';
      case 'AA':
        return '#3b82f6';
      case 'warning':
        return '#ef4444';
    }
  }};
  color: white;
  text-transform: uppercase;
`;

const WarningIcon = styled.span`
  font-size: 16px;
  cursor: help;
`;

const RatioTooltip = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 10;
`;

export function ContrastIndicator({ color1, color2 }: ContrastIndicatorProps) {
  const [showRatio, setShowRatio] = useState(false);
  
  const ratio = calculateContrastRatio(color1.rgb, color2.rgb);
  const meetsAA = meetsWCAG_AA(ratio);
  const meetsAAA = meetsWCAG_AAA(ratio);

  const getAccessibilityDescription = () => {
    if (meetsAAA) {
      return `Excellent contrast: ${ratio.toFixed(2)} to 1 ratio. Meets WCAG AAA standards.`;
    } else if (meetsAA) {
      return `Good contrast: ${ratio.toFixed(2)} to 1 ratio. Meets WCAG AA standards.`;
    } else {
      return `Warning: Low contrast of ${ratio.toFixed(2)} to 1 ratio. Does not meet WCAG accessibility standards.`;
    }
  };

  return (
    <IndicatorContainer
      onMouseEnter={() => setShowRatio(true)}
      onMouseLeave={() => setShowRatio(false)}
      data-testid="contrast-indicator"
      role="status"
      aria-label={getAccessibilityDescription()}
    >
      {meetsAAA && (
        <Badge 
          $type="AAA" 
          data-testid="badge-aaa"
          aria-label="WCAG AAA compliant"
        >
          AAA
        </Badge>
      )}
      {meetsAA && !meetsAAA && (
        <Badge 
          $type="AA" 
          data-testid="badge-aa"
          aria-label="WCAG AA compliant"
        >
          AA
        </Badge>
      )}
      {!meetsAA && (
        <>
          <WarningIcon 
            data-testid="warning-icon"
            role="img"
            aria-label="Warning: insufficient contrast"
          >
            <span aria-hidden="true">⚠️</span>
          </WarningIcon>
          <Badge 
            $type="warning" 
            data-testid="badge-warning"
            aria-label="Low contrast warning"
          >
            Low Contrast
          </Badge>
        </>
      )}
      <RatioTooltip 
        $visible={showRatio} 
        data-testid="ratio-tooltip"
        aria-hidden="true"
      >
        Contrast Ratio: {ratio.toFixed(2)}:1
      </RatioTooltip>
    </IndicatorContainer>
  );
}
