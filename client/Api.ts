/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * Describes the video media type of the content. Not every provider supports every media type.
 * Convertible to and from MIME type strings.
 */
export type VideoMediaType = "avi" | "mp4" | "mpeg";

export type MessageCategory =
  | "important"
  | "sponsorship"
  | "networking"
  | "generalInquiry"
  | "spam"
  | "urgent";

/**
 * Describes the image media type of the content. Not every provider supports every media type.
 * Convertible to and from MIME type strings.
 */
export type ImageMediaType =
  | "jpeg"
  | "png"
  | "gif"
  | "webp"
  | "heic"
  | "heif"
  | "svg";

/** Describes the detail of the image content, which can be low, high, or auto (open-ai specific). */
export type ImageDetail = "low" | "high" | "auto";

/**
 * Describes the document media type of the content. Not every provider supports every media type.
 * Includes also programming languages as document types for providers who support code running.
 * Convertible to and from MIME type strings.
 */
export type DocumentMediaType =
  | "pdf"
  | "txt"
  | "rtf"
  | "html"
  | "css"
  | "markdown"
  | "csv"
  | "xml"
  | "javascript"
  | "python";

/** Describes the format of the content, which can be base64 or string. */
export type ContentFormat = "base64" | "string";

/**
 * Describes the audio media type of the content. Not every provider supports every media type.
 * Convertible to and from MIME type strings.
 */
export type AudioMediaType = "wav" | "mp3" | "aiff" | "aac" | "ogg" | "flac";

export interface AddUsersToConversationRequest {
  userIds: string[];
}

/** Audio content containing audio data and metadata about it. */
export type Audio = {
  data: string;
  format?: null | ContentFormat;
  media_type?: null | AudioMediaType;
};

export interface ChatMessage {
  content: string;
  /** @format uuid */
  conversationId: string;
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  id: string;
  /** @format uuid */
  senderId: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ChatMessageWithMetadata {
  category?: null | MessageCategory;
  content: string;
  /** @format uuid */
  conversationId: string;
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  id: string;
  reasoning?: string | null;
  /** @format uuid */
  senderId: string;
  /** @format date-time */
  updatedAt: string;
}

export interface Conversation {
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  id: string;
  /** @format uuid */
  lastMessageId?: string | null;
  title?: string | null;
  /** @format date-time */
  updatedAt: string;
}

export type ConversationWithParticipants = Conversation & {
  participants: User[];
};

export interface CreateConversationRequest {
  /** @uniqueItems true */
  userIds: string[];
}

export interface CreateDelegationRequest {
  canDeletePosts: boolean;
  canMessage: boolean;
  canPost: boolean;
  /** @format uuid */
  delegateId: string;
}

export interface CreatePostRequest {
  content: UserContent[];
}

export interface CreateUser {
  password: string;
  username: string;
}

export interface Delegation {
  canDeletePosts: boolean;
  canMessage: boolean;
  canPost: boolean;
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  delegateId: string;
  /** @format uuid */
  ownerId: string;
}

/** Document content containing document data and metadata about it. */
export type Document = {
  data: string;
  format?: null | ContentFormat;
  media_type?: null | DocumentMediaType;
};

/** The kind of image source (to be used). */
export type DocumentSourceKind =
  | {
      type: "url";
      /** A file URL/URI. */
      value: string;
    }
  | {
      type: "base64";
      /** A base-64 encoded string. */
      value: string;
    }
  | {
      type: "unknown";
    };

export interface EditConversationRequest {
  title: string;
}

/**
 * A JSON response for errors that includes the error type and message
 * Used in HTTP responses to notify the client of errors
 */
export interface ErrorResponse {
  /** @example "Something went wrong" */
  message: string;
  /** @example "UserError" */
  type: string;
}

export interface FeedResponse {
  fromUsers: string[];
  posts: Post[];
}

/** Image content containing image data and metadata about it. */
export type Image = {
  /** The kind of image source (to be used). */
  data: DocumentSourceKind;
  detail?: null | ImageDetail;
  media_type?: null | ImageMediaType;
};

export interface InputPrompt {
  prompt: string;
}

export interface LoginUser {
  password: string;
  username: string;
}

export interface Post {
  content: UserContent[];
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  createdBy: string;
  /** @format uuid */
  id: string;
  /** @format date-time */
  updatedAt: string;
  /** @format uuid */
  userId: string;
}

export interface PromptResponse {
  output: string;
}

export interface PublicUser {
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  id: string;
  username: string;
}

export interface SendMessageRequest {
  content: UserContent[];
}

/**
 * The event types that can be sent over the SSE stream.
 *
 * Events are sent as JSON with a `type` field indicating the event type
 * and a `data` field containing the event-specific payload.
 */
export type SseEvent =
  | {
      /** A new message was sent in a conversation the user is part of */
      data: ChatMessage;
      type: "newMessage";
    }
  | {
      /** A new conversation was created that includes the user */
      data: Conversation;
      type: "newConversation";
    }
  | {
      /** A conversation's details (like title) were edited */
      data: Conversation;
      type: "editConversation";
    }
  | {
      /** New users were added to an existing conversation */
      data: {
        /** The updated conversation details */
        conversation: Conversation;
        /** List of user IDs that were added */
        new_user_ids: string[];
      };
      type: "usersAddedToConversation";
    }
  | {
      /** A message was categorized for this specific user */
      data: {
        /** The category assigned to the message */
        category: MessageCategory;
        /**
         * The ID of the message that was categorized
         * @format uuid
         */
        message_id: string;
        /** AI-generated reasoning for the categorization */
        reasoning: string;
      };
      type: "messageCategorized";
    }
  | {
      /** A new post was created */
      data: Post;
      type: "newPost";
    };

/**
 * Example SSE event structure that will be sent to clients.
 * This is used for OpenAPI documentation purposes.
 */
export interface SseEventExample {
  /** The event-specific data payload */
  data: any;
  /** The type of event (e.g., "newMessage", "newConversation", etc.) */
  type: string;
}

/** Basic text content. */
export interface Text {
  text: string;
}

export interface User {
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  id: string;
  password: string;
  /** @format date-time */
  updatedAt: string;
  username: string;
}

/**
 * Describes the content of a message, which can be text, a tool result, an image, audio, or
 *  a document. Dependent on provider supporting the content type. Multimedia content is generally
 *  base64 (defined by it's format) encoded but additionally supports urls (for some providers).
 */
export type UserContent =
  | (Text & {
      type: "text";
    })
  | (Image & {
      type: "image";
    })
  | (Audio & {
      type: "audio";
    })
  | (Video & {
      type: "video";
    })
  | (Document & {
      type: "document";
    });

/** Video content containing video data and metadata about it. */
export type Video = {
  data: string;
  format?: null | ContentFormat;
  media_type?: null | VideoMediaType;
};

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title cloneops-api
 * @version 0.1.0
 * @license
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Enhance a prompt
     *
     * @tags agents
     * @name EnhancePrompt
     * @request POST:/api/agents/enhance_prompt
     */
    enhancePrompt: (data: InputPrompt, params: RequestParams = {}) =>
      this.request<PromptResponse, ErrorResponse>({
        path: `/api/agents/enhance_prompt`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Research a prompt
     *
     * @tags agents
     * @name ResearchPrompt
     * @request POST:/api/agents/research_prompt
     */
    researchPrompt: (data: InputPrompt, params: RequestParams = {}) =>
      this.request<PromptResponse, ErrorResponse>({
        path: `/api/agents/research_prompt`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags messaging
     * @name ListConversationsHandler
     * @request GET:/api/conversations
     */
    listConversationsHandler: (
      query?: {
        /**
         * Filter by user ID (requires access)
         * @format uuid
         */
        user_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Conversation[], void>({
        path: `/api/conversations`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags messaging
     * @name CreateConversationHandler
     * @request POST:/api/conversations
     */
    createConversationHandler: (
      data: CreateConversationRequest,
      params: RequestParams = {},
    ) =>
      this.request<Conversation, void>({
        path: `/api/conversations`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags messaging
     * @name GetConversationHandler
     * @request GET:/api/conversations/{id}
     */
    getConversationHandler: (id: string, params: RequestParams = {}) =>
      this.request<ConversationWithParticipants, void>({
        path: `/api/conversations/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags messaging
     * @name EditConversationHandler
     * @request PATCH:/api/conversations/{id}
     */
    editConversationHandler: (
      id: string,
      data: EditConversationRequest,
      params: RequestParams = {},
    ) =>
      this.request<Conversation, void>({
        path: `/api/conversations/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags messaging
     * @name GetMessagesHandler
     * @request GET:/api/conversations/{id}/messages
     */
    getMessagesHandler: (id: string, params: RequestParams = {}) =>
      this.request<ChatMessage[], void>({
        path: `/api/conversations/${id}/messages`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags messaging
     * @name SendMessageHandler
     * @request POST:/api/conversations/{id}/messages
     */
    sendMessageHandler: (
      id: string,
      data: SendMessageRequest,
      params: RequestParams = {},
    ) =>
      this.request<ChatMessage, void>({
        path: `/api/conversations/${id}/messages`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags messaging
     * @name GetCategorizedMessagesHandler
     * @request GET:/api/conversations/{id}/messages/categorized
     */
    getCategorizedMessagesHandler: (id: string, params: RequestParams = {}) =>
      this.request<ChatMessageWithMetadata[], void>({
        path: `/api/conversations/${id}/messages/categorized`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags messaging
     * @name AddUsersToConversationHandler
     * @request POST:/api/conversations/{id}/users
     */
    addUsersToConversationHandler: (
      id: string,
      data: AddUsersToConversationRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/conversations/${id}/users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name GetDelegationsHandler
     * @request GET:/api/delegations
     */
    getDelegationsHandler: (params: RequestParams = {}) =>
      this.request<Delegation[], any>({
        path: `/api/delegations`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name CreateDelegationHandler
     * @request POST:/api/delegations
     */
    createDelegationHandler: (
      data: CreateDelegationRequest,
      params: RequestParams = {},
    ) =>
      this.request<Delegation, any>({
        path: `/api/delegations`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name GetReceivedDelegationsHandler
     * @request GET:/api/delegations/received
     */
    getReceivedDelegationsHandler: (params: RequestParams = {}) =>
      this.request<Delegation[], any>({
        path: `/api/delegations/received`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name RevokeDelegationHandler
     * @request DELETE:/api/delegations/{delegate_id}
     */
    revokeDelegationHandler: (delegateId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/delegations/${delegateId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Establishes a Server-Sent Events connection to receive real-time updates about conversations, messages, and categorizations.
     *
     * @tags events
     * @name SubscribeToEvents
     * @summary Subscribe to real-time events
     * @request GET:/api/events
     */
    subscribeToEvents: (params: RequestParams = {}) =>
      this.request<SseEvent, void>({
        path: `/api/events`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name GetFeedHandler
     * @request GET:/api/feed
     */
    getFeedHandler: (params: RequestParams = {}) =>
      this.request<FeedResponse, any>({
        path: `/api/feed`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Login a user to the backend
     *
     * @tags users
     * @name Login
     * @request POST:/api/login
     */
    login: (data: LoginUser, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name CreatePostHandler
     * @request POST:/api/posts
     */
    createPostHandler: (data: CreatePostRequest, params: RequestParams = {}) =>
      this.request<Post, void>({
        path: `/api/posts`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name DeletePostHandler
     * @request DELETE:/api/posts/{id}
     */
    deletePostHandler: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/posts/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetProfile
     * @request GET:/api/profile
     * @secure
     */
    getProfile: (params: RequestParams = {}) =>
      this.request<User, void>({
        path: `/api/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Register a new user to the database
     *
     * @tags users
     * @name Register
     * @request POST:/api/register
     */
    register: (data: CreateUser, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name DeleteUserHandler
     * @request DELETE:/api/users/me
     * @secure
     */
    deleteUserHandler: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/users/me`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name SearchUsersHandler
     * @request GET:/api/users/search
     */
    searchUsersHandler: (
      query: {
        /** Search query for username */
        q: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublicUser[], any>({
        path: `/api/users/search`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetUserHandler
     * @request GET:/api/users/{id}
     */
    getUserHandler: (id: string, params: RequestParams = {}) =>
      this.request<PublicUser, void>({
        path: `/api/users/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name GetPostsHandler
     * @request GET:/api/users/{id}/posts
     */
    getPostsHandler: (id: string, params: RequestParams = {}) =>
      this.request<Post[], any>({
        path: `/api/users/${id}/posts`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
