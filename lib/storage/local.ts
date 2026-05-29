import type {
  ChatSession,
  ConnectionSettings,
  ModelInfo,
  ThemeMode,
} from "@/types/app";

const STORAGE_KEYS = {
  connection: "ollabridge.connection",
  model: "ollabridge.model",
  activeSession: "ollabridge.activeSession",
  theme: "ollabridge.theme",
  modelCache: "ollabridge.modelCache",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredConnection() {
  return readJson<ConnectionSettings>(STORAGE_KEYS.connection);
}

export function setStoredConnection(connection: ConnectionSettings) {
  writeJson(STORAGE_KEYS.connection, connection);
}

export function getStoredModel() {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(STORAGE_KEYS.model) ?? "";
}

export function setStoredModel(model: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.model, model);
}

export function getStoredActiveSession() {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(STORAGE_KEYS.activeSession) ?? "";
}

export function setStoredActiveSession(sessionId: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.activeSession, sessionId);
}

export function getStoredTheme(): ThemeMode {
  if (!isBrowser()) {
    return "dark";
  }

  const value = window.localStorage.getItem(STORAGE_KEYS.theme);
  return value === "light" ? "light" : "dark";
}

export function setStoredTheme(theme: ThemeMode) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function getStoredModelCache() {
  return readJson<ModelInfo[]>(STORAGE_KEYS.modelCache) ?? [];
}

export function setStoredModelCache(models: ModelInfo[]) {
  writeJson(STORAGE_KEYS.modelCache, models);
}

export function getSessionSummary(session: ChatSession) {
  return {
    id: session.id,
    title: session.title,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length,
  };
}
