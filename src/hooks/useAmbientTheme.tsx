import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type AmbientThemeContextValue = {
  ambientEnabled: boolean;
  setAmbientEnabled: (enabled: boolean) => void;
  toggleAmbient: () => void;
};

const AmbientThemeContext = createContext<AmbientThemeContextValue | null>(null);

const STORAGE_KEY = "ambientThemeEnabled";

export const AmbientThemeProvider = ({ children }: { children: ReactNode }) => {
  const [ambientEnabled, setAmbientEnabledState] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "false") setAmbientEnabledState(false);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("ambient-off", !ambientEnabled);
  }, [ambientEnabled]);

  const setAmbientEnabled = (enabled: boolean) => {
    setAmbientEnabledState(enabled);
    window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  };

  const toggleAmbient = () => setAmbientEnabled(!ambientEnabled);

  const value = useMemo(
    () => ({
      ambientEnabled,
      setAmbientEnabled,
      toggleAmbient,
    }),
    [ambientEnabled]
  );

  return <AmbientThemeContext.Provider value={value}>{children}</AmbientThemeContext.Provider>;
};

export const useAmbientTheme = () => {
  const ctx = useContext(AmbientThemeContext);
  if (!ctx) throw new Error("useAmbientTheme must be used within AmbientThemeProvider");
  return ctx;
};
