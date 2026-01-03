import { Moon, Sun } from 'lucide-react';
import { useColorTheme } from '@/hooks/useColorTheme';

const ThemeSwitcher = () => {
  const { colorTheme, toggleColorTheme } = useColorTheme();

  const getThemeColors = () => {
    switch (colorTheme) {
      case 'green':
        return {
          bg: 'from-green-400 to-green-600',
          border: 'border-green-300',
          shadow: 'shadow-green-500/50',
          glow: 'bg-green-500 shadow-green-500/50',
          name: 'Green Theme'
        };
      case 'red':
        return {
          bg: 'from-red-400 to-red-600',
          border: 'border-red-300',
          shadow: 'shadow-red-500/50',
          glow: 'bg-red-500 shadow-red-500/50',
          name: 'Red Theme'
        };
      case 'purple':
        return {
          bg: 'from-purple-400 to-purple-600',
          border: 'border-purple-300',
          shadow: 'shadow-purple-500/50',
          glow: 'bg-purple-500 shadow-purple-500/50',
          name: 'Purple Theme'
        };
      case 'orange':
        return {
          bg: 'from-orange-400 to-orange-600',
          border: 'border-orange-300',
          shadow: 'shadow-orange-500/50',
          glow: 'bg-orange-500 shadow-orange-500/50',
          name: 'Orange Theme'
        };
      case 'pink':
        return {
          bg: 'from-pink-400 to-pink-600',
          border: 'border-pink-300',
          shadow: 'shadow-pink-500/50',
          glow: 'bg-pink-500 shadow-pink-500/50',
          name: 'Pink Theme'
        };
      case 'turquoise':
      default:
        return {
          bg: 'from-cyan-400 to-cyan-600',
          border: 'border-cyan-300',
          shadow: 'shadow-cyan-500/50',
          glow: 'bg-cyan-500 shadow-cyan-500/50',
          name: 'Turquoise Theme'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <button
      onClick={toggleColorTheme}
      className="p-2 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-all hover:scale-105 group"
      title={`Switch to next theme (${colors.name})`}
    >
      <div className="relative">
        {/* Theme icon */}
        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-lg ${colors.shadow}`} />
        
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity ${colors.glow}`}
        />
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-popover border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {colors.name}
      </div>
    </button>
  );
};

export default ThemeSwitcher;
