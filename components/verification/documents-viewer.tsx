"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, FolderOpen } from "lucide-react";
import { formatPh } from "@/lib/datetime";

export interface VerificationDocument {
  id: string;
  type: string;
  url: string;
  filename: string;
  createdAt: Date | string;
}

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
}

export function DocumentsViewer({
  subjectName,
  documents,
  typeLabels,
  emptyMessage,
}: {
  subjectName: string;
  documents: VerificationDocument[];
  typeLabels: Record<string, string>;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        Documents
        {documents.length > 0 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
            {documents.length}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents — {subjectName}
            </DialogTitle>
          </DialogHeader>

          {documents.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No documents uploaded</p>
              <p className="text-xs text-muted-foreground mt-1">
                {emptyMessage ?? "No verification documents on file."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="rounded-lg border overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/40 border-b">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {typeLabels[doc.type] ?? doc.type}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{doc.filename}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {formatPh(new Date(doc.createdAt), "MMM d, yyyy")}
                      </span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </a>
                    </div>
                  </div>

                  {isImage(doc.url) && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={doc.url}
                        alt={typeLabels[doc.type] ?? doc.type}
                        className="w-full max-h-60 object-contain bg-muted/20"
                      />
                    </a>
                  )}

                  {doc.url.toLowerCase().includes(".pdf") && (
                    <div className="px-3 py-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium text-foreground text-xs">{doc.filename}</p>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Click to open PDF in new tab
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
