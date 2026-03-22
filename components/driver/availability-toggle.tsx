"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DriverAvailabilityToggleProps {
  driverId: string;
  initialAvailability: boolean;
}

export function DriverAvailabilityToggle({
  driverId,
  initialAvailability,
}: DriverAvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailability);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleAvailability() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });

      if (res.ok) {
        setIsAvailable(!isAvailable);
        toast.success(
          !isAvailable
            ? "You are now available for bookings"
            : "You are now offline"
        );
      } else {
        toast.error("Failed to update availability");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isAvailable ? "default" : "secondary"}>
        {isAvailable ? "Online" : "Offline"}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleAvailability}
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : isAvailable ? "Go Offline" : "Go Online"}
      </Button>
    </div>
  );
}
