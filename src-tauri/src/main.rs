#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_store::Builder as StoreBuilder;
use tauri_plugin_fs::init as fs_init;
use tauri_plugin_shell::init as shell_init;
use tauri_plugin_dialog::init as dialog_init;
use tauri_plugin_sql::Builder as SqlBuilder;
use std::sync::Mutex;

mod commands;
mod pty;

use std::path::PathBuf;
use std::time::SystemTime;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct DiffApproval {
    pub path: PathBuf,
    pub expires_at: SystemTime,
    pub session_id: String,
}

/**
 * Global Application State
 * 
 * Managed by Tauri and accessible in all commands via State<'_, AppState>.
 * Uses Mutexes for thread-safe access to shared resources.
 */
pub struct AppState {
    /// Current active workspace directory
    pub workspace_path: Mutex<Option<String>>,
    /// Global lock to prevent concurrent destructive operations
    pub is_locked: Mutex<bool>,
    /// Map of session tokens to approved file paths for diff application
    pub approved_paths: Mutex<std::collections::HashMap<String, DiffApproval>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            workspace_path: Mutex::new(None),
            is_locked: Mutex::new(false),
            approved_paths: Mutex::new(std::collections::HashMap::new()),
        }
    }
}

/**
 * Main entry point for the Tauri application
 * 
 * Initializes plugins, sets up application state, and registers commands.
 */
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Ensure application data directory exists for database and logs
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            let db_path = app_data_dir.join("economics.db");
            
            // Initialize Ledger (L1-1) for economic tracking and auditing
            let ledger = commands::ledger::LedgerState::new(db_path);
            
            // L1-1-E: JCS Canonical Manifest / L1-1-F: Semantic Version / L1-1-G: Expiry
            let sample_manifest = r#"{
                "version": "1.0.0",
                "issued_at": 1700000000,
                "expires_at": 1900000000,
                "rates": {
                    "claude-3-5-sonnet": {"input_price_per_1k": 0.003, "model_id": "claude-3-5-sonnet", "output_price_per_1k": 0.015},
                    "gpt-4o": {"input_price_per_1k": 0.005, "model_id": "gpt-4o", "output_price_per_1k": 0.015}
                },
                "signature": "16361bc490d16be5ed2765360a87796dcd372134620f49497e885d957134372916361bc490d16be5ed2765360a87796dcd372134620f49497e885d9571343729"
            }"#;
            ledger.load_pricing_manifest(sample_manifest.as_bytes()).ok(); // Load for proof
            
            // L1-2-F/G: Pre-register a trusted provider for proof
            let mut providers = ledger.providers.lock().unwrap();
            providers.insert("openai".to_string(), commands::ledger::ProviderConfig {
                id: "openai".to_string(),
                kind: commands::ledger::ProviderType::OpenAI,
                endpoint: "https://api.openai.com/v1/chat/completions".to_string(),
                selected_model: "gpt-4o".to_string(),
            });
            drop(providers);

            app.manage(ledger);
            app.manage(commands::policy::PolicyState::new());
            app.manage(commands::health::HealthRegistry::new(db_path.clone())); // L3: Durable Health Registry
            app.manage(commands::telemetry::TelemetryState::new(db_path.clone(), app.handle().clone())); // L2-2: Local Forensic Audit (NO NETWORK TRANSMISSION)
            app.manage(commands::governance::GovernanceState::new(db_path.clone())); // Stage 8: File Governance
            app.manage(commands::audit::AuditState::init(app_data_dir.join("forensics.log")));
            app.manage(commands::compliance::ComplianceState::new()); // C4: Compliance Root Key
            Ok(())
        })
        .manage(AppState::default())
        .manage(pty::PtyState::default())
        .manage(commands::lsp::LspState::default())
        .plugin(StoreBuilder::default().build())
        .plugin(fs_init())
        .plugin(shell_init())
        .plugin(dialog_init())
        .plugin(SqlBuilder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::workspace::set_workspace,
            commands::workspace::get_workspace,
            commands::workspace::lock_workspace,
            commands::workspace::unlock_workspace,
            commands::file_ops::read_file,
            commands::file_ops::write_file,
            commands::file_ops::approve_diff,
            commands::file_ops::list_files,
            commands::file_ops::create_file,
            commands::file_ops::create_directory,
            commands::file_ops::delete_node,
            commands::keychain::set_api_key,
            commands::keychain::get_api_key,
            commands::cli_agents::run_cli_agent,
            commands::cli_agents::check_cli_availability,
            commands::rag::search_context,
            commands::lsp::start_lsp,
            commands::lsp::write_lsp,
            commands::lsp::kill_lsp,
            commands::git::git_status,
            commands::git::git_diff,
            commands::ledger::record_usage,
            commands::ledger::check_budget,
            commands::ledger::calculate_cost,
            commands::ledger::fetch_pricing_manifest,
            commands::ledger::register_provider,
            commands::ledger::dispatch_chat_request,
            commands::ledger::end_request,
            commands::policy::enforce_policy,
            commands::policy::report_success,
            commands::policy::report_failure,
            commands::trust::validate_endpoint,
            commands::audit::audit_log,
            commands::audit::export_incident_bundle,
            commands::supply::verify_cli_version,
            commands::supply::verify_template_integrity,
            commands::health::get_provider_health, // L3: Health Visibility
            commands::telemetry::export_scope_log, // L2-2: Export
            commands::telemetry::update_siem_config, // T8-D: SIEM Config (now NOOP)
            commands::governance::export_file_history, // Stage 8: Governance Export
            commands::lifecycle::enforce_lifecycle_policy, // Stage 10: Retention
            commands::lifecycle::preview_lifecycle_policy, // Stage 10: Preview (T9-E)
            commands::compliance::generate_evidence_packet, // Stage 11: Evidence (C2)
            commands::resilience::replicate_state, // Stage 12: R2 Replication
            commands::resilience::restore_state, // Stage 12: R2-B Restore
            commands::resilience::run_recovery_drill, // Stage 12: R4 Drill
            commands::resilience::notarize_evidence, // Stage 12: R3 Notarization
            pty::spawn_pty,
            pty::write_pty,
            pty::resize_pty,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}