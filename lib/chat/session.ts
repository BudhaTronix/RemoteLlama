import type {
  AttachmentRecord,
  ChatMessage,
  ChatSession,
  MessageRole,
} from "@/types/app";

import { createId } from "@/lib/utils/id";

export function deriveSessionTitle(text: string) {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "New chat";
  }

  if (normalized.length <= 42) {
    return normalized;
  }

  return `${normalized.slice(0, 42).trimEnd()}...`;
}

export function createMessage(
  role: MessageRole,
  content: string,
  attachments?: AttachmentRecord[],
): ChatMessage {
  return {
    id: createId(role),
    role,
    content,
    createdAt: new Date().toISOString(),
    ...(attachments?.length ? { attachments } : {}),
  };
}

export function createAssistantDraft() {
  return {
    id: createId("assistant"),
    role: "assistant" as const,
    content: "",
    createdAt: new Date().toISOString(),
    status: "streaming" as const,
  };
}

export function createEmptySession(model: string): ChatSession {
  const now = new Date().toISOString();

  return {
    id: createId("session"),
    title: "New chat",
    model,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function sortSessionsByRecent(sessions: ChatSession[]) {
  return [...sessions].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}
