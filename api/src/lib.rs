use std::{
    env::current_dir,
    net::SocketAddr,
    path::PathBuf,
    str::FromStr,
    sync::{Arc, LazyLock},
    time::Duration,
};

use axum::{
    Router,
    extract::DefaultBodyLimit,
    http::{
        HeaderValue,
        header::{
            ACCEPT, AUTHORIZATION, CONTENT_ENCODING, CONTENT_LENGTH, CONTENT_TYPE, COOKIE,
            SET_COOKIE,
        },
    },
};
use color_eyre::eyre::eyre;
use lazy_regex::{Lazy, lazy_regex};
use regex::Regex;
use sqlx::{
    SqlitePool,
    migrate::MigrateError,
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
};
use tower::ServiceBuilder;
use tower_http::{
    LatencyUnit, ServiceBuilderExt,
    cors::{AllowOrigin, CorsLayer},
    services::{ServeDir, ServeFile},
    timeout::TimeoutLayer,
    trace::{DefaultMakeSpan, DefaultOnRequest, DefaultOnResponse, TraceLayer},
};
use tracing::{Level, info, warn};
use url::Url;
use utoipa::{
    Modify, OpenApi,
    openapi::security::{ApiKey, ApiKeyValue, SecurityScheme},
};
use utoipa_axum::{router::OpenApiRouter, routes};
use utoipa_swagger_ui::SwaggerUi;

mod agents;
mod auth;
mod entities;
mod error;
mod events;
mod messaging;
mod posts;
mod state;
mod users;
mod utoipa_compat;

use crate::{error::Result, state::AppState};

pub const PKG_NAME: &str = env!("CARGO_PKG_NAME");

/// Path to the data directory for the application.
/// Falls back to the current directory if the data directory cannot be determined.
pub static DATA_DIR: LazyLock<PathBuf> = LazyLock::new(|| {
    let mut path = match dirs::data_dir() {
        Some(dir) => dir,
        None => {
            warn!("Could not determine data directory. Attempting to use current directory.");
            current_dir().unwrap()
        }
    };
    path.push(PKG_NAME);
    if !path.exists() {
        std::fs::create_dir_all(&path).unwrap();
    }
    path
});

pub static CONFIG_DIR: LazyLock<PathBuf> = LazyLock::new(|| {
    let mut path = match dirs::config_dir() {
        Some(dir) => dir,
        None => {
            warn!("Could not determine config directory. Attempting to use current directory.");
            current_dir().unwrap()
        }
    };
    path.push(PKG_NAME);
    if !path.exists() {
        std::fs::create_dir_all(&path).unwrap();
    }
    path
});

/// Path to where user uploads are stored.
pub static UPLOAD_DIR: LazyLock<PathBuf> = LazyLock::new(|| {
    let path = DATA_DIR.join("uploads");
    if !path.exists() {
        std::fs::create_dir_all(&path).unwrap();
    }
    path
});

/// Path to where user avatar/profile images are stored.
pub static AVATAR_DIR: LazyLock<PathBuf> = LazyLock::new(|| {
    let path = DATA_DIR.join("avatars");
    if !path.exists() {
        std::fs::create_dir_all(&path).unwrap();
    }
    path
});

static ORIGIN_REGEX: Lazy<Regex> = lazy_regex!(r"^https?://localhost:\d+/?$");

/// Website host
pub static HOST: LazyLock<String> = LazyLock::new(|| {
    std::env::var("CLONEOPS_HOST").unwrap_or("cloneops.cyanistic.com".to_string())
});

#[derive(OpenApi)]
#[openapi(
        modifiers(&SecurityAddon),
        paths(
            users::register,
            users::login,
            users::get_profile,
            users::search_users_handler,
            users::get_user_handler,
            agents::enhance_prompt,
            agents::research_prompt,
            messaging::create_conversation_handler,
            messaging::list_conversations_handler,
            messaging::send_message_handler,
            messaging::edit_conversation_handler,
            messaging::add_users_to_conversation_handler,
            messaging::get_conversation_handler,
            messaging::get_messages_handler,
            messaging::get_categorized_messages_handler,
            posts::create_post_handler,
            posts::get_posts_handler,
            posts::delete_post_handler,
            posts::create_delegation_handler,
            posts::get_delegations_handler,
            posts::get_received_delegations_handler,
            posts::revoke_delegation_handler,
            posts::get_feed_handler,
            events::events_handler,
        ),
        components(
            schemas(
                events::SseEvent,
                events::SseEventExample,
                entities::MessageCategory,
                entities::ChatMessage,
                entities::Conversation,
                entities::ConversationWithParticipants,
                entities::ChatMessageWithMetadata,
                entities::Post,
                entities::Delegation,
                posts::FeedResponse,
            )
        ),
        tags(
            (name = "users", description = "User related operations"),
            (name = "agents", description = "Agent related operations"),
            (name = "messaging", description = "Messaging and conversation operations"),
            (name = "posts", description = "Social media posts and delegation management"),
            (name = "events", description = "Real-time event streaming via Server-Sent Events (SSE)"),
        )
    )]
struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "lokr_session_cookie",
                SecurityScheme::ApiKey(ApiKey::Cookie(ApiKeyValue::new("session"))),
            )
        }
    }
}

pub async fn start_server(pool: SqlitePool) -> Result<()> {
    let cors = CorsLayer::very_permissive()
        .allow_origin(AllowOrigin::predicate({
            move |origin: &HeaderValue, _: _| {
                ORIGIN_REGEX.is_match(origin.to_str().unwrap_or_default())
            }
        }))
        .allow_headers([
            AUTHORIZATION,
            CONTENT_TYPE,
            CONTENT_ENCODING,
            CONTENT_LENGTH,
            ACCEPT,
            SET_COOKIE,
        ])
        .expose_headers([
            AUTHORIZATION,
            CONTENT_TYPE,
            CONTENT_ENCODING,
            CONTENT_LENGTH,
            ACCEPT,
            SET_COOKIE,
        ]);

    let sensitive_headers: Arc<[_]> = [AUTHORIZATION, COOKIE].into();

    let middleware = ServiceBuilder::new()
        // Mark the `Authorization` and `Cookie` headers as sensitive so it doesn't show in logs
        .sensitive_request_headers(sensitive_headers.clone())
        // Add high level tracing/logging to all requests
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(
                    DefaultMakeSpan::new()
                        .level(Level::DEBUG)
                        .include_headers(true),
                )
                .on_request(DefaultOnRequest::new().level(Level::TRACE))
                .on_response(
                    DefaultOnResponse::new()
                        .level(Level::TRACE)
                        .include_headers(true)
                        .latency_unit(LatencyUnit::Micros),
                )
                .on_failure(()),
        )
        .sensitive_response_headers(sensitive_headers)
        // GovernorLayer is a rate limiter that limits the number of requests a user can make
        // within a given time period. This is used to prevent abuse/attacks on the server.
        // This is safe to use because the it is only none if the period or burst size is 0.
        // Neither of which are the case here.
        // Set a timeout
        .layer(TimeoutLayer::new(Duration::from_secs(15)))
        // Compress responses
        .compression()
        // Set a `Content-Type` if there isn't one already.
        .insert_response_header_if_not_present(
            CONTENT_TYPE,
            HeaderValue::from_static("application/octet-stream"),
        );

    let state = AppState::new(pool.clone());

    // Setup the router along with the OpenApi documentation router
    // for easy docs generation.
    let (api_router, open_api): (Router, _) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .routes(routes!(users::register))
        .routes(routes!(users::login))
        .routes(routes!(users::get_profile))
        .routes(routes!(users::search_users_handler))
        .routes(routes!(users::get_user_handler))
        .routes(routes!(agents::enhance_prompt))
        .routes(routes!(agents::research_prompt))
        .routes(routes!(messaging::create_conversation_handler))
        .routes(routes!(messaging::list_conversations_handler))
        .routes(routes!(messaging::send_message_handler))
        .routes(routes!(messaging::edit_conversation_handler))
        .routes(routes!(messaging::add_users_to_conversation_handler))
        .routes(routes!(messaging::get_conversation_handler))
        .routes(routes!(messaging::get_messages_handler))
        .routes(routes!(messaging::get_categorized_messages_handler))
        .routes(routes!(posts::create_post_handler))
        .routes(routes!(posts::get_posts_handler))
        .routes(routes!(posts::delete_post_handler))
        .routes(routes!(posts::create_delegation_handler))
        .routes(routes!(posts::get_delegations_handler))
        .routes(routes!(posts::get_received_delegations_handler))
        .routes(routes!(posts::revoke_delegation_handler))
        .routes(routes!(posts::get_feed_handler))
        .routes(routes!(events::events_handler))
        .route_layer(DefaultBodyLimit::max(1_000_000_000))
        .layer(cors)
        .with_state(state)
        .split_for_parts();

    let app = Router::new()
        .merge(api_router)
        .merge(SwaggerUi::new("/docs").url("/api-docs/openapi.json", open_api))
        // Serve the client files from the `../client/dist` directory
        // We use a fallback `ServeDir` for this because we send all the requests to the same file and
        // react-router handles the routing on the client side.
        //
        // We need the first fallback to serve all of the static files for the server and we need
        // the second fallback to redirect all other requests to the index.html file for
        // react-router.
        .fallback_service(
            ServeDir::new("../client/dist").fallback(ServeFile::new("../client/dist/index.html")),
        )
        .layer(middleware);

    // run our app with hyper, listening globally on port 6969
    let listener = tokio::net::TcpListener::bind("0.0.0.0:6969").await.unwrap();

    info!("Server listening on port 6969");
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install CTRL+C signal handler");
    })
    .await?;
    pool.close().await;
    Ok(())
}

pub async fn init_db(db_url: &Url) -> Result<SqlitePool> {
    let pool: SqlitePool = SqlitePool::connect_lazy_with(
        SqliteConnectOptions::from_str(db_url.as_str())?
            .foreign_keys(true)
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            // Only use NORMAL if WAL mode is enabled
            // as it provides extra performance benefits
            // at the cost of durability
            .synchronous(SqliteSynchronous::Normal),
    );
    // Check if there is a version mismatch between the migrations and the database
    // If there is, delete the database file and run the migrations again
    match sqlx::migrate!("./migrations").run(&pool).await {
        Err(MigrateError::VersionMismatch(_)) => {
            std::fs::remove_file(
                db_url
                    .to_file_path()
                    .map_err(|_| eyre!("Unable to convert db url to file path"))?,
            )?;
            // Pin the future so we can call it recursively within the same async function
            // Will get a recursion error otherwise if we don't
            Box::pin(init_db(db_url)).await?;
        }
        // We don't know how to deal with the other errors
        // but we can't continue so just return early with them
        Err(e) => return Err(e.into()),
        _ => {}
    }
    Ok(pool)
}
