use color_eyre::{Result, eyre::eyre};
use sqlx::{
    Pool, Sqlite,
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqliteSynchronous},
};
use std::{env, fs::File, io::ErrorKind, path::PathBuf, str::FromStr};

/// Build file for migration scripts to ensure that the compile-time
/// queries are compatible with the latest migration scripts
async fn run_migrations() -> Result<()> {
    // Attempt to load .env file. This is fine if it doesn't exist.
    dotenvy::dotenv().ok();

    // Get DATABASE_URL from environment, then .env, then fallback
    let db_url = match env::var("DATABASE_URL") {
        Ok(k) => k,
        Err(_) => {
            let default_db_path = env::current_dir().unwrap().join("cloneops.db");
            let mut db_url = default_db_path.display().to_string();
            println!("cargo:warning=DATABASE_URL not found in .env, using default: {db_url}");
            // On Windows, convert backslashes to forward slashes for the URL.
            if cfg!(windows) {
                db_url = db_url.replace('\\', "/");
            }
            format!("sqlite:{}", db_url)
        }
    };

    println!("cargo:rustc-env=DATABASE_URL={db_url}"); // Make it available to the crate

    // Strip the scheme from the URL to get a valid file path.
    // This needs to handle different URL formats and OS-specific path details.
    let path_str = if let Some(path) = db_url.strip_prefix("sqlite://") {
        // If on windows and path is like /C:/... remove the leading slash
        if cfg!(windows) {
            path.strip_prefix('/').unwrap_or(path)
        } else {
            path
        }
    } else if let Some(path) = db_url.strip_prefix("sqlite:") {
        path
    } else {
        // If no prefix, assume it's a raw path, which sqlx treats as sqlite:
        db_url.as_str()
    };

    let db_path = PathBuf::from(path_str);

    match std::fs::remove_file(&db_path) {
        // Only return an error if it doesn't talk about the file not existing
        // since this likely means that this is the first time the database is being created
        Err(e) if e.kind() != ErrorKind::NotFound => {
            return Err(eyre!(e));
        }
        _ => {}
    }

    let pool: Pool<Sqlite> = Pool::connect_lazy_with(
        SqliteConnectOptions::from_str(&db_url)?
            .foreign_keys(false) // Disable during migration due to table creation order
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            // Only use NORMAL if WAL mode is enabled
            // as it provides extra performance benefits
            // at the cost of durability
            .synchronous(SqliteSynchronous::Normal),
    );
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(())
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    // Rebuild if any of these files change
    println!("cargo:rerun-if-changed=src/lib.rs");
    println!("cargo:rerun-if-changed=migrations");

    tokio::try_join!(run_migrations())?;

    Ok(())
}
