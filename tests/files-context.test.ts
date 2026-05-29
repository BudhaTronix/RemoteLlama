import { describe, expect, it } from "vitest";

import {
  collectImagePayloads,
  composeAttachmentContext,
} from "@/lib/files/context";
import type { AttachmentRecord } from "@/types/app";

const sampleAttachments: AttachmentRecord[] = [
  {
    id: "text-1",
    name: "notes.md",
    mimeType: "text/markdown",
    size: 1024,
    kind: "text",
    source: "client",
    extractedText: "Important project notes",
  },
  {
    id: "img-1",
    name: "diagram.png",
    mimeType: "image/png",
    size: 2048,
    kind: "image",
    source: "client",
    base64Data: "ZmFrZS1pbWFnZQ==",
  },
];

describe("attachment context helpers", () => {
  it("builds prompt context from extracted text attachments", () => {
    const context = composeAttachmentContext(sampleAttachments);

    expect(context).toContain("Attached file context");
    expect(context).toContain("File: notes.md");
    expect(context).toContain("Important project notes");
  });

  it("only includes images automatically for vision-like models", () => {
    expect(collectImagePayloads(sampleAttachments, "llama3.2:latest", "auto")).toEqual([]);
    expect(collectImagePayloads(sampleAttachments, "llava:latest", "auto")).toEqual([
      "ZmFrZS1pbWFnZQ==",
    ]);
    expect(collectImagePayloads(sampleAttachments, "llama3.2:latest", "force")).toEqual([
      "ZmFrZS1pbWFnZQ==",
    ]);
  });
});
