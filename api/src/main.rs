use cloneops_api::{DATA_DIR, init_db, start_server};
use color_eyre::eyre;
use color_eyre::eyre::eyre;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use url::Url;

#[tokio::main]
async fn main() -> Result<(), eyre::Report> {
    dotenvy::dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!("{}=debug,tower_http=info", env!("CARGO_CRATE_NAME")).into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
    let url = Url::from_file_path(&*DATA_DIR.join("api.db"))
        .map_err(|_| eyre!("Invalid database URL"))?;
    let pool = init_db(&url).await?;
    start_server(pool).await?;
    Ok(())
}
