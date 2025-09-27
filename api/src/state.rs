use std::sync::Arc;

use papaya::HashMap;
use sqlx::SqlitePool;
use tokio::sync::broadcast;
use uuid::Uuid;

use crate::events::SseEvent;

// A sender for a client's broadcast channel.
// The string is a JSON-encoded event.
pub type ClientTx = broadcast::Sender<SseEvent>;

// A map of connected clients, mapping user ID to their broadcast sender.
pub type ClientMap = HashMap<Uuid, ClientTx>;

#[derive(Clone, Debug)]
pub struct AppState {
    pub pool: SqlitePool,
    pub clients: Arc<ClientMap>,
}

impl AppState {
    pub fn new(pool: SqlitePool) -> Self {
        Self {
            pool,
            clients: Default::default(),
        }
    }
}
