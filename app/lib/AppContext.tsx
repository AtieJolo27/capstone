import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Language = 'english' | 'tagalog';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, tl: string) => string;
}

const AppContext = createContext<AppContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDarkMode: false,
  language: 'tagalog',
  setLanguage: () => {},
  t: (en: string, tl: string) => tl,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('tagalog');

  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation helper: returns Tagalog by default, English if set
  const t = (en: string, tl: string): string => {
    return language === 'english' ? en : tl;
  };

  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, isDarkMode, language, setLanguage, t }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

