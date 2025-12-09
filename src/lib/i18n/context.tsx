"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "pt-BR" | "en" | "es";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translateDnd5e: (term: string) => string;
  translateEquipment: (name: string) => string;
  translateSpell: (name: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Carregar traduções dinamicamente
const loadTranslations = async (locale: Locale) => {
  try {
    const translations = await import(`./translations/${locale}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // Fallback para inglês
    const fallback = await import(`./translations/en.json`);
    return fallback.default;
  }
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt-BR");
  const [translations, setTranslations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Carregar traduções ao montar e quando o locale mudar
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const loadedTranslations = await loadTranslations(locale);
      setTranslations(loadedTranslations);
      setLoading(false);
    };
    load();
  }, [locale]);

  // Carregar locale salvo do localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    if (savedLocale && ["pt-BR", "en", "es"].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    // Atualizar atributo lang do HTML
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale === "pt-BR" ? "pt-BR" : newLocale === "es" ? "es" : "en";
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!translations || loading) {
      return key; // Retornar a chave enquanto carrega
    }

    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Retornar a chave se não encontrar
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Substituir parâmetros
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  const translateDnd5e = (term: string): string => {
    const { translateDnd5eTerm } = require("./dnd5e-translations");
    return translateDnd5eTerm(term, locale);
  };

  const translateEquipment = (name: string): string => {
    const { translateEquipmentName } = require("./equipment-translations");
    return translateEquipmentName(name, locale);
  };

  const translateSpell = (name: string): string => {
    const { translateSpellName } = require("./spell-translations");
    return translateSpellName(name, locale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, translateDnd5e, translateEquipment, translateSpell }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}

