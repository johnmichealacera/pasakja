import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (cloudinaryUrl && uploadPreset) {
    const cloudForm = new FormData();
    cloudForm.append("file", file);
    cloudForm.append("upload_preset", uploadPreset);
    const apiKey = process.env.CLOUDINARY_API_KEY;
    if (apiKey) cloudForm.append("api_key", apiKey);

    const res = await fetch(cloudinaryUrl, { method: "POST", body: cloudForm });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Cloudinary upload failed" }));
      return NextResponse.json({ error: err.error?.message ?? "Upload failed" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ url: data.secure_url });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
