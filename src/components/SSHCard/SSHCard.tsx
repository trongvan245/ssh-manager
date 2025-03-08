import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Host } from "@/types";
import defaultTerminalImg from "../../assets/default_terminal.png";
import { useEffect, useState } from "react";
import { useTerminal } from "@/hooks/TerminalContext";
import { connectToHost } from "@/utils/connectToHost";
import { EditHostDialog } from "../EditHostDialog/EditHostDialog";
import { Badge } from "../ui/badge";
import { getAvatar } from "@/utils/file";

interface SSHCardProps {
  host: Host;
  updateHost: (updateHost: Host) => void;
  deleteHost: () => void;
}

export function SSHCard({ host, updateHost, deleteHost }: SSHCardProps) {
  const { terminal } = useTerminal();

  const handleConnect = async () => {
    await connectToHost(host.host, terminal);
  };

  const [image_url, setImageUrl] = useState(defaultTerminalImg);

  useEffect(() => {
    const checkAvatarExists = async () => {
      const avatar = host.host ? await getAvatar(host.host) : null;
      console.log("avatar", host.host, avatar);

      if (avatar) {
        setImageUrl(URL.createObjectURL(avatar));
      }
    };

    checkAvatarExists();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center p-2">
        <Avatar className="w-24 h-24 sm:w-30 sm:h-30 md:w-36 md:h-36 lg:w-40 lg:h-40">
          <AvatarImage
            src={image_url}
            alt="@shadcn"
            className="w-full h-full object-contain"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <CardTitle>{host.host}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-2 justify-end h-5">
          {host.tags?.map((tag, index) => (
            <Badge key={index} className="bg-gray-200 px-2 py-1 rounded">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex flex-row justify-between">
          <p>IP</p> <p>{host.hostname}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>User</p> <p>{host.user}</p>
        </div>
        <div className="flex flex-row justify-between ">
          <p>Key</p>
          <p className="truncate w-3/5 text-right">
            {host.identity_file
              ? host.identity_file.replace(/\\/g, "/").split("/").pop()
              : "No file selected"}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <EditHostDialog
          host={host}
          updateHost={updateHost}
          deleteHost={deleteHost}
          setImageUrl={setImageUrl}
          avatarURL={image_url}
        />
        <Button onClick={handleConnect}>Connect</Button>
      </CardFooter>
    </Card>
  );
}
