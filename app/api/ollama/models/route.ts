import { NextResponse } from "next/server";

import { normalizeModelList } from "@/lib/ollama/models";
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

  try {
    const response = await fetchOllama(parsed.data.connection, "/api/tags", {
      method: "GET",
      headers: {},
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: await response.text(),
        },
        { status: response.status },
      );
    }

    const payload = await response.json();

    return NextResponse.json({
      models: normalizeModelList(payload),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 503 },
    );
  }
}
