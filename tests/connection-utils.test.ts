import { describe, expect, it } from "vitest";

import {
  buildOllamaBaseUrl,
  isSafeHost,
  normalizeConnectionInput,
} from "@/lib/ollama/connection";

describe("ollama connection helpers", () => {
  it("normalizes full URLs into protocol, host, and port", () => {
    expect(
      normalizeConnectionInput({
        protocol: "http",
        host: "https://ollama.example.com:12400/api/tags?debug=1",
      }),
    ).toEqual({
      protocol: "https",
      host: "ollama.example.com",
      port: 12400,
    });
  });

  it("builds a stable Ollama base URL", () => {
    expect(
      buildOllamaBaseUrl({
        protocol: "http",
        host: "192.168.1.42",
        port: 11434,
      }),
    ).toBe("http://192.168.1.42:11434");
  });

  it("rejects unsafe host strings with paths", () => {
    expect(isSafeHost("demo.example.com/path")).toBe(false);
    expect(isSafeHost("demo.example.com")).toBe(true);
  });
});
