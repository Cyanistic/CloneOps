use sqlx::SqlitePool;

#[derive(Clone, Debug)]
pub struct AppState {
    pub pool: SqlitePool
}

impl AppState {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}
