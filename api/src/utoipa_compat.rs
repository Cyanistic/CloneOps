#![allow(dead_code)]
use serde::Serialize;
use utoipa::ToSchema;

/// Describes the content of a message, which can be text, a tool result, an image, audio, or
///  a document. Dependent on provider supporting the content type. Multimedia content is generally
///  base64 (defined by it's format) encoded but additionally supports urls (for some providers).
#[derive(Serialize, ToSchema)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum UserContent {
    Text(Text),
    Image(Image),
    Audio(Audio),
    Video(Video),
    Document(Document),
}

#[derive(Serialize, ToSchema)]
pub struct Reasoning {
    pub id: Option<String>,
    pub reasoning: Vec<String>,
}

// ================================================================
// Base content models
// ================================================================

/// Basic text content.
#[derive(Serialize, ToSchema)]
pub struct Text {
    pub text: String,
}

/// Image content containing image data and metadata about it.
#[derive(Serialize, ToSchema)]
pub struct Image {
    pub data: DocumentSourceKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_type: Option<ImageMediaType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detail: Option<ImageDetail>,
    #[serde(flatten, skip_serializing_if = "Option::is_none")]
    pub additional_params: Option<serde_json::Value>,
}

/// The kind of image source (to be used).
#[derive(Serialize, ToSchema)]
#[serde(tag = "type", content = "value", rename_all = "camelCase")]
#[non_exhaustive]
pub enum DocumentSourceKind {
    /// A file URL/URI.
    Url(String),
    /// A base-64 encoded string.
    Base64(String),
    /// An unknown file source (there's nothing there).
    Unknown,
}

/// Audio content containing audio data and metadata about it.
#[derive(Serialize, ToSchema)]
pub struct Audio {
    pub data: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub format: Option<ContentFormat>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_type: Option<AudioMediaType>,
    #[serde(flatten, skip_serializing_if = "Option::is_none")]
    pub additional_params: Option<serde_json::Value>,
}

/// Video content containing video data and metadata about it.
#[derive(Serialize, ToSchema)]
pub struct Video {
    pub data: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub format: Option<ContentFormat>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_type: Option<VideoMediaType>,
    #[serde(flatten, skip_serializing_if = "Option::is_none")]
    pub additional_params: Option<serde_json::Value>,
}

/// Document content containing document data and metadata about it.
#[derive(Serialize, ToSchema)]
pub struct Document {
    pub data: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub format: Option<ContentFormat>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_type: Option<DocumentMediaType>,
    #[serde(flatten, skip_serializing_if = "Option::is_none")]
    pub additional_params: Option<serde_json::Value>,
}

/// Describes the format of the content, which can be base64 or string.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum ContentFormat {
    Base64,
    String,
}

/// Helper enum that tracks the media type of the content.
#[derive(Serialize, ToSchema)]
pub enum MediaType {
    Image(ImageMediaType),
    Audio(AudioMediaType),
    Document(DocumentMediaType),
    Video(VideoMediaType),
}

/// Describes the image media type of the content. Not every provider supports every media type.
/// Convertible to and from MIME type strings.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum ImageMediaType {
    JPEG,
    PNG,
    GIF,
    WEBP,
    HEIC,
    HEIF,
    SVG,
}

/// Describes the document media type of the content. Not every provider supports every media type.
/// Includes also programming languages as document types for providers who support code running.
/// Convertible to and from MIME type strings.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum DocumentMediaType {
    PDF,
    TXT,
    RTF,
    HTML,
    CSS,
    MARKDOWN,
    CSV,
    XML,
    Javascript,
    Python,
}

/// Describes the audio media type of the content. Not every provider supports every media type.
/// Convertible to and from MIME type strings.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum AudioMediaType {
    WAV,
    MP3,
    AIFF,
    AAC,
    OGG,
    FLAC,
}

/// Describes the video media type of the content. Not every provider supports every media type.
/// Convertible to and from MIME type strings.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum VideoMediaType {
    AVI,
    MP4,
    MPEG,
}

/// Describes the detail of the image content, which can be low, high, or auto (open-ai specific).
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum ImageDetail {
    Low,
    High,
    Auto,
}
