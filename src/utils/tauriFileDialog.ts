import { open } from "@tauri-apps/plugin-dialog";

export async function selectFile() {
  return await open({
    multiple: false,
    directory: false,
  });
}

export async function selectDirectory() {
  return await open({
    multiple: false,
    directory: true,
  });
}
