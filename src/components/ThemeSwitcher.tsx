import { Moon, Sun } from 'lucide-react';
import { useColorTheme } from '@/hooks/useColorTheme';

const ThemeSwitcher = () => {
  const { colorTheme, toggleColorTheme } = useColorTheme();

  return (
    <button
      onClick={toggleColorTheme}
      className="p-2 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-all hover:scale-105 group"
      title={`Switch to ${colorTheme === 'turquoise' ? 'green' : 'turquoise'} theme`}
    >
      <div className="relative">
        {/* Theme icon */}
        {colorTheme === 'turquoise' ? (
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-green-300 shadow-lg shadow-green-500/50" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-cyan-300 shadow-lg shadow-cyan-500/50" />
        )}
        
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity ${
            colorTheme === 'turquoise' 
              ? 'bg-green-500 shadow-green-500/50' 
              : 'bg-cyan-500 shadow-cyan-500/50'
          }`}
        />
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-popover border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {colorTheme === 'turquoise' ? 'Green Theme' : 'Turquoise Theme'}
      </div>
    </button>
  );
};

export default ThemeSwitcher;
