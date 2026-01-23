use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Stdio;
use tauri::{State, command};

use tokio::io::{AsyncReadExt, AsyncWriteExt};

use super::AppState;
use tokio::process::Command as TokioCommand;
use std::time::Duration;

use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
pub struct CLIAgentConfig {
    pub id: String,
    pub name: String,
    pub command: String,
    pub working_directory: Option<String>,
    pub environment_vars: Option<HashMap<String, String>>,
    pub flags: Option<Vec<String>>,
}

const ALLOWED_BINARIES: &[&str] = &[
    "aider", "gpt-engineer", "goose", "gh", "gemini", "opencode", 
    "blackbox", "crush", "codex", "claude-code", "warp", "droid"
];
const MAX_OUTPUT_SIZE: usize = 1024 * 1024; // 1MB
const EXECUTION_TIMEOUT_MS: u64 = 60_000; // 60s

#[command]
pub async fn run_cli_agent(
    agent_command: String,
    args: Vec<String>,
    working_dir: String,
    env_vars: HashMap<String, String>,
    input: Option<String>,
    state: State<'_, super::AppState>,
    ledger: State<'_, super::ledger::LedgerState>, // L1-2-A: Trusted Ledger Access
    app: tauri::AppHandle,
) -> Result<String, String> {
    // L1-2-A: System-Driven Context Creation
    // The backend decides the identity of the process being launched.
    // This session_id is a one-shot token needed for subsequent record_usage.
    let provider_id = format!("cli:{}", agent_command);
    let model_id = "agent-v1".to_string(); // Inferred from system policy
    let session_id = ledger.create_request_context(provider_id.clone(), model_id.clone());

    // P1: Audit Log
    let _ = super::audit::audit_log(
        "CLI_EXEC".into(), 
        format!("session: {}, cmd: {}, args: {:?}", session_id, agent_command, args),
        app.state()
    ).await;
    // 1. Binary Allowlist Check
    if !ALLOWED_BINARIES.contains(&agent_command.as_str()) {
        return Err(format!("Security Block: '{}' is not in the allowed binaries list", agent_command));
    }

    // 2. Workspace Safety & Canonicalization
    let workspace_path = state.workspace_path.lock().unwrap().clone().ok_or("No workspace set")?;
    let workspace_canonical = std::fs::canonicalize(&workspace_path).map_err(|e| e.to_string())?;
    
    let full_working_dir = if Path::new(&working_dir).is_absolute() {
        PathBuf::from(&working_dir)
    } else {
        Path::new(&workspace_path).join(&working_dir)
    };
    let canonical_working_dir = std::fs::canonicalize(&full_working_dir).map_err(|e| e.to_string())?;

    if !canonical_working_dir.starts_with(&workspace_canonical) {
        return Err("CLI sandbox violation".into());
    }

    // 3. Execution with Strict Isolation and Limits
    let mut cmd = TokioCommand::new(&agent_command);
    cmd.args(&args)
       .current_dir(&canonical_working_dir)
       .env_clear() // CRITICAL: Prevent secret leakage from parent
       .stdout(Stdio::piped())
       .stderr(Stdio::piped())
       .stdin(Stdio::piped());

    for (k, v) in env_vars { cmd.env(k, v); }

    let mut child = cmd.spawn().map_err(|e| e.to_string())?;
    
    if let Some(in_str) = input {
        if let Some(mut stdin) = child.stdin.take() {
            let _ = tokio::io::AsyncWriteExt::write_all(&mut stdin, in_str.as_bytes()).await;
        }
    }

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    let mut output = Vec::new();
    let mut err_output = Vec::new();

    // Stream with Byte Cap
    let run = async {
        let mut stdout_reader = tokio::io::BufReader::new(stdout);
        let mut stderr_reader = tokio::io::BufReader::new(stderr);
        let mut buf = [0u8; 1024];

        loop {
            tokio::select! {
                res = stdout_reader.read(&mut buf) => {
                    let n = res.map_err(|e| e.to_string())?;
                    if n == 0 { break; }
                    output.extend_from_slice(&buf[..n]);
                    if output.len() > MAX_OUTPUT_SIZE { return Err("Output limit exceeded (1MB)".into()); }
                }
                res = stderr_reader.read(&mut buf) => {
                    let n = res.map_err(|e| e.to_string())?;
                    if n == 0 { break; }
                    err_output.extend_from_slice(&buf[..n]);
                    if err_output.len() > MAX_OUTPUT_SIZE { return Err("Error output limit exceeded (1MB)".into()); }
                }
            }
        }
        child.wait().await.map_err(|e| e.to_string())
    };

    match tokio::time::timeout(Duration::from_millis(EXECUTION_TIMEOUT_MS), run).await {
        Ok(Ok(status)) => {
            if status.success() {
                Ok(String::from_utf8_lossy(&output).into())
            } else {
                Err(String::from_utf8_lossy(&err_output).into())
            }
        }
        Ok(Err(e)) => {
            let _ = child.kill().await; // Kill on error (e.g. byte cap)
            Err(e)
        }
        Err(_) => {
            let _ = child.kill().await; // Kill on timeout
            Err("Execution timed out (60s)".into())
        }
    }
}

#[command]
pub async fn check_cli_availability(command: String) -> Result<bool, String> {
    let result = Command::new("which") // Unix
        .arg(&command)
        .output();

    // Fallback for Windows
    #[cfg(target_os = "windows")]
    let result = Command::new("where")
        .arg(&command)
        .output();

    match result {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}

#[command]
pub async fn get_cli_agent_info(agent_id: String) -> Result<CLIAgentConfig, String> {
    // This would return configuration for known CLI agents
    // For now, return a basic config
    Ok(CLIAgentConfig {
        id: agent_id,
        name: agent_id.clone(),
        command: agent_id,
        working_directory: None,
        environment_vars: None,
        flags: None,
    })
}
