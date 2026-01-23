use tauri::{AppHandle, Emitter, State};
use std::process::{Command, Stdio, Child};
use std::sync::{Arc, Mutex};
use std::io::{Read, Write};
use std::collections::HashMap;
use std::thread;

pub struct LspState {
    pub processes: Arc<Mutex<HashMap<u32, Child>>>,
}

impl Default for LspState {
    fn default() -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[tauri::command]
pub async fn start_lsp(
    app: AppHandle,
    state: State<'_, LspState>,
    language: String,
    workspace_path: String,
) -> Result<u32, String> {
    let (cmd, args) = match language.as_str() {
        "typescript" | "typescriptreact" | "javascript" | "javascriptreact" => {
            // Check if on windows, might need .cmd suffix if it's an npm bin
            if cfg!(target_os = "windows") {
                ("typescript-language-server.cmd", vec!["--stdio"])
            } else {
                ("typescript-language-server", vec!["--stdio"])
            }
        },
        "python" => ("pylsp", vec![]),
        "rust" => ("rust-analyzer", vec![]),
        _ => return Err("Unsupported language".into()),
    };

    println!("Starting LSP: {} in {}", cmd, workspace_path);

    let mut child = Command::new(cmd)
        .args(args)
        .current_dir(workspace_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn LSP: {}", e))?;

    let id = child.id();
    let mut stdout = child.stdout.take().ok_or("Failed to open stdout")?;
    let mut stderr = child.stderr.take().ok_or("Failed to open stderr")?;
    
    // Spawn thread to read stdout
    let app_clone = app.clone();
    thread::spawn(move || {
        let mut buffer = [0; 1024];
        loop {
            match stdout.read(&mut buffer) {
                Ok(n) if n > 0 => {
                    let data = buffer[..n].to_vec();
                    // Emit raw bytes? Tauri events support bytes since v2?
                    // Payload must be Serialize. Vec<u8> serializes to array of numbers.
                    let _ = app_clone.emit(&format!("lsp-stdout-{}", id), data);
                }
                _ => break,
            }
        }
        println!("LSP {} stdout closed", id);
        let _ = app_clone.emit(&format!("lsp-exit-{}", id), "stdout closed");
    });

    // Spawn thread to read stderr (logs)
    let app_clone2 = app.clone();
    thread::spawn(move || {
        let mut buffer = [0; 1024];
        loop {
             match stderr.read(&mut buffer) {
                Ok(n) if n > 0 => {
                    let log = String::from_utf8_lossy(&buffer[..n]).to_string();
                    let _ = app_clone2.emit(&format!("lsp-stderr-{}", id), log);
                }
                _ => break,
            }
        }
    });

    state.processes.lock().unwrap().insert(id, child);
    Ok(id)
}

#[tauri::command]
pub async fn write_lsp(
    state: State<'_, LspState>,
    id: u32,
    data: String, 
) -> Result<(), String> {
    // data is expected to be a string (JSON-RPC message)
    // If frontend sends raw bytes, change signature to Vec<u8>
    let mut processes = state.processes.lock().unwrap();
    if let Some(child) = processes.get_mut(&id) {
        if let Some(stdin) = child.stdin.as_mut() {
            stdin.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
            stdin.flush().map_err(|e| e.to_string())?;
            return Ok(());
        }
    }
    Err("LSP process not found or stdin closed".into())
}

#[tauri::command]
pub async fn kill_lsp(
    state: State<'_, LspState>,
    id: u32,
) -> Result<(), String> {
    let mut processes = state.processes.lock().unwrap();
    if let Some(mut child) = processes.remove(&id) {
        child.kill().map_err(|e| e.to_string())?;
    }
    Ok(())
}
