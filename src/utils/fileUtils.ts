export function getFileName(filePath: string | undefined): string {
  if (!filePath) {
    return "No file selected";
  }
  return filePath.replace(/\\/g, "/").split("/").pop() || "No file selected";
}
