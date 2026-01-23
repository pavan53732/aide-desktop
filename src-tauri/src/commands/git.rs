use tauri::command;
use std::process::Command;
use std::collections::HashMap;

#[command]
pub async fn git_status(workspace_path: String) -> Result<HashMap<String, String>, String> {
    let output = Command::new("git")
        .args(&["status", "--porcelain"])
        .current_dir(&workspace_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut status_map = HashMap::new();

    for line in stdout.lines() {
        if line.len() > 3 {
            let status = &line[0..2];
            let path = &line[3..];
            status_map.insert(path.to_string(), status.to_string());
        }
    }

    Ok(status_map)
}

#[command]
pub async fn git_diff(workspace_path: String, file_path: String) -> Result<String, String> {
    let output = Command::new("git")
        .args(&["diff", "--", &file_path])
        .current_dir(&workspace_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

     if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
