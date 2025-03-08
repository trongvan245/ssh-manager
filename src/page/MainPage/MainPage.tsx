import { SSHCard } from "@/components/SSHCard";
import { Host } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import ButtonAddHost from "./ButtonAddHost";
import { getDirPath } from "@/utils/dirPath";
import SelectTerminal from "@/components/SelectTerminal/SelectTerminal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ListHost from "./ListHost";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ArrowDownUp, List, Menu, Monitor, Tag } from "lucide-react";
import { getTags, saveTags } from "@/utils/tags";
import TagSelector from "@/components/SelectTag/SelectTag";
import { getLastConnect } from "@/utils/getLastConnect";

export default function MainPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [hostsWithTags, setHostsWithTags] = useState<Host[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [mode, setMode] = useState("Large Icon");

  useEffect(() => {
    setHostsWithTags(
      hosts.filter((host) => {
        if (tags.length === 0) return true;
        return tags.every((tag) => host.tags?.includes(tag));
      })
    );
  }, [tags, hosts]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const dirPath = await getDirPath();
        const hosts = await invoke<Host[]>("read_ssh_config", {
          path: dirPath + "/config",
        });
        const hostWithTags = await Promise.all(
          hosts.map(async (host) => {
            const tags = await getTags(host);
            const last_connect = await getLastConnect(host);
            return { ...host, tags, last_connect };
          })
        );
        setHosts(hostWithTags);
        setHostsWithTags(hostWithTags);
      } catch (error) {
        console.error("Failed to read SSH config:", error);
      }
    };

    fetchConfig();
  }, []);

  console.log(hosts);

  const addHost = async (host: Host) => {
    const newHosts = [...hosts, host];
    setHosts(newHosts);

    try {
      const dirPath = await getDirPath();
      await invoke("write_ssh_config", {
        hosts: newHosts,
        path: dirPath + "/",
      });
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };

  const deleteHost = async (host?: string) => {
    const newHosts = hosts.filter((h) => h.host !== host);
    setHosts(newHosts);

    try {
      const dirPath = await getDirPath();
      await invoke("write_ssh_config", {
        hosts: newHosts,
        path: dirPath + "/config",
      });
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };

  const updateHost = async (index: number, updatedHost: Host) => {
    const newHosts = [...hosts];
    newHosts[index] = updatedHost;
    try {
      const dirPath = await getDirPath();
      await invoke("write_ssh_config", {
        hosts: newHosts,
        path: dirPath + "/config",
      });
      const tags = updatedHost.tags;
      if (tags) {
        await saveTags(tags, updatedHost);
      }

      setHosts(newHosts);
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };

  return (
    <div>
      <div className="w-full pb-2 flex justify-between px-5">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>
              <Menu />
              <div>View</div>
            </MenubarTrigger>
            <MenubarContent style={{ minWidth: "200px" }}>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(value) => value && setMode(value)}
                style={{ justifyContent: "start" }}
              >
                <ToggleGroupItem value="Large Icon" aria-label="Toggle bold">
                  <Monitor />
                  <div>Large Icon</div>
                </ToggleGroupItem>

                <ToggleGroupItem value="Smaller Icon" aria-label="Toggle bold">
                  <Monitor scale={0.5} />
                  <div>Smaller Icon</div>
                </ToggleGroupItem>

                <ToggleGroupItem value="List" aria-label="Toggle italic">
                  <List />
                  <div>List</div>
                </ToggleGroupItem>
              </ToggleGroup>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>
              <ArrowDownUp />
              <div>Sort</div>
            </MenubarTrigger>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>
              <ButtonAddHost addHost={addHost} />
            </MenubarTrigger>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>
              <Tag />
            </MenubarTrigger>

            <MenubarContent>
              <TagSelector tags={tags} setTags={setTags} />
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <SelectTerminal />
      </div>
      {mode === "Large Icon" && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {hostsWithTags
            .filter((host) => {
              if (tags.length === 0) return true;
              return tags.every((tag) => host.tags?.includes(tag));
            })
            .map((host, index) => (
              <SSHCard
                key={index}
                host={host}
                updateHost={(updatedHost) => updateHost(index, updatedHost)}
                deleteHost={() => deleteHost(host.host)}
              />
            ))}
        </div>
      )}

      <div className="w-2/3">
        {mode === "List" && (
          <ListHost
            hosts={hosts}
            updateHost={(updatedHost) => updateHost(index, updatedHost)}
            deleteHost={() => deleteHost(host.host)}
          />
        )}
      </div>
    </div>
  );
}
