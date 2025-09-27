CREATE TABLE users (
	id BLOB NOT NULL PRIMARY KEY,
	username TEXT NOT NULL UNIQUE COLLATE NOCASE,
	password TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
	id BLOB NOT NULL PRIMARY KEY,
	user_id BLOB NOT NULL,
	expires TIMESTAMP NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE conversations (
    id BLOB NOT NULL PRIMARY KEY,
    title TEXT,
    last_message_id BLOB, -- Can be NULL if conversation is empty
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id BLOB NOT NULL PRIMARY KEY,
    conversation_id BLOB NOT NULL,
    sender_id BLOB NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Create a table to link users to conversations
CREATE TABLE conversation_participants (
    conversation_id BLOB NOT NULL,
    user_id BLOB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create a table for user-specific message metadata, including categories and reasoning
CREATE TABLE user_message_metadata (
    user_id BLOB NOT NULL,
    message_id BLOB NOT NULL,
    category INTEGER NOT NULL,
    reasoning TEXT,
    PRIMARY KEY (user_id, message_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Create an index for faster message retrieval by conversation
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
