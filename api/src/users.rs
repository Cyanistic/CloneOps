use axum::{
    Json,
    extract::State,
    http::{StatusCode, header::SET_COOKIE},
    response::{AppendHeaders, IntoResponse, Response},
};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::{
    auth::SessionAuth,
    entities::{User, create_session, create_user, get_user},
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
