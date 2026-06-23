"use client";

import { DocumentsViewer } from "@/components/verification/documents-viewer";
import { DRIVER_DOC_TYPE_LABELS } from "@/lib/verification-doc-types";

interface DriverDocument {
  id: string;
  type: string;
  url: string;
  filename: string;
  createdAt: Date | string;
}

export function DriverDocumentsViewer({
  driverName,
  documents,
}: {
  driverName: string;
  documents: DriverDocument[];
}) {
  return (
    <DocumentsViewer
      subjectName={driverName}
      documents={documents}
      typeLabels={DRIVER_DOC_TYPE_LABELS}
      emptyMessage="This driver did not upload any verification documents during registration."
    />
  );
}
