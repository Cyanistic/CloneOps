use core::fmt;
use std::fmt::{Display, Formatter};
use std::ops::Deref;

use axum::{
    Json,
    extract::rejection::JsonRejection,
    http::{HeaderMap, StatusCode, header::SET_COOKIE},
    response::{IntoResponse, Response},
};
use color_eyre::eyre;
use rig::completion::PromptError;
use rig::extractor::ExtractionError;
use serde::{Serialize, Serializer};
use thiserror::Error;
use utoipa::ToSchema;

/// A wrapper type that serializes any type that implements `Display` into a string.
#[derive(Debug)]
pub struct LossyError<T>(pub T);

impl<T: Display> Display for LossyError<T> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl<T: Display> Serialize for LossyError<T> {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.0.to_string())
    }
}

impl<T> Deref for LossyError<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

/// Error that wraps `anyhow::Error`.
/// Useful to provide more fine grained error handling in our application.
/// Helps us debug errors in the code easier and gives the client a better idea of what went wrong.
#[derive(Debug, Serialize, Error)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum AppError {
    #[error("The JSON body was rejected: {0}")]
    JsonRejection(LossyError<JsonRejection>),
    #[error("SQLx error: {0}")]
    SqlxError(LossyError<sqlx::Error>),
    #[error("Serde serialzation error: {0}")]
    SerdeError(LossyError<serde_json::Error>),
    #[error("Error during authentication: {0}")]
    AuthError(String),
    #[error("{}", .0.1)]
    UserError((LossyError<StatusCode>, String)),
    #[error("Something went wrong: {0}")]
    Generic(LossyError<eyre::Error>),
    #[error("Prompt error: {0}")]
    PromptError(LossyError<PromptError>),
    #[error("Extraction error: {0}")]
    ExtractionError(LossyError<ExtractionError>),
}

/// A JSON response for errors that includes the error type and message
/// Used in HTTP responses to notify the client of errors
#[derive(Serialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ErrorResponse {
    #[schema(value_type = String, example = "UserError")]
    pub r#type: AppError,
    #[schema(example = "Something went wrong")]
    pub message: String,
}

impl AppError {
    /// Get the error type as a string to notify the client of what went wrong
    pub fn r#type(&self) -> &'static str {
        match self {
            AppError::JsonRejection(_) => "JsonRejection",
            AppError::SerdeError(_) => "SerdeError",
            AppError::AuthError(_) => "AuthError",
            AppError::SqlxError(_) => "SqlxError",
            AppError::Generic(_) => "Generic",
            AppError::UserError(_) => "User",
            AppError::PromptError(_) => "PromptError",
            AppError::ExtractionError(_) => "ExtractionError",
        }
    }
}

/// Tell axum how to convert `AppError` into a response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let mut headers = HeaderMap::new();
        let (status, message) = match &self {
            AppError::JsonRejection(rejection) => (rejection.status(), rejection.body_text()),
            AppError::SerdeError(_) => (StatusCode::BAD_REQUEST, self.to_string()),
            AppError::AuthError(e) => {
                headers.append(SET_COOKIE, "session=; HttpOnly; Max-Age=0".parse().unwrap());
                headers.append(
                    SET_COOKIE,
                    "authenticated=; Path=/; Max-Age=0".parse().unwrap(),
                );
                (StatusCode::UNAUTHORIZED, e.to_string())
            }
            AppError::UserError((code, e)) => (**code, e.to_string()),
            AppError::SqlxError(_) | AppError::Generic(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, self.to_string())
            }
            AppError::PromptError(_) => (StatusCode::BAD_REQUEST, self.to_string()),
            AppError::ExtractionError(_) => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
        };
        // Return a JSON response with the error type and message.
        (
            status,
            headers,
            Json(ErrorResponse {
                r#type: self,
                message,
            }),
        )
            .into_response()
    }
}

#[macro_export]
macro_rules! impl_from_error {
    ($from_type:ty => $app_error_variant:ident) => {
        impl From<$from_type> for AppError {
            fn from(err: $from_type) -> Self {
                Self::$app_error_variant(LossyError(err))
            }
        }
    };
    ($from_type:ty) => {
        impl From<$from_type> for AppError {
            fn from(err: $from_type) -> Self {
                Self::Generic(LossyError(eyre::eyre!(err)))
            }
        }
    };
}

// Specific From impls to avoid conflict
impl_from_error!(JsonRejection => JsonRejection);
impl_from_error!(sqlx::Error => SqlxError);
impl_from_error!(serde_json::Error => SerdeError);
impl_from_error!(eyre::Error => Generic);
impl_from_error!(PromptError => PromptError);
impl_from_error!(ExtractionError => ExtractionError);
impl_from_error!(std::io::Error);
impl_from_error!(sqlx::migrate::MigrateError);

pub type Result<T> = std::result::Result<T, AppError>;
