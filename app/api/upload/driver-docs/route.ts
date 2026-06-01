import { NextRequest, NextResponse } from "next/server";

// No auth required — called during driver registration before account exists
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, and PDF files are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (cloudinaryUrl && uploadPreset) {
      const cloudForm = new FormData();
      cloudForm.append("file", file);
      cloudForm.append("upload_preset", uploadPreset);
      cloudForm.append("folder", "driver-documents");
      const apiKey = process.env.CLOUDINARY_API_KEY;
      if (apiKey) cloudForm.append("api_key", apiKey);

      const res = await fetch(cloudinaryUrl, { method: "POST", body: cloudForm });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: err.error?.message ?? "Upload failed" },
          { status: 500 }
        );
      }
      const data = await res.json();
      return NextResponse.json({ url: data.secure_url, filename: file.name });
    }

    // Local fallback
    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "driver-docs");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/driver-docs/${filename}`, filename: file.name });
  } catch (error) {
    console.error("Driver doc upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
