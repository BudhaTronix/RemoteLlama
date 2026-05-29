"use client";

import {
  ArrowUpRight,
  Database,
  FileText,
  Orbit,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { useAppState } from "@/components/providers/app-provider";

export function EmptyState() {
  const { selectedModel, connection } = useAppState();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 md:px-8">
      <div className="surface-glow panel w-full max-w-5xl overflow-hidden rounded-[34px] p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brandSoft px-3.5 py-1.5 text-xs uppercase tracking-[0.26em] text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              Ready when you are
            </div>

            <h2 className="mt-5 max-w-2xl font-heading text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              Start a conversation that feels local, even when your model lives elsewhere.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              Ask a question, drop in a document, or switch to another model. OllaBridge
              keeps each session local while streaming replies back from{" "}
              <span className="font-medium text-ink">
                {connection ? `${connection.host}:${connection.port}` : "your host"}
              </span>
              .
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="token-pill inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                <Orbit className="h-3.5 w-3.5 text-brand" />
                Connected workspace
              </div>
              <div className="token-pill inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                <WandSparkles className="h-3.5 w-3.5 text-brand" />
                {selectedModel || "Choose a model"}
              </div>
            </div>
          </div>

          <div className="panel-muted rounded-[30px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Suggested first moves
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Summarize the attached design brief and list open questions.",
                "Compare two uploaded files and highlight key differences.",
                "Draft a concise technical plan for the next feature.",
              ].map((prompt, index) => (
                <button
                  key={prompt}
                  type="button"
                  className="panel-muted micro-lift flex w-full items-start gap-3 rounded-[24px] px-4 py-4 text-left"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brandSoft text-xs font-semibold text-brand">
                    0{index + 1}
                  </span>
                  <span className="text-sm leading-6 text-inkSoft">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="panel-muted rounded-[28px] p-5">
            <FileText className="h-5 w-5 text-brand" />
            <p className="mt-4 text-sm font-semibold tracking-[-0.01em] text-ink">
              Bring file context
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Upload text, PDFs, DOCX, CSV, JSON, or images. OllaBridge extracts
              what it can and keeps the rest graceful.
            </p>
          </div>
          <div className="panel-muted rounded-[28px] p-5">
            <Database className="h-5 w-5 text-brand" />
            <p className="mt-4 text-sm font-semibold tracking-[-0.01em] text-ink">
              Switch models fast
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              The current model is{" "}
              <span className="font-semibold text-ink">{selectedModel || "not selected yet"}</span>.
              Refresh the catalog anytime from the toolbar.
            </p>
          </div>
          <div className="panel-muted rounded-[28px] p-5">
            <ArrowUpRight className="h-5 w-5 text-brand" />
            <p className="mt-4 text-sm font-semibold tracking-[-0.01em] text-ink">
              Keep threads local
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Sessions are stored in your browser, so reopening the app brings your
              past conversations back instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
