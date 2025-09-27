use axum::http::StatusCode;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{SqlitePool, prelude::FromRow};
use uuid::Uuid;

use crate::{
    error::{AppError, LossyError, Result},
    users::CreateUser,
};

#[derive(Clone, Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub password: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn create_user(pool: &SqlitePool, user: &CreateUser) -> Result<User> {
    let Some(user) = sqlx::query_as!(
        User,
        r#"INSERT INTO users (username, password) VALUES (?, ?) RETURNING id AS "id: _", username, password, created_at AS "created_at: _", updated_at AS "updated_at: _""#,
        user.username,
        user.password
    )
    .fetch_optional(pool)
    .await?
    else {
        return Err(AppError::UserError((
            LossyError(StatusCode::CONFLICT),
            "Username already in use!".into(),
        )));
    };
    Ok(user)
}
