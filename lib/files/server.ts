import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import { getFileExtension } from "@/lib/files/constants";
import { createId } from "@/lib/utils/id";
import type { AttachmentRecord } from "@/types/app";

function cleanExtractedText(text: string) {
  return text.replace(/\u0000/g, "").trim();
}

export async function parseServerFile(file: File): Promise<AttachmentRecord> {
  const extension = getFileExtension(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const base: AttachmentRecord = {
    id: createId("attachment"),
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    kind: "document",
    source: "server",
  };

  try {
    if (extension === "pdf") {
      const result = await pdfParse(buffer);
      return {
        ...base,
        extractedText: cleanExtractedText(result.text),
      };
    }

    if (extension === "docx") {
      const result = await mammoth.extractRawText({
        buffer,
      });
      return {
        ...base,
        extractedText: cleanExtractedText(result.value),
      };
    }
  } catch (error) {
    return {
      ...base,
      warning:
        error instanceof Error
          ? `Could not extract content from ${file.name}: ${error.message}`
          : `Could not extract content from ${file.name}`,
    };
  }

  return {
    ...base,
    warning: "This file type is not supported for server-side parsing.",
  };
}
