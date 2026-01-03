import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type ColorTheme = 'turquoise' | 'green';

interface ColorThemeContextValue {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  toggleColorTheme: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

const STORAGE_KEY = "colorTheme";

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('turquoise');

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'green') setColorThemeState('green');
  }, []);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    
    // Apply theme to CSS variables
    const root = document.documentElement;
    if (theme === 'green') {
      // Convert #9eff48 to HSL: approximately 142° 100% 64%
      root.style.setProperty('--primary', '142 100% 64%');
      root.style.setProperty('--primary-foreground', '220 20% 4%');
      root.style.setProperty('--card-foreground', '142 100% 64%');
      root.style.setProperty('--popover-foreground', '142 100% 64%');
      root.style.setProperty('--ring', '142 100% 64%');
      root.style.setProperty('--sidebar-foreground', '142 100% 64%');
      root.style.setProperty('--sidebar-primary', '142 100% 64%');
      root.style.setProperty('--sidebar-primary-foreground', '220 20% 4%');
      root.style.setProperty('--sidebar-accent-foreground', '142 100% 64%');
      root.style.setProperty('--sidebar-ring', '142 100% 64%');
      root.style.setProperty('--muted-foreground', '142 50% 40%');
      root.style.setProperty('--border', '142 100% 25%');
      root.style.setProperty('--terminal-glow', '0 0 10px hsl(142 100% 64% / 0.5), 0 0 20px hsl(142 100% 64% / 0.3), 0 0 40px hsl(142 100% 64% / 0.1)');
      root.style.setProperty('--neon-cyan', '142 100% 64%');
    } else {
      // Reset to turquoise (180°)
      root.style.setProperty('--primary', '180 100% 50%');
      root.style.setProperty('--primary-foreground', '220 20% 4%');
      root.style.setProperty('--card-foreground', '180 100% 50%');
      root.style.setProperty('--popover-foreground', '180 100% 50%');
      root.style.setProperty('--ring', '180 100% 50%');
      root.style.setProperty('--sidebar-foreground', '180 100% 50%');
      root.style.setProperty('--sidebar-primary', '180 100% 50%');
      root.style.setProperty('--sidebar-primary-foreground', '220 20% 4%');
      root.style.setProperty('--sidebar-accent-foreground', '180 100% 50%');
      root.style.setProperty('--sidebar-ring', '180 100% 50%');
      root.style.setProperty('--muted-foreground', '180 50% 40%');
      root.style.setProperty('--border', '180 100% 25%');
      root.style.setProperty('--terminal-glow', '0 0 10px hsl(180 100% 50% / 0.5), 0 0 20px hsl(180 100% 50% / 0.3), 0 0 40px hsl(180 100% 50% / 0.1)');
      root.style.setProperty('--neon-cyan', '180 100% 50%');
    }
  };

  useEffect(() => {
    setColorTheme(colorTheme);
  }, [colorTheme]);

  const toggleColorTheme = () => {
    setColorTheme(colorTheme === 'turquoise' ? 'green' : 'turquoise');
  };

  const value = useMemo(
    () => ({
      colorTheme,
      setColorTheme,
      toggleColorTheme,
    }),
    [colorTheme]
  );

  return <ColorThemeContext.Provider value={value}>{children}</ColorThemeContext.Provider>;
};

export const useColorTheme = () => {
  const ctx = useContext(ColorThemeContext);
  if (!ctx) throw new Error("useColorTheme must be used within ColorThemeProvider");
  return ctx;
};
