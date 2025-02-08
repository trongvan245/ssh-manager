// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::File;
use std::io::Read;
use std::process::Command;
use which::which;
use reqwest;

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

// #[tauri::command]
// async fn handle_connect(host: String, terminal: String) -> Result<(), String> {
//     let command = format!("ssh {}", host);

//     let fixed_terminals = if cfg!(target_os = "windows") {
//         vec!["wt", "powershell", "cmd"]
//     } else if cfg!(target_os = "macos") {
//         vec!["iTerm.app", "Terminal"]
//     } else {
//         vec!["gnome-terminal", "konsole", "xfce4-terminal", "alacritty", "kitty", "wezterm", "xterm", "tilix"]
//     };

//     if !fixed_terminals.contains(&terminal.as_str()) {
//         return Err(format!("Terminal '{}' is not supported.", terminal));
//     }

//     #[cfg(target_os = "windows")]
//     {
//         if terminal == "wt" {
//             Command::new("wt")
//                 .args(&["new-tab", "cmd", "/K", &command])
//                 .spawn()
//                 .map_err(|e| e.to_string())?;
//         } else if terminal == "powershell" {
//             Command::new("powershell")
//                 .args(&[
//                     "-Command",
//                     &format!(
//                         "Start-Process powershell -ArgumentList '-NoExit -Command {}' -WindowStyle Normal",
//                         command
//                     ),
//                 ])
//                 .spawn()
//                 .map_err(|e| e.to_string())?;
//         } else {
//             Command::new("cmd")
//                 .args(&["/C", "start", "cmd", "/K", &command]) // Ensures new cmd window
//                 .spawn()
//                 .map_err(|e| e.to_string())?;
//         }
//     }

//     #[cfg(target_os = "macos")]
//     {
//         Command::new("osascript")
//             .args(&[
//                 "-e",
//                 &format!(
//                     r#"tell application "{}" to activate
//                     do script "{}" in (make new window)"#,
//                     terminal, command
//                 ),
//             ])
//             .spawn()
//             .map_err(|e| e.to_string())?;
//     }

//     #[cfg(target_os = "linux")]
//     {
//         let terminal_cmd = match terminal.as_str() {
//             "gnome-terminal" => vec!["--window", "--", "bash", "-c", &command],
//             "konsole" => vec!["--new-tab", "-e", "bash", "-c", &command],
//             "xfce4-terminal" => vec!["--window", "-x", "bash", "-c", &command],
//             "alacritty" | "kitty" | "wezterm" => vec!["-e", "bash", "-c", &command],
//             "xterm" | "tilix" => vec!["-e", &command],
//             _ => return Err("Unsupported terminal".to_string()),
//         };

//         Command::new(&terminal)
//             .args(terminal_cmd)
//             .spawn()
//             .map_err(|e| e.to_string())?;
//     }

//     Ok(())
// }

// #[tauri::command]
// fn get_installed_terminals() -> Vec<(String, String)> {
//     let mut terminals = Vec::new();

//     let terminal_map = if cfg!(target_os = "windows") {
//         vec![
//             ("Windows Terminal", "wt"),
//             ("PowerShell", "powershell"),
//             ("Command Prompt", "cmd"),
//         ]
//     } else if cfg!(target_os = "macos") {
//         vec![
//             ("iTerm", "iTerm.app"),
//             ("Terminal", "Terminal"),
//         ]
//     } else {
//         vec![
//             ("GNOME Terminal", "gnome-terminal"),
//             ("Konsole", "konsole"),
//             ("XFCE Terminal", "xfce4-terminal"),
//             ("Alacritty", "alacritty"),
//             ("Kitty", "kitty"),
//             ("WezTerm", "wezterm"),
//             ("XTerm", "xterm"),
//             ("Tilix", "tilix"),
//         ]
//     };

//     for (name, command) in terminal_map {
//         if which(command).is_ok() {
//             terminals.push((name.to_string(), command.to_string()));
//         }
//     }

//     terminals
// }

// #[derive(Deserialize)]
// struct TerminalEntry {
//     name: String,
//     cmd: String,
//     args: Vec<String>,
// }

const GIST_URL: &str = "https://gist.githubusercontent.com/trongvan245/303b7425ab50187c92ea1d8b9acd35b9/raw/terminals.json";
#[tauri::command]
async fn get_installed_terminals() -> Result<Vec<(String, String)>, String> {
    let response = reqwest::get(GIST_URL)
        .await
        .map_err(|e| format!("Failed to fetch terminal list: {}", e))?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse terminal list: {}", e))?;

    let os_key = if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else {
        "linux"
    };

    let terminals = response[os_key]
        .as_array()
        .ok_or("Unsupported OS".to_string())?;

    let mut installed_terminals = Vec::new();
    for entry in terminals {
        let name = entry["name"].as_str().unwrap_or("").to_string();
        let cmd = entry["cmd"].as_str().unwrap_or("").to_string();

        if !name.is_empty() && !cmd.is_empty() && which(&cmd).is_ok() {
            installed_terminals.push((name, cmd));
        }
    }

    Ok(installed_terminals)
}

#[tauri::command]
async fn handle_connect(host: String, terminal: String) -> Result<(), String> {
    let response = reqwest::get(GIST_URL)
        .await
        .map_err(|e| format!("Failed to fetch terminal list: {}", e))?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse terminal list: {}", e))?;

    let os_key = if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else {
        "linux"
    };

    let terminals = response[os_key]
        .as_array()
        .ok_or("Unsupported OS".to_string())?;

    let terminal_entry = terminals.iter().find(|entry| {
        entry["cmd"].as_str().unwrap_or("") == terminal
    });

    if terminal_entry.is_none() {
        return Err(format!("Terminal '{}' is not supported.", terminal));
    }

    let terminal_entry = terminal_entry.unwrap();
    let cmd = terminal_entry["cmd"].as_str().unwrap();
    let args: Vec<String> = terminal_entry["args"]
        .as_array()
        .unwrap()
        .iter()
        .map(|arg| arg.as_str().unwrap().replace("{}", &host))
        .collect();

    Command::new(cmd)
        .args(&args)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn read_ssh_config(path: std::path::PathBuf) -> Result<Vec<Host>, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| e.to_string())?;

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
async fn write_ssh_config(hosts: Vec<Host>, path: std::path::PathBuf) -> Result<(), String> {
    let config_content = hosts
        .iter()
        .map(|host| {
            let identity_file = host.identity_file.as_deref().unwrap_or("None");
            format!(
                "Host {}\n  HostName {}\n  User {}\n  IdentityFile {}\n",
                host.host, host.hostname, host.user, identity_file
            )
        })
        .collect::<Vec<String>>()
        .join("\n");
    
    fs::write(path, config_content)
        .map_err(|err| format!("Failed to write SSH config: {}", err))
}

#[tauri::command]
fn allow_dir(app: tauri::AppHandle, path: std::path::PathBuf) -> Result<(), String> {
    use tauri_plugin_fs::FsExt;

    app.fs_scope()
        .allow_directory(path.parent().unwrap_or(&path), true)
        .map_err(|err| err.to_string())
}

#[tauri::command]
fn disallow_dir(app: tauri::AppHandle, path: std::path::PathBuf) -> Result<(), String> {
    use tauri_plugin_fs::FsExt;

    app.fs_scope()
        .allow_directory(path.parent().unwrap_or(&path), false)
        .map_err(|err| err.to_string())
}

#[tauri::command]
fn generate_ssh_key(key_name: String, passphrase: String, comment: String) -> Result<String, String> {
    let output = Command::new("ssh-keygen")
        .arg("-t").arg("rsa")
        .arg("-b").arg("4096")
        .arg("-N").arg(&passphrase)
        .arg("-C").arg(&comment)  // Add comment here
        .arg("-f").arg(format!("{}/.ssh/{}", std::env::var("HOME").unwrap(), key_name))
        .output();
    
    match output {
        Ok(output) if output.status.success() => Ok("SSH key generated successfully!".to_string()),
        Ok(output) => Err(String::from_utf8_lossy(&output.stderr).to_string()),
        Err(err) => Err(err.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            handle_connect,
            get_installed_terminals,
            read_ssh_config,
            write_ssh_config,
            allow_dir,
            disallow_dir,
            generate_ssh_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
