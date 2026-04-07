import { NextResponse } from "next/server";

import { connectionPayloadSchema } from "@/lib/ollama/schemas";
import { fetchOllama, getErrorMessage } from "@/lib/ollama/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = connectionPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const startedAt = performance.now();

  try {
    const response = await fetchOllama(parsed.data.connection, "/api/version", {
      method: "GET",
      headers: {},
    });

    const latencyMs = Math.round(performance.now() - startedAt);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          status: response.status,
          latencyMs,
          error: await response.text(),
        },
        { status: response.status },
      );
    }

    const data = (await response.json()) as { version?: string };

    return NextResponse.json({
      ok: true,
      status: response.status,
      latencyMs,
      version: data.version,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 503,
        latencyMs: Math.round(performance.now() - startedAt),
        error: getErrorMessage(error),
      },
      { status: 503 },
    );
  }
}
