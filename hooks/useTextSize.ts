import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface TextSizes {
  body: number;
  bodyLarge: number;
  header: number;
  headerLarge: number;
  button: number;
  caption: number;
  timer: number;
}

export function useTextSize(): TextSizes {
  const textSize = useAppStore((state) => state.settings.textSize);

  return useMemo(() => {
    switch (textSize) {
      case 'extraLarge':
        return {
          body: 24,
          bodyLarge: 28,
          header: 36,
          headerLarge: 42,
          button: 28,
          caption: 20,
          timer: 48,
        };
      case 'large':
        return {
          body: 20,
          bodyLarge: 24,
          header: 30,
          headerLarge: 36,
          button: 24,
          caption: 18,
          timer: 42,
        };
      case 'normal':
      default:
        return {
          body: 18,
          bodyLarge: 20,
          header: 28,
          headerLarge: 32,
          button: 20,
          caption: 16,
          timer: 36,
        };
    }
  }, [textSize]);
}
