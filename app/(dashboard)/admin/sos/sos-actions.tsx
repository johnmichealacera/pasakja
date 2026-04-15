"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface SosActionsProps {
  alertId: string;
  isResolved: boolean;
}

export function SosActions({ alertId, isResolved }: SosActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function toggle() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sos/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: !isResolved }),
      });

      if (res.ok) {
        toast.success(isResolved ? "Alert re-opened" : "Alert resolved");
        router.refresh();
      } else {
        toast.error("Failed to update alert");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return isResolved ? (
    <Button
      size="sm"
      variant="outline"
      onClick={toggle}
      disabled={isLoading}
      className="gap-1.5"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Re-open
    </Button>
  ) : (
    <Button
      size="sm"
      onClick={toggle}
      disabled={isLoading}
      className="gap-1.5 bg-green-600 hover:bg-green-700"
    >
      <CheckCircle className="h-3.5 w-3.5" />
      Mark Resolved
    </Button>
  );
}
