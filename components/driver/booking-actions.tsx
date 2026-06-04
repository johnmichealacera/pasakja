"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, MapPin, Flag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface BookingActionsProps {
  booking: {
    id: string;
    status: string;
    fare?: number | string | null;
    quotedFare?: number | string | null;
  };
  driverId: string;
  isPending?: boolean;
  /** True when this booking was specifically requested for this driver. */
  isRequested?: boolean;
  /** False when the driver already has an active trip — cannot accept new bookings. */
  canAcceptNewBookings?: boolean;
}

export function BookingActions({
  booking,
  isPending,
  isRequested,
  canAcceptNewBookings = true,
}: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  async function updateStatus(status: string, extraData?: Record<string, unknown>) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extraData }),
      });

      if (res.ok) {
        const messages: Record<string, string> = {
          ACCEPTED: "Booking accepted! Head to pickup location.",
          PICKED_UP: "Passenger picked up. Starting trip.",
          IN_PROGRESS: "Trip is in progress.",
          COMPLETED: "Trip completed!",
          PENDING: "Booking released — another driver can now accept it.",
        };
        toast.success(messages[status] ?? "Status updated");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Failed to update booking");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      setConfirmCancel(false);
    }
  }

  async function rejectRequest() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_request" }),
      });
      if (res.ok) {
        toast.info("Request declined — booking is now open to other drivers.");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Failed to decline request");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      setConfirmReject(false);
    }
  }

  // Requested booking: show confirmation UI for reject
  if (isPending && isRequested) {
    if (!canAcceptNewBookings) {
      return (
        <p className="text-xs text-muted-foreground text-right max-w-[200px]">
          Complete your current trip before accepting another booking.
        </p>
      );
    }

    if (confirmReject) {
      return (
        <div className="flex flex-col gap-2 items-end">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Decline this request?
          </span>
          <p className="text-xs text-muted-foreground text-right max-w-[180px]">
            The booking will open to all available drivers.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={rejectRequest}
              disabled={isLoading}
            >
              {isLoading ? "Declining…" : "Yes, decline"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmReject(false)}
              disabled={isLoading}
            >
              Back
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-2 flex-wrap justify-end">
        <Button
          size="sm"
          onClick={() => updateStatus("ACCEPTED")}
          disabled={isLoading}
          className="gap-1.5 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirmReject(true)}
          disabled={isLoading}
          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/40"
        >
          <XCircle className="h-4 w-4" />
          Decline
        </Button>
      </div>
    );
  }

  // Regular open booking: just Accept
  if (isPending) {
    if (!canAcceptNewBookings) {
      return (
        <p className="text-xs text-muted-foreground text-right max-w-[200px]">
          Complete your current trip before accepting another booking.
        </p>
      );
    }

    return (
      <Button
        size="sm"
        onClick={() => updateStatus("ACCEPTED")}
        disabled={isLoading}
        className="gap-1.5"
      >
        <CheckCircle className="h-4 w-4" />
        Accept
      </Button>
    );
  }

  if (booking.status === "ACCEPTED") {
    if (confirmCancel) {
      return (
        <div className="flex flex-col gap-2 items-end">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Release this booking?
          </span>
          <p className="text-xs text-muted-foreground text-right max-w-[180px]">
            The passenger stays in the queue — another driver can accept.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateStatus("PENDING")}
              disabled={isLoading}
            >
              {isLoading ? "Releasing…" : "Yes, release"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmCancel(false)}
              disabled={isLoading}
            >
              Back
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-2 flex-wrap justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus("PICKED_UP")}
          disabled={isLoading}
          className="gap-1.5"
        >
          <MapPin className="h-4 w-4" />
          Picked Up
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirmCancel(true)}
          disabled={isLoading}
          className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        >
          <XCircle className="h-4 w-4" />
          Can&apos;t Go
        </Button>
      </div>
    );
  }

  if (booking.status === "PICKED_UP") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateStatus("IN_PROGRESS")}
        disabled={isLoading}
        className="gap-1.5"
      >
        <MapPin className="h-4 w-4" />
        Start Trip
      </Button>
    );
  }

  if (booking.status === "IN_PROGRESS") {
    const completeFare =
      Number(booking.fare) || Number(booking.quotedFare) || 15;
    return (
      <Button
        size="sm"
        onClick={() => updateStatus("COMPLETED", { fare: completeFare })}
        disabled={isLoading}
        className="gap-1.5 bg-green-600 hover:bg-green-700"
      >
        <Flag className="h-4 w-4" />
        Complete
      </Button>
    );
  }

  return null;
}
