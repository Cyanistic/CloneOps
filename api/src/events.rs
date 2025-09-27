use crate::{
    auth::SessionAuth,
    entities::{ChatMessage, Conversation, get_conversation_participants},
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
use sqlx::SqlitePool;
use std::{convert::Infallible, time::Duration};
use tokio::sync::broadcast;
use tokio_stream::{StreamExt as _, wrappers::BroadcastStream};
use uuid::Uuid;

/// The event types that can be sent over the SSE stream.
#[derive(Clone, Debug, Serialize)]
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
pub enum SseEvent {
    NewMessage(ChatMessage),
    NewConversation(Conversation),
    EditConversation(Conversation),
    UsersAddedToConversation {
        conversation: Conversation,
        new_user_ids: Vec<Uuid>,
    },
}

/// The handler for the SSE `/api/events` endpoint.
/// This keeps a connection open and streams events to the client.
#[utoipa::path(
    get,
    path = "/api/events",
    responses(
        (status = 200, description = "Event stream"),
        (status = 401, description = "Unauthorized"),
    )
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
