use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use rig::{message::UserContent, OneOrMany};
use serde::Deserialize;
use std::collections::HashSet;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    auth::SessionAuth,
    entities::{
        create_chat_message, create_conversation, is_user_in_conversation, update_conversation_title, ChatMessage, Conversation
    },
    error::{AppError, Result},
    state::AppState, utoipa_compat,
};

// ====== Request Structs ======

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateConversationRequest {
    pub user_ids: HashSet<Uuid>,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct EditConversationRequest {
    pub title: String,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct SendMessageRequest {
    #[schema(value_type = Vec<utoipa_compat::UserContent>)]
    pub content: OneOrMany<UserContent>,
}

// ====== Endpoint Handlers ======

#[utoipa::path(
    post,
    path = "/api/conversations",
    request_body = CreateConversationRequest,
    responses(
        (status = CREATED, description = "Conversation created successfully", body = Conversation),
        (status = FORBIDDEN, description = "User is not authenticated"),
    )
)]
pub async fn create_conversation_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Json(mut payload): Json<CreateConversationRequest>,
) -> Result<impl IntoResponse> {
    // Ensure the current user is part of the conversation
    payload.user_ids.insert(session.0.id);
    // Remove duplicates
    let user_ids: Vec<Uuid> = payload
        .user_ids
        .into_iter()
        .collect();

    let conversation = create_conversation(&state.pool, &user_ids).await?;
    Ok((StatusCode::CREATED, Json(conversation)))
}

#[utoipa::path(
    post,
    path = "/api/conversations/{id}/messages",
    request_body = SendMessageRequest,
    params(
        ("id" = Uuid, Path, description = "ID of the conversation to send a message to")
    ),
    responses(
        (status = CREATED, description = "Message sent successfully", body = ChatMessage),
        (status = FORBIDDEN, description = "User is not part of the conversation"),
    )
)]
pub async fn send_message_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Path(conversation_id): Path<Uuid>,
    Json(payload): Json<SendMessageRequest>,
) -> Result<impl IntoResponse> {
    // Authorize: Check if the user is part of the conversation
    if !is_user_in_conversation(&state.pool, session.0.id, conversation_id).await? {
        return Err(AppError::AuthError(
            "You are not a member of this conversation.".into(),
        ));
    }

    let message = create_chat_message(
        &state.pool,
        conversation_id,
        session.0.id,
        payload.content,
    )
    .await?;

    Ok((StatusCode::CREATED, Json(message)))
}

#[utoipa::path(
    patch,
    path = "/api/conversations/{id}",
    request_body = EditConversationRequest,
    params(
        ("id" = Uuid, Path, description = "ID of the conversation to edit")
    ),
    responses(
        (status = OK, description = "Conversation updated successfully", body = Conversation),
        (status = FORBIDDEN, description = "User is not part of the conversation"),
    )
)]
pub async fn edit_conversation_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Path(conversation_id): Path<Uuid>,
    Json(payload): Json<EditConversationRequest>,
) -> Result<impl IntoResponse> {
    // Authorize: Check if the user is part of the conversation
    if !is_user_in_conversation(&state.pool, session.0.id, conversation_id).await? {
        return Err(AppError::AuthError(
            "You are not a member of this conversation.".into(),
        ));
    }

    let conversation =
        update_conversation_title(&state.pool, conversation_id, payload.title).await?;

    Ok((StatusCode::OK, Json(conversation)))
}

