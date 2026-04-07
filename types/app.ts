export type ConnectionProtocol = "http" | "https";
export type ConnectionState = "connected" | "connecting" | "disconnected";
export type ThemeMode = "dark" | "light";
export type MessageRole = "system" | "user" | "assistant";
export type MessageStatus = "idle" | "streaming" | "error";
export type AttachmentKind = "text" | "document" | "image" | "binary";
export type ImageHandlingMode = "auto" | "force";

export interface ConnectionSettings {
  protocol: ConnectionProtocol;
  host: string;
  port: number;
}

export interface ModelInfo {
  name: string;
  size?: number;
  modifiedAt?: string;
  details?: Record<string, unknown> | null;
  supportsImagesGuess: boolean;
}

export interface AttachmentRecord {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: AttachmentKind;
  source: "client" | "server";
  extractedText?: string;
  previewUrl?: string;
  base64Data?: string;
  warning?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  attachments?: AttachmentRecord[];
  status?: MessageStatus;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ConnectionTestResult {
  ok: boolean;
  status: number;
  latencyMs: number;
  version?: string;
  error?: string;
}

export interface ChatStreamEvent {
  type: "meta" | "delta" | "done" | "error";
  data?: Record<string, unknown>;
  content?: string;
  error?: string;
}
