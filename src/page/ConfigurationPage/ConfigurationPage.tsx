import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getDirPath, updateDirPath } from "@/utils/dirPath";
import { selectDirectory } from "@/utils/tauriFileDialog";
import { invoke } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";

export default function ConfigurationPage() {
  const [dirPath, setDirPath] = useState<string>("");
  const [sshKeys, setSSHKeys] = useState<string[]>([]);

  useEffect(() => {
    const fetchDirPath = async () => {
      const appDirPath = await getDirPath();
      if (appDirPath) {
        setDirPath(appDirPath);
      }
    };
    fetchDirPath();
  }, []);

  const onClickAddkey = async () => {
    try {
      const keyName = "id_rsa_new";
      const passphrase = "";
      const comment = "your_email@example.com";
      const message = await invoke("generate_ssh_key", {
        keyName,
        passphrase,
        comment,
      });
      alert(message);
    } catch (error) {
      console.error("Error generating SSH key:", error);
    }
  };

  useEffect(() => {
    const fetchSSHKeys = async () => {
      if (!dirPath) return;
      const entries = await readDir(dirPath);
      const sshKeys = entries
        .filter(
          (entry) =>
            entry.name.includes("id_rsa") && !entry.name.endsWith(".pub")
        )
        .map((entry) => entry.name);
      setSSHKeys(sshKeys);
      console.log(sshKeys);
    };
    fetchSSHKeys();
  }, [dirPath]); //TODO: Trigger when new keys is added

  const handleSelectFile = async () => {
    const newDirPath = await selectDirectory();
    if (newDirPath) {
      // Set the selected file path in the form field
      await updateDirPath(newDirPath);
      setDirPath(newDirPath);
    } else {
      console.log("No file selected");
    }
  };

  return (
    <div className="p-4">
      <Label className="text-xl">Setting</Label>
      <Separator orientation="horizontal" className="my-4" />

      <div>
        <Label>File Directory</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={dirPath}
            readOnly
            placeholder="Select a file"
            className="w-80 pointer-events-none"
          />
          <Button onClick={handleSelectFile}>Browse</Button>
        </div>
      </div>

      <div className="pt-5">
        <Label>SSH Keys</Label>
        <div className="flex flex-col space-y-2">
          {sshKeys.map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <Input
                type="text"
                value={key}
                readOnly
                placeholder="Select a file"
                className="w-80 pointer-events-none"
              />
            </div>
          ))}
        </div>

        <Button className="mt-5" onClick={onClickAddkey}>
          Add Key
        </Button>
      </div>
    </div>
  );
}
