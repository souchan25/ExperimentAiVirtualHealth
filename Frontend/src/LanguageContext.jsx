import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { settingsService } from './api/service';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const fetchSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings.language) {
        setLanguage(settings.language);
        localStorage.setItem('language', settings.language);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const t = (key) => {
    const lang = language === 'fil' ? 'fil' : 'en';
    return translations[lang][key] || key;
  };

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, updateLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
