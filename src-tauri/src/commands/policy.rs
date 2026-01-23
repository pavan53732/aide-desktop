use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH, Duration};
use tauri::{State, command};

pub struct PolicyState {
    pub global_counter: AtomicUsize,
    pub last_reset: AtomicUsize, // Timestamp in seconds
    pub circuit_breakers: Mutex<HashMap<String, CircuitBreaker>>,
    pub in_flight: Mutex<HashMap<String, usize>>,
}

pub struct CircuitBreaker {
    pub failures: usize,
    pub last_failure: u64,
    pub disabled_until: u64,
}

impl PolicyState {
    pub fn new() -> Self {
        Self {
            global_counter: AtomicUsize::new(0),
            last_reset: AtomicUsize::new(0),
            circuit_breakers: Mutex::new(HashMap::new()),
            in_flight: Mutex::new(HashMap::new()),
        }
    }
}

#[command]
pub async fn enforce_policy(
    provider_id: String,
    rpm_limit: usize,
    max_concurrency: usize,
    state: State<'_, PolicyState>,
) -> Result<(), String> {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as usize;
    
    // M1: Global Throttle
    let last_reset = state.last_reset.load(Ordering::SeqCst);
    if now > last_reset + 60 {
        state.global_counter.store(0, Ordering::SeqCst);
        state.last_reset.store(now, Ordering::SeqCst);
    }
    
    let current_count = state.global_counter.fetch_add(1, Ordering::SeqCst);
    if current_count >= rpm_limit {
        return Err(format!("Policy Block: Global rate limit ({} RPM) exceeded", rpm_limit));
    }

    // M2: Circuit Breaker
    {
        let mut breakers = state.circuit_breakers.lock().unwrap();
        let breaker = breakers.entry(provider_id.clone()).or_insert(CircuitBreaker {
            failures: 0,
            last_failure: 0,
            disabled_until: 0,
        });

        if breaker.disabled_until > now as u64 {
            return Err(format!("Policy Block: Circuit open for {}. Try again in {}s", provider_id, breaker.disabled_until - now as u64));
        }
    }

    // M3: Parallel Request Guard
    {
        let mut in_flight = state.in_flight.lock().unwrap();
        let count = in_flight.entry(provider_id.clone()).or_insert(0);
        if *count >= max_concurrency {
            return Err(format!("Policy Block: Max concurrency ({}) reached for {}", max_concurrency, provider_id));
        }
        *count += 1;
    }

    Ok(())
}

#[command]
pub async fn report_success(provider_id: String, state: State<'_, PolicyState>) -> Result<(), String> {
    let mut in_flight = state.in_flight.lock().unwrap();
    if let Some(count) = in_flight.get_mut(&provider_id) {
        if *count > 0 { *count -= 1; }
    }
    
    let mut breakers = state.circuit_breakers.lock().unwrap();
    if let Some(breaker) = breakers.get_mut(&provider_id) {
        breaker.failures = 0; // Reset on success
    }
    Ok(())
}

#[command]
pub async fn report_failure(provider_id: String, state: State<'_, PolicyState>) -> Result<(), String> {
    let mut in_flight = state.in_flight.lock().unwrap();
    if let Some(count) = in_flight.get_mut(&provider_id) {
        if *count > 0 { *count -= 1; }
    }

    let mut breakers = state.circuit_breakers.lock().unwrap();
    let breaker = breakers.entry(provider_id.clone()).or_insert(CircuitBreaker {
        failures: 0,
        last_failure: 0,
        disabled_until: 0,
    });

    breaker.failures += 1;
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    breaker.last_failure = now;

    if breaker.failures >= 5 {
        breaker.disabled_until = now + 60; // 60s cooldown
    }
    
    Ok(())
}
