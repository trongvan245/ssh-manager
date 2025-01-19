// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::fs::File;
use std::io::Read;
use std::fs;
use std::process::Command;
use serde::{Serialize, Deserialize};
// use tauri::Manager;
#[derive(Serialize, Deserialize)]
struct Host {
    host: String,
    hostname: String,
    user: String,
    identity_file: Option<String>,
    port: Option<u16>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn handle_connect(host: String) -> Result<(), String> {
    let command = format!("ssh {}", host);
    
    #[cfg(target_os = "windows")]
    {
        Command::new("wt")
            .args(&["new-tab", "cmd", "/K", &command])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

}

#[tauri::command]
async fn read_ssh_config() ->Result<Vec<Host>, String> {
    let path = "C:/Users/ADMIN/.ssh/config";
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;

    
    let mut hosts = Vec::new();
    let mut current_host: Option<Host> = None;

    
    for line in contents.lines() {
        let line = line.trim();
        if line.starts_with("Host ") {
            if let Some(host) = current_host.take() {
                hosts.push(host);
            }
            current_host = Some(Host {
                host: line[5..].to_string(),
                hostname: String::new(),
                user: String::new(),
                identity_file: Some(String::new()),
                port: Some(22),
            });
        } else if let Some(host) = current_host.as_mut() {
            if line.starts_with("HostName ") {
                host.hostname = line[9..].to_string();
            } else if line.starts_with("User ") {
                host.user = line[5..].to_string();
            } else if line.starts_with("IdentityFile ") {
                host.identity_file = Some(line[14..].to_string());
            } else if line.starts_with("Port ") {
                host.port = Some(line[5..].parse().unwrap_or(22));
            }
        }
    }

    if let Some(host) = current_host {
        hosts.push(host);
    }

    Ok(hosts)
}

#[tauri::command]
async fn write_ssh_config(hosts: Vec<Host>) -> Result<(), String> {
  let config_content = hosts.iter().map(|host| {
    let identity_file = host.identity_file.as_deref().unwrap_or("None");
    format!(
      "Host {}\n  HostName {}\n  User {}\n  IdentityFile {}\n",
      host.host, host.hostname, host.user, identity_file
    )
  }).collect::<Vec<String>>().join("\n");

  fs::write("C:/Users/ADMIN/.ssh/configtest", config_content)
    .map_err(|err| format!("Failed to write SSH config: {}", err))
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, handle_connect, read_ssh_config, write_ssh_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
