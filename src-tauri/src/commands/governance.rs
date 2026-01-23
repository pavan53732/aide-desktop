use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Serialize, Deserialize};
use tauri::{State, command};
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use sha2::{Digest, Sha256};
use ed25519_dalek::{Signer, SigningKey, VerifyingKey, Signature};
use rand::rngs::OsRng;

// F1-F10: Enterprise File Governance

#[derive(Debug, Serialize, Deserialize)]
pub struct SnapshotRecord {
    pub seq: u64,
    pub scope_id: String,
    pub path: String,
    pub content_hash: String,
    pub prev_hash: String,
    pub author: String,
    pub approval_token: String,
    pub event_hash: String, // F4: File event link
    pub timestamp: u64,
}

#[derive(Debug, Serialize)]
pub struct FileHistoryExport {
    pub path: String,
    pub snapshots: Vec<SnapshotRecord>,
    pub root_hash: String,
    pub signature: String, // F6: Signed Bundle
}

#[derive(Debug, PartialEq)]
pub enum Action {
    Read,
    Write,
    Delete,
    Restore
}

#[derive(Debug, PartialEq)]
pub enum Role {
    Admin,
    User,
    Viewer
}

pub struct GovernanceState {
    pub db_path: PathBuf,
    // F6: Signing Key for Exports (Simulated for this session, ideally from KMS)
    signing_key: Mutex<SigningKey>,
}

impl GovernanceState {
    pub fn new(db_path: PathBuf) -> Self {
        let mut csprng = OsRng;
        let signing_key = Mutex::new(SigningKey::generate(&mut csprng));
        
        let state = Self { db_path, signing_key };
        state.init_db();
        state
    }

    fn init_db(&self) {
        let conn = Connection::open(&self.db_path).expect("Failed to open Audit DB for Governance");
        
        // F1: WORM Snapshots (with Telemetry Link)
        conn.execute(
            "CREATE TABLE IF NOT EXISTS file_snapshots (
                seq INTEGER PRIMARY KEY AUTOINCREMENT,
                scope_id TEXT NOT NULL,
                path TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                prev_hash TEXT NOT NULL,
                content BLOB NOT NULL,
                author TEXT NOT NULL,
                approval_token TEXT NOT NULL,
                event_hash TEXT NOT NULL,
                timestamp INTEGER NOT NULL
            )",
            [],
        ).expect("Failed to create file_snapshots");

        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS uniq_file_chain ON file_snapshots(scope_id, path, content_hash)",
            [],
        ).expect("Failed to create index");

        // F2: Legal Hold / Retention Policy
        conn.execute(
            "CREATE TABLE IF NOT EXISTS file_policy (
                scope_id TEXT PRIMARY KEY,
                legal_hold BOOLEAN NOT NULL DEFAULT 0,
                retention_days INTEGER NOT NULL DEFAULT 90
            )",
            [],
        ).expect("Failed to create file_policy");

        // F1: Strict WORM Trigger (No Update on Snapshots)