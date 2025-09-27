use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use rig::{OneOrMany, message::UserContent};
use serde::Deserialize;
use std::collections::HashSet;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    agents,
    auth::SessionAuth,
    entities::{
        ChatMessage, ChatMessageWithMetadata, Conversation, ConversationWithParticipants,
        add_users_to_conversation, categorize_message, create_chat_message, create_conversation,
        get_chat_messages, get_conversation, get_conversation_messages,
        get_conversation_messages_chronological, get_conversation_participants,
        get_conversation_with_participants, is_user_in_conversation, update_conversation_title,
    },
    error::{AppError, Result},
    events::{SseEvent, broadcast_event},
    state::AppState,
    utoipa_compat,
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

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct AddUsersToConversationRequest {
    pub user_ids: Vec<Uuid>,
}

// ====== Helper Functions ======

async fn broadcast_to_conversation(
    pool: &sqlx::SqlitePool,
    clients: &crate::state::ClientMap,
    conversation_id: Uuid,
    event: SseEvent,
) -> Result<()> {
    let participants = get_conversation_participants(pool, conversation_id).await?;
    let recipients: Vec<Uuid> = participants.into_iter().map(|u| u.id).collect();
    if !recipients.is_empty() {
        broadcast_event(clients, &recipients, &event).await;
    }
    Ok(())
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
    let user_ids: Vec<Uuid> = payload.user_ids.into_iter().collect();

    let conversation = create_conversation(&state.pool, &user_ids).await?;

    // Broadcast the new conversation event to all participants
    broadcast_to_conversation(
        &state.pool,
        &state.clients,
        conversation.id,
        SseEvent::NewConversation(conversation.clone()),
    )
    .await?;

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
) -> Result<Response> {
    let user_id = session.0.id;
    // Authorize: Check if the user is part of the conversation
    if !is_user_in_conversation(&state.pool, user_id, conversation_id).await? {
        return Err(AppError::AuthError(
            "You are not a member of this conversation.".into(),
        ));
    }

    // The `UserContent` needs to be serialized to a string to be stored.
    let message =
        create_chat_message(&state.pool, conversation_id, user_id, payload.content).await?;

    // Get message history for categorization context (chronological order for AI)
    let history = get_conversation_messages_chronological(&state.pool, conversation_id).await?;

    // Wrap shared data in Arc to avoid unnecessary cloning
    let message_arc = std::sync::Arc::new(message.clone());
    let history_arc = std::sync::Arc::new(history);

    // Categorize the message for each recipient (not the sender)
    let participants = get_conversation_participants(&state.pool, conversation_id).await?;
    for participant in participants {
        if participant.id != user_id {
            // Run categorization asynchronously for each recipient
            let pool_clone = state.pool.clone();
            let clients_clone = state.clients.clone();
            let message_clone = message_arc.clone();
            let history_clone = history_arc.clone();
            let recipient_id = participant.id;

            tokio::spawn(async move {
                // Try to categorize, but don't fail if it doesn't work
                if let Ok(categorization) =
                    agents::categorize_message((*message_clone).clone(), &history_clone).await
                {
                    if let Ok(_) = categorize_message(
                        &pool_clone,
                        recipient_id,
                        message_clone.id,
                        categorization.category.clone(),
                        categorization.reasoning.clone(),
                    )
                    .await
                    {
                        // Send SSE event for the categorization
                        let event = SseEvent::MessageCategorized {
                            message_id: message_clone.id,
                            category: categorization.category,
                            reasoning: categorization.reasoning,
                        };
                        broadcast_event(&clients_clone, &[recipient_id], &event).await;
                    }
                }
            });
        }
    }

    // Broadcast the new message to all participants
    broadcast_to_conversation(
        &state.pool,
        &state.clients,
        conversation_id,
        SseEvent::NewMessage(message.clone()),
    )
    .await?;

    Ok((StatusCode::CREATED, Json(message)).into_response())
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
) -> Result<Response> {
    // Authorize: Check if the user is part of the conversation
    if !is_user_in_conversation(&state.pool, session.0.id, conversation_id).await? {
        return Err(AppError::AuthError(
            "You are not a member of this conversation.".into(),
        ));
    }

    let conversation =
        update_conversation_title(&state.pool, conversation_id, payload.title).await?;

    // Broadcast the conversation update to all participants
    broadcast_to_conversation(
        &state.pool,
        &state.clients,
        conversation_id,
        SseEvent::EditConversation(conversation.clone()),
    )
    .await?;

    Ok((StatusCode::OK, Json(conversation)).into_response())
}

#[utoipa::path(
    post,
    path = "/api/conversations/{id}/users",
    request_body = AddUsersToConversationRequest,
    params(
        ("id" = Uuid, Path, description = "ID of the conversation to add users to")
    ),
    responses(
        (status = OK, description = "Users added successfully"),
        (status = FORBIDDEN, description = "User is not part of the conversation"),
    )
)]
pub async fn add_users_to_conversation_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Path(conversation_id): Path<Uuid>,
    Json(payload): Json<AddUsersToConversationRequest>,
) -> Result<Response> {
    // Authorize: Check if the user is part of the conversation
    if !is_user_in_conversation(&state.pool, session.0.id, conversation_id).await? {
        return Err(AppError::AuthError(
            "You are not a member of this conversation.".into(),
        ));
    }

    // Add users to the conversation
    add_users_to_conversation(&state.pool, conversation_id, &payload.user_ids).await?;

    // Get the updated conversation
    let conversation = get_conversation(&state.pool, conversation_id).await?;

    // Broadcast to all participants (including new ones)
    broadcast_to_conversation(
        &state.pool,
        &state.clients,
        conversation_id,
        SseEvent::UsersAddedToConversation {
            conversation: conversation.clone(),
            new_user_ids: payload.user_ids.clone(),
        },
    )
    .await?;

    Ok((StatusCode::OK, Json(conversation)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/conversations/{id}",
    params(
        ("id" = Uuid, Path, description = "ID of the conversation to get")
    ),
    responses(
        (status = OK, description = "Conversation retrieved successfully", body = ConversationWithParticipants),
        (status = FORBIDDEN, description = "User is not part of the conversation"),
    )
)]
pub async fn get_conversation_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Path(conversation_id): Path<Uuid>,
) -> Result<Response> {
    // Authorize: Check if the user is part of the conversation
    if !is_user_in_conversation(&state.pool, session.0.id, conversation_id).await? {
        return Err(AppError::AuthError(
            "You are not a member of this conversation.".into(),
        ));
    }

    let conversation_with_participants =
        get_conversation_with_participants(&state.pool, conversation_id).await?;

    Ok((StatusCode::OK, Json(conversation_with_participants)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/conversations/{id}/messages",
    params(
        ("id" = Uuid, Path, description = "ID of the conversation to get messages for")
    ),
    responses(
        (status = OK, description = "Messages retrieved successfully", body = Vec<ChatMessage>),
        (status = FORBIDDEN, description = "User is not part of the conversation"),
    )
)]
pub async fn get_messages_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Path(conversation_id): Path<Uuid>,
) -> Result<Response> {
    // Authorize: Check if the user is part of the conversation
    if !is_user_in_conversation(&state.pool, session.0.id, conversation_id).await? {
        return Err(AppError::AuthError(
            "You are not a member of this conversation.".into(),
        ));
    }

    let messages = get_conversation_messages(&state.pool, conversation_id).await?;

    Ok((StatusCode::OK, Json(messages)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/conversations/{id}/messages/categorized",
    params(
        ("id" = Uuid, Path, description = "ID of the conversation to get categorized messages for")
    ),
    responses(
        (status = OK, description = "Categorized messages retrieved successfully", body = Vec<ChatMessageWithMetadata>),
        (status = FORBIDDEN, description = "User is not part of the conversation"),
    )
)]
pub async fn get_categorized_messages_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Path(conversation_id): Path<Uuid>,
) -> Result<Response> {
    let user_id = session.0.id;
    // Authorize: Check if the user is part of the conversation
    if !is_user_in_conversation(&state.pool, user_id, conversation_id).await? {
        return Err(AppError::AuthError(
            "You are not a member of this conversation.".into(),
        ));
    }

    // Get messages with user-specific categorization metadata
    let messages = get_chat_messages(&state.pool, conversation_id, user_id).await?;

    Ok((StatusCode::OK, Json(messages)).into_response())
}
