import { SSHCard } from "@/components/SSHCard";
import { Host } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import ButtonAddHost from "./ButtonAddHost";

export default function MainPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  console.log("im in mainpage");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const result = await invoke<Host[]>("read_ssh_config");
        setHosts(result);
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
      await invoke("write_ssh_config", { hosts: newHosts });
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };

  const deleteHost = async (index: number) => {
    const newHosts = [...hosts];
    newHosts.splice(index, 1);
    setHosts(newHosts);

    try {
      await invoke("write_ssh_config", { hosts: newHosts });
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };

  const updateHost = async (index: number, updatedHost: Host) => {
    const newHosts = [...hosts];
    newHosts[index] = updatedHost;
    setHosts(newHosts);

    try {
      await invoke("write_ssh_config", { hosts: newHosts });
    } catch (error) {
      console.error("Failed to write SSH config:", error);
    }
  };
  return (
    <div>
      <ButtonAddHost addHost={addHost} />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {hosts.map((host, index) => (
          <SSHCard
            host={host.host}
            hostname={host.hostname}
            user={host.user}
            updateHost={(updatedHost) => updateHost(index, updatedHost)}
            deleteHost={() => deleteHost(index)}
            identity_file={host.identity_file}
          />
        ))}
      </div>
    </div>
  );
}
