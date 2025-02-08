import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface Props {
  setTerminal: (terminal: string) => void;
}

type Terminal = {
  name: string;
  command: string;
};

export default function SelectTerminal({ setTerminal }: Props) {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<string>("");

  useEffect(() => {
    async function fetchTerminals() {
      try {
        const result: [string, string][] = await invoke(
          "get_installed_terminals"
        );
        const formattedTerminals = result.map(([name, command]) => ({
          name,
          command,
        }));
        console.log(formattedTerminals);
        setTerminals(formattedTerminals);

        // Set default value after fetching terminals
        if (formattedTerminals.length > 0) {
          setSelectedTerminal(formattedTerminals[0].command);
          setTerminal(formattedTerminals[0].command);
        }
      } catch (error) {
        console.error("Failed to fetch terminals:", error);
      }
    }

    fetchTerminals();
  }, []);
  return (
    <Select
      value={selectedTerminal}
      onValueChange={(value) => {
        setSelectedTerminal(value);
        setTerminal(value);
      }}
    >
      <SelectTrigger className="w-[180px] ring-0 focus:ring-0 focus:outline-none">
        <SelectValue placeholder="Select terminal" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {terminals.map((terminal) => (
            <SelectItem value={terminal.command}>{terminal.name}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
