import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    // Reset clipboard mock before each test
    vi.clearAllMocks();
  });

  it('should copy text to clipboard successfully', async () => {
    // Mock clipboard API
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() => useClipboard());
    
    let copyResult: boolean = false;
    await act(async () => {
      copyResult = await result.current.copyToClipboard('test text');
    });
    
    expect(copyResult).toBe(true);
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBe(null);
    expect(writeTextMock).toHaveBeenCalledWith('test text');
  });

  it('should handle clipboard API not available', async () => {
    // Remove clipboard API
    Object.assign(navigator, {
      clipboard: undefined,
    });

    const { result } = renderHook(() => useClipboard());
    
    let copyResult: boolean = false;
    await act(async () => {
      copyResult = await result.current.copyToClipboard('test text');
    });
    
    expect(copyResult).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('Clipboard API not available');
  });

  it('should handle clipboard write errors', async () => {
    // Mock clipboard API with error
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() => useClipboard());
    
    let copyResult: boolean = false;
    await act(async () => {
      copyResult = await result.current.copyToClipboard('test text');
    });
    
    expect(copyResult).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('Permission denied');
  });
});
