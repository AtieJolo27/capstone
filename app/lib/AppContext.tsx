import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Language = 'english' | 'tagalog';
type FontSize = 'small' | 'medium' | 'large';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, tl: string) => string;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontScale: number;
}

const AppContext = createContext<AppContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDarkMode: false,
  language: 'tagalog',
  setLanguage: () => {},
  t: (en: string, tl: string) => tl,
  fontSize: 'medium',
  setFontSize: () => {},
  fontScale: 1,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('tagalog');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');

  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  // Font size scale factor
  const fontScale = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.2 : 1;

  // Translation helper: returns Tagalog by default, English if set
  const t = (en: string, tl: string): string => {
    return language === 'english' ? en : tl;
  };

  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, isDarkMode, language, setLanguage, t, fontSize, setFontSize, fontScale }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export type { FontSize };

