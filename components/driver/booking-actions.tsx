"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, MapPin, Flag } from "lucide-react";
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
}

export function BookingActions({ booking, isPending }: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
          CANCELLED: "Booking cancelled.",
        };
        toast.success(messages[status] ?? "Status updated");
        router.refresh();
      } else {
        toast.error("Failed to update booking");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (isPending) {
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
    return (
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
      Number(booking.fare) || Number(booking.quotedFare) || 50;
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
