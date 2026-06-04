"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface Props {
  pickupLat: number;
  pickupLng: number;
  /** Only show when booking status is ACCEPTED (driver heading to pickup). */
  status: string;
}

const AVG_SPEED_KMH = 20;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeEta(driverLat: number, driverLng: number, pickupLat: number, pickupLng: number) {
  const distKm = haversineKm(driverLat, driverLng, pickupLat, pickupLng);
  return Math.max(1, Math.ceil((distKm * 1.35) / AVG_SPEED_KMH * 60));
}

export function PickupEtaChip({ pickupLat, pickupLng, status }: Props) {
  const [eta, setEta] = useState<number | null>(null);
  const [gpsReady, setGpsReady] = useState(false);

  useEffect(() => {
    if (status !== "ACCEPTED") return;
    if (!navigator.geolocation) return;

    let cancelled = false;

    function getPosition() {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const minutes = computeEta(
            pos.coords.latitude, pos.coords.longitude,
            pickupLat, pickupLng,
          );
          setEta(minutes);
          setGpsReady(true);
        },
        () => { /* GPS unavailable — show nothing */ },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10_000 }
      );
    }

    getPosition();
    // Refresh ETA every 30 s as driver moves
    const interval = setInterval(getPosition, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [pickupLat, pickupLng, status]);

  if (status !== "ACCEPTED") return null;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
      gpsReady
        ? "bg-amber-50 border-amber-200 text-amber-800"
        : "bg-muted border-border text-muted-foreground"
    }`}>
      <Clock className="h-3.5 w-3.5" />
      {gpsReady && eta !== null
        ? `~${eta} min to pickup`
        : "Heading to pickup…"}
      {gpsReady && (
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
        </span>
      )}
    </div>
  );
}
