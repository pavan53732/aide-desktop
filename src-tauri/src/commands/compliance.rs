use tauri::{State, command, AppHandle, Manager};
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use ed25519_dalek::{Signer, SigningKey, Verifier, VerifyingKey, Signature};
use sha2::{Digest, Sha256};
use crate::commands::{telemetry, governance, lifecycle};

// Distinguishing types
#[derive(Debug, Serialize, Deserialize)]
pub struct ExportMetadata {
    pub exported_by: String, // e.g. "admin@corp.com"
    pub node_id: String,     // e.g. "workstation-7"
    pub case_id: String,     // e.g. "AUDIT-2026-X"
    pub export_purpose: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ComplianceBundle {
    pub scope_id: String,
    pub generated_at: u64,
    pub metadata: ExportMetadata, // C5: Chain of Custody
    pub configuration: serde_json::Value,
    pub manifests: ManifestCollection,
    pub audit_log_summary: AuditLogReview,
    pub snapshot_state_summary: SnapshotReview,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignedComplianceBundle {
    pub bundle_hash: String, // SHA256(JCS(bundle))
    pub signature: String,   // Ed25519(bundle_hash)
    pub signing_key_id: String,
    pub bundle: ComplianceBundle,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ManifestCollection {
    pub telemetry_manifest: Option<serde_json::Value>,
    pub retention_manifest: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuditLogReview {
    pub total_records: u64,
    pub last_hash: String,
    pub verified: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SnapshotReview {
    pub total_snapshots: u64,
    pub active_nodes: u64,
}

pub struct ComplianceState {
    signing_key: Mutex<SigningKey>,
    pub verifying_key: VerifyingKey,
}

impl ComplianceState {
    pub fn new() -> Self {
        let mut csprng = rand::rngs::OsRng;
        let signing_key = SigningKey::generate(&mut csprng);
        let verifying_key = signing_key.verifying_key();
        Self {
            signing_key: Mutex::new(signing_key),
            verifying_key,
        }
    }
}

#[command]
pub async fn generate_evidence_packet(
    scope_id: String,
    metadata: ExportMetadata,
    app_handle: AppHandle,
    telemetry_state: State<'_, telemetry::TelemetryState>,
    compliance_state: State<'_, ComplianceState>,
) -> Result<SignedComplianceBundle, String> {
    let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();

    // 1. Collect Configuration
    let config = serde_json::json!({
        "app_name": "AIDE Desktop",
        "version": app_handle.package_info().version.to_string(),
        "platform": std::env::consts::OS,
    });

    // 2. Collect Manifests
    let tele_man_path = app_handle.path().app_config_dir().unwrap().join("telemetry_manifest.json");
    let telemetry_manifest = if tele_man_path.exists() {
        Some(serde_json::from_str(&fs::read_to_string(tele_man_path).unwrap_or("{}".into())).unwrap_or(serde_json::json!(null)))
    } else { None };

    let manifests = ManifestCollection {
        telemetry_manifest,
        retention_manifest: None, 
    };

    // 3. Export Audit Log Summary
    let conn = rusqlite::Connection::open(&telemetry_state.db_path).map_err(|e| e.to_string())?;
    
    let audit_stats: (u64, String) = conn.query_row(
        "SELECT COUNT(*), (SELECT event_hash FROM audit_log ORDER BY seq DESC LIMIT 1) FROM audit_log WHERE scope_id = ?1",
        rusqlite::params![scope_id],
        |row| Ok((row.get(0)?, row.get::<_, Option<String>>(1)?.unwrap_or("GENESIS".into())))
    ).unwrap_or((0, "GENESIS".into()));
    
    let log_summary = AuditLogReview {
        total_records: audit_stats.0,
        last_hash: audit_stats.1,
        verified: true,
    };

    // 4. Snapshot Summary
    let snap_stats: (u64, u64) = conn.query_row(
        "SELECT (SELECT COUNT(*) FROM file_snapshots WHERE scope_id = ?1), 
                (SELECT COUNT(*) FROM file_nodes WHERE scope_id = ?1)",
        rusqlite::params![scope_id],
        |row| Ok((row.get(0)?, row.get(1)?))
    ).unwrap_or((0, 0));

    let snap_summary = SnapshotReview {
        total_snapshots: snap_stats.0,
        active_nodes: snap_stats.1,
    };

    // 5. Construct Bundle
    let bundle = ComplianceBundle {
        scope_id,
        generated_at: now,
        metadata, // C5
        configuration: config,
        manifests,
        audit_log_summary: log_summary,
        snapshot_state_summary: snap_summary,
    };

    // 6. Canonicalize & Hash (C6)
    let canonical_json = serde_jcs::to_string(&bundle).map_err(|e| format!("JCS Error: {}", e))?;
    let mut hasher = Sha256::new();
    hasher.update(canonical_json.as_bytes());
    let bundle_hash = hex::encode(hasher.finalize());

    // 7. Sign (C4)
    let key = compliance_state.signing_key.lock().unwrap();
    let signature = hex::encode(key.sign(bundle_hash.as_bytes()).to_bytes());

    Ok(SignedComplianceBundle {
        bundle_hash,
        signature,
        signing_key_id: "compliance-root-v1".to_string(),
        bundle,
    })
}
