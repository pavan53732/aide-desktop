use tauri::{State, command, Manager};
use super::AppState;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

// Simple Cosine Similarity
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot_product: f32 = a.iter().zip(b).map(|(x, y)| x * y).sum();
    let magnitude_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let magnitude_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    
    if magnitude_a == 0.0 || magnitude_b == 0.0 {
        return 0.0;
    }
    
    dot_product / (magnitude_a * magnitude_b)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SearchResult {
    pub file_path: String,
    pub content: String,
    pub score: f32,
}

// Since we are using Frontend Orchestration for Embedding Generation, 
// Rust's job here is primarily to perform the Vector Search if we pass the embeddings to it,
// OR we can do the search in SQL if using an extension (not available here).
//
// OPTION A: Frontend sends Query Embedding -> Rust loads ALL embeddings from DB -> Rust computes Cosine Similarity -> Returns Top K.
// This is feasible for < 10,000 chunks.
//
#[command]
pub async fn search_context(
    query_embedding: Vec<f32>,
    limit: usize,
    state: State<'_, super::AppState>,
) -> Result<Vec<SearchResult>, String> {
    // 1. Fetch all embeddings from DB
    // Note: In a real app with >10k files, use sqlite-vss or similar.
    // For MVP, loading into memory is fine.
    
    use tauri_plugin_sql::{Migration, Builder}; 
    // Wait, we can't easily access the internal SQL plugin pool from here without exposing it.
    // However, the DB is SQLite. We can use a separate connection or try to access the plugin state if public.
    // Actually, `rusqlite` is included in Cargo.toml.
    
    // Better approach:
    // Let the frontend manage the DB read? 
    // No, passing 10k vectors to frontend is slow.
    // Rust should read the DB.
    
    // We need to open the DB here.
    let conn = rusqlite::Connection::open("aide.db").map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare("SELECT file_path, content, embedding FROM file_embeddings").map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([], |row| {
        let embedding_json: String = row.get(2)?;
        let embedding: Vec<f32> = serde_json::from_str(&embedding_json).unwrap_or_default();
        Ok((
            row.get::<_, String>(0)?, // file_path
            row.get::<_, String>(1)?, // content
            embedding
        ))
    }).map_err(|e| e.to_string())?;
    
    let mut results: Vec<SearchResult> = Vec::new();
    
    for row in rows {
        if let Ok((path, content, embedding)) = row {
            let score = cosine_similarity(&query_embedding, &embedding);
            results.push(SearchResult {
                file_path: path,
                content: content,
                score: score
            });
        }
    }
    
    // Sort by score descending
    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
    
    // Take top K
    results.truncate(limit);
    
    Ok(results)
}
