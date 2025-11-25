import { useState, useCallback } from 'react';

interface ClipboardState {
  success: boolean;
  error: string | null;
}

/**
 * Custom hook for clipboard operations
 */
export function useClipboard() {
  const [state, setState] = useState<ClipboardState>({
    success: false,
    error: null,
  });

  /**
   * Copy text to clipboard
   * @param text - The text to copy
   * @returns Promise that resolves to true if successful, false otherwise
   */
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    // Check if clipboard API is available
    if (!navigator.clipboard) {
      setState({
        success: false,
        error: 'Clipboard API not available',
      });
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setState({
        success: true,
        error: null,
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      setState({
        success: false,
        error: errorMessage,
      });
      return false;
    }
  }, []);

  return {
    copyToClipboard,
    success: state.success,
    error: state.error,
  };
}
