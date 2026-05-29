import type { ConnectionSettings } from "@/types/app";

import { buildOllamaBaseUrl } from "@/lib/ollama/connection";

const DEFAULT_TIMEOUT_MS = Number(process.env.OLLABRIDGE_PROXY_TIMEOUT_MS ?? "5000");
const DEFAULT_STREAM_TIMEOUT_MS = Number(
  process.env.OLLABRIDGE_STREAM_TIMEOUT_MS ?? "600000",
);

export function getRequestTimeout() {
  return Number.isFinite(DEFAULT_TIMEOUT_MS) ? DEFAULT_TIMEOUT_MS : 5000;
}

export function getStreamTimeout() {
  return Number.isFinite(DEFAULT_STREAM_TIMEOUT_MS)
    ? DEFAULT_STREAM_TIMEOUT_MS
    : 600000;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "The request timed out before Ollama finished responding.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export async function fetchOllama(
  connection: ConnectionSettings,
  pathname: string,
  init?: RequestInit,
  options?: { timeoutMs?: number },
) {
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? getRequestTimeout();
  const timeout =
    timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    return await fetch(`${buildOllamaBaseUrl(connection)}${pathname}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
