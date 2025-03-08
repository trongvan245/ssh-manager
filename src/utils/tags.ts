import { Host } from "@/types";
import { load } from "@tauri-apps/plugin-store";

export async function saveTags(tags: string[], host: Host) {
  const store = await load("tags.json", { autoSave: false });
  await store.set(host.host, tags);
  await store.save();
}

export async function getTags(host: Host): Promise<string[]> {
  const store = await load("tags.json", { autoSave: false });
  return (await store.get(host.host)) ?? [];
}

export async function getTagsList(): Promise<string[]> {
  const store = await load("tags.json", { autoSave: false });
  const hostwithTags = await store.entries();
  const tags = hostwithTags.map(([_, tags]) => tags);
  const tagsList = tags.flat();
  return tagsList as unknown as string[];
  // return store.keys();
}
