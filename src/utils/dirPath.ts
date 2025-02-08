import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";

export const updateDirPath = async (dirPath: string) => {
  const store = await load("store.json");
  const oldDirPath = await store.get<{ value: string }>("dir-path");
  if (oldDirPath) {
    await invoke("disallow_dir", { path: oldDirPath?.value });
  }
  await invoke("allow_dir", { path: dirPath });
  await store.set("dir-path", { value: dirPath });
};

export const getDirPath = async () => {
  const store = await load("store.json");
  const dirPath = await store.get<{ value: string }>("dir-path");
  return dirPath?.value;
};
