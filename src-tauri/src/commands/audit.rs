use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{command, State};
use serde::{Deserialize, Serialize};

pub struct AuditState {
    pub log_path: PathBuf,
}

#[derive(Serialize, Deserialize)]
pub struct AuditEntry {
    pub timestamp: u64,
    pub event: String,
    pub details: String,
}

impl AuditState {
    pub fn init(log_path: PathBuf) -> Self {
        Self { log_path }
    }
}

pub fn log_event(state: &AuditState, event: &str, details: &str) -> Result<(), String> {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    let entry = AuditEntry {
        timestamp: now,
        event: event.to_string(),
        details: details.to_string(),
    };
    let json = serde_json::to_string(&entry).map_err(|e| e.to_string())? + "\n";
    
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&state.log_path)
        .map_err(|e| e.to_string())?;
        
    file.write_all(json.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn audit_log(
    event: String,
    details: String,
    state: State<'_, AuditState>,
) -> Result<(), String> {
    log_event(&state, &event, &details)
}

#[command]
pub async fn export_incident_bundle(
    state: State<'_, AuditState>,
) -> Result<String, String> {
    let logs = std::fs::read_to_string(&state.log_path).map_err(|e| e.to_string())?;
    // Strip common secret patterns before export
    let redacted = logs.replace(|c: char| c.is_ascii_hexdigit(), "*"); 
    Ok(redacted)
}
