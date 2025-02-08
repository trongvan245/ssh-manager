import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import { DraggableButton, Droppable } from "../components";
import SSHConnectButton from "../components/SSHConnectButton";

interface Host {
  Hostname: string;
  User: string;
  IdentityFile: string;
}

const initialHosts: Host[] = [
  { Hostname: "host1", User: "user1", IdentityFile: "file1" },
  { Hostname: "host2", User: "user2", IdentityFile: "file2" },
  { Hostname: "host3", User: "user3", IdentityFile: "file3" },
  { Hostname: "host4", User: "user4", IdentityFile: "file4" },
  { Hostname: "host5", User: "user5", IdentityFile: "file5" },
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over) {
      const oldSlot = Object.keys(items).find(
        (key) => items[key]?.Hostname === active.id
      );
      const newSlot = over.id;

      if (oldSlot !== newSlot) {
        setItems((prev) => {
          const newItems = { ...prev };
          if (oldSlot) {
            newItems[oldSlot] = newItems[newSlot] || null;
          }
          newItems[newSlot] =
            initialHosts.find((host) => host.Hostname === active.id) || null;
          return newItems;
        });
      }
    }
  }

  function resetApp() {
    setItems(initialItems);
  }

  return (
    <div>
      <button onClick={resetApp} className="mb-4 p-2 bg-red-500 text-white">
        Reset
      </button>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4">
          {initialSlots.map((id) => (
            <Droppable key={id} id={id} className="w-32 h-full bg-gray-200 p-2">
              {items[id] ? (
                <DraggableButton
                  key={items[id]?.Hostname}
                  id={items[id]?.Hostname}
                  className="bg-blue-500 p-2 m-1"
                >
                  <div>{items[id]?.Hostname}</div>
                  <div>{items[id]?.User}</div>
                  <div>{items[id]?.IdentityFile}</div>
                  <SSHConnectButton
                    hostname={items[id]?.Hostname}
                    user={items[id]?.User}
                    identityFile={items[id]?.IdentityFile}
                  />
                </DraggableButton>
              ) : (
                <div className="bg-red-500 p-2">Empty</div>
              )}
            </Droppable>
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default App;
