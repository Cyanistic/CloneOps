use crate::{
    auth::SessionAuth,
    entities::{ChatMessage, Conversation, MessageCategory, Post, get_conversation_participants},
    error::Result,
    state::{AppState, ClientMap},
};
use axum::{
    extract::State,
    response::{
        IntoResponse,
        sse::{Event, Sse},
    },
};
use serde::Serialize;
use serde_json::json;
use sqlx::SqlitePool;
use std::{convert::Infallible, time::Duration};
use tokio::sync::broadcast;
use tokio_stream::{StreamExt as _, wrappers::BroadcastStream};
use utoipa::ToSchema;
use uuid::Uuid;

/// The event types that can be sent over the SSE stream.
///
/// Events are sent as JSON with a `type` field indicating the event type
/// and a `data` field containing the event-specific payload.
#[derive(Clone, Debug, Serialize, ToSchema)]
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
pub enum SseEvent {
    /// A new message was sent in a conversation the user is part of
    NewMessage(ChatMessage),

    /// A new conversation was created that includes the user
    NewConversation(Conversation),

    /// A conversation's details (like title) were edited
    EditConversation(Conversation),

    /// New users were added to an existing conversation
    UsersAddedToConversation {
        /// The updated conversation details
        conversation: Conversation,
        /// List of user IDs that were added
        new_user_ids: Vec<Uuid>,
    },

    /// A message was categorized for this specific user
    MessageCategorized {
        /// The ID of the message that was categorized
        message_id: Uuid,
        /// The category assigned to the message
        category: MessageCategory,
        /// AI-generated reasoning for the categorization
        reasoning: String,
    },

    /// A new post was created
    NewPost(Post),
}

/// Example SSE event structure that will be sent to clients.
/// This is used for OpenAPI documentation purposes.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct SseEventExample {
    /// The type of event (e.g., "newMessage", "newConversation", etc.)
    #[serde(rename = "type")]
    pub event_type: String,
    /// The event-specific data payload
    pub data: serde_json::Value,
}

/// The handler for the SSE `/api/events` endpoint.
/// This keeps a connection open and streams events to the client.
///
/// ## Event Stream Format
///
/// Events are sent as Server-Sent Events (SSE) with JSON payloads.
/// Each event follows this structure:
/// ```
/// data: {"type": "eventType", "data": {...}}
/// ```
///
/// ## Event Types
///
/// - `newMessage`: A new message in a conversation
/// - `newConversation`: User was added to a new conversation
/// - `editConversation`: Conversation details were updated
/// - `usersAddedToConversation`: New users joined a conversation
/// - `messageCategorized`: A message was categorized for the user
#[utoipa::path(
    get,
    path = "/api/events",
    responses(
        (status = 200, description = "Server-Sent Event stream of real-time updates", 
         content_type = "text/event-stream",
         body = SseEvent,
         example = json!({
             "type": "newMessage",
             "data": {
                 "id": "550e8400-e29b-41d4-a716-446655440000",
                 "conversationId": "550e8400-e29b-41d4-a716-446655440001",
                 "senderId": "550e8400-e29b-41d4-a716-446655440002",
                 "content": "Hello, world!",
                 "createdAt": "2024-01-01T00:00:00Z",
                 "updatedAt": "2024-01-01T00:00:00Z"
             }
         })),
        (status = 401, description = "Unauthorized - User must be authenticated"),
    ),
    tag = "events",
    operation_id = "subscribeToEvents",
    summary = "Subscribe to real-time events",
    description = "Establishes a Server-Sent Events connection to receive real-time updates about conversations, messages, and categorizations."
)]
pub async fn events_handler(
    session: SessionAuth,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let user_id = session.0.id;

    // Create a new broadcast channel for this user.
    let (tx, _) = broadcast::channel(64);
    let pin = state.clients.pin();
    let tx = pin.get_or_insert(user_id, tx);

    // Create a stream from the receiver.
    let stream = BroadcastStream::new(tx.subscribe())
        // Listen for messages on the channel...
        .filter_map(|res| res.ok())
        // ...and map them into SSE `Event` objects.
        .map(|event: SseEvent| {
            // Serialize the event enum into a JSON string to send to the client.
            Event::default().json_data(event).unwrap_or_default()
        })
        .map(Ok::<_, Infallible>);

    // Return the SSE response, keeping the connection alive.
    Sse::new(stream)
        .keep_alive(axum::response::sse::KeepAlive::new().interval(Duration::from_secs(15)))
}

/// A helper function to broadcast an event to a list of users.
pub async fn broadcast_event(clients: &ClientMap, recipients: &[Uuid], event: &SseEvent) {
    let guard = clients.guard();
    for user_id in recipients {
        // Find the user in the client map.
        if let Some(tx) = clients.get(user_id, &guard) {
            // Send the event. An error means the user has disconnected,
            // which is fine, so we ignore it.
            let _ = tx.send(event.clone());
        }
    }
}

/// Documentation module for SSE event examples
pub mod sse_examples {
    use super::*;
    use serde_json::json;

    /// Example of a NewMessage event
    pub fn new_message_example() -> serde_json::Value {
        json!({
            "type": "newMessage",
            "data": {
                "id": "msg_123",
                "conversationId": "conv_456",
                "senderId": "user_789",
                "content": "[{\"type\":\"text\",\"content\":\"Hello!\"}]",
                "createdAt": "2024-01-01T12:00:00Z",
                "updatedAt": "2024-01-01T12:00:00Z"
            }
        })
    }

    /// Example of a MessageCategorized event
    pub fn message_categorized_example() -> serde_json::Value {
        json!({
            "type": "messageCategorized",
            "data": {
                "messageId": "msg_123",
                "category": "Important",
                "reasoning": "This message contains a direct question requiring a response."
            }
        })
    }

    /// Example of a UsersAddedToConversation event
    pub fn users_added_example() -> serde_json::Value {
        json!({
            "type": "usersAddedToConversation",
            "data": {
                "conversation": {
                    "id": "conv_456",
                    "title": "Project Discussion",
                    "lastMessageId": "msg_123",
                    "createdAt": "2024-01-01T10:00:00Z",
                    "updatedAt": "2024-01-01T12:00:00Z"
                },
                "newUserIds": ["user_abc", "user_def"]
            }
        })
    }
}
