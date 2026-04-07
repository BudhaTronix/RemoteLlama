"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createAssistantDraft,
  createEmptySession,
  createMessage,
  deriveSessionTitle,
  sortSessionsByRecent,
} from "@/lib/chat/session";
import {
  requestConnectionTest,
  requestModels,
  streamChatRequest,
} from "@/lib/ollama/client";
import { deleteSession, listSessions, saveSession } from "@/lib/storage/db";
import {
  getStoredActiveSession,
  getStoredConnection,
  getStoredModel,
  getStoredModelCache,
  getStoredTheme,
  setStoredActiveSession,
  setStoredConnection,
  setStoredModel,
  setStoredModelCache,
  setStoredTheme,
} from "@/lib/storage/local";
import { sessionToMarkdown } from "@/lib/utils/export";
import type {
  AttachmentRecord,
  ChatSession,
  ConnectionSettings,
  ConnectionState,
  ConnectionTestResult,
  ImageHandlingMode,
  ModelInfo,
  ThemeMode,
} from "@/types/app";

interface SendMessageInput {
  text: string;
  attachments: AttachmentRecord[];
  imageMode: ImageHandlingMode;
}

interface AppContextValue {
  hydrated: boolean;
  theme: ThemeMode;
  connection: ConnectionSettings | null;
  connectionStatus: ConnectionState;
  connectionMessage: string;
  models: ModelInfo[];
  modelsLoading: boolean;
  selectedModel: string;
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeSession: ChatSession | null;
  isStreaming: boolean;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  saveConnection: (connection: ConnectionSettings) => Promise<ConnectionTestResult>;
  testConnection: (
    connection: ConnectionSettings,
    options?: { affectGlobal?: boolean },
  ) => Promise<ConnectionTestResult>;
  refreshModels: (connection?: ConnectionSettings | null) => Promise<void>;
  setSelectedModel: (model: string) => void;
  newChat: () => void;
  selectSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => Promise<void>;
  removeSession: (sessionId: string) => Promise<void>;
  exportSession: (sessionId: string) => void;
  sendMessage: (input: SendMessageInput) => Promise<void>;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const CONNECTION_HEARTBEAT_MS = 30000;

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

function findSession(sessions: ChatSession[], sessionId: string | null) {
  return sessions.find((session) => session.id === sessionId) ?? null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [connection, setConnection] = useState<ConnectionSettings | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionState>("disconnected");
  const [connectionMessage, setConnectionMessage] = useState(
    "Connect to your Ollama host",
  );
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedModel, setSelectedModelState] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const probeInFlightRef = useRef(false);

  const activeSession = findSession(sessions, activeSessionId);

  function createConnectedMessage(version?: string) {
    return `Connected${version ? ` to Ollama ${version}` : ""}`;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      const storedTheme = getStoredTheme();
      const storedConnection = getStoredConnection();
      const storedModel = getStoredModel();
      const storedSessions = await listSessions().catch(() => []);
      const storedActiveSession = getStoredActiveSession();
      const cachedModels = getStoredModelCache();

      if (cancelled) {
        return;
      }

      setTheme(storedTheme);
      setConnection(storedConnection);
      setSelectedModelState(storedModel);
      setModels(cachedModels);
      setSessions(storedSessions);
      setActiveSessionId(
        storedActiveSession || storedSessions[0]?.id || null,
      );
      setHydrated(true);

      if (storedConnection?.host) {
        setConnectionStatus("connecting");
        setConnectionMessage("Testing connection...");

        try {
          const result = await requestConnectionTest(storedConnection);

          if (cancelled) {
            return;
          }

          setConnectionStatus(result.ok ? "connected" : "disconnected");
          setConnectionMessage(
            result.ok
              ? createConnectedMessage(result.version)
              : result.error ?? "Connection failed",
          );

          if (!result.ok) {
            return;
          }

          setModelsLoading(true);
          try {
            const nextModels = await requestModels(storedConnection);

            if (cancelled) {
              return;
            }

            setModels(nextModels);
            setStoredModelCache(nextModels);

            if (!nextModels.length) {
              setConnectionMessage("Connected, but no Ollama models were found.");
              return;
            }

            const desiredModel =
              storedModel && nextModels.some((model) => model.name === storedModel)
                ? storedModel
                : nextModels[0].name;

            setSelectedModelState(desiredModel);
            setStoredModel(desiredModel);
          } catch (error) {
            if (!cancelled) {
              setConnectionStatus("connected");
              setConnectionMessage(
                error instanceof Error
                  ? `Connected, but model loading failed: ${error.message}`
                  : "Connected, but model loading failed.",
              );
            }
          } finally {
            if (!cancelled) {
              setModelsLoading(false);
            }
          }
        } catch (error) {
          if (!cancelled) {
            const message =
              error instanceof Error ? error.message : "Unable to test connection";
            setConnectionStatus("disconnected");
            setConnectionMessage(message);
          }
        }
      }
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    const heartbeatConnection = connection;

    if (!hydrated || !heartbeatConnection?.host || isStreaming) {
      return;
    }

    const activeConnection = heartbeatConnection;

    let cancelled = false;

    async function runHeartbeat() {
      if (probeInFlightRef.current) {
        return;
      }

      probeInFlightRef.current = true;

      try {
        const result = await requestConnectionTest(activeConnection);

        if (cancelled) {
          return;
        }

        setConnectionStatus(result.ok ? "connected" : "disconnected");
        setConnectionMessage(
          result.ok
            ? createConnectedMessage(result.version)
            : result.error ?? "Connection failed",
        );
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Unable to test connection";
          setConnectionStatus("disconnected");
          setConnectionMessage(message);
        }
      } finally {
        probeInFlightRef.current = false;
      }
    }

    const intervalId = window.setInterval(() => {
      void runHeartbeat();
    }, CONNECTION_HEARTBEAT_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runHeartbeat();
      }
    };

    const handleWindowFocus = () => {
      void runHeartbeat();
    };

    const handleWindowOnline = () => {
      void runHeartbeat();
    };

    const handleWindowOffline = () => {
      setConnectionStatus("disconnected");
      setConnectionMessage("Network offline");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("online", handleWindowOnline);
    window.addEventListener("offline", handleWindowOffline);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("online", handleWindowOnline);
      window.removeEventListener("offline", handleWindowOffline);
    };
  }, [
    hydrated,
    connection,
    isStreaming,
  ]);

  function applySelectedModel(
    model: string,
    options: { persist?: boolean; syncSession?: boolean } = {},
  ) {
    setSelectedModelState(model);

    if (options.persist !== false) {
      setStoredModel(model);
    }

    if (options.syncSession !== false && activeSessionId) {
      let updatedSession: ChatSession | null = null;

      setSessions((currentSessions) =>
        sortSessionsByRecent(
          currentSessions.map((session) => {
            if (session.id !== activeSessionId) {
              return session;
            }

            updatedSession = {
              ...session,
              model,
              updatedAt: new Date().toISOString(),
            };

            return updatedSession;
          }),
        ),
      );

      if (updatedSession) {
        void saveSession(updatedSession);
      }
    }
  }

  async function probeConnection(
    nextConnection: ConnectionSettings,
    options: { affectGlobal?: boolean; showConnecting?: boolean } = {},
  ) {
    const affectGlobal = options.affectGlobal ?? false;
    const showConnecting = options.showConnecting ?? affectGlobal;

    if (affectGlobal && showConnecting) {
      setConnectionStatus("connecting");
      setConnectionMessage("Testing connection...");
    }

    try {
      const result = await requestConnectionTest(nextConnection);

      if (affectGlobal) {
        setConnectionStatus(result.ok ? "connected" : "disconnected");
        setConnectionMessage(
          result.ok
            ? createConnectedMessage(result.version)
            : result.error ?? "Connection failed",
        );
      }

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to test connection";

      if (affectGlobal) {
        setConnectionStatus("disconnected");
        setConnectionMessage(message);
      }

      return {
        ok: false,
        status: 503,
        latencyMs: 0,
        error: message,
      } satisfies ConnectionTestResult;
    }
  }

  async function loadModels(targetConnection: ConnectionSettings) {
    setModelsLoading(true);
    try {
      const nextModels = await requestModels(targetConnection);
      setModels(nextModels);
      setStoredModelCache(nextModels);
      return nextModels;
    } finally {
      setModelsLoading(false);
    }
  }

  async function refreshModels(targetConnection = connection) {
    if (!targetConnection?.host) {
      return;
    }

    const nextModels = await loadModels(targetConnection);
    if (!nextModels.length) {
      return;
    }

    if (!nextModels.some((model) => model.name === selectedModel)) {
      applySelectedModel(nextModels[0].name, {
        persist: true,
      });
    }
  }

  async function saveConnectionSettings(nextConnection: ConnectionSettings) {
    setConnection(nextConnection);
    setStoredConnection(nextConnection);

    const result = await probeConnection(nextConnection, {
      affectGlobal: true,
    });

    if (result.ok) {
      await refreshModels(nextConnection);
    }

    return result;
  }

  function newChat() {
    const nextSession = createEmptySession(selectedModel || models[0]?.name || "");

    setSessions((currentSessions) => sortSessionsByRecent([nextSession, ...currentSessions]));
    setActiveSessionId(nextSession.id);
    setStoredActiveSession(nextSession.id);
    setSidebarOpen(false);
    void saveSession(nextSession);
  }

  function selectSession(sessionId: string) {
    startTransition(() => {
      setActiveSessionId(sessionId);
      setStoredActiveSession(sessionId);
      setSidebarOpen(false);
    });

    const session = sessions.find((entry) => entry.id === sessionId);
    if (session?.model) {
      applySelectedModel(session.model, {
        persist: true,
        syncSession: false,
      });
    }
  }

  async function renameSession(sessionId: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    let updatedSession: ChatSession | null = null;

    setSessions((currentSessions) =>
      sortSessionsByRecent(
        currentSessions.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          updatedSession = {
            ...session,
            title: trimmed,
            updatedAt: new Date().toISOString(),
          };

          return updatedSession;
        }),
      ),
    );

    if (updatedSession) {
      await saveSession(updatedSession);
    }
  }

  async function removeSession(sessionId: string) {
    const remaining = sessions.filter((session) => session.id !== sessionId);
    setSessions(remaining);
    await deleteSession(sessionId);

    if (activeSessionId === sessionId) {
      const fallback = remaining[0]?.id ?? null;
      setActiveSessionId(fallback);
      setStoredActiveSession(fallback ?? "");
    }
  }

  function exportSession(sessionId: string) {
    const session = sessions.find((entry) => entry.id === sessionId);
    if (!session) {
      return;
    }

    const filename = `${session.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "chat"}.md`;
    downloadTextFile(filename, sessionToMarkdown(session));
  }

  async function sendMessage(input: SendMessageInput) {
    const trimmed = input.text.trim();
    if (!trimmed || !connection?.host || !selectedModel || isStreaming) {
      return;
    }

    const connectionCheck = await probeConnection(connection, {
      affectGlobal: true,
      showConnecting: connectionStatus !== "connected",
    });

    if (!connectionCheck.ok) {
      return;
    }

    const baseSession = activeSession ?? createEmptySession(selectedModel);
    const shouldRename = !baseSession.messages.length || baseSession.title === "New chat";
    const userMessage = createMessage("user", trimmed, input.attachments);
    const assistantDraft = createAssistantDraft();
    const requestMessages = [...baseSession.messages, userMessage];
    const initialSession: ChatSession = {
      ...baseSession,
      title: shouldRename ? deriveSessionTitle(trimmed) : baseSession.title,
      model: selectedModel,
      updatedAt: userMessage.createdAt,
      messages: [...requestMessages, assistantDraft],
    };

    setIsStreaming(true);
    setConnectionStatus("connected");
    setConnectionMessage(`Connected · streaming from ${selectedModel}...`);

    setSessions((currentSessions) => {
      const withoutCurrent = currentSessions.filter(
        (session) => session.id !== initialSession.id,
      );
      return sortSessionsByRecent([initialSession, ...withoutCurrent]);
    });
    setActiveSessionId(initialSession.id);
    setStoredActiveSession(initialSession.id);
    await saveSession(initialSession);

    try {
      await streamChatRequest({
        connection,
        sessionId: initialSession.id,
        model: selectedModel,
        imageMode: input.imageMode,
        messages: requestMessages,
        onEvent: (event) => {
          if (event.type === "delta") {
            setSessions((currentSessions) =>
              currentSessions.map((session) => {
                if (session.id !== initialSession.id) {
                  return session;
                }

                return {
                  ...session,
                  messages: session.messages.map((message) =>
                    message.id === assistantDraft.id
                      ? {
                          ...message,
                          content: `${message.content}${event.content ?? ""}`,
                          status: "streaming",
                        }
                      : message,
                  ),
                };
              }),
            );
          }

          if (event.type === "done") {
            let completedSession: ChatSession | null = null;

            setConnectionStatus("connected");
            setConnectionMessage(createConnectedMessage());
            setSessions((currentSessions) =>
              sortSessionsByRecent(
                currentSessions.map((session) => {
                  if (session.id !== initialSession.id) {
                    return session;
                  }

                  completedSession = {
                    ...session,
                    updatedAt: new Date().toISOString(),
                    messages: session.messages.map((message) =>
                      message.id === assistantDraft.id
                        ? {
                            ...message,
                            status: "idle",
                          }
                        : message,
                    ),
                  };

                  return completedSession;
                }),
              ),
            );

            if (completedSession) {
              void saveSession(completedSession);
            }
          }

          if (event.type === "error") {
            let failedSession: ChatSession | null = null;

            setConnectionStatus("connected");
            setConnectionMessage(event.error ?? "Streaming failed");
            setSessions((currentSessions) =>
              sortSessionsByRecent(
                currentSessions.map((session) => {
                  if (session.id !== initialSession.id) {
                    return session;
                  }

                  failedSession = {
                    ...session,
                    updatedAt: new Date().toISOString(),
                    messages: session.messages.map((message) =>
                      message.id === assistantDraft.id
                        ? {
                            ...message,
                            content:
                              message.content ||
                              "OllaBridge could not complete this response.",
                            status: "error",
                            error: event.error,
                          }
                        : message,
                    ),
                  };

                  return failedSession;
                }),
              ),
            );

            if (failedSession) {
              void saveSession(failedSession);
            }
          }
        },
      });
    } catch (error) {
      let failedSession: ChatSession | null = null;
      const message =
        error instanceof Error ? error.message : "Unable to complete the chat request.";

      setConnectionStatus("disconnected");
      setConnectionMessage(message);
      setSessions((currentSessions) =>
        sortSessionsByRecent(
          currentSessions.map((session) => {
            if (session.id !== initialSession.id) {
              return session;
            }

            failedSession = {
              ...session,
              updatedAt: new Date().toISOString(),
              messages: session.messages.map((entry) =>
                entry.id === assistantDraft.id
                  ? {
                      ...entry,
                      content:
                        entry.content || "OllaBridge could not complete this response.",
                      status: "error",
                      error: message,
                    }
                  : entry,
              ),
            };

            return failedSession;
          }),
        ),
      );

      if (failedSession) {
        await saveSession(failedSession);
      }
    } finally {
      setIsStreaming(false);
    }
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  }

  const value: AppContextValue = {
    hydrated,
    theme,
    connection,
    connectionStatus,
    connectionMessage,
    models,
    modelsLoading,
    selectedModel,
    sessions,
    activeSessionId,
    activeSession,
    isStreaming,
    sidebarOpen,
    settingsOpen,
    saveConnection: saveConnectionSettings,
    testConnection: probeConnection,
    refreshModels,
    setSelectedModel: (model) => applySelectedModel(model),
    newChat,
    selectSession,
    renameSession,
    removeSession,
    exportSession,
    sendMessage,
    toggleTheme,
    setSidebarOpen,
    setSettingsOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}
