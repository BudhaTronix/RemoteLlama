"use client";

import { useState } from "react";
import { Bot, Check, Copy, User2 } from "lucide-react";

import { AttachmentChip } from "@/components/files/attachment-chip";
import { MarkdownContent } from "@/components/markdown/markdown-content";
import { cn } from "@/lib/utils/cn";
import { formatClock, formatTimestamp } from "@/lib/utils/time";
import type { ChatMessage } from "@/types/app";

export function ChatMessageCard({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  async function copyResponse() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article
      className={cn(
        "animate-float-in rounded-[30px] border p-5 shadow-soft backdrop-blur md:p-6",
        isAssistant
          ? "panel-muted mr-auto w-full max-w-4xl"
          : "ml-auto w-full max-w-3xl border-brand/18 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_90%,transparent),color-mix(in_srgb,var(--surface-solid)_82%,transparent))]",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-[18px] border shadow-soft",
              isAssistant
                ? "border-strokeStrong bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-solid)_82%,transparent),color-mix(in_srgb,var(--surface-alt)_90%,transparent))] text-brand"
                : "border-brand/18 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand)_88%,white_8%),color-mix(in_srgb,var(--brand-strong)_74%,#0f172a_12%))] text-white",
            )}
          >
            {isAssistant ? <Bot className="h-5 w-5" /> : <User2 className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              {isAssistant ? "Assistant" : "You"}
            </p>
            <p className="text-xs text-muted" title={formatTimestamp(message.createdAt)}>
              {formatClock(message.createdAt)}
            </p>
          </div>
        </div>

        {isAssistant && message.content ? (
          <button
            type="button"
            onClick={() => void copyResponse()}
            className="focus-ring token-pill micro-lift inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>

      {message.attachments?.length ? (
        <div className="mb-4 flex flex-wrap gap-3">
          {message.attachments.map((attachment) => (
            <AttachmentChip key={attachment.id} attachment={attachment} compact />
          ))}
        </div>
      ) : null}

      {isAssistant ? (
        <MarkdownContent content={message.content || "_Thinking..._"} />
      ) : (
        <div className="whitespace-pre-wrap text-sm leading-7 text-ink">
          {message.content}
        </div>
      )}

      {message.status === "streaming" ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brandSoft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
          <span className="h-2 w-2 rounded-full bg-brand" />
          Streaming response...
        </div>
      ) : null}

      {message.status === "error" && message.error ? (
        <p className="mt-4 rounded-[22px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {message.error}
        </p>
      ) : null}
    </article>
  );
}
