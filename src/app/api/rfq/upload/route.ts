import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const TMP_UPLOAD_DIR = path.join(DATA_DIR, "uploads", "tmp");

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const category = formData.get("category");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (typeof category !== "string" || category.trim().length === 0) {
    return NextResponse.json({ error: "File category is required." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  await fs.mkdir(TMP_UPLOAD_DIR, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const tempFileName = `${randomUUID()}-${safeName}`;
  const tempPath = path.join(TMP_UPLOAD_DIR, tempFileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(tempPath, buffer);

  return NextResponse.json(
    {
      tempPath: tempFileName,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      category,
    },
    { status: 201 }
  );
}
