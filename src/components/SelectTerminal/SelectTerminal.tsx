import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTerminal } from "@/hooks/TerminalContext";

export default function SelectTerminal() {
  const { terminal, setTerminal, terminals } = useTerminal();

  return (
    <Select
      value={terminal}
      onValueChange={(value) => {
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
