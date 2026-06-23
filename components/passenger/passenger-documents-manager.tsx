"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle2, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPh } from "@/lib/datetime";
import {
  PASSENGER_DOC_TYPES,
  PASSENGER_DOC_TYPE_LABELS,
} from "@/lib/verification-doc-types";
import { cn } from "@/lib/utils";

type PassengerDocument = {
  id: string;
  type: string;
  url: string;
  filename: string;
  createdAt: string;
};

export function PassengerDocumentsManager({
  initialDocuments,
}: {
  initialDocuments: PassengerDocument[];
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [docType, setDocType] = useState<string>(PASSENGER_DOC_TYPES[0].key);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedTypeMeta = PASSENGER_DOC_TYPES.find((d) => d.key === docType);

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await fetch("/api/upload/passenger-docs", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadData.error ?? "Upload failed");
        return;
      }

      const saveRes = await fetch("/api/passenger/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: docType,
          url: uploadData.url,
          filename: uploadData.filename ?? selectedFile.name,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        toast.error(saveData.error ?? "Failed to save document");
        return;
      }

      setDocuments((prev) => [saveData.document, ...prev]);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      toast.success("Document uploaded");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/passenger/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Failed to delete");
        return;
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document removed");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Identity Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Upload a government ID or other documents for admin verification.
          Accepted: JPG, PNG, WebP, PDF (max 5 MB each).
        </p>

        <div className="space-y-3 rounded-lg border p-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="doc-type">
              Document type
            </label>
            <select
              id="doc-type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              disabled={uploading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
            >
              {PASSENGER_DOC_TYPES.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
            {selectedTypeMeta && (
              <p className="text-xs text-muted-foreground">{selectedTypeMeta.hint}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {selectedFile ? "Change file" : "Select file"}
            </Button>
            {selectedFile && (
              <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                {selectedFile.name}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              className="gap-1.5 ml-auto"
              disabled={uploading || !selectedFile}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                "Upload document"
              )}
            </Button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 py-8 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your documents ({documents.length})
            </p>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {PASSENGER_DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {doc.filename} · {formatPh(new Date(doc.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}
                  >
                    View
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    disabled={deletingId === doc.id}
                    onClick={() => handleDelete(doc.id)}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
