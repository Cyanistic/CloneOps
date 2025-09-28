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

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ConversationWithParticipants {
    #[serde(flatten)]
    pub conversation: Conversation,
    pub participants: Vec<User>,
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
#[derive(Clone, Debug, Serialize, Deserialize, FromRow, ToSchema)]
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

#[derive(Clone, Debug, Serialize, Deserialize, FromRow, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Post {
    pub id: Uuid,
    pub user_id: Uuid,
    pub created_by: Uuid,
    #[schema(value_type = Vec<crate::utoipa_compat::UserContent>)]
    pub content: Json<OneOrMany<UserContent>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, FromRow, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Delegation {
    pub owner_id: Uuid,
    pub delegate_id: Uuid,
    pub can_post: bool,
    pub can_message: bool,
    pub can_delete_posts: bool,
    pub created_at: DateTime<Utc>,
}

pub async fn create_user(pool: &SqlitePool, user: &CreateUser) -> Result<User> {
    let user_id = Uuid::new_v4();
    let Some(user) = sqlx::query_as!(
        User,
        r#"INSERT INTO users (id, username, password) VALUES (?, ?, ?) RETURNING id AS "id: _", username, password, created_at AS "created_at: _", updated_at AS "updated_at: _""#,
        user_id,
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
        ORDER BY DATETIME(m.created_at) DESC
        "#,
        user_id,
        conversation_id
    )
    .fetch_all(pool)
    .await?;
    Ok(messages)
}

pub async fn get_conversation_messages(
    pool: &SqlitePool,
    conversation_id: Uuid,
) -> Result<Vec<ChatMessage>> {
    let messages = sqlx::query_as!(
        ChatMessage,
        r#"
        SELECT 
            id AS "id: _", 
            conversation_id AS "conversation_id: _", 
            sender_id AS "sender_id: _", 
            content, 
            created_at AS "created_at: _", 
            updated_at AS "updated_at: _"
        FROM messages
        WHERE conversation_id = ?
        ORDER BY DATETIME(created_at) DESC
        "#,
        conversation_id
    )
    .fetch_all(pool)
    .await?;
    Ok(messages)
}

pub async fn get_conversation_messages_chronological(
    pool: &SqlitePool,
    conversation_id: Uuid,
) -> Result<Vec<ChatMessage>> {
    let messages = sqlx::query_as!(
        ChatMessage,
        r#"
        SELECT 
            id AS "id: _", 
            conversation_id AS "conversation_id: _", 
            sender_id AS "sender_id: _", 
            content, 
            created_at AS "created_at: _", 
            updated_at AS "updated_at: _"
        FROM messages
        WHERE conversation_id = ?
        ORDER BY DATETIME(created_at) ASC
        "#,
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

pub async fn get_conversation_with_participants(
    pool: &SqlitePool,
    conversation_id: Uuid,
) -> Result<ConversationWithParticipants> {
    let conversation = get_conversation(pool, conversation_id).await?;
    let participants = get_conversation_participants(pool, conversation_id).await?;
    Ok(ConversationWithParticipants {
        conversation,
        participants,
    })
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

// ====== Posts Functions ======

pub async fn create_post(
    pool: &SqlitePool,
    user_id: Uuid,
    created_by: Uuid,
    content: OneOrMany<UserContent>,
) -> Result<Post> {
    let post_id = Uuid::new_v4();
    let content_json = Json(content);
    let post = sqlx::query_as!(
        Post,
        r#"
        INSERT INTO posts (id, user_id, created_by, content)
        VALUES (?, ?, ?, ?)
        RETURNING 
            id AS "id: _",
            user_id AS "user_id: _",
            created_by AS "created_by: _",
            content AS "content: Json<OneOrMany<UserContent>>",
            created_at AS "created_at: _",
            updated_at AS "updated_at: _"
        "#,
        post_id,
        user_id,
        created_by,
        content_json
    )
    .fetch_one(pool)
    .await?;
    Ok(post)
}

pub async fn get_user_posts(pool: &SqlitePool, user_id: Uuid) -> Result<Vec<Post>> {
    let posts = sqlx::query_as!(
        Post,
        r#"
        SELECT 
            id AS "id: _",
            user_id AS "user_id: _",
            created_by AS "created_by: _",
            content AS "content: Json<OneOrMany<UserContent>>",
            created_at AS "created_at: _",
            updated_at AS "updated_at: _"
        FROM posts
        WHERE user_id = ?
        ORDER BY DATETIME(created_at) DESC
        "#,
        user_id
    )
    .fetch_all(pool)
    .await?;
    Ok(posts)
}

pub async fn delete_post(pool: &SqlitePool, post_id: Uuid, user_id: Uuid) -> Result<()> {
    // First check if the user is the owner or creator of the post
    let result = sqlx::query!(
        "DELETE FROM posts WHERE id = ? AND (user_id = ? OR created_by = ?)",
        post_id,
        user_id,
        user_id
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        // Check if the user has delegation permission to delete posts for the owner
        let post = sqlx::query!(
            "SELECT user_id AS \"user_id: Uuid\" FROM posts WHERE id = ?",
            post_id
        )
        .fetch_optional(pool)
        .await?;

        if let Some(post) = post {
            // Check if this user has delegation to delete posts for the post owner
            if let Some(delegation) = check_delegation(pool, post.user_id, user_id).await? {
                if delegation.can_delete_posts {
                    // User has delegation to delete posts, so delete the post
                    let result = sqlx::query!(
                        "DELETE FROM posts WHERE id = ? AND user_id = ?",
                        post_id,
                        post.user_id
                    )
                    .execute(pool)
                    .await?;

                    if result.rows_affected() == 0 {
                        return Err(AppError::AuthError("Post not found".into()));
                    }
                    return Ok(());
                }
            }
        }
        return Err(AppError::AuthError("Post not found or unauthorized".into()));
    }
    Ok(())
}

// ====== Delegation Functions ======

pub async fn create_delegation(
    pool: &SqlitePool,
    owner_id: Uuid,
    delegate_id: Uuid,
    can_post: bool,
    can_message: bool,
    can_delete_posts: bool,
) -> Result<Delegation> {
    let delegation = sqlx::query_as!(
        Delegation,
        r#"
        INSERT INTO delegations (owner_id, delegate_id, can_post, can_message, can_delete_posts)
        VALUES (?, ?, ?, ?, ?)
        RETURNING 
            owner_id AS "owner_id: _",
            delegate_id AS "delegate_id: _",
            can_post,
            can_message,
            can_delete_posts,
            created_at AS "created_at: _"
        "#,
        owner_id,
        delegate_id,
        can_post,
        can_message,
        can_delete_posts
    )
    .fetch_one(pool)
    .await?;
    Ok(delegation)
}

pub async fn get_user_delegations(pool: &SqlitePool, owner_id: Uuid) -> Result<Vec<Delegation>> {
    let delegations = sqlx::query_as!(
        Delegation,
        r#"
        SELECT 
            owner_id AS "owner_id: _",
            delegate_id AS "delegate_id: _",
            can_post,
            can_message,
            can_delete_posts,
            created_at AS "created_at: _"
        FROM delegations
        WHERE owner_id = ?
        "#,
        owner_id
    )
    .fetch_all(pool)
    .await?;
    Ok(delegations)
}

pub async fn get_delegated_to_user(
    pool: &SqlitePool,
    delegate_id: Uuid,
) -> Result<Vec<Delegation>> {
    let delegations = sqlx::query_as!(
        Delegation,
        r#"
        SELECT 
            owner_id AS "owner_id: _",
            delegate_id AS "delegate_id: _",
            can_post,
            can_message,
            can_delete_posts,
            created_at AS "created_at: _"
        FROM delegations
        WHERE delegate_id = ?
        "#,
        delegate_id
    )
    .fetch_all(pool)
    .await?;
    Ok(delegations)
}

pub async fn check_delegation(
    pool: &SqlitePool,
    owner_id: Uuid,
    delegate_id: Uuid,
) -> Result<Option<Delegation>> {
    let delegation = sqlx::query_as!(
        Delegation,
        r#"
        SELECT 
            owner_id AS "owner_id: _",
            delegate_id AS "delegate_id: _",
            can_post,
            can_message,
            can_delete_posts,
            created_at AS "created_at: _"
        FROM delegations
        WHERE owner_id = ? AND delegate_id = ?
        "#,
        owner_id,
        delegate_id
    )
    .fetch_optional(pool)
    .await?;
    Ok(delegation)
}

pub async fn delete_delegation(pool: &SqlitePool, owner_id: Uuid, delegate_id: Uuid) -> Result<()> {
    sqlx::query!(
        "DELETE FROM delegations WHERE owner_id = ? AND delegate_id = ?",
        owner_id,
        delegate_id
    )
    .execute(pool)
    .await?;
    Ok(())
}

// ====== User Search Functions ======

pub async fn search_users(pool: &SqlitePool, query: &str) -> Result<Vec<User>> {
    let search_pattern = format!("%{}%", query);
    let users = sqlx::query_as!(
        User,
        r#"
        SELECT 
            id AS "id: _",
            username,
            password,
            created_at AS "created_at: _",
            updated_at AS "updated_at: _"
        FROM users
        WHERE username LIKE ?
        ORDER BY username
        LIMIT 20
        "#,
        search_pattern
    )
    .fetch_all(pool)
    .await?;
    Ok(users)
}

pub async fn get_all_users(pool: &SqlitePool, limit: i64, offset: i64) -> Result<Vec<User>> {
    let users = sqlx::query_as!(
        User,
        r#"
        SELECT 
            id AS "id: _",
            username,
            password,
            created_at AS "created_at: _",
            updated_at AS "updated_at: _"
        FROM users
        ORDER BY username
        LIMIT ? OFFSET ?
        "#,
        limit,
        offset
    )
    .fetch_all(pool)
    .await?;
    Ok(users)
}

// ====== Read Tracking Functions ======

pub async fn mark_conversation_as_read(
    pool: &SqlitePool,
    user_id: Uuid,
    conversation_id: Uuid,
) -> Result<()> {
    sqlx::query!(
        r#"
        UPDATE conversation_participants
        SET last_read_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND conversation_id = ?
        "#,
        user_id,
        conversation_id
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_last_read_time(
    pool: &SqlitePool,
    user_id: Uuid,
    conversation_id: Uuid,
) -> Result<Option<DateTime<Utc>>> {
    let result = sqlx::query!(
        r#"
        SELECT last_read_at AS "last_read_at: DateTime<Utc>"
        FROM conversation_participants
        WHERE user_id = ? AND conversation_id = ?
        "#,
        user_id,
        conversation_id
    )
    .fetch_optional(pool)
    .await?;
    
    Ok(result.and_then(|r| r.last_read_at))
}

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UnreadMessage {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub conversation_title: Option<String>,
    pub sender_username: String,
}

pub async fn get_unread_messages(
    pool: &SqlitePool,
    user_id: Uuid,
) -> Result<Vec<UnreadMessage>> {
    let messages = sqlx::query_as!(
        UnreadMessage,
        r#"
        SELECT 
            m.id AS "id: _",
            m.conversation_id AS "conversation_id: _",
            m.sender_id AS "sender_id: _",
            m.content,
            m.created_at AS "created_at: _",
            c.title AS "conversation_title",
            u.username AS "sender_username!"
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        JOIN conversation_participants cp ON cp.conversation_id = c.id
        JOIN users u ON m.sender_id = u.id
        WHERE cp.user_id = ?
        AND m.sender_id != ?
        AND (cp.last_read_at IS NULL OR DATETIME(m.created_at) > DATETIME(cp.last_read_at))
        ORDER BY DATETIME(m.created_at) DESC
        LIMIT 100
        "#,
        user_id,
        user_id
    )
    .fetch_all(pool)
    .await?;
    
    Ok(messages)
}
