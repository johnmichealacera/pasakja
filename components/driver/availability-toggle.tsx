"use client";

// NOTE: navigator.geolocation requires HTTPS in production.
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DriverAvailabilityToggleProps {
  driverId: string;
  initialAvailability: boolean;
}

const GPS_INTERVAL_MS = 15_000; // post position every 15 s while online

export function DriverAvailabilityToggle({
  driverId,
  initialAvailability,
}: DriverAvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailability);
  const [isLoading, setIsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "sharing" | "denied">("idle");

  const watchIdRef  = useRef<number | null>(null);
  const lastPostRef = useRef(0);

  // Start / stop GPS broadcasting whenever availability changes
  useEffect(() => {
    if (!isAvailable) {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setGpsStatus("idle");
      // Remove stale location so passengers no longer see this driver
      fetch("/api/location", { method: "DELETE" }).catch(() => {});
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }

    setGpsStatus("sharing");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastPostRef.current < GPS_INTERVAL_MS) return;
        lastPostRef.current = now;

        // Upsert into DriverLocation (bookingId=null → idle/available position)
        fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude:  pos.coords.latitude,
            longitude: pos.coords.longitude,
            bookingId: null,
          }),
        }).catch(() => {});

        // Also keep Driver.currentLat/Lng in sync for backward compat
        fetch(`/api/drivers/${driverId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentLat: pos.coords.latitude,
            currentLng: pos.coords.longitude,
          }),
        }).catch(() => {});
      },
      (err) => setGpsStatus(err.code === 1 ? "denied" : "idle"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10_000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isAvailable, driverId]);

  async function toggleAvailability() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });
      if (res.ok) {
        setIsAvailable((prev) => !prev);
        toast.success(
          !isAvailable
            ? "You are now online — your location is visible to passengers"
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
    <div className="flex flex-col gap-1.5">
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
          {isLoading ? "Updating…" : isAvailable ? "Go Offline" : "Go Online"}
        </Button>
      </div>
      {isAvailable && gpsStatus === "sharing" && (
        <span className="text-xs text-green-600 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
          </span>
          Location visible to passengers
        </span>
      )}
      {isAvailable && gpsStatus === "denied" && (
        <span className="text-xs text-amber-600">
          ⚠ GPS permission denied — enable it so passengers can find you
        </span>
      )}
    </div>
  );
}
