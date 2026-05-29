import type { ModelInfo } from "@/types/app";

const IMAGE_HINTS = [
  "vision",
  "vl",
  "llava",
  "bakllava",
  "moondream",
  "minicpm-v",
  "qwen2.5-vl",
  "qwen2-vl",
  "gemma3",
  "multimodal",
  "llama3.2-vision",
];

export function inferVisionSupport(model: {
  name?: string;
  details?: Record<string, unknown> | null;
}) {
  const haystack = JSON.stringify({
    name: model.name ?? "",
    details: model.details ?? {},
  }).toLowerCase();

  return IMAGE_HINTS.some((hint) => haystack.includes(hint));
}

export function normalizeModelList(payload: unknown): ModelInfo[] {
  const models = Array.isArray((payload as { models?: unknown[] })?.models)
    ? ((payload as { models: unknown[] }).models ?? [])
    : [];

  return models
    .map((entry) => {
      const model = entry as {
        name?: string;
        size?: number;
        modified_at?: string;
        details?: Record<string, unknown> | null;
      };

      return {
        name: model.name ?? "unknown",
        size: model.size,
        modifiedAt: model.modified_at,
        details: model.details ?? null,
        supportsImagesGuess: inferVisionSupport({
          name: model.name,
          details: model.details ?? null,
        }),
      } satisfies ModelInfo;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}
