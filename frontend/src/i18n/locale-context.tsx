import * as React from "react";
import {
  isLocaleCode,
  localeMeta,
  LOCALE_STORAGE_KEY,
  translate,
  type LocaleCode,
} from "@/i18n/translations";

type LocaleContextValue = {
  locale: LocaleCode;
  dir: "ltr" | "rtl";
  setLocale: (code: LocaleCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

function readStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocaleCode(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

function applyDocumentLocale(locale: LocaleCode) {
  const meta = localeMeta[locale];
  document.documentElement.lang = locale;
  document.documentElement.dir = meta.dir;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<LocaleCode>("en");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const initial = readStoredLocale();
    setLocaleState(initial);
    applyDocumentLocale(initial);
    setReady(true);
  }, []);

  const setLocale = React.useCallback((code: LocaleCode) => {
    setLocaleState(code);
    applyDocumentLocale(code);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const t = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: localeMeta[locale].dir,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  // Avoid flashing the wrong language on first paint after hydration.
  if (!ready) {
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
