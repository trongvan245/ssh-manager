import { Host } from "@/types";
import { load } from "@tauri-apps/plugin-store";

export async function saveLastConnect(time: Date, host: Host) {
  const store = await load("last_connect.json", { autoSave: false });
  await store.set(host.host, time);
  await store.save();
}

export async function getLastConnect(host: Host): Promise<Date> {
  const store = await load("last_connect.json", { autoSave: false });
  const last_connect = await store.get(host.host);
  if (!last_connect) {
    const date = new Date();
    await saveLastConnect(date, host);
    return date;
  }
  return new Date(last_connect as string);
}
