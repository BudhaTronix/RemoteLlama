export const DEFAULT_MAX_FILE_MB = Number(
  process.env.NEXT_PUBLIC_OLLABRIDGE_MAX_FILE_MB ?? "10",
);
export const DEFAULT_MAX_BATCH_MB = Number(
  process.env.NEXT_PUBLIC_OLLABRIDGE_MAX_BATCH_MB ?? "25",
);

export const MAX_FILE_BYTES = DEFAULT_MAX_FILE_MB * 1024 * 1024;
export const MAX_BATCH_BYTES = DEFAULT_MAX_BATCH_MB * 1024 * 1024;

export const TEXT_EXTENSIONS = new Set(["txt", "md", "csv", "json"]);
export const SERVER_PARSED_EXTENSIONS = new Set(["pdf", "docx"]);
export const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp"]);

export function getFileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}
