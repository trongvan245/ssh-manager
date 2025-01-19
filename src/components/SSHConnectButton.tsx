import { invoke } from "@tauri-apps/api/core";
import React from "react";

interface SSHConnectButtonProps {
  host: string;
}

const SSHConnectButton: React.FC<SSHConnectButtonProps> = ({ host }) => {
  const handleConnect = async () => {
    // console.log(command);
    try {
      await invoke("handle_connect", { host });
    } catch (error) {
      console.error("Failed to connect via SSH:", error);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleConnect();
      }}
      className="mt-2 p-2 bg-green-500 text-white"
    >
      Connect SSH
    </button>
  );
};

export default SSHConnectButton;
