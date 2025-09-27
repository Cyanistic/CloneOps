use axum::{
    Json,
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Deserialize;
use sqlx::prelude::FromRow;
use utoipa::ToSchema;

use crate::{
    entities::create_user,
    error::{ErrorResponse, Result},
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
    let user = create_user(&state.pool, &user).await?;
    Ok((StatusCode::CREATED).into_response())
}
