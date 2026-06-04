"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  driverId: string;
  period: string;        // "YYYY-MM"
  amount: number;        // platform fees for the period
  currentStatus: "PENDING" | "PAID" | null; // null = no record yet
}

export function RemittanceToggle({ driverId, period, amount, currentStatus }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"PENDING" | "PAID">(currentStatus ?? "PENDING");

  async function toggle() {
    const nextStatus = status === "PAID" ? "PENDING" : "PAID";
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/remittances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, period, amount, status: nextStatus }),
      });
      if (res.ok) {
        setStatus(nextStatus);
        toast.success(
          nextStatus === "PAID"
            ? `Remittance of ₱${amount.toFixed(2)} marked as Paid`
            : "Remittance marked as Pending"
        );
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Failed to update remittance");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {status === "PAID" ? (
        <>
          <Badge className="gap-1 bg-green-600 hover:bg-green-600 text-xs px-2 py-0.5">
            <CheckCircle className="h-3 w-3" /> Paid
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground hover:text-foreground px-1.5"
            onClick={toggle}
            disabled={isLoading}
          >
            Undo
          </Button>
        </>
      ) : (
        <>
          <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2 text-green-700 border-green-300 hover:bg-green-50"
            onClick={toggle}
            disabled={isLoading}
          >
            {isLoading ? "…" : "Mark Paid"}
          </Button>
        </>
      )}
    </div>
  );
}
