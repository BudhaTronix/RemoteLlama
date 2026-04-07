import { describe, expect, it } from "vitest";

import { inferVisionSupport, normalizeModelList } from "@/lib/ollama/models";

describe("model normalization", () => {
  it("flags common multimodal model families", () => {
    expect(
      inferVisionSupport({
        name: "llava:latest",
      }),
    ).toBe(true);

    expect(
      inferVisionSupport({
        name: "llama3.2:latest",
      }),
    ).toBe(false);
  });

  it("normalizes model payloads from Ollama tags", () => {
    const models = normalizeModelList({
      models: [
        {
          name: "llava:latest",
          size: 123,
          modified_at: "2026-04-07T10:00:00.000Z",
          details: {
            families: ["llava"],
          },
        },
      ],
    });

    expect(models).toEqual([
      {
        name: "llava:latest",
        size: 123,
        modifiedAt: "2026-04-07T10:00:00.000Z",
        details: {
          families: ["llava"],
        },
        supportsImagesGuess: true,
      },
    ]);
  });
});
