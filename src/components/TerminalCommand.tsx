import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandOutput {
  command: string;
  output: string | React.ReactNode;
  isError?: boolean;
}

const COMMANDS: Record<string, { output: string | React.ReactNode; description: string }> = {
  help: {
    output: `Available commands:
  help     - Show this help message
  whoami   - Display user info
  ls       - List directories
  pwd      - Print working directory
  clear    - Clear terminal
  date     - Show current date
  uptime   - System uptime
  neofetch - System info
  hack     - Initiate hack sequence
  matrix   - Enter the matrix
  coffee   - Brew some coffee
  sudo     - Try to gain root access
  exit     - Close terminal`,
    description: "Show available commands",
  },
  whoami: {
    output: "guest@matty.lol - anonymous_hacker_69",
    description: "Display user info",
  },
  ls: {
    output: `drwxr-xr-x  blog/
drwxr-xr-x  apps/
drwxr-xr-x  tools/
drwxr-xr-x  links/
-rw-r--r--  README.md
-rw-r--r--  secret.txt (ACCESS DENIED)`,
    description: "List directories",
  },
  pwd: {
    output: "/home/guest/matty.lol",
    description: "Print working directory",
  },
  date: {
    output: new Date().toString(),
    description: "Show current date",
  },
  uptime: {
    output: `up ${Math.floor(Math.random() * 365)} days, ${Math.floor(Math.random() * 24)} hours, ${Math.floor(Math.random() * 60)} minutes`,
    description: "System uptime",
  },
  neofetch: {
    output: `
   ██╗     ██████╗ ██╗
   ██║    ██╔═══██╗██║
   ██║    ██║   ██║██║
   ██║    ██║   ██║██║
   ███████╗╚██████╔╝███████╗
   ╚══════╝ ╚═════╝ ╚══════╝
   
   guest@matty.lol
   ---------------
   OS: WebOS 4.2.0
   Host: Browser v∞
   Shell: Terminal.tsx
   Resolution: ${window.innerWidth}x${window.innerHeight}
   Theme: Cyberpunk Neon
   CPU: Neural Net 9000
   Memory: 640KB (enough)`,
    description: "System info",
  },
  hack: {
    output: `Initiating hack sequence...
[▓▓▓▓▓▓▓▓▓▓] 100%
ACCESS GRANTED
Just kidding, this is a portfolio site 😄`,
    description: "Initiate hack sequence",
  },
  matrix: {
    output: `Wake up, Neo...
The Matrix has you...
Follow the white rabbit.
Knock, knock.`,
    description: "Enter the matrix",
  },
  coffee: {
    output: `Brewing coffee...
   (  )  (
    )  (  )
  ........
  |      |]
  \\      /
   '----'
   
☕ Coffee ready! +1 productivity`,
    description: "Brew some coffee",
  },
  sudo: {
    output: `[sudo] password for guest: ********
Sorry, user guest is not in the sudoers file.
This incident will be reported. 🚨`,
    description: "Try to gain root access",
  },
  exit: {
    output: "Goodbye! 👋",
    description: "Close terminal",
  },
};

interface TerminalCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

const TerminalCommand = ({ isOpen, onClose }: TerminalCommandProps) => {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (!trimmedCmd) return;

    if (trimmedCmd === "clear") {
      setHistory([]);
      return;
    }

    if (trimmedCmd === "exit") {
      setHistory([...history, { command: cmd, output: COMMANDS.exit.output }]);
      setTimeout(onClose, 1000);
      return;
    }

    const commandDef = COMMANDS[trimmedCmd];
    
    if (commandDef) {
      setHistory([
        ...history,
        { command: cmd, output: commandDef.output },
      ]);
    } else {
      setHistory([
        ...history,
        { 
          command: cmd, 
          output: `bash: ${trimmedCmd}: command not found. Type 'help' for available commands.`,
          isError: true 
        },
      ]);
    }

    setCommandHistory([...commandHistory, cmd]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-card border border-primary neon-border"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-accent" />
                <div className="w-3 h-3 rounded-full bg-secondary" />
              </div>
              <span className="text-xs text-muted-foreground">guest@matty.lol:~</span>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            {/* Terminal Body */}
            <div
              ref={terminalRef}
              className="h-80 overflow-y-auto p-4 font-mono text-sm"
              onClick={() => inputRef.current?.focus()}
            >
              {/* Welcome message */}
              <div className="text-secondary mb-4">
                Welcome to matty.lol terminal!
                <br />
                Type <span className="text-primary">'help'</span> to see available commands.
              </div>

              {/* Command history */}
              {history.map((entry, index) => (
                <div key={index} className="mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-secondary">guest@matty.lol:~$</span>
                    <span className="text-foreground">{entry.command}</span>
                  </div>
                  <pre
                    className={`whitespace-pre-wrap pl-4 mt-1 ${
                      entry.isError ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {entry.output}
                  </pre>
                </div>
              ))}

              {/* Current input */}
              <div className="flex items-center gap-2">
                <span className="text-secondary">guest@matty.lol:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-foreground outline-none caret-primary"
                  spellCheck={false}
                  autoComplete="off"
                />
                <span className="cursor-blink text-primary">▊</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TerminalCommand;
