import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface Terminal {
  name: string;
  command: string;
}

interface TerminalContextProps {
  terminal: string;
  setTerminal: (terminal: string) => void;
  terminals: Terminal[];
}

const TerminalContext = createContext<TerminalContextProps | undefined>(
  undefined
);

export const TerminalProvider = ({ children }: { children: ReactNode }) => {
  const [terminal, setTerminal] = useState("ssh");
  const [terminals, setTerminals] = useState<Terminal[]>([]);

  const fetchTerminals = async () => {
    try {
      const result: [string, string][] = await invoke(
        "get_installed_terminals"
      );
      const formattedTerminals = result.map(([name, command]) => ({
        name,
        command,
      }));
      setTerminals(formattedTerminals);

      // Set default value after fetching terminals
      if (formattedTerminals.length > 0) {
        setTerminal(formattedTerminals[0].command);
      }
    } catch (error) {
      console.error("Failed to fetch terminals:", error);
    }
  };

  useEffect(() => {
    fetchTerminals();
  }, []);

  return (
    <TerminalContext.Provider value={{ terminal, setTerminal, terminals }}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }
  return context;
};
