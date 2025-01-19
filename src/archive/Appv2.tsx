import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Draggable, Droppable } from "./components";
import { useEffect, useState } from "react";
import SSHConnectButton from "./components/SSHConnectButton";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "./components/ui/button";
import DashBoard from "./page/dashboard/Dashboard";
import { ThemeProvider } from "./components/theme-provider";

interface Host {
  name?: string;
  hostname: string;
  user?: string;
  identity_file?: string;
  port?: number;
}

const initialHosts: Host[] = [
  { hostname: "host1", user: "user1", identity_file: "file1" },
  { hostname: "host2", user: "user2", identity_file: "file2" },
  { hostname: "host3", user: "user3", identity_file: "file3" },
  { hostname: "host4", user: "user4", identity_file: "file4" },
  { hostname: "host5", user: "user5", identity_file: "file5" },
];

const initialSlots = ["slot1", "slot2", "slot3", "slot4", "slot5"];
const initialItems: { [key: string]: Host | null } = initialSlots.reduce(
  (acc, slot, index) => {
    acc[slot] = initialHosts[index] || null;
    return acc;
  },
  {} as { [key: string]: Host | null }
);

function App() {
  const [items, setItems] = useState<{ [key: string]: Host | null }>(
    initialItems
  );
  const [hosts, setHosts] = useState<Host[]>([]);

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

  console.log(items);
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over) {
      const oldSlot = Object.keys(items).find(
        (key) => items[key]?.hostname === active.id
      );
      const newSlot = over.id;

      if (oldSlot !== newSlot) {
        setItems((prev) => {
          const newItems = { ...prev };
          if (oldSlot) {
            newItems[oldSlot] = newItems[newSlot] || null;
          }
          newItems[newSlot] =
            initialHosts.find((host) => host.hostname === active.id) || null;
          return newItems;
        });
      }
    }
  }

  const getConfig = async () => {
    try {
      const config = await invoke("read_ssh_config");
      console.log(config);
    } catch (error) {
      console.error("Failed to read SSH config:", error);
    }
  };

  function resetApp() {
    setItems(initialItems);
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DashBoard />
    </ThemeProvider>
  );

  return (
    <div>
      <Button onClick={getConfig}>Read Config</Button>
      <Button onClick={resetApp}>Reset</Button>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4">
          {hosts.map((host) => (
            <div key={host.name} className="mb-4 p-2 border">
              <p>
                <strong>Host:</strong> {host.name}
              </p>
              <p>
                <strong>HostName:</strong> {host.hostname}
              </p>
              <p>
                <strong>User:</strong> {host.user}
              </p>
              <p>
                <strong>IdentityFile:</strong> {host.identity_file}
              </p>
              <p>
                <strong>Port:</strong> {host.port}
              </p>
              <SSHConnectButton host={host.name || "defaultHost"} />
            </div>
          ))}
          {/* {initialSlots.map((id) => (
            <Droppable key={id} id={id} className="w-32 h-full bg-gray-200 p-2">
              {items[id] ? (
                <Draggable
                  key={items[id]?.hostname}
                  id={items[id]?.hostname}
                  className="bg-blue-500 p-2 m-1"
                >
                  <div>{items[id]?.hostname}</div>
                  <div>{items[id]?.user}</div>
                  <div>{items[id]?.identityfile}</div>
                  <SSHConnectButton
                    hostname={items[id]?.hostname}
                    user={items[id]?.user}
                    identityFile={items[id]?.identityfile}
                  />
                </Draggable>
              ) : (
                <div className="bg-red-500 p-2">Empty</div>
              )}
            </Droppable>
          ))} */}
        </div>
      </DndContext>
    </div>
  );
}

export default App;
