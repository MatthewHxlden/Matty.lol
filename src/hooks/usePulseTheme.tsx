import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type PulseThemeContextValue = {
  pulseEnabled: boolean;
  setPulseEnabled: (enabled: boolean) => void;
  togglePulse: () => void;
};

const PulseThemeContext = createContext<PulseThemeContextValue | null>(null);

const STORAGE_KEY = "pulseThemeEnabled";

export const PulseThemeProvider = ({ children }: { children: ReactNode }) => {
  const [pulseEnabled, setPulseEnabledState] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "false") setPulseEnabledState(false);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("pulse-enabled", pulseEnabled);
  }, [pulseEnabled]);

  const setPulseEnabled = (enabled: boolean) => {
    setPulseEnabledState(enabled);
    window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  };

  const togglePulse = () => setPulseEnabled(!pulseEnabled);

  const value = useMemo(
    () => ({
      pulseEnabled,
      setPulseEnabled,
      togglePulse,
    }),
    [pulseEnabled]
  );

  return <PulseThemeContext.Provider value={value}>{children}</PulseThemeContext.Provider>;
};

export const usePulseTheme = () => {
  const ctx = useContext(PulseThemeContext);
  if (!ctx) throw new Error("usePulseTheme must be used within PulseThemeProvider");
  return ctx;
};
