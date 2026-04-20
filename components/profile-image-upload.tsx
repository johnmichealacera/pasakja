"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

interface Props {
  currentImage: string | null;
  initials: string;
}

export function ProfileImageUpload({ currentImage, initials }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImage);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: url }),
      });

      if (!res.ok) throw new Error("Failed to save profile image");

      setImageUrl(url);
      toast.success("Profile photo updated");
      router.refresh();
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      className="relative group cursor-pointer w-fit"
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <Avatar className="h-16 w-16">
        {imageUrl && <AvatarImage src={imageUrl} alt="Profile photo" />}
        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : initials}
        </AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Camera className="h-5 w-5 text-white" />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  );
}
