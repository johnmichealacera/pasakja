export interface CloudinaryUploadOptions {
  enableWebPOptimization?: boolean;
  showOptimizationInfo?: boolean;
}

export interface CloudinaryUploadResult {
  url: string;
  originalFile: File;
  optimizedFile?: File;
  optimizationInfo?: {
    originalSize: number;
    optimizedSize: number;
    savings: number;
    savingsPercentage: number;
    format: string;
  };
}

async function convertToWebP(
  file: File,
  quality: number = 0.8
): Promise<{ file: File; originalSize: number; optimizedSize: number; format: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to convert to WebP"));
              return;
            }

            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ".webp"),
              { type: "image/webp", lastModified: Date.now() }
            );

            resolve({
              file: webpFile,
              originalSize: file.size,
              optimizedSize: blob.size,
              format: "webp",
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function isWebPSupported(): boolean {
  if (typeof window === "undefined") return false;
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
}

export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const { enableWebPOptimization = true, showOptimizationInfo = false } = options;

  let optimizedFile: File | undefined;
  let optimizationInfo: CloudinaryUploadResult["optimizationInfo"];

  if (enableWebPOptimization && isWebPSupported() && file.type.startsWith("image/")) {
    try {
      const result = await convertToWebP(file, 0.85);
      optimizedFile = result.file;

      if (showOptimizationInfo) {
        optimizationInfo = {
          originalSize: result.originalSize,
          optimizedSize: result.optimizedSize,
          savings: result.originalSize - result.optimizedSize,
          savingsPercentage:
            ((result.originalSize - result.optimizedSize) / result.originalSize) * 100,
          format: result.format,
        };
      }
    } catch (error) {
      console.warn("WebP optimization failed, falling back to original file:", error);
      optimizedFile = file;
    }
  } else {
    optimizedFile = file;
  }

  const formData = new FormData();
  formData.append("file", optimizedFile as File);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Failed to upload image");
  }
  const data = await res.json();

  if (!data.url || data.url.trim() === "") {
    throw new Error("Failed to upload image");
  }

  return { url: data.url, originalFile: file, optimizedFile, optimizationInfo };
}

export async function uploadMultipleToCloudinary(
  files: File[],
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];
  for (const file of files) {
    try {
      results.push(await uploadToCloudinary(file, options));
    } catch (error) {
      console.error("Failed to upload file:", file.name, error);
    }
  }
  return results;
}

export function canOptimizeImages(): boolean {
  return typeof window !== "undefined" && isWebPSupported();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
