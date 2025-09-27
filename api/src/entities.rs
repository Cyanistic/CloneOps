use axum::http::StatusCode;
use chrono::{DateTime, Duration, Utc};
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

#[derive(Clone, Debug, Serialize, Deserialize, FromRow)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub expires: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn create_user(pool: &SqlitePool, user: &CreateUser) -> Result<User> {
    let id = Uuid::new_v4();
    let Some(user) = sqlx::query_as!(
        User,
        r#"INSERT INTO users (id, username, password) VALUES (?, ?, ?) RETURNING id AS "id: _", username, password, created_at AS "created_at: _", updated_at AS "updated_at: _""#,
        id,
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

pub async fn get_user(pool: &SqlitePool, username: String) -> Result<Option<User>> {
    Ok(sqlx::query_as!(
        User,
        r#"SELECT id AS "id: _", username, password, created_at AS "created_at: _", updated_at AS "updated_at: _" FROM users WHERE username = ?"#,
        username
    )
    .fetch_optional(pool)
    .await?)
}

pub async fn get_user_by_id(pool: &SqlitePool, id: Uuid) -> Result<User> {
    let Some(user) = sqlx::query_as!(
        User,
        r#"SELECT id AS "id: _", username, password, created_at AS "created_at: _", updated_at AS "updated_at: _" FROM users WHERE id = ?"#,
        id
    )
    .fetch_optional(pool)
    .await?
    else {
        return Err(AppError::UserError((
            LossyError(StatusCode::NOT_FOUND),
            "User not found!".into(),
        )));
    };
    Ok(user)
}

pub async fn delete_user(pool: &SqlitePool, id: Uuid) -> Result<()> {
    let result = sqlx::query!("DELETE FROM users WHERE id = ?", id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::UserError((
            LossyError(StatusCode::NOT_FOUND),
            "User not found!".into(),
        )));
    }

    Ok(())
}

pub async fn create_session(pool: &SqlitePool, user_id: Uuid) -> Result<Session> {
    let expires = Utc::now() + Duration::days(7);
    let id = Uuid::new_v4();
    let session = sqlx::query_as!(
        Session,
        r#"
        INSERT INTO sessions (id, user_id, expires) VALUES (?, ?, ?)
        RETURNING id AS "id: _", user_id AS "user_id: _", expires AS "expires: _", created_at AS "created_at: _", updated_at AS "updated_at: _"
        "#,
        id,
        user_id,
        expires
    )
    .fetch_one(pool)
    .await?;
    Ok(session)
}

pub async fn get_session(pool: &SqlitePool, id: Uuid) -> Result<Option<Session>> {
    Ok(sqlx::query_as!(
        Session,
        r#"
        SELECT id AS "id: _", user_id AS "user_id: _", expires AS "expires: _", created_at AS "created_at: _", updated_at AS "updated_at: _"
        FROM sessions WHERE id = ? AND DATETIME(expires) >= CURRENT_TIMESTAMP
        "#,
        id
    )
    .fetch_optional(pool)
    .await?)
}

pub async fn delete_session(pool: &SqlitePool, id: Uuid) -> Result<()> {
    sqlx::query!("DELETE FROM sessions WHERE id = ?", id)
        .execute(pool)
        .await?;
    Ok(())
}
