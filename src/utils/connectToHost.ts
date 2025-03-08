import { invoke } from "@tauri-apps/api/core";

export const connectToHost = async (host: string, terminal: string) => {
  try {
    await invoke("handle_connect", { host, terminal });
  } catch (error) {
    console.error("Failed to connect via SSH:", error);
  }
};
