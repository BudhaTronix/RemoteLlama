import { NextResponse } from "next/server";

import { buildOllamaMessages } from "@/lib/ollama/payload";
import { chatPayloadSchema } from "@/lib/ollama/schemas";
import {
  fetchOllama,
  getErrorMessage,
  getStreamTimeout,
} from "@/lib/ollama/server";

export const runtime = "nodejs";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toSse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function readTextValue(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  return "";
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = chatPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const upstream = await fetchOllama(parsed.data.connection, "/api/chat", {
    method: "POST",
    body: JSON.stringify({
      model: parsed.data.model,
      stream: true,
      messages: buildOllamaMessages({
        messages: parsed.data.messages,
        model: parsed.data.model,
        imageMode: parsed.data.imageMode,
      }),
    }),
  }, {
    timeoutMs: getStreamTimeout(),
  }).catch((error) =>
    NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 503 },
    ),
  );

  if (upstream instanceof NextResponse) {
    return upstream;
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      {
        error: await upstream.text(),
      },
      { status: upstream.status || 502 },
    );
  }

  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        toSse("meta", {
          sessionId: parsed.data.sessionId,
          model: parsed.data.model,
        }),
      );

      let buffer = "";

      const flushLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return;
        }

        try {
          const chunk = JSON.parse(trimmed) as {
            error?: string;
            done?: boolean;
            message?: {
              content?: string;
            };
          };

          if (chunk.error) {
            controller.enqueue(
              toSse("error", {
                message: chunk.error,
                kind: "upstream",
              }),
            );
            return;
          }

          const delta = readTextValue(chunk.message?.content);
          if (delta) {
            controller.enqueue(
              toSse("delta", {
                content: delta,
              }),
            );
          }

          if (chunk.done) {
            controller.enqueue(
              toSse("done", {
                done: true,
              }),
            );
          }
        } catch {
          controller.enqueue(
            toSse("error", {
              message: "Received an unreadable stream chunk from Ollama.",
              kind: "stream",
            }),
          );
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.trim()) {
              flushLine(buffer);
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          lines.forEach(flushLine);
        }
      } catch (error) {
        controller.enqueue(
          toSse("error", {
            message: getErrorMessage(error),
            kind:
              error instanceof DOMException && error.name === "AbortError"
                ? "timeout"
                : "stream",
          }),
        );
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
