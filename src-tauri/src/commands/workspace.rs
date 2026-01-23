use serde::{Deserialize, Serialize};
use tauri::{State, command, Manager};

use super::AppState;

/**
 * Workspace Management Commands
 * 
 * This module provides commands for setting, getting, and locking the active workspace.
 * It ensures that only one workspace is active at a time and handles path canonicalization.
 */

#[derive(Debug, Serialize, Deserialize)]
pub enum FileError {
    NotFound,
    PermissionDenied,
    InvalidPath,
    IoError(String),
    NoWorkspaceSet,
    WorkspaceBusy,
    LockError,
}

/**
 * Represents a node in the file system tree
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileNode>>,
    pub size: Option<u64>,
    pub truncated: Option<bool>,
}

/**
 * Sets the active workspace directory.
 * 
 * Validates that the path exists and is a directory before updating the global state.
 * Logs the action to the audit trail.
 */
#[command]
pub async fn set_workspace(
    path: String,
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<(), FileError> {
    // Check if workspace is locked (e.g., during a sensitive operation)
    {
        let is_locked = state.is_locked.lock().unwrap();
        if *is_locked {
            return Err(FileError::WorkspaceBusy);
        }
    }

    // Verify path exists and canonicalize to absolute path
    let canonical_path = match std::fs::canonicalize(&path) {
        Ok(p) => p,
        Err(_) => return Err(FileError::InvalidPath),
    };

    // Verify it's a directory
    if !canonical_path.is_dir() {
        return Err(FileError::InvalidPath);
    }

    // Update global state with the new workspace path
    {
        let mut workspace_path = state.workspace_path.lock().unwrap();
        *workspace_path = Some(canonical_path.to_string_lossy().to_string());
    }
    
    // P1: Audit Log - Record the workspace change for security tracking
    let _ = super::audit::audit_log(
        "SET_WORKSPACE".into(), 
        format!("path: {:?}", canonical_path),
        app.state()
    ).await;
    
    Ok(())
}

/**
 * Retrieves the current active workspace path.
 */
#[command]
pub async fn get_workspace(
    state: State<'_, AppState>,
) -> Result<Option<String>, FileError> {
    let workspace_path = state.workspace_path.lock().unwrap();
    Ok((*workspace_path).clone())
}

/**
 * Locks the workspace to prevent changes.
 * 
 * Used during operations that require a stable file system state.
 */
#[command]
pub async fn lock_workspace(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<(), FileError> {
    let mut is_locked = state.is_locked.lock().unwrap();
    if *is_locked {
        return Err(FileError::LockError);
    }
    
    *is_locked = true;
    let _ = super::audit::audit_log("LOCK".into(), "workspace locked".into(), app.state()).await;
    Ok(())
}

/**
 * Unlocks the workspace.
 */
#[command]
pub async fn unlock_workspace(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<(), FileError> {
    let mut is_locked = state.is_locked.lock().unwrap();
    if !*is_locked {
        return Err(FileError::LockError);
    }
    
    *is_locked = false;
    let _ = super::audit::audit_log("UNLOCK".into(), "workspace unlocked".into(), app.state()).await;
    Ok(())
}


// Startup recovery - force unlock on startup
pub fn recover_from_crash() {
    // This would be called during app initialization
    // For now, we'll handle this in the main.rs or app initialization
}
