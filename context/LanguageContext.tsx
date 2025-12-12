"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { IntlProvider } from 'next-intl';
import { Locale, defaultLocale } from '@/i18n/config';

// Import all message files
import enMessages from '@/i18n/messages/en.json';
import esMessages from '@/i18n/messages/es.json';
import frMessages from '@/i18n/messages/fr.json';
import deMessages from '@/i18n/messages/de.json';

const allMessages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
};

const validLocales = ['en', 'es', 'fr', 'de'];

function isValidLocale(value: string | null): value is Locale {
  return value !== null && validLocales.includes(value);
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: typeof enMessages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Check localStorage first (client-side only)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cognify-locale');
      if (isValidLocale(stored)) {
        return stored;
      }
    }
    return initialLocale || defaultLocale;
  });

  const messages = useMemo(() => allMessages[locale], [locale]);

  // Persist locale changes to localStorage
  const setLocale = useCallback((newLocale: Locale) => {
    if (isValidLocale(newLocale)) {
      setLocaleState(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cognify-locale', newLocale);
      }
    }
  }, []);

  const contextValue = useMemo(() => ({
    locale,
    setLocale,
    messages,
  }), [locale, setLocale, messages]);

  return (
    <LanguageContext.Provider value={contextValue}>
      <IntlProvider
        locale={locale}
        messages={messages}
        timeZone="UTC"
        now={new Date()}
      >
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
