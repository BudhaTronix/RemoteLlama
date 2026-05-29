"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { connectionSchema } from "@/lib/ollama/schemas";
import type { ConnectionSettings, ConnectionTestResult } from "@/types/app";

export function ConnectionForm({
  initialConnection,
  title,
  description,
  submitLabel,
  onSubmit,
  onTest,
}: {
  initialConnection: ConnectionSettings;
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (connection: ConnectionSettings) => Promise<ConnectionTestResult>;
  onTest: (connection: ConnectionSettings) => Promise<ConnectionTestResult>;
}) {
  const [protocol, setProtocol] = useState<ConnectionSettings["protocol"]>(
    initialConnection.protocol,
  );
  const [host, setHost] = useState(initialConnection.host);
  const [port, setPort] = useState(String(initialConnection.port));
  const [fieldError, setFieldError] = useState("");
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProtocol(initialConnection.protocol);
    setHost(initialConnection.host);
    setPort(String(initialConnection.port));
  }, [initialConnection]);

  function parseConnection() {
    const parsed = connectionSchema.safeParse({
      protocol,
      host,
      port,
    });

    if (!parsed.success) {
      setFieldError(
        parsed.error.issues[0]?.message ?? "Check your connection details.",
      );
      return null;
    }

    setFieldError("");
    return parsed.data;
  }

  async function handleTest() {
    const parsed = parseConnection();
    if (!parsed) {
      return;
    }

    setIsTesting(true);
    try {
      const result = await onTest(parsed);
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseConnection();
    if (!parsed) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSubmit(parsed);
      setTestResult(result);
    } finally {
      setIsSaving(false);
    }
  }

  const resultTone = testResult?.ok
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
    : "border-rose-400/20 bg-rose-400/10 text-rose-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-brand/80">
          {title}
        </p>
        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[140px,1fr,140px]">
        <label className="space-y-2 text-sm">
          <span className="text-muted">Protocol</span>
          <select
            value={protocol}
            onChange={(event) =>
              setProtocol(event.target.value as ConnectionSettings["protocol"])
            }
            className="field focus-ring w-full rounded-[18px] px-4 py-3 text-ink outline-none"
          >
            <option value="http">http</option>
            <option value="https">https</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted">Host or URL</span>
          <input
            value={host}
            onChange={(event) => setHost(event.target.value)}
            placeholder="192.168.1.42 or ollama.example.com"
            className="field focus-ring w-full rounded-[18px] px-4 py-3 text-ink outline-none placeholder:text-muted"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted">Port</span>
          <input
            value={port}
            onChange={(event) => setPort(event.target.value)}
            placeholder="11434"
            inputMode="numeric"
            className="field focus-ring w-full rounded-[18px] px-4 py-3 text-ink outline-none placeholder:text-muted"
          />
        </label>
      </div>

      {fieldError ? (
        <p className="rounded-[20px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {fieldError}
        </p>
      ) : null}

      {testResult ? (
        <div className={`rounded-[20px] border px-4 py-3 text-sm ${resultTone}`}>
          <p className="font-semibold tracking-[-0.01em]">
            {testResult.ok
              ? `Connection succeeded${testResult.version ? ` (${testResult.version})` : ""}`
              : "Connection failed"}
          </p>
          <p className="mt-1 opacity-90">
            {testResult.ok
              ? `Latency ${testResult.latencyMs} ms`
              : testResult.error ?? "OllaBridge could not reach the remote Ollama instance."}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={handleTest}
          disabled={isTesting || isSaving}
          className="sm:flex-1 rounded-[18px]"
        >
          {isTesting ? <Spinner /> : null}
          Test Connection
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSaving}
          className="sm:flex-1 rounded-[18px]"
        >
          {isSaving ? <Spinner /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
