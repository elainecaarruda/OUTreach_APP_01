import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { Language } from '../types';
import { translations, TranslationKey } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt-BR');

  // Memoize translation function to avoid unnecessary recalculations
  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  // Memoize context value to prevent unnecessary provider re-renders
  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};