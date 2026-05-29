import type { ChatSession } from "@/types/app";

export function sessionToMarkdown(session: ChatSession) {
  const lines: string[] = [
    `# ${session.title}`,
    "",
    `Model: ${session.model || "Unknown"}`,
    `Updated: ${session.updatedAt}`,
    "",
  ];

  for (const message of session.messages) {
    lines.push(`## ${message.role === "assistant" ? "Assistant" : "You"}`);
    lines.push(message.content || "_No content_");

    if (message.attachments?.length) {
      lines.push("");
      lines.push("Attachments:");
      for (const attachment of message.attachments) {
        lines.push(`- ${attachment.name} (${attachment.kind})`);
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}
