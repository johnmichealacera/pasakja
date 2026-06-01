"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, X, FileText } from "lucide-react";

export interface PendingDoc {
  type: string;
  file: File;
}

const DOC_TYPES = [
  {
    key: "DRIVERS_LICENSE",
    label: "Driver's License",
    required: true,
    hint: "Front and back of your official driver's license",
  },
  {
    key: "VEHICLE_REGISTRATION",
    label: "Vehicle Registration (OR/CR)",
    required: true,
    hint: "Official receipt and certificate of registration",
  },
  {
    key: "VALID_ID",
    label: "Government-Issued ID",
    required: false,
    hint: "UMID, PhilSys ID, Passport, etc.",
  },
];

interface Props {
  onChange: (docs: PendingDoc[]) => void;
  disabled?: boolean;
}

export function DocumentUploadRegistration({ onChange, disabled }: Props) {
  const [selected, setSelected] = useState<Record<string, File>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function notify(next: Record<string, File>) {
    onChange(Object.entries(next).map(([type, file]) => ({ type, file })));
  }

  function handleChange(type: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const next = { ...selected, [type]: file };
    setSelected(next);
    notify(next);
  }

  function remove(type: string) {
    const next = { ...selected };
    delete next[type];
    setSelected(next);
    notify(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Supporting Documents</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Select your documents for admin verification. They will be uploaded when you click
        <strong> Create Account</strong>. Accepted: JPG, PNG, PDF (max 5 MB each).
      </p>

      {DOC_TYPES.map((doc) => {
        const file = selected[doc.key];

        return (
          <div
            key={doc.key}
            className={`rounded-lg border px-3 py-2.5 transition-colors ${
              file ? "border-green-200 bg-green-50" : "border-border bg-background"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{doc.label}</span>
                  {doc.required && <span className="text-xs text-destructive">*</span>}
                </div>
                {file ? (
                  <p className="text-xs text-green-700 truncate mt-0.5">{file.name}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.hint}</p>
                )}
              </div>

              {file ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(doc.key)}
                    disabled={disabled}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-8 gap-1.5 text-xs"
                  disabled={disabled}
                  onClick={() => inputRefs.current[doc.key]?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Select
                </Button>
              )}
            </div>

            <input
              ref={(el) => { inputRefs.current[doc.key] = el; }}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={(e) => handleChange(doc.key, e)}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}
