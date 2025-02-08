import { BaseDirectory, readFile, writeFile } from "@tauri-apps/plugin-fs";

export const getAvatar = async (host: string): Promise<File | null> => {
  const filePath = `${host}.png`; // Avatar filename
  try {
    // Read the binary file from AppData
    const fileData = await readFile(filePath, {
      baseDir: BaseDirectory.AppData,
    });

    // Convert Uint8Array to Blob
    const blob = new Blob([fileData], { type: "image/png" });

    // Convert Blob to File
    const file = new File([blob], `${host}.png`, { type: "image/png" });

    return file;
  } catch (error) {
    return null; // Return null if file not found or an error occurs
  }
};

export const uploadAvatar = async (host: string, file: File) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    if (!e.target || !e.target.result) return;

    const fileData = new Uint8Array(e.target.result as ArrayBuffer);
    const filePath = `${host}.png`;

    // Save the file using Tauri's filesystem plugin
    await writeFile(filePath, new Uint8Array(fileData), {
      baseDir: BaseDirectory.AppData,
    });

    console.log("Avatar uploaded:", filePath);
  };

  reader.readAsArrayBuffer(file);
};
