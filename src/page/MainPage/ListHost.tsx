import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTerminal } from "@/hooks/TerminalContext";
import { Host } from "@/types";
import { connectToHost } from "@/utils/connectToHost";

const data = [
  {
    id: "1",
    name: "Alice",
    role: "Developer",
    details:
      "Alice specializes in frontend development with React and Tailwind.",
  },
  {
    id: "2",
    name: "Bob",
    role: "Designer",
    details: "Bob is a UI/UX designer with experience in Figma and Adobe XD.",
  },
  {
    id: "3",
    name: "Charlie",
    role: "Manager",
    details: "Charlie oversees project management and team coordination.",
  },
];

interface Props {
  hosts: Host[];
  updateHost: (updateHost: Host) => void;
  deleteHost: () => void;
}

export default function ListHost({ hosts, updateHost, deleteHost }: Props) {
  const { terminal } = useTerminal();

  const handleConnect = async (host: string) => {
    await connectToHost(host, terminal);
  };

  return (
    <div>
      <Accordion type="single" collapsible className="pr-2">
        {hosts.map((host, key) => (
          <AccordionItem value={host.host || String(key)} className="hover">
            <Card className="w-full">
              <AccordionTrigger>
                <CardHeader className="flex flex-row justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div>
                      <Avatar>
                        <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS40pgJvEieHP_cxqZrVAREB72ZO8sdfcG1VQ&s" />
                      </Avatar>
                    </div>
                    <div>
                      <CardTitle>{host.host}</CardTitle>
                      <CardDescription>{host.hostname}</CardDescription>
                    </div>
                  </div>

                  <div>
                    {host.tags?.map((tag, index) => (
                      <Badge key={index}>{tag}</Badge>
                    ))}
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <div>
                  <Button variant="outline">Edit</Button>
                  <Button onClick={() => handleConnect(host.host as string)}>
                    Connect
                  </Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
