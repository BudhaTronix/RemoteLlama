"use client";

import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { AttachmentRecord } from "@/types/app";

function AttachmentIcon({ attachment }: { attachment: AttachmentRecord }) {
  if (attachment.kind === "image") {
    return <ImageIcon className="h-4 w-4" />;
  }

  if (attachment.kind === "text" || attachment.kind === "document") {
    return <FileText className="h-4 w-4" />;
  }

  return <Paperclip className="h-4 w-4" />;
}

export function AttachmentChip({
  attachment,
  onRemove,
  compact = false,
}: {
  attachment: AttachmentRecord;
  onRemove?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "panel-muted micro-lift flex items-center gap-3 rounded-[22px] px-3 py-2.5 text-sm text-ink",
        compact ? "max-w-full" : "max-w-sm",
      )}
    >
      {attachment.previewUrl ? (
        <img
          src={attachment.previewUrl}
          alt={attachment.name}
          className="h-11 w-11 rounded-[16px] object-cover shadow-soft"
        />
      ) : (
        <div className="token-pill flex h-11 w-11 items-center justify-center rounded-[16px] text-muted">
          <AttachmentIcon attachment={attachment} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold tracking-[-0.01em]">{attachment.name}</p>
        <p className="truncate text-xs text-muted">
          {attachment.warning ?? `${Math.max(1, Math.round(attachment.size / 1024))} KB`}
        </p>
      </div>

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="focus-ring token-pill micro-lift rounded-full p-1.5 text-muted transition hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
