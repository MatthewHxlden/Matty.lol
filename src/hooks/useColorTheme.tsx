import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type ColorTheme = 'turquoise' | 'green' | 'red' | 'purple' | 'orange' | 'pink';

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
    if (raw === 'green' || raw === 'red' || raw === 'purple' || raw === 'orange' || raw === 'pink') {
      setColorThemeState(raw);
    }
  }, []);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    
    // Apply theme to CSS variables
    const root = document.documentElement;
    
    switch (theme) {
      case 'green':
        // Lime green #9eff48 = 142° 100% 64%
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
        
      case 'turquoise':
      default:
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
        break;
    }
  };

  useEffect(() => {
    setColorTheme(colorTheme);
  }, [colorTheme]);

  const toggleColorTheme = () => {
    const themes: ColorTheme[] = ['turquoise', 'green', 'red', 'purple', 'orange', 'pink'];
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
