use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use rig::{OneOrMany, message::UserContent};
use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    auth::SessionAuth,
    entities::{
        Delegation, Post, check_delegation, create_delegation, create_post, delete_delegation,
        delete_post, get_delegated_to_user, get_user_delegations, get_user_posts,
    },
    error::{AppError, Result},
    events::{SseEvent, broadcast_event},
    state::AppState,
    utoipa_compat,
};

// ====== Request/Response Structs ======

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreatePostRequest {
    #[schema(value_type = Vec<utoipa_compat::UserContent>)]
    pub content: OneOrMany<UserContent>,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ActAsQuery {
    /// Post/act on behalf of another user (requires delegation)
    pub act_as: Option<Uuid>,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateDelegationRequest {
    pub delegate_id: Uuid,
    pub can_post: bool,
    pub can_message: bool,
    pub can_delete_posts: bool,
}

// ====== Post Endpoints ======

#[utoipa::path(
    post,
    path = "/api/posts",
    request_body = CreatePostRequest,
    responses(
        (status = CREATED, description = "Post created successfully", body = Post),
        (status = FORBIDDEN, description = "Not authorized to post as this user"),
    )
)]
pub async fn create_post_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Query(query): Query<ActAsQuery>,
    Json(payload): Json<CreatePostRequest>,
) -> Result<Response> {
    let created_by = session.0.id;
    let user_id = if let Some(act_as_id) = query.act_as {
        // Check if user has delegation to post as act_as_id
        if let Some(delegation) = check_delegation(&state.pool, act_as_id, created_by).await? {
            if !delegation.can_post {
                return Err(AppError::AuthError(
                    "You don't have permission to post as this user".into(),
                ));
            }
            act_as_id
        } else {
            return Err(AppError::AuthError(
                "You don't have delegation from this user".into(),
            ));
        }
    } else {
        created_by
    };

    let post = create_post(&state.pool, user_id, created_by, payload.content).await?;

    // Broadcast SSE event for new post
    let event = SseEvent::NewPost(post.clone());
    // Send to the post owner and all their delegates
    let mut recipients = vec![user_id];
    if user_id != created_by {
        recipients.push(created_by);
    }
    let delegations = get_user_delegations(&state.pool, user_id).await?;
    for delegation in delegations {
        recipients.push(delegation.delegate_id);
    }
    broadcast_event(&state.clients, &recipients, &event).await;

    Ok((StatusCode::CREATED, Json(post)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/users/{id}/posts",
    params(
        ("id" = Uuid, Path, description = "User ID to get posts for")
    ),
    responses(
        (status = OK, description = "Posts retrieved successfully", body = Vec<Post>),
    )
)]
pub async fn get_posts_handler(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
) -> Result<Response> {
    let posts = get_user_posts(&state.pool, user_id).await?;
    Ok((StatusCode::OK, Json(posts)).into_response())
}

#[utoipa::path(
    delete,
    path = "/api/posts/{id}",
    params(
        ("id" = Uuid, Path, description = "Post ID to delete")
    ),
    responses(
        (status = NO_CONTENT, description = "Post deleted successfully"),
        (status = FORBIDDEN, description = "Not authorized to delete this post"),
    )
)]
pub async fn delete_post_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Path(post_id): Path<Uuid>,
) -> Result<Response> {
    delete_post(&state.pool, post_id, session.0.id).await?;
    Ok(StatusCode::NO_CONTENT.into_response())
}

// ====== Delegation Endpoints ======

#[utoipa::path(
    post,
    path = "/api/delegations",
    request_body = CreateDelegationRequest,
    responses(
        (status = CREATED, description = "Delegation created successfully", body = Delegation),
    )
)]
pub async fn create_delegation_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Json(payload): Json<CreateDelegationRequest>,
) -> Result<Response> {
    let delegation = create_delegation(
        &state.pool,
        session.0.id,
        payload.delegate_id,
        payload.can_post,
        payload.can_message,
        payload.can_delete_posts,
    )
    .await?;

    Ok((StatusCode::CREATED, Json(delegation)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/delegations",
    responses(
        (status = OK, description = "Delegations retrieved", body = Vec<Delegation>),
    )
)]
pub async fn get_delegations_handler(
    State(state): State<AppState>,
    session: SessionAuth,
) -> Result<Response> {
    let delegations = get_user_delegations(&state.pool, session.0.id).await?;
    Ok((StatusCode::OK, Json(delegations)).into_response())
}

#[utoipa::path(
    get,
    path = "/api/delegations/received",
    responses(
        (status = OK, description = "Received delegations retrieved", body = Vec<Delegation>),
    )
)]
pub async fn get_received_delegations_handler(
    State(state): State<AppState>,
    session: SessionAuth,
) -> Result<Response> {
    let delegations = get_delegated_to_user(&state.pool, session.0.id).await?;
    Ok((StatusCode::OK, Json(delegations)).into_response())
}

#[utoipa::path(
    delete,
    path = "/api/delegations/{delegate_id}",
    params(
        ("delegate_id" = Uuid, Path, description = "Delegate user ID to revoke")
    ),
    responses(
        (status = NO_CONTENT, description = "Delegation revoked successfully"),
    )
)]
pub async fn revoke_delegation_handler(
    State(state): State<AppState>,
    session: SessionAuth,
    Path(delegate_id): Path<Uuid>,
) -> Result<Response> {
    delete_delegation(&state.pool, session.0.id, delegate_id).await?;
    Ok(StatusCode::NO_CONTENT.into_response())
}

// ====== Feed Endpoint ======

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct FeedResponse {
    pub posts: Vec<Post>,
    pub from_users: Vec<Uuid>,
}

#[utoipa::path(
    get,
    path = "/api/feed",
    responses(
        (status = OK, description = "Feed retrieved successfully", body = FeedResponse),
    )
)]
pub async fn get_feed_handler(
    State(state): State<AppState>,
    session: SessionAuth,
) -> Result<Response> {
    let user_id = session.0.id;

    // Get posts from:
    // 1. The user themselves
    let mut all_posts = get_user_posts(&state.pool, user_id).await?;
    let mut from_users = vec![user_id];

    // 2. Users who have delegated to them
    let delegations = get_delegated_to_user(&state.pool, user_id).await?;
    for delegation in delegations {
        if delegation.can_post {
            let posts = get_user_posts(&state.pool, delegation.owner_id).await?;
            all_posts.extend(posts);
            from_users.push(delegation.owner_id);
        }
    }

    // Sort by created_at descending
    all_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    Ok((
        StatusCode::OK,
        Json(FeedResponse {
            posts: all_posts,
            from_users,
        }),
    )
        .into_response())
}

use serde::Serialize;
