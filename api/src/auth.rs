use axum::{
    extract::{FromRequestParts, OptionalFromRequestParts, State},
    http::{header::COOKIE, request::Parts},
};
use color_eyre::eyre::eyre;
use tracing::{Level, instrument};
use uuid::Uuid;

use crate::{
    entities::{User, get_session, get_user_by_id},
    error::{AppError, LossyError},
    state::AppState,
};

#[derive(Debug)]
pub struct SessionAuth(pub User);

/// Attempt to extract the user from the request's session cookie.
impl<S> FromRequestParts<S> for SessionAuth
where
    S: Send + Sync,
    State<AppState>: FromRequestParts<S>,
{
    type Rejection = AppError;

    #[instrument(err(level = Level::WARN), skip(parts, state), name = "session_handler", level = "warn")]
    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        <Self as axum::extract::OptionalFromRequestParts<S>>::from_request_parts(parts, state)
            .await
            .and_then(|res| res.ok_or(AppError::AuthError("No session cookie provided".into())))
    }
}

/// Optionally extract the user from the session to allow for
/// differing behavior based on whether the user is logged in or not.
impl<S> OptionalFromRequestParts<S> for SessionAuth
where
    S: Send + Sync,
    State<AppState>: FromRequestParts<S>,
{
    type Rejection = AppError;

    #[instrument(err(level = Level::WARN), skip(parts, state), name = "session_handler")]
    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Option<Self>, Self::Rejection> {
        let State(state) = State::<AppState>::from_request_parts(parts, state)
            .await
            .map_err(|_| AppError::Generic(LossyError(eyre!("Database error"))))?;

        let cookies = match parts.headers.get(COOKIE) {
            Some(k) => k,
            None => return Ok(None),
        };

        let session_id: Uuid = match cookies
            .to_str()
            .ok()
            .and_then(|s| s.split(';').find_map(|s| s.trim().strip_prefix("session=")))
            .and_then(|s| Uuid::try_parse(s).ok())
        {
            Some(id) => id,
            None => return Ok(None),
        };

        let Some(session) = get_session(&state.pool, session_id).await? else {
            return Err(AppError::AuthError("Invalid session cookie".into()));
        };

        let user = get_user_by_id(&state.pool, session.user_id).await?;

        Ok(Some(SessionAuth(user)))
    }
}

