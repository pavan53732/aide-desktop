use serde::{Deserialize, Serialize};
use tauri::command;
use url::Url;

#[command]
pub async fn validate_endpoint(
    url_str: String,
    provider_type: String, // "cloud" or "local"
) -> Result<(), String> {
    let url = Url::parse(&url_str).map_err(|e| format!("Invalid URL: {}", e))?;

    // N2: TLS Enforcement
    match (url.scheme(), provider_type.as_str()) {
        ("https", _) => (),
        ("http", "local") => (),
        ("http", "cloud") => return Err("Security Block: HTTPS required for cloud providers".into()),
        (s, _) => return Err(format!("Security Block: Scheme {} is prohibited", s)),
    }

    // N1: Endpoint Mutation Protection
    let host = url.host_str().ok_or("No host in URL")?;
    
    // Block localhost and specific internal ranges
    let prohibited_patterns = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "10.",
        "192.168.",
        "172.16.", // Simplified range check
    ];

    for pattern in prohibited_patterns {
        if host.starts_with(pattern) && provider_type != "local" {
            return Err(format!("Security Block: Sensitive endpoint injection detected ({})", host));
        }
    }

    Ok(())
}
