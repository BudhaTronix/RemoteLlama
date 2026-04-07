"use client";

import { Bot, Menu, MoonStar, Settings2, Sparkles, SunMedium } from "lucide-react";

import { useAppState } from "@/components/providers/app-provider";
import { StatusBadge } from "@/components/ui/status-badge";

export function Header() {
  const {
    connection,
    connectionStatus,
    connectionMessage,
    theme,
    toggleTheme,
    setSidebarOpen,
    setSettingsOpen,
  } = useAppState();

  return (
    <header className="flex items-center justify-between border-b border-stroke px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="focus-ring token-pill micro-lift rounded-full p-2 text-muted transition hover:text-ink md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand)_88%,white_10%),color-mix(in_srgb,var(--brand-strong)_78%,#0f172a_22%))] text-white shadow-glow">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-heading text-xl font-semibold tracking-[-0.03em]">
                OllaBridge
              </p>
              <span className="hidden rounded-full bg-brandSoft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand md:inline-flex">
                Remote AI
              </span>
            </div>
            <div className="mt-1 hidden items-center gap-2 text-sm text-muted md:flex">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>
                {connection
                  ? `${connection.protocol}://${connection.host}:${connection.port}`
                  : "No host configured"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={connectionStatus} message={connectionMessage} />
        <button
          type="button"
          onClick={toggleTheme}
          className="focus-ring token-pill micro-lift rounded-full p-2 text-muted transition hover:text-ink"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunMedium className="h-4 w-4" />
          ) : (
            <MoonStar className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="focus-ring token-pill micro-lift rounded-full p-2 text-muted transition hover:text-ink"
          aria-label="Open settings"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
