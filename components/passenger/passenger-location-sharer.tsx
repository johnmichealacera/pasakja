"use client";

import { useEffect, useRef } from "react";

export function PassengerLocationSharer({ bookingId }: { bookingId: string }) {
  const lastPostRef = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastPostRef.current < 10_000) return;
        lastPostRef.current = now;

        fetch("/api/passenger-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            bookingId,
          }),
        }).catch(() => {});
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      fetch("/api/passenger-location", { method: "DELETE" }).catch(() => {});
    };
  }, [bookingId]);

  return null;
}
