import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConnectionForm } from "@/components/settings/connection-form";

describe("ConnectionForm", () => {
  it("normalizes URL-like input before testing the connection", async () => {
    const user = userEvent.setup();
    const onTest = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      latencyMs: 24,
      version: "0.5.0",
    });

    render(
      <ConnectionForm
        initialConnection={{
          protocol: "http",
          host: "",
          port: 11434,
        }}
        title="Setup"
        description="desc"
        submitLabel="Save"
        onSubmit={vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          latencyMs: 24,
        })}
        onTest={onTest}
      />,
    );

    await user.type(
      screen.getByPlaceholderText("192.168.1.42 or ollama.example.com"),
      "https://ollama.example.com:12000",
    );
    await user.clear(screen.getByPlaceholderText("11434"));
    await user.type(screen.getByPlaceholderText("11434"), "11434");
    await user.click(screen.getByRole("button", { name: /test connection/i }));

    expect(onTest).toHaveBeenCalledWith({
      protocol: "https",
      host: "ollama.example.com",
      port: 12000,
    });
  });
});
