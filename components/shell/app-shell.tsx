"use client";

import { AlertTriangle } from "lucide-react";

import { ChatComposer } from "@/components/composer/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { EmptyState } from "@/components/chat/empty-state";
import { useAppState } from "@/components/providers/app-provider";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SetupScreen } from "@/components/settings/setup-screen";
import { Header } from "@/components/shell/header";
import { Sidebar } from "@/components/shell/sidebar";

export function AppShell() {
  const {
    hydrated,
    connection,
    activeSession,
    connectionStatus,
    connectionMessage,
  } = useAppState();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="surface-glow panel w-full max-w-xl rounded-[34px] px-8 py-7 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-brand/80">OllaBridge</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em]">
            Loading your workspace
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Restoring local sessions, preferences, and your saved connection.
          </p>
          <div className="shimmer-line mt-6 h-1.5 rounded-full animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!connection?.host) {
    return <SetupScreen />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-95">
        <div className="absolute left-[-7%] top-[-4%] h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute left-[22%] top-[4%] h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-4%] h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <SettingsPanel />

      <div className="relative flex h-screen overflow-hidden p-3 md:p-4">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex min-h-0 flex-1 flex-col md:pl-4">
            <section className="surface-glow panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-shell">
              <Header />

              <div className="border-b border-stroke px-4 py-4 md:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-brand/80">
                      Active conversation
                    </p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.03em] md:text-[2rem]">
                      {activeSession?.title ?? "New chat"}
                    </h2>
                  </div>

                  <div className="panel-muted rounded-[22px] px-4 py-3 text-sm text-muted">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-brand/80">
                      Connection summary
                    </span>
                    <span className="mt-1 block font-medium text-ink">{connectionMessage}</span>
                  </div>
                </div>

                {connectionStatus === "disconnected" ? (
                  <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="leading-6">
                      OllaBridge is using your saved host settings, but the last
                      connection test failed. You can update them from Settings and
                      keep working locally in the meantime.
                    </p>
                  </div>
                ) : null}
              </div>

              {activeSession?.messages.length ? <ChatMessageList /> : <EmptyState />}
              <ChatComposer />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
