"use client";

import { Orbit, Sparkles, Zap } from "lucide-react";

import { useAppState } from "@/components/providers/app-provider";
import { ConnectionForm } from "@/components/settings/connection-form";
import { getDefaultConnection } from "@/lib/ollama/connection";

export function SetupScreen() {
  const { saveConnection, testConnection } = useAppState();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-glow panel relative w-full max-w-6xl overflow-hidden rounded-[38px] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="panel-muted rounded-[30px] p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brandSoft px-3.5 py-1.5 text-xs uppercase tracking-[0.24em] text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              First launch
            </div>
            <h1 className="mt-5 max-w-2xl font-heading text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
              Bridge your laptop to a remote Ollama host
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
              OllaBridge keeps the interface local, routes requests through Next.js,
              and remembers your connection details in the browser so you can pick
              up chats quickly.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="token-pill inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                <Orbit className="h-3.5 w-3.5 text-brand" />
                Browser-safe proxy
              </div>
              <div className="token-pill inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                <Zap className="h-3.5 w-3.5 text-brand" />
                Local-first sessions
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="panel-muted rounded-[26px] p-5">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Proxy-first architecture
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The browser never talks to Ollama directly, so frontend CORS quirks
                  stay out of your way.
                </p>
              </div>
              <div className="panel-muted rounded-[26px] p-5">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Local-first persistence
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Chats, models, theme preferences, and uploaded context stay on your
                  device unless you export them.
                </p>
              </div>
            </div>
          </div>

          <div className="panel-muted rounded-[30px] p-6 md:p-8">
            <ConnectionForm
              initialConnection={getDefaultConnection()}
              title="Setup"
              description="Enter the remote Ollama address. You can use a plain IP/host or paste a full URL."
              submitLabel="Save & Continue"
              onSubmit={saveConnection}
              onTest={(connection) => testConnection(connection)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
