use std::process::Command;
use serde_json::Value;
use tauri::command;

#[command]
pub async fn verify_cli_version(
    agent_name: String,
    min_version: String,
) -> Result<String, String> {
    let output = Command::new(&agent_name)
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to detect {}: {}", agent_name, e))?;
        
    let version_str = String::from_utf8_lossy(&output.stdout).to_string();
    
    // Simple version check (Enterprise would use semver)
    if !version_str.contains(&min_version) {
        return Err(format!("Supply Chain Block: {} version too low. Min required: {}", agent_name, min_version));
    }
    
    Ok(version_str)
}

#[command]
pub async fn verify_template_integrity(
    template_id: String,
    template_json: String,
    expected_checksum: String,
) -> Result<(), String> {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    template_json.hash(&mut hasher);
    let checksum = format!("{:x}", hasher.finish());
    
    if checksum != expected_checksum {
        return Err(format!("Supply Chain Block: Template {} integrity failure", template_id));
    }
    
    Ok(())
}
