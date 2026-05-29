"use client";

import { useState } from "react";
import {
  Bot,
  Download,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { useAppState } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatTimestamp } from "@/lib/utils/time";

function SessionItem({
  isActive,
  title,
  updatedAt,
  onSelect,
  onRename,
  onDelete,
  onExport,
}: {
  isActive: boolean;
  title: string;
  updatedAt: string;
  onSelect: () => void;
  onRename: (nextTitle: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onExport: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  return (
    <div
      className={cn(
        "panel-muted micro-lift group rounded-[26px] p-3.5 transition",
        isActive
          ? "border-brand/30 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_92%,transparent),color-mix(in_srgb,var(--surface-solid)_88%,transparent))] shadow-float"
          : "hover:border-strokeStrong hover:bg-white/8",
      )}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void onRename(draft);
                setIsEditing(false);
              }
            }}
            className="field focus-ring w-full rounded-[18px] px-3 py-2.5 text-sm text-ink outline-none"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              className="flex-1 rounded-[18px]"
              onClick={() => {
                void onRename(draft);
                setIsEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-[18px]"
              onClick={() => {
                setDraft(title);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <button type="button" onClick={onSelect} className="w-full text-left">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border text-sm font-semibold",
                  isActive
                    ? "border-brand/20 bg-brandSoft text-brand"
                    : "border-stroke bg-white/8 text-muted",
                )}
              >
                {title.trim().charAt(0).toUpperCase() || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">
                  {title}
                </p>
                <p className="mt-1 text-xs text-muted" title={formatTimestamp(updatedAt)}>
                  {new Date(updatedAt).toLocaleDateString()} ·{" "}
                  {new Date(updatedAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="token-pill rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                Saved locally
              </span>
              {isActive ? (
                <span className="rounded-full bg-brandSoft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
                  Active
                </span>
              ) : null}
            </div>
          </button>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="focus-ring token-pill micro-lift rounded-full p-2 text-muted transition hover:text-ink"
                aria-label={`Rename ${title}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onExport}
                className="focus-ring token-pill micro-lift rounded-full p-2 text-muted transition hover:text-ink"
                aria-label={`Export ${title}`}
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void onDelete()}
              className="focus-ring micro-lift rounded-full border border-rose-400/20 bg-rose-400/10 p-2 text-rose-200 transition hover:bg-rose-400/16"
              aria-label={`Delete ${title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Sidebar() {
  const {
    sessions,
    activeSessionId,
    sidebarOpen,
    setSidebarOpen,
    newChat,
    selectSession,
    renameSession,
    removeSession,
    exportSession,
    setSettingsOpen,
  } = useAppState();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm transition md:hidden",
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          "panel fixed inset-y-0 left-0 z-40 mx-3 my-3 flex w-[324px] flex-col rounded-[30px] px-4 py-4 shadow-panel transition duration-300 md:static md:mx-0 md:my-0 md:w-[318px] md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-5 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand)_90%,white_10%),color-mix(in_srgb,var(--brand-strong)_82%,#0f172a_16%))] text-white shadow-glow">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-heading text-xl font-semibold tracking-[-0.03em]">
                OllaBridge
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">AI workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="focus-ring token-pill micro-lift rounded-full p-2 text-muted transition hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="panel-muted mb-5 hidden rounded-[26px] p-4 md:block">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand)_90%,white_10%),color-mix(in_srgb,var(--brand-strong)_82%,#0f172a_16%))] text-white shadow-glow">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-heading text-xl font-semibold tracking-[-0.03em] text-ink">
                  OllaBridge
                </p>
                <Sparkles className="h-4 w-4 text-brand" />
              </div>
              <p className="mt-1 text-sm leading-6 text-muted">
                A premium remote workspace for your Ollama models.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={newChat}
          className="w-full justify-between rounded-[22px] px-5 py-3.5 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </span>
          <span className="rounded-full bg-white/16 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/84">
            Instant
          </span>
        </Button>

        <div className="mt-6 flex-1 overflow-y-auto pr-1">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-xs uppercase tracking-[0.26em] text-muted">Sessions</p>
            <span className="token-pill rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              {sessions.length}
            </span>
          </div>
          <div className="space-y-3">
            {sessions.length ? (
              sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  isActive={activeSessionId === session.id}
                  title={session.title}
                  updatedAt={session.updatedAt}
                  onSelect={() => selectSession(session.id)}
                  onRename={(nextTitle) => renameSession(session.id, nextTitle)}
                  onDelete={() => removeSession(session.id)}
                  onExport={() => exportSession(session.id)}
                />
              ))
            ) : (
              <div className="panel-muted rounded-[26px] border-dashed px-4 py-6 text-sm leading-6 text-muted">
                No chats yet. Start a new session and your history will appear here.
              </div>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="token-pill mt-4 w-full justify-start rounded-[22px] py-3.5"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
          Settings
        </Button>
      </aside>
    </>
  );
}
