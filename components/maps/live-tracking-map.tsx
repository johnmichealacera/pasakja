"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import type { LatLng } from "@/components/maps/types";
import { cn } from "@/lib/utils";

interface LiveTrackingMapProps {
  bookingId: string;
  pickup: LatLng;
  destination: LatLng;
  heightClassName?: string;
}

export function LiveTrackingMap({
  bookingId,
  pickup,
  destination,
  heightClassName = "h-[280px]",
}: LiveTrackingMapProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const driverMarkerRef = useRef<Leaflet.CircleMarker | null>(null);
  const [driverPos, setDriverPos] = useState<LatLng | null>(null);
  const [tripEnded, setTripEnded] = useState(false);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    let cancelled = false;

    async function init() {
      const L = await import("leaflet");
      if (cancelled || !mapElRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapElRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([pickup.lat, pickup.lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      L.circleMarker([pickup.lat, pickup.lng], {
        color: "#14B8A6",
        fillColor: "#14B8A6",
        fillOpacity: 0.85,
        radius: 8,
        weight: 2,
      }).addTo(map);

      L.circleMarker([destination.lat, destination.lng], {
        color: "#2563EB",
        fillColor: "#2563EB",
        fillOpacity: 0.85,
        radius: 8,
        weight: 2,
      }).addTo(map);

      map.fitBounds(
        L.latLngBounds([pickup.lat, pickup.lng], [destination.lat, destination.lng]).pad(0.3),
      );

      mapRef.current = map;
    }

    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      driverMarkerRef.current = null;
    };
  }, [pickup.lat, pickup.lng, destination.lat, destination.lng]);

  useEffect(() => {
    if (tripEnded) return;

    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/driver-location`);
        if (!res.ok || !active) return;
        const data = (await res.json()) as { lat: number | null; lng: number | null; status: string };

        if (["COMPLETED", "CANCELLED"].includes(data.status)) {
          setTripEnded(true);
          return;
        }

        if (data.lat != null && data.lng != null) {
          setDriverPos({ lat: data.lat, lng: data.lng });
        }
      } catch {
        // ignore
      }
    }

    poll();
    const interval = setInterval(poll, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [bookingId, tripEnded]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !driverPos) return;

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
    } else {
      driverMarkerRef.current = L.circleMarker([driverPos.lat, driverPos.lng], {
        color: "#F59E0B",
        fillColor: "#F59E0B",
        fillOpacity: 1,
        radius: 10,
        weight: 3,
      }).addTo(map);
    }
  }, [driverPos]);

  return (
    <div className="space-y-1">
      <div ref={mapElRef} className={cn("rounded-xl border bg-card", heightClassName)} />
      <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-teal-500" /> Pickup
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> Destination
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Driver
        </span>
        {tripEnded && <span className="text-muted-foreground ml-auto">Trip ended</span>}
      </div>
    </div>
  );
}
