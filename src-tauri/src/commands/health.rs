use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use tauri::State;
use rusqlite::{params, Connection, OptionalExtension};

// L3 Configuration Constants
const FAILURE_THRESHOLD: f64 = 0.5; // 50% failure rate triggers Open
const LATENCY_SLO_MS: u64 = 5000; // 5s latency target
const EMA_ALPHA: f64 = 0.2; // Smoothing factor for failure rate
const COOL_DOWN_SECS: u64 = 60; // 1 minute cool-down for Open circuit
const MIN_SAMPLES: u64 = 5; // Minimum requests before enforcing circuit
const WINDOW_SIZE: usize = 100; // Rolling window size for latency

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum CircuitStatus {
    Closed,    // Normal operation
    Open,      // Broken, fail-fast
    HalfOpen,  // Probing for recovery
}

impl ToString for CircuitStatus {
    fn to_string(&self) -> String {
        match self {
            CircuitStatus::Closed => "CLOSED".to_string(),
            CircuitStatus::Open => "OPEN".to_string(),
            CircuitStatus::HalfOpen => "HALF_OPEN".to_string(),
        }
    }
}

impl From<String> for CircuitStatus {
    fn from(s: String) -> Self {
        match s.as_str() {
            "OPEN" => CircuitStatus::Open,
            "HALF_OPEN" => CircuitStatus::HalfOpen,
            _ => CircuitStatus::Closed,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProviderHealth {
    pub provider_id: String,
    pub scope_id: String,
    pub status: CircuitStatus,
    pub failure_rate_ema: f64,
    pub average_latency_ema: f64,
    pub last_failure_at: u64,
    pub consecutive_failures: u64,
    pub sample_count: u64,
    pub open_until: u64,
    
    // L3: Latency SLO Window (Runtime only, rebuilt on restart or cleared)
    // We don't necessarily need to persist the full window if we persist the EMA/Status.
    // For Audit compliance "p95 calculation", we keep it in memory.
    #[serde(skip)] 
    pub latency_window: Vec<u64>,
}

impl ProviderHealth {
    pub fn new(scope_id: String, provider_id: String) -> Self {
        Self {
            provider_id,
            scope_id,
            status: CircuitStatus::Closed,
            failure_rate_ema: 0.0,
            average_latency_ema: 0.0,
            last_failure_at: 0,
            consecutive_failures: 0,
            sample_count: 0,
            open_until: 0,
            latency_window: Vec::with_capacity(WINDOW_SIZE),
        }
    }

    pub fn update(&mut self, success: bool, latency_ms: u64) {
        self.sample_count += 1;
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

        // 1. Update Metrics
        let outcome_val = if success { 0.0 } else { 1.0 };
        self.failure_rate_ema = (EMA_ALPHA * outcome_val) + ((1.0 - EMA_ALPHA) * self.failure_rate_ema);
        self.average_latency_ema = (EMA_ALPHA * latency_ms as f64) + ((1.0 - EMA_ALPHA) * self.average_latency_ema);
        
        // Update Latency Window
        if self.latency_window.len() >= WINDOW_SIZE {
            self.latency_window.remove(0);
        }
        self.latency_window.push(latency_ms);

        // 2. Calculate p95 Latency
        let p95_latency = self.calculate_p95();
        let latency_violation = success && p95_latency > LATENCY_SLO_MS as f64;

        // 3. State Machine Transitions (Outcome-Based)
        match self.status {
            CircuitStatus::HalfOpen => {
                if success && !latency_violation {
                    // Success -> Closed (Recovery)
                    self.status = CircuitStatus::Closed;
                    self.failure_rate_ema = 0.0;
                    self.open_until = 0;
                } else {
                    // Failure or Slow -> Open (Trip Again)
                    self.trip(now);
                }
            },
            CircuitStatus::Closed => {
                if !success {
                    self.consecutive_failures += 1;
                    self.last_failure_at = now;
                } else {
                    self.consecutive_failures = 0;
                }

                // Trip Conditions
                let failure_trip = self.sample_count >= MIN_SAMPLES && self.failure_rate_ema > FAILURE_THRESHOLD;
                let latency_trip = self.sample_count >= MIN_SAMPLES && latency_violation;

                if failure_trip || latency_trip {
                    self.trip(now);
                }
            },
            CircuitStatus::Open => {
                // Should not happen via report_outcome unless race condition or forced probe.
                // If we get a result in Open state, we mostly ignore or re-trip if failure.
                if !success {
                    self.last_failure_at = now;
                    self.open_until = now + COOL_DOWN_SECS; // Extend cooldown
                }
            }
        }
    }

    fn calculate_p95(&self) -> f64 {
        if self.latency_window.is_empty() {
            return 0.0;
        }
        let mut sorted = self.latency_window.clone();
        sorted.sort();
        let index = (sorted.len() as f64 * 0.95).ceil() as usize;
        let index = if index > 0 { index - 1 } else { 0 };
        sorted.get(index).cloned().unwrap_or(0) as f64
    }

    fn trip(&mut self, now: u64) {
        self.status = CircuitStatus::Open;
        self.last_failure_at = now;
        self.open_until = now + COOL_DOWN_SECS;
        self.consecutive_failures = 0; // Reset for next cycle
    }

    // Time-based transition check
    pub fn try_recover(&mut self, now: u64) -> bool {
        if self.status == CircuitStatus::Open && now >= self.open_until {
            self.status = CircuitStatus::HalfOpen;
            true // State changed
        } else {
            false
        }
    }

    pub fn can_request(&self) -> bool {
        match self.status {
            CircuitStatus::Closed => true,
            CircuitStatus::HalfOpen => true, // Allowed for probe
            CircuitStatus::Open => false,
        }
    }
}

pub struct HealthRegistry {
    pub providers: Mutex<HashMap<String, ProviderHealth>>,
    pub db_path: PathBuf,
}

impl HealthRegistry {
    pub fn new(db_path: PathBuf) -> Self {
        let registry = Self {
            providers: Mutex::new(HashMap::new()),
            db_path,
        };
        registry.init_db();
        registry
    }

    fn init_db(&self) {
        let conn = Connection::open(&self.db_path).expect("Failed to open DB for health");
        conn.execute(
            "CREATE TABLE IF NOT EXISTS provider_health (
                scope_id TEXT NOT NULL,
                provider_id TEXT NOT NULL,
                status TEXT NOT NULL,
                failure_rate_ema REAL NOT NULL,
                average_latency_ema REAL NOT NULL,
                last_failure_at INTEGER NOT NULL,
                consecutive_failures INTEGER NOT NULL,
                open_until INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                PRIMARY KEY (scope_id, provider_id)
            )",
            [],
        ).expect("Failed to init provider_health table");
        
        self.load_from_db(&conn);
    }

    fn load_from_db(&self, conn: &Connection) {
        let mut stmt = conn.prepare("SELECT scope_id, provider_id, status, failure_rate_ema, average_latency_ema, last_failure_at, consecutive_failures, open_until FROM provider_health").unwrap();
        
        let rows = stmt.query_map([], |row| {
            Ok(ProviderHealth {
                scope_id: row.get(0)?,
                provider_id: row.get(1)?,
                status: CircuitStatus::from(row.get::<_, String>(2)?),
                failure_rate_ema: row.get(3)?,
                average_latency_ema: row.get(4)?,
                last_failure_at: row.get(5)?,
                consecutive_failures: row.get(6)?,
                sample_count: 5,
                open_until: row.get(7)?,
                latency_window: Vec::new(), // Cold start
            })
        }).unwrap();

        let mut map = self.providers.lock().unwrap();
        for health in rows {
            if let Ok(h) = health {
                let key = format!("{}:{}", h.scope_id, h.provider_id);
                map.insert(key, h);
            }
        }
    }

    pub fn persist_health(&self, health: &ProviderHealth) {
        let conn = Connection::open(&self.db_path).unwrap_or_else(|_| panic!("DB Access Failed"));
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        
        conn.execute(
            "INSERT INTO provider_health (scope_id, provider_id, status, failure_rate_ema, average_latency_ema, last_failure_at, consecutive_failures, open_until, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
             ON CONFLICT(scope_id, provider_id) DO UPDATE SET
                status=excluded.status,
                failure_rate_ema=excluded.failure_rate_ema,
                average_latency_ema=excluded.average_latency_ema,
                last_failure_at=excluded.last_failure_at,
                consecutive_failures=excluded.consecutive_failures,
                open_until=excluded.open_until,
                updated_at=excluded.updated_at",
            params![
                health.scope_id,
                health.provider_id,
                health.status.to_string(),
                health.failure_rate_ema,
                health.average_latency_ema,
                health.last_failure_at,
                health.consecutive_failures,
                health.open_until,
                now
            ],
        ).expect("Failed to persist health state");
    }
}

pub fn check_availability(registry: &State<HealthRegistry>, scope_id: &str, provider_id: &str) -> Result<(), String> {
    let mut providers = registry.providers.lock().map_err(|e| e.to_string())?;
    let key = format!("{}:{}", scope_id, provider_id);
    
    let health = providers.entry(key)
        .or_insert_with(|| ProviderHealth::new(scope_id.to_string(), provider_id.to_string()));

    // Strict State Machine: Check Time-Based Transition (Open -> HalfOpen)
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    if health.try_recover(now) {
        // State changed Open -> HalfOpen, must persist immediately
        registry.persist_health(health);
    }

    if health.can_request() {
        Ok(())
    } else {
        Err(format!("Circuit Breaker: Provider '{}' is unhealthy for scope '{}' (Status: {:?}, OpenUntil: {}). Request blocked.", provider_id, scope_id, health.status, health.open_until))
    }
}

pub fn report_outcome(registry: &State<HealthRegistry>, scope_id: &str, provider_id: &str, success: bool, latency_ms: u64) -> Result<(), String> {
    let mut providers = registry.providers.lock().map_err(|e| e.to_string())?;
    let key = format!("{}:{}", scope_id, provider_id);
    
    if let Some(health) = providers.get_mut(&key) {
        health.update(success, latency_ms);
        // Persist on update (Atomic Transition)
        registry.persist_health(health);
    }
    Ok(())
}

#[tauri::command]
pub async fn get_provider_health(
    scope_id: String,
    provider_id: String,
    state: State<'_, HealthRegistry>,
) -> Result<ProviderHealth, String> {
    let providers = state.providers.lock().map_err(|e| e.to_string())?;
    let key = format!("{}:{}", scope_id, provider_id);
    let health = providers.get(&key).cloned().unwrap_or_else(|| ProviderHealth::new(scope_id, provider_id));
    Ok(health)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_strict_state_machine() {
        let mut health = ProviderHealth::new("global".into(), "test".into());
        // 1. Closed -> Open (Failure Threshold)
        health.sample_count = 10;
        health.failure_rate_ema = 0.6;
        health.update(false, 100);
        assert_eq!(health.status, CircuitStatus::Open);
        
        // 2. Open -> HalfOpen (Time)
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        health.open_until = now - 1; // Expired
        assert!(health.try_recover(now));
        assert_eq!(health.status, CircuitStatus::HalfOpen);

        // 3. HalfOpen -> Closed (Success)
        health.update(true, 100);
        assert_eq!(health.status, CircuitStatus::Closed);

        // 4. HalfOpen -> Open (Failure)
        health.status = CircuitStatus::HalfOpen;
        health.update(false, 100);
        assert_eq!(health.status, CircuitStatus::Open);
    }

    #[test]
    fn test_p95_latency_slo() {
        let mut health = ProviderHealth::new("global".into(), "test".into());
        health.sample_count = 10;
        
        // Add 95 fast requests
        for _ in 0..95 {
            health.update(true, 100); // 100ms
        }
        // Add 5 slow requests (> 5000ms)
        for _ in 0..5 {
            health.update(true, 6000); // 6000ms
        }
        
        // p95 of 100 items with 5 slow ones:
        // top 5 are 6000. 95th percentile is 6000.
        // Should trip.
        // Wait, update is called one by one. p95 is calculated each time.
        // Last update should trigger trip.
        assert_eq!(health.calculate_p95(), 6000.0);
        
        // Check if tripped (since last update was slow and pushed p95 > threshold)
        // With sample_Count > min, and violation...
        // Wait, did it trip? 
        // In the loop, the last update call saw p95=6000 > 5000.
        // So latency_violation = true.
        // Trip condition: sample_count >= MIN && latency_violation.
        // Yes.
        assert_eq!(health.status, CircuitStatus::Open);
    }
}
