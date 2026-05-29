import type { ConnectionState } from "@/types/app";

import { cn } from "@/lib/utils/cn";

const badgeStyles: Record<ConnectionState, string> = {
  connected:
    "border-emerald-400/18 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(16,185,129,0.1))] text-emerald-100 shadow-[0_10px_24px_-18px_rgba(16,185,129,0.6)]",
  connecting:
    "border-amber-400/20 bg-[linear-gradient(180deg,rgba(245,158,11,0.18),rgba(245,158,11,0.08))] text-amber-100 shadow-[0_10px_24px_-18px_rgba(245,158,11,0.5)]",
  disconnected:
    "border-rose-400/18 bg-[linear-gradient(180deg,rgba(244,63,94,0.18),rgba(244,63,94,0.08))] text-rose-100 shadow-[0_10px_24px_-18px_rgba(244,63,94,0.45)]",
};

export function StatusBadge({
  status,
  message,
}: {
  status: ConnectionState;
  message?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] backdrop-blur-sm",
        badgeStyles[status],
      )}
      title={message}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-40" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-current" />
      </span>
      {status}
    </div>
  );
}
