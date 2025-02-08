import { SSHCard } from "@/components/SSHCard";
import { Host } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import ButtonAddHost from "./ButtonAddHost";
import { getDirPath } from "@/utils/dirPath";
import SelectTerminal from "@/components/SelectTerminal/SelectTerminal";

export default function MainPage() {
  const [hosts, setHosts] = useState<Host[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const dirPath = await getDirPath();
        console.log(dirPath);
        const hosts = await invoke<Host[]>("read_ssh_config", {
          path: dirPath + "/config",
        });
        setHosts(hosts);
      } catch (error) {
        console.error("Failed to read SSH config:", error);
      }
    };

    fetchConfig();
  }, []);

  const addHost = async (host: Host) => {
    const newHosts = [...hosts, host];
    setHosts(newHosts);

    try {
      const dirPath = await getDirPath();
      await invoke("write_ssh_config", {
        hosts: newHosts,
        path: dirPath + "/configtest",
      });
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };

  const deleteHost = async (index: number) => {
    const newHosts = [...hosts];
    newHosts.splice(index, 1);
    setHosts(newHosts);

    try {
      const dirPath = await getDirPath();
      await invoke("write_ssh_config", {
        hosts: newHosts,
        path: dirPath + "/configtest",
      });
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };

  const updateHost = async (index: number, updatedHost: Host) => {
    const newHosts = [...hosts];
    newHosts[index] = updatedHost;
    setHosts(newHosts);

    try {
      const dirPath = await getDirPath();
      await invoke("write_ssh_config", {
        hosts: newHosts,
        path: dirPath + "/configtest",
      });
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };

  const [terminal, setTerminal] = useState("ssh");
  return (
    <div>
      <div className="w-full pb-2 flex justify-between px-5">
        <ButtonAddHost addHost={addHost} />
        <SelectTerminal setTerminal={setTerminal} />
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {hosts.map((host, index) => (
          <SSHCard
            key={index}
            host={host.host}
            hostname={host.hostname}
            user={host.user}
            terminal={terminal}
            updateHost={(updatedHost) => updateHost(index, updatedHost)}
            deleteHost={() => deleteHost(index)}
            identity_file={host.identity_file}
          />
        ))}
      </div>
    </div>
  );
}
