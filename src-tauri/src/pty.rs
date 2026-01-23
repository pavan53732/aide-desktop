use portable_pty::{native_pty_system, CommandBuilder, PtyPair, PtySize};
use std::{
    collections::HashMap,
    io::{Read, Write},
    sync::{Arc, Mutex},
    thread,
};
use tauri::{AppHandle, Emitter, Manager};

pub struct PtyState {
    pub ptys: Arc<Mutex<HashMap<String, PtyPair>>>,
}

impl Default for PtyState {
    fn default() -> Self {
        Self {
            ptys: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[tauri::command]
pub fn spawn_pty(
    app: AppHandle,
    state: tauri::State<PtyState>,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let pty_system = native_pty_system();

    let size = PtySize {
        rows,
        cols,
        pixel_width: 0,
        pixel_height: 0,
    };

    let pair = pty_system
        .openpty(size)
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    // Spawn shell (cmd.exe on Windows by default, or powershell)
    let cmd = if cfg!(target_os = "windows") {
        CommandBuilder::new("cmd.exe")
    } else {
        CommandBuilder::new("bash")
    };

    let _child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn command: {}", e))?;

    // Clone reader for thread
    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;
    let id_clone = id.clone();
    
    // store pair
    state.ptys.lock().unwrap().insert(id.clone(), pair);

    // Spawn read thread
    thread::spawn(move || {
        let mut buffer = [0u8; 1024];
        loop {
            match reader.read(&mut buffer) {
                Ok(n) if n > 0 => {
                    let data = String::from_utf8_lossy(&buffer[..n]).to_string();
                    app.emit(&format!("pty-data-{}", id_clone), data).unwrap_or(());
                }
                Ok(_) => break, // EOF
                Err(_) => break, // Error
            }
        }
        // Cleanup?
    });

    Ok(())
}

#[tauri::command]
pub fn write_pty(state: tauri::State<PtyState>, id: String, data: String) -> Result<(), String> {
    let mut ptys = state.ptys.lock().unwrap();
    if let Some(pair) = ptys.get_mut(&id) {
        write!(pair.master, "{}", data).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn resize_pty(
    state: tauri::State<PtyState>,
    id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    let mut ptys = state.ptys.lock().unwrap();
    if let Some(pair) = ptys.get_mut(&id) {
        pair.master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
