use axum::{
    Json,
    extract::{Path, Query, State},
    http::{StatusCode, header::SET_COOKIE},
    response::{AppendHeaders, IntoResponse, Response},
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    auth::SessionAuth,
    entities::{
        Conversation, User, create_session, create_user, get_all_users, get_user, get_user_by_id,
        get_user_conversations, search_users,
    },
    error::{AppError, ErrorResponse, LossyError, Result},
    state::AppState,
};

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateUser {
    pub username: String,
    pub password: String,
}

#[utoipa::path(
    post,
    path = "/api/register",
    description = "Register a new user to the database",
    request_body(content = CreateUser, description = "User to register"),
    responses(
        (status = CREATED, description = "User successfully created"),
        (status = CONFLICT, description = "Username or email already in use", body = ErrorResponse),
        (status = BAD_REQUEST, description = "Invalid username, email, or password", body = ErrorResponse)
    )
)]
pub async fn register(
    State(state): State<AppState>,
    Json(user): Json<CreateUser>,
) -> Result<Response> {
    create_user(&state.pool, &user).await?;
    Ok((StatusCode::CREATED).into_response())
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct LoginUser {
    pub username: String,
    pub password: String,
}

#[utoipa::path(
    post,
    path = "/api/login",
    description = "Login a user to the backend",
    request_body(content = LoginUser, description = "User to login"),
    responses(
        (status = OK, description = "User successfully logged in"),
        (status = UNAUTHORIZED, description = "Invalid username or password", body = ErrorResponse)
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(login_user): Json<LoginUser>,
) -> Result<Response> {
    let Some(user) = get_user(&state.pool, login_user.username).await? else {
        return Err(AppError::UserError((
            LossyError(StatusCode::NOT_FOUND),
            "User not found".into(),
        )));
    };

    // Verify the provided password against the hashed password
    if login_user.password != user.password {
        return Err(AppError::UserError((
            LossyError(StatusCode::UNAUTHORIZED),
            "Invalid username or password".into(),
        )));
    }

    let session = create_session(&state.pool, user.id).await?;

    // For development with cross-origin requests (localhost:3000 -> localhost:6969)
    // In production, you'd want Secure=true and proper domain settings
    Ok((
        StatusCode::OK,
        AppendHeaders([
            (
                SET_COOKIE,
                format!(
                    "session={}; HttpOnly; Max-Age=34560000; Path=/; SameSite=Lax",
                    session.id
                ),
            ),
            (
                SET_COOKIE,
                "authenticated=true; Max-Age=34560000; Path=/; SameSite=Lax".to_string(),
            ),
        ]),
    )
        .into_response())
}

#[utoipa::path(
    get,
    path = "/api/profile",
    responses(
        (status = OK, description = "Current user profile", body = User),
        (status = FORBIDDEN, description = "User is not authenticated"),
    ),
    security(
        ("lokr_session_cookie" = [])
    )
)]
pub async fn get_profile(SessionAuth(user): SessionAuth) -> Result<Json<User>> {
    Ok(Json(user))
}

// ====== User Search Endpoints ======

#[derive(Deserialize, ToSchema)]
pub struct SearchQuery {
    pub q: String,
}

#[derive(Deserialize, ToSchema)]
pub struct PaginationQuery {
    #[serde(default = "default_limit")]
    pub limit: i64,
    #[serde(default)]
    pub offset: i64,
}

fn default_limit() -> i64 {
    20
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PublicUser {
    pub id: Uuid,
    pub username: String,
    pub created_at: DateTime<Utc>,
}

impl From<User> for PublicUser {
    fn from(user: User) -> Self {
        PublicUser {
            id: user.id,
            username: user.username,
            created_at: user.created_at,
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/users/search",
    params(
        ("q" = String, Query, description = "Search query for username")
    ),
    responses(
        (status = OK, description = "Search results", body = Vec<PublicUser>),
    )
)]
pub async fn search_users_handler(
    State(state): State<AppState>,
    Query(query): Query<SearchQuery>,
) -> Result<Response> {
    let users = search_users(&state.pool, &query.q).await?;
    let public_users: Vec<PublicUser> = users.into_iter().map(Into::into).collect();
    Ok((StatusCode::OK, Json(public_users)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/users",
    params(
        ("limit" = Option<i64>, Query, description = "Number of users to return (default: 20)"),
        ("offset" = Option<i64>, Query, description = "Number of users to skip (default: 0)")
    ),
    responses(
        (status = OK, description = "List of users", body = Vec<PublicUser>),
    )
)]
pub async fn list_users_handler(
    State(state): State<AppState>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Response> {
    let users = get_all_users(&state.pool, pagination.limit, pagination.offset).await?;
    let public_users: Vec<PublicUser> = users.into_iter().map(Into::into).collect();
    Ok((StatusCode::OK, Json(public_users)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/users/{id}",
    params(
        ("id" = Uuid, Path, description = "User ID")
    ),
    responses(
        (status = OK, description = "User details", body = PublicUser),
        (status = NOT_FOUND, description = "User not found"),
    )
)]
pub async fn get_user_handler(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
) -> Result<Response> {
    let user = get_user_by_id(&state.pool, user_id).await?;
    let public_user: PublicUser = user.into();
    Ok((StatusCode::OK, Json(public_user)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/users/me/conversations",
    responses(
        (status = OK, description = "User conversations", body = Vec<Conversation>),
        (status = FORBIDDEN, description = "Not authenticated"),
    )
)]
pub async fn get_my_conversations_handler(
    State(state): State<AppState>,
    session: SessionAuth,
) -> Result<Response> {
    let conversations = get_user_conversations(&state.pool, session.0.id).await?;
    Ok((StatusCode::OK, Json(conversations)).into_response())
}
