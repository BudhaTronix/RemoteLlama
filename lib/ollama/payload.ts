import type { ChatMessage, ImageHandlingMode } from "@/types/app";

import {
  collectImagePayloads,
  composeAttachmentContext,
} from "@/lib/files/context";

interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[];
}

export function buildOllamaMessages(input: {
  messages: ChatMessage[];
  model: string;
  imageMode: ImageHandlingMode;
}) {
  const messages: OllamaChatMessage[] = [];

  for (const message of input.messages) {
    if (!["system", "user", "assistant"].includes(message.role)) {
      continue;
    }

    const attachmentContext = composeAttachmentContext(message.attachments);
    const content = attachmentContext
      ? [message.content, attachmentContext].filter(Boolean).join("\n\n")
      : message.content;

    const images =
      message.role === "user"
        ? collectImagePayloads(message.attachments, input.model, input.imageMode)
        : [];

    messages.push({
      role: message.role,
      content,
      ...(images.length ? { images } : {}),
    });
  }

  return messages;
}
