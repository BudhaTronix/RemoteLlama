import { z } from "zod";

import { isSafeHost, normalizeConnectionInput } from "@/lib/ollama/connection";

const baseConnectionSchema = z.object({
  protocol: z.enum(["http", "https"]).default("http"),
  host: z.string().trim().min(1, "Host is required"),
  port: z.coerce.number().int().min(1).max(65535).default(11434),
});

export const connectionSchema = baseConnectionSchema
  .transform((value) => normalizeConnectionInput(value))
  .superRefine((value, context) => {
    if (!isSafeHost(value.host)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid host, IP, or URL",
        path: ["host"],
      });
    }
  });

export const attachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().nonnegative(),
  kind: z.enum(["text", "document", "image", "binary"]),
  source: z.enum(["client", "server"]),
  extractedText: z.string().optional(),
  previewUrl: z.string().optional(),
  base64Data: z.string().optional(),
  warning: z.string().optional(),
});

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
  createdAt: z.string().min(1),
  attachments: z.array(attachmentSchema).optional(),
  status: z.enum(["idle", "streaming", "error"]).optional(),
  error: z.string().optional(),
});

export const connectionPayloadSchema = z.object({
  connection: connectionSchema,
});

export const chatPayloadSchema = z.object({
  connection: connectionSchema,
  sessionId: z.string().min(1),
  model: z.string().min(1),
  imageMode: z.enum(["auto", "force"]).default("auto"),
  messages: z.array(chatMessageSchema).min(1),
});
