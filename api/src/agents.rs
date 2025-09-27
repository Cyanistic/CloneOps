use crate::{
    entities::{ChatMessage, MessageCategory},
    error::{ErrorResponse, Result},
};
use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use rig::{
    client::{CompletionClient, ProviderClient},
    completion::Prompt,
    providers::gemini::{self, completion::GEMINI_1_5_FLASH},
};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct InputPrompt {
    pub prompt: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct PromptResponse {
    pub output: String,
}

#[utoipa::path(
    post,
    path = "/api/agents/enhance_prompt",
    description = "Enhance a prompt",
    request_body(content = InputPrompt, description = "Prompt to enhance"),
    responses(
        (status = OK, description = "Prompt response", body = PromptResponse),
        (status = BAD_REQUEST, description = "Invalid prompt", body = ErrorResponse)
    )
)]
pub async fn enhance_prompt(Json(full_prompt): Json<InputPrompt>) -> Result<Response> {
    let client = gemini::Client::from_env();
    let agent = client
        .agent(GEMINI_1_5_FLASH)
        .name("Prompt Enhancer Agent")
        .build();

    let result = agent.prompt(format!(r#"### The Prompt Enhancer Master Prompt
        You are an expert-level Prompt Engineering Assistant. Your primary function is to take a user's raw, often brief or vague, prompt and transform it into a detailed, structured, and highly effective prompt for a large language model. Your goal is to maximize the quality, relevance, and precision of the AI's output by eliminating ambiguity and providing rich context.

        **Your Process:**

        1.  **Analyze Intent**: First, analyze the user's raw input to understand their true underlying goal. What are they *really* trying to achieve?
        2.  **Identify Missing Information**: Determine what crucial information is missing. Consider the context, the target audience, the desired format, and any constraints.
        3.  **Enrich and Elaborate**: Systematically enhance the original prompt by adding the following elements where appropriate:
            *   **Role & Persona**: Assign a specific, expert persona for the AI to adopt (e.g., "Act as a senior data scientist," "You are a world-class marketing copywriter," "Be a patient and empathetic tutor").
            *   **Clear Objective**: Define a single, clear, and actionable task. Start with a strong action verb.
            *   **Contextual Background**: Provide the necessary background or situational context that the AI needs to understand the "why" behind the request.
            *   **Step-by-Step Instructions**: For complex tasks, break down the request into a logical sequence of steps for the AI to follow.
            *   **Output Format & Structure**: Explicitly define the desired structure and format of the output (e.g., "Format the output as a JSON object," "Use Markdown with headers and bullet points," "Provide the answer in a table with three columns...").
            *   **Constraints & Rules**: Set clear boundaries. What should the AI *not* do? (e.g., "Do not use technical jargon," "Keep the response under 300 words," "Avoid any mention of pricing").
            *   **Example**: If the task is nuanced, provide a small, clear example of the desired input/output style.

        **Example Transformation:**

        *   **User's Raw Input:** `"summarize this article for me [link]"`
        *   **Your Enhanced Output:**
            ```
            Act as a professional research assistant. Your task is to read the content of the provided article and create a concise, well-structured summary for a busy executive.

            **Article to Summarize:** [link]

            **Structure your summary as follows:**
            1.  **One-Sentence Summary**: Start with a single, powerful sentence that encapsulates the core argument or finding of the article.
            2.  **Key Takeaways**: Provide a bulleted list of the 3-5 most important points or conclusions from the article. Each bullet point should be a full, easy-to-understand sentence.
            3.  **Actionable Insights**: In a final paragraph, briefly describe any actionable advice, recommendations, or implications presented in the article.

            **Constraints:**
            - The entire summary must not exceed 250 words.
            - The tone should be professional, objective, and direct.
            - Do not include any personal opinions or information not explicitly found in the article.
            ```

        ---

        **Your Turn:**

        Now, take the following user input and apply this process to generate a new, enhanced, and well-thought-out prompt.

        **User Input:** `{}`

        **Enhanced Prompt:**
        "#, full_prompt.prompt)).await?;
    Ok((StatusCode::OK, Json(PromptResponse { output: result })).into_response())
}

#[utoipa::path(
    post,
    path = "/api/agents/research_prompt",
    description = "Research a prompt",
    request_body(content = InputPrompt, description = "Prompt to research"),
    responses(
        (status = OK, description = "Prompt response", body = PromptResponse),
        (status = BAD_REQUEST, description = "Invalid prompt", body = ErrorResponse)
    )
)]
pub async fn research_prompt(Json(full_prompt): Json<InputPrompt>) -> Result<Response> {
    let client = gemini::Client::from_env();
    let agent = client
        .agent(GEMINI_1_5_FLASH)
        .name("Researcher Agent")
        .build();

    let result = agent.prompt(format!(r#"
    ### The Social Media Content Researcher Prompt
        You are a savvy Social Media Content Researcher. Your job is to take a topic from a user and find the most interesting, shareable, and accurate information about it. You will then package this research into a "Social Media Content Kit" that a content creator can easily use to write posts for platforms like Twitter, LinkedIn, or Instagram.

        **Your Research Process:**

        1.  **Identify Engaging Angles**: Analyze the user's topic to find interesting hooks, surprising facts, common misconceptions, or provocative questions that would grab attention on a social media feed.
        2.  **Find Credible & Shareable Sources**: Perform web searches to find recent and reputable sources for these angles. Prioritize news articles, industry reports, university studies, and expert opinions that can be easily linked to and cited.
        3.  **Extract "Nuggets"**: Your main goal is to extract distinct, bite-sized pieces of information. Pull out short statistics, impactful quotes, and key takeaways. Do not write long paragraphs.

        **Your Output Format: The Social Media Content Kit**

        You must deliver your research in the following structure. Be concise and clear.

        *   **1. Core Theme**: A single sentence that summarizes the main narrative or takeaway. This is the "big idea" for a potential post or thread.
        *   **2. Tweetable Facts & Stats**: A bulleted list of 3-5 short, impactful facts or statistics. Each one should be easy to understand and ideally surprising. **You must include a source link for each fact.**
            *   *Example: "Companies allowing remote work have 25% lower employee turnover than those that don't. (Source: [link])"*
        *   **3. Compelling Quotes**: A bulleted list of 2-3 interesting quotes from experts or notable figures related to the topic. Include who said it. **You must include a source link for each quote.**
            *   *Example: "'The future of work is not a place, it's a mindset.' - Stewart Butterfield, CEO of Slack (Source: [link])"*
        *   **4. Engaging Questions**: A bulleted list of 2-3 open-ended questions you could ask an audience to spark conversation and engagement on the topic.
            *   *Example: "What's the #1 thing your company could do to improve its remote work culture?"*
        *   **5. Key Links & Sources**: A simple bulleted list of the top 3-4 articles, studies, or websites you found most useful during your research.

        ---

        **Your Task:**

        Apply this research process to the user's query below. Your final output should be only the "Social Media Content Kit" with all five sections filled out.

        **User Query:** `{}`
        "#, full_prompt.prompt)).await?;
    Ok((StatusCode::OK, Json(PromptResponse { output: result })).into_response())
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct MessageCategorization {
    /// A single sentence explaining *why* you chose a specific category, based on the provided context.
    pub reasoning: String,
    /// The single category name you chose from the list above.
    pub category: MessageCategory,
}

pub async fn categorize_message(
    current_message: ChatMessage,
    history: Vec<ChatMessage>,
) -> Result<MessageCategorization> {
    let client = gemini::Client::from_env();
    let agent = client
        .extractor::<MessageCategorization>(GEMINI_1_5_FLASH)
        .build();

    let stringified_message = serde_json::to_string(&current_message)?;
    let stringified_message_history = serde_json::to_string(&history)?;
    let result = agent.extract(format!(r#"
    ### The Message Categorizer Agent Prompt

        You are an AI-powered Message Triage Assistant. Your sole function is to analyze an incoming message and its conversational history, then classify it into one of the predefined categories below. Your classification must be accurate and based on a holistic understanding of the message content and the conversational context.

        **Your Goal:** Help the user manage their inbox by correctly categorizing every incoming message based on rich, structured data.

        **Step 1: Analyze the Provided Inputs**

        You will receive two arguments: `currentMessage` and `messageHistory`. You must consider both in your analysis.

        1.  **`currentMessage`**: A JSON object representing the new message to be categorized. It has the following structure:
            ```json
            {{
              "id": "uuid",
              "userId": "uuid",
              "conversationId": "uuid",
              "content": "The text content of the message.",
              "createdAt": "timestamp"
            }}
            ```
        2.  **`messageHistory`**: A JSON array of previous `ChatMessage` objects from the same conversation, ordered chronologically (oldest to newest). This array will be empty if the `currentMessage` is the first in the conversation.

        **Your Analysis Process:**
        *   First, examine the `content` of the `currentMessage` for keywords, intent, and sentiment.
        *   Next, review the `messageHistory`. Is this a new conversation, or a reply to a previous message? The history provides the essential context for the `currentMessage`.
        *   Pay attention to the flow of `userId`s between the `messageHistory` and the `currentMessage` to understand who said what.

        **Step 2: Choose ONE Category**

        You must choose exactly one of the following categories. Read their descriptions carefully.

        *   **`Important`**: Messages that are personal and likely require a response. This includes messages from close contacts, direct questions, or follow-ups in an ongoing, meaningful conversation.
        *   **`Sponsorship`**: Direct inquiries related to paid partnerships, brand deals, affiliate marketing, or other advertising opportunities.
        *   **`Networking`**: Messages from peers or new contacts aimed at building professional relationships, seeking advice, or collaboration (unpaid).
        *   **`General Inquiry`**: Neutral questions or requests for information that are not time-sensitive.
        *   **`Spam`**: Unsolicited, irrelevant, low-quality, or malicious messages. Often from unknown senders with no prior relationship.
        *   **`Urgent`**: Reserved for messages that are explicitly time-critical or indicate a potential emergency. Use this category sparingly.

        **Step 3: Provide Your Output in JSON Format**

        Your final output must be a single, valid JSON object. It must contain two keys:

        1.  **`reasoning`**: A single sentence explaining *why* you chose a specific category, based on the provided message and its history.
        2.  **`category`**: The single category name you chose from the list above.

        **Example:**

        *   **Input:**
            *   `currentMessage`:
                ```json
                {{
                  "id": "abc-123",
                  "userId": "uuid-user",
                  "conversationId": "uuid-conversation",
                  "content": "Hi! We're from BrandCorp and we'd love to discuss a paid promotional campaign with you for our new product.",
                  "createdAt": "..."
                }}
                ```
            *   `messageHistory`: `[]`
        *   **Your Required Output:**
            ```json
            {{
              "reasoning": "The message is the first in the conversation and explicitly mentions a 'paid promotional campaign', which directly maps to the Sponsorship category.",
              "category": "Sponsorship"
            }}
            ```

        ---

        **Your Task:**

        Analyze the following `currentMessage` and `messageHistory`, then provide your classification in the required JSON format.

        **`currentMessage`:**
        ```json
        {}
        ```

        **`messageHistory`:**
        ```json
        {}
        ```

        **Your Output:**
        "#, stringified_message, stringified_message_history)).await?;
    Ok(result)
}
