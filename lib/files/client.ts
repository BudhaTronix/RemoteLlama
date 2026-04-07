import { createId } from "@/lib/utils/id";
import {
  DEFAULT_MAX_BATCH_MB,
  DEFAULT_MAX_FILE_MB,
  getFileExtension,
  IMAGE_EXTENSIONS,
  MAX_BATCH_BYTES,
  MAX_FILE_BYTES,
  SERVER_PARSED_EXTENSIONS,
  TEXT_EXTENSIONS,
} from "@/lib/files/constants";
import type { AttachmentKind, AttachmentRecord } from "@/types/app";

function classifyAttachment(file: Pick<File, "name" | "type">): AttachmentKind {
  const extension = getFileExtension(file.name);

  if (file.type.startsWith("image/") || IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (TEXT_EXTENSIONS.has(extension)) {
    return "text";
  }

  if (SERVER_PARSED_EXTENSIONS.has(extension)) {
    return "document";
  }

  return "binary";
}

function dataUrlToBase64(dataUrl: string) {
  return dataUrl.split(",")[1] ?? "";
}

export async function fileToDataUrl(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";

  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return `data:${file.type || "application/octet-stream"};base64,${btoa(binary)}`;
}

export async function prepareClientAttachment(file: File): Promise<AttachmentRecord> {
  const kind = classifyAttachment(file);
  const attachment: AttachmentRecord = {
    id: createId("attachment"),
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    kind,
    source: "client",
  };

  if (kind === "text") {
    return {
      ...attachment,
      extractedText: await file.text(),
    };
  }

  if (kind === "image") {
    const previewUrl = await fileToDataUrl(file);
    return {
      ...attachment,
      previewUrl,
      base64Data: dataUrlToBase64(previewUrl),
    };
  }

  if (kind === "binary") {
    return {
      ...attachment,
      warning: "Binary content cannot be extracted. The file will be referenced, but its contents are unavailable.",
    };
  }

  return attachment;
}

export async function parseServerAttachments(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/files/parse", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as {
    attachments?: AttachmentRecord[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to parse uploaded files");
  }

  return payload.attachments ?? [];
}

export function validateFiles(files: File[], existingBytes = 0) {
  const totalSize = files.reduce((sum, file) => sum + file.size, existingBytes);

  if (files.some((file) => file.size > MAX_FILE_BYTES)) {
    return `Each file must be ${DEFAULT_MAX_FILE_MB} MB or smaller.`;
  }

  if (totalSize > MAX_BATCH_BYTES) {
    return `Uploads in a single message must stay under ${DEFAULT_MAX_BATCH_MB} MB.`;
  }

  return null;
}

export function splitFilesByParser(files: File[]) {
  const clientFiles: File[] = [];
  const serverFiles: File[] = [];

  for (const file of files) {
    const extension = getFileExtension(file.name);
    if (SERVER_PARSED_EXTENSIONS.has(extension)) {
      serverFiles.push(file);
    } else {
      clientFiles.push(file);
    }
  }

  return { clientFiles, serverFiles };
}
