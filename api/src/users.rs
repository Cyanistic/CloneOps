use axum::{
    extract::State, http::{header::SET_COOKIE, StatusCode}, response::{AppendHeaders, IntoResponse, Response}, Json
};
use serde::Deserialize;
use sqlx::prelude::FromRow;
use utoipa::ToSchema;

use crate::{
    entities::{create_session, create_user, get_user},
    error::{AppError, ErrorResponse, LossyError, Result},
    state::AppState,
};

#[derive(Deserialize, ToSchema)]
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
pub async fn login(State(state): State<AppState>, Json(login_user): Json<LoginUser>) -> Result<Response> {
    let Some(user) = get_user(&state.pool, login_user.username).await? else {
        return Err(AppError::UserError((
            LossyError(StatusCode::NOT_FOUND),
            "User not found".into(),
        )));
    };
    
    // Verify the provided password against the hashed password
    match verify(&login_user.password, &user.password) {
        Ok(valid) => {
            if !valid {
                return Err(AppError::UserError((
                    LossyError(StatusCode::UNAUTHORIZED),
                    "Invalid username or password".into(),
                )));
            }
        }
        Err(_) => {
            return Err(AppError::UserError((
                LossyError(StatusCode::UNAUTHORIZED),
                "Invalid username or password".into(),
            )));
        }
    }
    
    let session = create_session(&state.pool, user.id).await?;
    Ok((
        StatusCode::OK,
        [(
            SET_COOKIE,
            format!("session={}; HttpOnly; Max-Age=34560000", session.id),
        )],
        AppendHeaders([(
            SET_COOKIE,
            "authenticated=true; Max-Age=34560000; Path=/".to_string(),
        )]),
    )
        .into_response())
}
