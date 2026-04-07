import type {
  ChatMessage,
  ChatStreamEvent,
  ConnectionSettings,
  ConnectionTestResult,
  ImageHandlingMode,
  ModelInfo,
} from "@/types/app";

function getErrorText(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return fallback;
}

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorText(payload, "The request failed."));
  }

  return payload as TResponse;
}

export async function requestConnectionTest(connection: ConnectionSettings) {
  return postJson<ConnectionTestResult>("/api/ollama/test", {
    connection,
  });
}

export async function requestModels(connection: ConnectionSettings) {
  const payload = await postJson<{ models: ModelInfo[] }>("/api/ollama/models", {
    connection,
  });

  return payload.models;
}

function emitEvent(
  chunk: string,
  onEvent: (event: ChatStreamEvent) => void,
) {
  const lines = chunk.split("\n");
  let eventName = "message";
  let data = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    }

    if (line.startsWith("data:")) {
      data += line.slice(5).trimStart();
    }
  }

  let parsed: Record<string, unknown> | null = null;
  if (data) {
    parsed = JSON.parse(data) as Record<string, unknown>;
  }

  if (eventName === "delta") {
    onEvent({
      type: "delta",
      content: typeof parsed?.content === "string" ? parsed.content : "",
      data: parsed ?? undefined,
    });
    return;
  }

  if (eventName === "error") {
    onEvent({
      type: "error",
      error: typeof parsed?.message === "string" ? parsed.message : "Stream failed",
      data: parsed ?? undefined,
    });
    return;
  }

  if (eventName === "done") {
    onEvent({
      type: "done",
      data: parsed ?? undefined,
    });
    return;
  }

  if (eventName === "meta") {
    onEvent({
      type: "meta",
      data: parsed ?? undefined,
    });
  }
}

export async function streamChatRequest(input: {
  connection: ConnectionSettings;
  sessionId: string;
  model: string;
  imageMode: ImageHandlingMode;
  messages: ChatMessage[];
  onEvent: (event: ChatStreamEvent) => void;
}) {
  const response = await fetch("/api/ollama/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connection: input.connection,
      sessionId: input.sessionId,
      model: input.model,
      imageMode: input.imageMode,
      messages: input.messages,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(getErrorText(payload, "Unable to reach Ollama."));
  }

  if (!response.body) {
    throw new Error("Streaming is unavailable for this response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          emitEvent(buffer, input.onEvent);
        }
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";
      chunks.forEach((chunk) => emitEvent(chunk, input.onEvent));
    }
  } finally {
    reader.releaseLock();
  }
}
