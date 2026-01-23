use serde::{Deserialize, Serialize};
use tauri::{State, command};

#[command]
pub async fn set_api_key(
    key: String,
    service: String,
    account: String,
) -> Result<(), String> {
    let keyring = keyring::Entry::new(&service, &account)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;
    
    keyring.set_password(&key)
        .map_err(|e| format!("Failed to store API key: {}", e))?;
    
    Ok(())
}

#[command]
pub async fn get_api_key(
    service: String,
    account: String,
) -> Result<String, String> {
    let keyring = keyring::Entry::new(&service, &account)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;
    
    keyring.get_password()
        .map_err(|e| format!("Failed to retrieve API key: {}", e))
}

// Helper function to get service name for a provider
pub fn get_service_name(provider_id: &str) -> String {
    format!("aide-desktop-{}", provider_id)
}
