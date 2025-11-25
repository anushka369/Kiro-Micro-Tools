import styled from 'styled-components';
import type { ColorFormat } from '../types';

interface FormatSelectorProps {
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
}

const SelectorContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormatButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${props => props.$active ? '#333' : '#ddd'};
  background: ${props => props.$active ? '#333' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #333;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid #4a90e2;
    outline-offset: 2px;
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

export function FormatSelector({ format, onFormatChange }: FormatSelectorProps) {
  const formats: ColorFormat[] = ['HEX', 'RGB', 'HSL'];

  return (
    <SelectorContainer role="group" aria-label="Color format selector">
      {formats.map((fmt) => (
        <FormatButton
          key={fmt}
          $active={format === fmt}
          onClick={() => onFormatChange(fmt)}
          data-testid={`format-button-${fmt}`}
          aria-label={`Display colors in ${fmt} format`}
          aria-pressed={format === fmt}
          title={`Switch to ${fmt} format`}
        >
          {fmt}
        </FormatButton>
      ))}
    </SelectorContainer>
  );
}
