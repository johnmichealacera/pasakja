"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Driver {
  id: string;
  status: "PENDING" | "VERIFIED" | "SUSPENDED";
}

export function DriverVerificationActions({ driver }: { driver: Driver }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(status: string) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/drivers/${driver.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const messages: Record<string, string> = {
          VERIFIED: "Driver verified successfully",
          SUSPENDED: "Driver has been suspended",
          PENDING: "Driver status reset to pending",
        };
        toast.success(messages[status] ?? "Status updated");
        router.refresh();
      } else {
        toast.error("Failed to update driver status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (driver.status === "PENDING") {
    return (
      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={() => updateStatus("VERIFIED")}
          disabled={isLoading}
          className="gap-1.5 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4" /> Verify
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => updateStatus("SUSPENDED")}
          disabled={isLoading}
          className="gap-1.5"
        >
          <XCircle className="h-4 w-4" /> Reject
        </Button>
      </div>
    );
  }

  if (driver.status === "VERIFIED") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateStatus("SUSPENDED")}
        disabled={isLoading}
        className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
      >
        <XCircle className="h-4 w-4" /> Suspend
      </Button>
    );
  }

  if (driver.status === "SUSPENDED") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateStatus("VERIFIED")}
        disabled={isLoading}
        className="gap-1.5 text-green-600 border-green-600 hover:bg-green-50"
      >
        <ShieldCheck className="h-4 w-4" /> Reinstate
      </Button>
    );
  }

  return null;
}
