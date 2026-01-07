import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type ColorTheme = 'green' | 'red' | 'purple' | 'orange' | 'pink';

interface ColorThemeContextValue {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  toggleColorTheme: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

const STORAGE_KEY = "colorTheme";

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('green');

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'green' || raw === 'red' || raw === 'purple' || raw === 'orange' || raw === 'pink') {
      setColorThemeState(raw);
    } else {
      setColorThemeState('green');
    }
  }, []);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    
    // Apply theme to CSS variables
    const root = document.documentElement;
    
    switch (theme) {
      case 'green':
        // Logo green #9eff47 ≈ 90° 100% 64%
        root.style.setProperty('--primary', '90 100% 64%');
        root.style.setProperty('--primary-foreground', '220 20% 4%');
        root.style.setProperty('--card-foreground', '90 100% 64%');
        root.style.setProperty('--popover-foreground', '90 100% 64%');
        root.style.setProperty('--ring', '90 100% 64%');
        root.style.setProperty('--sidebar-foreground', '90 100% 64%');
        root.style.setProperty('--sidebar-primary', '90 100% 64%');
        root.style.setProperty('--sidebar-primary-foreground', '220 20% 4%');
        root.style.setProperty('--sidebar-accent-foreground', '90 100% 64%');
        root.style.setProperty('--sidebar-ring', '90 100% 64%');
        root.style.setProperty('--muted-foreground', '90 50% 46%');
        root.style.setProperty('--border', '90 100% 32%');
        root.style.setProperty('--terminal-glow', '0 0 10px hsl(90 100% 64% / 0.5), 0 0 20px hsl(90 100% 64% / 0.3), 0 0 40px hsl(90 100% 64% / 0.1)');
        root.style.setProperty('--neon-cyan', '90 100% 64%');
        break;
        
      case 'red':
        // Red #ff4848 = 0° 100% 67%
        root.style.setProperty('--primary', '0 100% 67%');
        root.style.setProperty('--primary-foreground', '220 20% 4%');
        root.style.setProperty('--card-foreground', '0 100% 67%');
        root.style.setProperty('--popover-foreground', '0 100% 67%');
        root.style.setProperty('--ring', '0 100% 67%');
        root.style.setProperty('--sidebar-foreground', '0 100% 67%');
        root.style.setProperty('--sidebar-primary', '0 100% 67%');
        root.style.setProperty('--sidebar-primary-foreground', '220 20% 4%');
        root.style.setProperty('--sidebar-accent-foreground', '0 100% 67%');
        root.style.setProperty('--sidebar-ring', '0 100% 67%');
        root.style.setProperty('--muted-foreground', '0 50% 40%');
        root.style.setProperty('--border', '0 100% 25%');
        root.style.setProperty('--terminal-glow', '0 0 10px hsl(0 100% 67% / 0.5), 0 0 20px hsl(0 100% 67% / 0.3), 0 0 40px hsl(0 100% 67% / 0.1)');
        root.style.setProperty('--neon-cyan', '0 100% 67%');
        break;
        
      case 'purple':
        // Purple #b848ff = 270° 100% 64%
        root.style.setProperty('--primary', '270 100% 64%');
        root.style.setProperty('--primary-foreground', '220 20% 4%');
        root.style.setProperty('--card-foreground', '270 100% 64%');
        root.style.setProperty('--popover-foreground', '270 100% 64%');
        root.style.setProperty('--ring', '270 100% 64%');
        root.style.setProperty('--sidebar-foreground', '270 100% 64%');
        root.style.setProperty('--sidebar-primary', '270 100% 64%');
        root.style.setProperty('--sidebar-primary-foreground', '220 20% 4%');
        root.style.setProperty('--sidebar-accent-foreground', '270 100% 64%');
        root.style.setProperty('--sidebar-ring', '270 100% 64%');
        root.style.setProperty('--muted-foreground', '270 50% 40%');
        root.style.setProperty('--border', '270 100% 25%');
        root.style.setProperty('--terminal-glow', '0 0 10px hsl(270 100% 64% / 0.5), 0 0 20px hsl(270 100% 64% / 0.3), 0 0 40px hsl(270 100% 64% / 0.1)');
        root.style.setProperty('--neon-cyan', '270 100% 64%');
        break;
        
      case 'orange':
        // Orange #ff9d48 = 24° 100% 64%
        root.style.setProperty('--primary', '24 100% 64%');
        root.style.setProperty('--primary-foreground', '220 20% 4%');
        root.style.setProperty('--card-foreground', '24 100% 64%');
        root.style.setProperty('--popover-foreground', '24 100% 64%');
        root.style.setProperty('--ring', '24 100% 64%');
        root.style.setProperty('--sidebar-foreground', '24 100% 64%');
        root.style.setProperty('--sidebar-primary', '24 100% 64%');
        root.style.setProperty('--sidebar-primary-foreground', '220 20% 4%');
        root.style.setProperty('--sidebar-accent-foreground', '24 100% 64%');
        root.style.setProperty('--sidebar-ring', '24 100% 64%');
        root.style.setProperty('--muted-foreground', '24 50% 40%');
        root.style.setProperty('--border', '24 100% 25%');
        root.style.setProperty('--terminal-glow', '0 0 10px hsl(24 100% 64% / 0.5), 0 0 20px hsl(24 100% 64% / 0.3), 0 0 40px hsl(24 100% 64% / 0.1)');
        root.style.setProperty('--neon-cyan', '24 100% 64%');
        break;
        
      case 'pink':
        // Pink #ff48b8 = 330° 100% 64%
        root.style.setProperty('--primary', '330 100% 64%');
        root.style.setProperty('--primary-foreground', '220 20% 4%');
        root.style.setProperty('--card-foreground', '330 100% 64%');
        root.style.setProperty('--popover-foreground', '330 100% 64%');
        root.style.setProperty('--ring', '330 100% 64%');
        root.style.setProperty('--sidebar-foreground', '330 100% 64%');
        root.style.setProperty('--sidebar-primary', '330 100% 64%');
        root.style.setProperty('--sidebar-primary-foreground', '220 20% 4%');
        root.style.setProperty('--sidebar-accent-foreground', '330 100% 64%');
        root.style.setProperty('--sidebar-ring', '330 100% 64%');
        root.style.setProperty('--muted-foreground', '330 50% 40%');
        root.style.setProperty('--border', '330 100% 25%');
        root.style.setProperty('--terminal-glow', '0 0 10px hsl(330 100% 64% / 0.5), 0 0 20px hsl(330 100% 64% / 0.3), 0 0 40px hsl(330 100% 64% / 0.1)');
        root.style.setProperty('--neon-cyan', '330 100% 64%');
        break;
        
      default:
        // Default to logo green
        root.style.setProperty('--primary', '90 100% 64%');
        root.style.setProperty('--primary-foreground', '220 20% 4%');
        root.style.setProperty('--card-foreground', '90 100% 64%');
        root.style.setProperty('--popover-foreground', '90 100% 64%');
        root.style.setProperty('--ring', '90 100% 64%');
        root.style.setProperty('--sidebar-foreground', '90 100% 64%');
        root.style.setProperty('--sidebar-primary', '90 100% 64%');
        root.style.setProperty('--sidebar-primary-foreground', '220 20% 4%');
        root.style.setProperty('--sidebar-accent-foreground', '90 100% 64%');
        root.style.setProperty('--sidebar-ring', '90 100% 64%');
        root.style.setProperty('--muted-foreground', '90 50% 46%');
        root.style.setProperty('--border', '90 100% 32%');
        root.style.setProperty('--terminal-glow', '0 0 10px hsl(90 100% 64% / 0.5), 0 0 20px hsl(90 100% 64% / 0.3), 0 0 40px hsl(90 100% 64% / 0.1)');
        root.style.setProperty('--neon-cyan', '90 100% 64%');
        break;
    }
  };

  useEffect(() => {
    setColorTheme(colorTheme);
  }, [colorTheme]);

  const toggleColorTheme = () => {
    const themes: ColorTheme[] = ['green', 'red', 'purple', 'orange', 'pink'];
    const currentIndex = themes.indexOf(colorTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setColorTheme(themes[nextIndex]);
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
