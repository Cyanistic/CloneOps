use axum::http::StatusCode;
use chrono::{DateTime, Duration, Utc};
use rig::{OneOrMany, message::UserContent};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use sqlx::{SqlitePool, prelude::FromRow, types::Json};
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    error::{AppError, LossyError, Result},
    users::CreateUser,
};

#[derive(Clone, Debug, Serialize, Deserialize, FromRow, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub password: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, FromRow, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub expires: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, FromRow, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Conversation {
    pub id: Uuid,
    pub title: Option<String>,
    pub last_message_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, FromRow, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ChatMessage {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, sqlx::Type, ToSchema, JsonSchema)]
#[repr(u8)]
#[serde(rename_all = "camelCase")]
pub enum MessageCategory {
    Important,
    Sponsorship,
    Networking,
    GeneralInquiry,
    Spam,
    Urgent,
}

// This special struct will be returned by our get_chat_messages function
#[derive(Clone, Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ChatMessageWithMetadata {
    // All fields from ChatMessage
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    // Plus the user-specific metadata, which can be null
    pub category: Option<MessageCategory>,
    pub reasoning: Option<String>,
}

pub async fn create_user(pool: &SqlitePool, user: &CreateUser) -> Result<User> {
    let id = Uuid::new_v4();
    let Some(user) = sqlx::query_as!(
        User,
        r#"INSERT OR IGNORE INTO users (id, username, password) VALUES (?, ?, ?) RETURNING id AS "id: _", username, password, created_at AS "created_at: _", updated_at AS "updated_at: _""#,
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
    let session_id = Uuid::new_v4();
    let session = sqlx::query_as!(
        Session,
        r#"
        INSERT INTO sessions (id, user_id, expires) VALUES (?, ?, ?)
        RETURNING id AS "id: _", user_id AS "user_id: _", expires AS "expires: _", created_at AS "created_at: _", updated_at AS "updated_at: _"
        "#,
        session_id,
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
        FROM sessions 
        WHERE id = ? AND DATETIME(expires) > CURRENT_TIMESTAMP
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

pub async fn create_conversation(pool: &SqlitePool, user_ids: &[Uuid]) -> Result<Conversation> {
    let mut tx = pool.begin().await?;
    let conv_id = Uuid::new_v4();
    let conv = sqlx::query_as!(
        Conversation,
        r#"INSERT INTO conversations (id) VALUES (?) RETURNING id AS "id: _", title, last_message_id AS "last_message_id: _", created_at AS "created_at: _", updated_at AS "updated_at: _""#,
        conv_id
    )
    .fetch_one(&mut *tx)
    .await?;

    for user_id in user_ids {
        sqlx::query!(
            "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)",
            conv.id,
            user_id
        )
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(conv)
}

pub async fn get_user_conversations(pool: &SqlitePool, user_id: Uuid) -> Result<Vec<Conversation>> {
    let convos = sqlx::query_as!(
        Conversation,
        r#"
        SELECT c.id AS "id: _", c.title, c.last_message_id AS "last_message_id: _", c.created_at AS "created_at: _", c.updated_at AS "updated_at: _"
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ?
        ORDER BY c.updated_at DESC
        "#,
        user_id
    )
    .fetch_all(pool)
    .await?;
    Ok(convos)
}

pub async fn get_conversation_participants(
    pool: &SqlitePool,
    conversation_id: Uuid,
) -> Result<Vec<User>> {
    let users = sqlx::query_as!(
        User,
        r#"
        SELECT u.id AS "id: _", u.username, u.password, u.created_at AS "created_at: _", u.updated_at AS "updated_at: _"
        FROM users u
        JOIN conversation_participants cp ON u.id = cp.user_id
        WHERE cp.conversation_id = ?
        "#,
        conversation_id
    )
    .fetch_all(pool)
    .await?;
    Ok(users)
}

pub async fn create_chat_message(
    pool: &SqlitePool,
    conversation_id: Uuid,
    sender_id: Uuid,
    content: OneOrMany<UserContent>,
) -> Result<ChatMessage> {
    let mut tx = pool.begin().await?;
    let msg_id = Uuid::new_v4();
    let msg_content = Json(content);
    let msg = sqlx::query_as!(
        ChatMessage,
        r#"INSERT INTO messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?) 
        RETURNING id AS "id: _", conversation_id AS "conversation_id: _", sender_id AS "sender_id: _", content, created_at AS "created_at: _", updated_at AS "updated_at: _""#,
        msg_id,
        conversation_id,
        sender_id,
        msg_content
    )
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query!(
        "UPDATE conversations SET last_message_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        msg.id,
        conversation_id
    )
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(msg)
}

pub async fn get_chat_messages(
    pool: &SqlitePool,
    conversation_id: Uuid,
    user_id: Uuid,
) -> Result<Vec<ChatMessageWithMetadata>> {
    let messages = sqlx::query_as!(
        ChatMessageWithMetadata,
        r#"
        SELECT 
            m.id AS "id: _", 
            m.conversation_id AS "conversation_id: _", 
            m.sender_id AS "sender_id: _", 
            m.content, 
            m.created_at AS "created_at: _", 
            m.updated_at AS "updated_at: _",
            meta.category AS "category: _",
            meta.reasoning AS "reasoning: _"
        FROM messages m
        LEFT JOIN user_message_metadata meta ON m.id = meta.message_id AND meta.user_id = ?
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
        "#,
        user_id,
        conversation_id
    )
    .fetch_all(pool)
    .await?;
    Ok(messages)
}

pub async fn categorize_message(
    pool: &SqlitePool,
    user_id: Uuid,
    message_id: Uuid,
    category: MessageCategory,
    reasoning: String,
) -> Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO user_message_metadata (user_id, message_id, category, reasoning)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, message_id) DO UPDATE SET
            category = excluded.category,
            reasoning = excluded.reasoning;
        "#,
        user_id,
        message_id,
        category,
        reasoning
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn is_user_in_conversation(
    pool: &SqlitePool,
    user_id: Uuid,
    conversation_id: Uuid,
) -> Result<bool> {
    let count = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM conversation_participants WHERE user_id = ? AND conversation_id = ?",
        user_id,
        conversation_id
    )
    .fetch_one(pool)
    .await?;
    Ok(count > 0)
}

pub async fn update_conversation_title(
    pool: &SqlitePool,
    id: Uuid,
    title: String,
) -> Result<Conversation> {
    let conv = sqlx::query_as!(
        Conversation,
        r#"
        UPDATE conversations
        SET title = ?
        WHERE id = ?
        RETURNING id AS "id: _", title, last_message_id AS "last_message_id: _", created_at AS "created_at: _", updated_at AS "updated_at: _"
        "#,
        title,
        id
    )
    .fetch_one(pool)
    .await?;
    Ok(conv)
}

pub async fn get_conversation(pool: &SqlitePool, id: Uuid) -> Result<Conversation> {
    let conv = sqlx::query_as!(
        Conversation,
        r#"
        SELECT id AS "id: _", title, last_message_id AS "last_message_id: _", created_at AS "created_at: _", updated_at AS "updated_at: _"
        FROM conversations
        WHERE id = ?
        "#,
        id
    )
    .fetch_one(pool)
    .await?;
    Ok(conv)
}

pub async fn add_users_to_conversation(
    pool: &SqlitePool,
    conversation_id: Uuid,
    user_ids: &[Uuid],
) -> Result<()> {
    let mut tx = pool.begin().await?;

    for user_id in user_ids {
        sqlx::query!(
            "INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)",
            conversation_id,
            user_id
        )
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(())
}
