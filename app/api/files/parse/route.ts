import { NextResponse } from "next/server";

import { MAX_BATCH_BYTES, MAX_FILE_BYTES } from "@/lib/files/constants";
import { parseServerFile } from "@/lib/files/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (!files.length) {
    return NextResponse.json(
      {
        error: "No files were uploaded.",
      },
      { status: 400 },
    );
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (files.some((file) => file.size > MAX_FILE_BYTES)) {
    return NextResponse.json(
      {
        error: "One or more files exceed the per-file upload limit.",
      },
      { status: 413 },
    );
  }

  if (totalSize > MAX_BATCH_BYTES) {
    return NextResponse.json(
      {
        error: "The uploaded batch exceeds the total size limit.",
      },
      { status: 413 },
    );
  }

  const attachments = await Promise.all(files.map((file) => parseServerFile(file)));

  return NextResponse.json({
    attachments,
  });
}
