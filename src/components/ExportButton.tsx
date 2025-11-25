import { useState } from 'react';
import styled from 'styled-components';
import type { Palette } from '../types';
import { useClipboard } from '../hooks/useClipboard';
import { encodePaletteToUrl } from '../utils/urlState';

interface ExportButtonProps {
  palette: Palette;
}

const ExportContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  padding: 10px 20px;
  border: 2px solid #333;
  background: white;
  color: #333;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #333;
    color: white;
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

const ConfirmationMessage = styled.div<{ $visible: boolean }>`
  padding: 10px 16px;
  background: #4caf50;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/**
 * Formats a palette as JSON with all color formats
 */
function formatPaletteAsJson(palette: Palette): string {
  const exportData = {
    colors: palette.colors.map(color => ({
      hex: color.hex,
      rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
      hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
    })),
    harmonyRule: palette.harmonyRule,
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Downloads a text file with the given content
 */
function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportButton({ palette }: ExportButtonProps) {
  const { copyToClipboard } = useClipboard();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleShareUrl = async () => {
    const hash = encodePaletteToUrl(palette);
    const fullUrl = `${window.location.origin}${window.location.pathname}#${hash}`;
    
    const success = await copyToClipboard(fullUrl);
    
    if (success) {
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
    }
  };

  const handleDownloadJson = () => {
    const jsonContent = formatPaletteAsJson(palette);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `palette-${timestamp}.json`;
    downloadTextFile(jsonContent, filename);
  };

  return (
    <ExportContainer role="group" aria-label="Export palette options">
      <Button 
        onClick={handleShareUrl} 
        data-testid="share-url-button"
        aria-label="Copy shareable URL to clipboard"
        title="Copy shareable URL to clipboard"
      >
        <span aria-hidden="true">🔗</span> Share URL
      </Button>
      <Button 
        onClick={handleDownloadJson} 
        data-testid="download-json-button"
        aria-label="Download palette as JSON file"
        title="Download palette as JSON file"
      >
        <span aria-hidden="true">💾</span> Download JSON
      </Button>
      <ConfirmationMessage 
        $visible={showConfirmation} 
        data-testid="copy-confirmation"
        role="status"
        aria-live="polite"
      >
        URL copied to clipboard!
      </ConfirmationMessage>
    </ExportContainer>
  );
}
