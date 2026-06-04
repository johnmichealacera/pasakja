"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function DisputeActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handle(action: "approve" | "deny") {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/dispute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Refund issued to passenger" : "Dispute denied");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Action failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        className="gap-1.5 bg-green-600 hover:bg-green-700"
        onClick={() => handle("approve")}
        disabled={isLoading}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Approve Refund
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
        onClick={() => handle("deny")}
        disabled={isLoading}
      >
        <XCircle className="h-3.5 w-3.5" />
        Deny
      </Button>
    </div>
  );
}
