import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations, TranslationKey } from '@/constants/translations';

export function useTranslation() {
  const language = useAppStore((state) => state.settings.language);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text = translations[language][key] || translations['en'][key] || key;

      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          text = text.replace(`{${paramKey}}`, String(value));
        });
      }

      return text;
    },
    [language]
  );

  return { t, language };
}
