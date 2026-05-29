import type { AttachmentRecord, ImageHandlingMode } from "@/types/app";

import { inferVisionSupport } from "@/lib/ollama/models";

const MAX_SINGLE_ATTACHMENT_CHARS = 12000;
const MAX_TOTAL_ATTACHMENT_CHARS = 30000;

function truncateText(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit)}\n\n[Truncated for context length]`;
}

export function composeAttachmentContext(attachments?: AttachmentRecord[]) {
  if (!attachments?.length) {
    return "";
  }

  let remaining = MAX_TOTAL_ATTACHMENT_CHARS;
  const sections: string[] = [];

  for (const attachment of attachments) {
    if (!attachment.extractedText?.trim()) {
      continue;
    }

    const capped = truncateText(attachment.extractedText.trim(), MAX_SINGLE_ATTACHMENT_CHARS);
    const clipped = truncateText(capped, remaining);
    remaining -= clipped.length;
    if (remaining <= 0) {
      break;
    }

    sections.push(`File: ${attachment.name}\n${clipped}`);
  }

  if (!sections.length) {
    return "";
  }

  return `Attached file context:\n\n${sections.join("\n\n---\n\n")}`;
}

export function collectImagePayloads(
  attachments: AttachmentRecord[] | undefined,
  modelName: string,
  imageMode: ImageHandlingMode,
) {
  if (!attachments?.length) {
    return [];
  }

  const allowImages =
    imageMode === "force" ||
    inferVisionSupport({
      name: modelName,
    });

  if (!allowImages) {
    return [];
  }

  return attachments
    .filter((attachment) => attachment.kind === "image" && attachment.base64Data)
    .map((attachment) => attachment.base64Data as string);
}
