import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type RainThemeContextValue = {
  rainEnabled: boolean;
  setRainEnabled: (enabled: boolean) => void;
  toggleRain: () => void;
};

const RainThemeContext = createContext<RainThemeContextValue | null>(null);

const STORAGE_KEY = "rainThemeEnabled";

export const RainThemeProvider = ({ children }: { children: ReactNode }) => {
  const [rainEnabled, setRainEnabledState] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "true") setRainEnabledState(true);
  }, []);

  const setRainEnabled = (enabled: boolean) => {
    setRainEnabledState(enabled);
    window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  };

  const toggleRain = () => setRainEnabled(!rainEnabled);

  const value = useMemo(
    () => ({
      rainEnabled,
      setRainEnabled,
      toggleRain,
    }),
    [rainEnabled]
  );

  return <RainThemeContext.Provider value={value}>{children}</RainThemeContext.Provider>;
};

export const useRainTheme = () => {
  const ctx = useContext(RainThemeContext);
  if (!ctx) throw new Error("useRainTheme must be used within RainThemeProvider");
  return ctx;
};
