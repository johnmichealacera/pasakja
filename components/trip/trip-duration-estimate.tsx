"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  className?: string;
  durationMinutes?: number;
  distanceKm?: number;
};

export function TripDurationEstimate({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  className,
  durationMinutes: durationProp,
  distanceKm: distanceProp,
}: Props) {
  const [minutes, setMinutes] = useState<number | null>(durationProp ?? null);
  const [km, setKm] = useState<number | null>(distanceProp ?? null);
  const [loading, setLoading] = useState(durationProp == null);

  useEffect(() => {
    if (durationProp != null && distanceProp != null) {
      setMinutes(durationProp);
      setKm(distanceProp);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    fetch(
      `/api/maps/route?fromLat=${pickupLat}&fromLng=${pickupLng}&toLat=${dropoffLat}&toLng=${dropoffLng}`,
    )
      .then(async (res) => {
        if (!active || !res.ok) return;
        const data = (await res.json()) as {
          durationMinutes?: number;
          distanceKm?: number;
        };
        if (!active) return;
        if (data.durationMinutes != null && data.distanceKm != null && data.distanceKm > 0) {
          setMinutes(data.durationMinutes);
          setKm(data.distanceKm);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, durationProp, distanceProp]);

  if (loading) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Estimating trip time…
      </span>
    );
  }

  if (minutes == null || km == null) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200",
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" />
      ~{minutes} min trip · {km.toFixed(1)} km
    </span>
  );
}
