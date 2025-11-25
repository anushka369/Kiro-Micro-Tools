import { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { PaletteDisplay } from './components/PaletteDisplay';
import { FormatSelector } from './components/FormatSelector';
import { ExportButton } from './components/ExportButton';
import { usePalette } from './hooks/usePalette';
import { useClipboard } from './hooks/useClipboard';
import type { ColorFormat, Palette } from './types';

// Global styles that use theme colors
const GlobalStyle = createGlobalStyle<{ $palette: Palette }>`
  body {
    transition: background 0.3s ease;
  }
  
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* Ensure focus is always visible */
  *:focus-visible {
    outline: 2px solid #4a90e2;
    outline-offset: 2px;
  }
`;

const AppContainer = styled.div<{ $palette: Palette }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    135deg,
    ${props => props.$palette.colors[0]?.hex || '#f5f7fa'} 0%,
    ${props => props.$palette.colors[props.$palette.colors.length - 1]?.hex || '#c3cfe2'} 100%
  );
  padding: 20px;
  transition: background 0.5s ease;
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Header = styled.header<{ $palette: Palette }>`
  text-align: center;
  margin-bottom: 32px;
  transition: color 0.3s ease;
`;

const Title = styled.h1<{ $palette: Palette }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => {
    // Use middle color for title, with good contrast
    const middleColor = props.$palette.colors[2];
    if (!middleColor) return '#333';
    
    // Calculate luminance to determine if we need light or dark text
    const rgb = middleColor.rgb;
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    // If the middle color is light, use dark text, otherwise use light text
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  }};
  margin-bottom: 8px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: color 0.3s ease;
`;

const Subtitle = styled.p<{ $palette: Palette }>`
  font-size: 1.1rem;
  color: ${props => {
    // Use similar logic for subtitle
    const middleColor = props.$palette.colors[2];
    if (!middleColor) return '#666';
    
    const rgb = middleColor.rgb;
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    return luminance > 0.5 ? '#4a4a4a' : '#e0e0e0';
  }};
  font-weight: 400;
  transition: color 0.3s ease;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
`;

const ControlsBar = styled.div<{ $visible: boolean }>`
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  opacity: ${props => props.$visible ? 1 : 0.3};
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
  }
  
  &:focus-within {
    opacity: 1;
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

function App() {
  const { palette, generatePalette, toggleLock, updateColor } = usePalette();
  const { copyToClipboard } = useClipboard();
  const [format, setFormat] = useState<ColorFormat>('HEX');
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionTimeout, setInteractionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Track user interaction to show/hide controls
  useEffect(() => {
    const handleInteraction = () => {
      setIsInteracting(true);
      
      // Clear existing timeout
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
      }
      
      // Set new timeout to hide controls after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        setIsInteracting(false);
      }, 3000);
      
      setInteractionTimeout(timeout);
    };

    // Listen for various interaction events
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    // Initial interaction state
    handleInteraction();

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
      }
    };
  }, [interactionTimeout]);

  const theme = {
    palette,
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle $palette={palette} />
      <AppContainer 
        $palette={palette} 
        data-testid="app-container"
        role="application"
        aria-label="Color Palette Picker Application"
      >
        <Header $palette={palette} role="banner">
          <Title $palette={palette}>Color Palette Picker</Title>
          <Subtitle $palette={palette}>Generate harmonious color palettes with ease</Subtitle>
        </Header>

        <MainContent>
          <PaletteDisplay
            palette={palette}
            format={format}
            onGeneratePalette={generatePalette}
            onToggleLock={toggleLock}
            onColorChange={updateColor}
            onCopy={copyToClipboard}
          />

          <ControlsBar 
            $visible={isInteracting} 
            data-testid="controls-bar"
            role="toolbar"
            aria-label="Palette controls"
          >
            <FormatSelector format={format} onFormatChange={setFormat} />
            <ExportButton palette={palette} />
          </ControlsBar>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
