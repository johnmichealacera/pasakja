"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import type { LatLng } from "@/components/maps/types";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const NEARBY_THRESHOLD_M = 300;  // show "Driver is nearby" within 300 m

/** Haversine distance in metres */
function distanceM(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLng = (b.lng - a.lng) * (Math.PI / 180);
  const lat1 = a.lat * (Math.PI / 180);
  const lat2 = b.lat * (Math.PI / 180);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Inject pulsing animation CSS once into the document */
function ensurePulseCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("pasakja-pulse-css")) return;
  const style = document.createElement("style");
  style.id = "pasakja-pulse-css";
  style.textContent = `
    @keyframes pasakja-ping {
      0%   { transform: scale(1); opacity: 0.6; }
      70%  { transform: scale(2.2); opacity: 0; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    .pasakja-driver-halo {
      position: absolute; inset: 0; border-radius: 50%;
      background: rgba(37,99,235,0.35);
      animation: pasakja-ping 2s cubic-bezier(0,0,0.2,1) infinite;
    }
    .pasakja-driver-dot {
      position: absolute; inset: 5px; border-radius: 50%;
      background: #2563EB; border: 2px solid #fff;
      box-shadow: 0 0 0 2px rgba(37,99,235,0.4);
    }
  `;
  document.head.appendChild(style);
}

interface LiveTrackingMapProps {
  bookingId: string;
  pickup: LatLng;
  destination: LatLng;
  bookingStatus?: string;
  heightClassName?: string;
}

export function LiveTrackingMap({
  bookingId,
  pickup,
  destination,
  bookingStatus: initialStatus = "ACCEPTED",
  heightClassName = "h-[280px]",
}: LiveTrackingMapProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const driverMarkerRef = useRef<Leaflet.Marker | null>(null);
  const lastFitRef = useRef<LatLng | null>(null);

  const [driverPos, setDriverPos] = useState<LatLng | null>(null);
  const [liveStatus, setLiveStatus] = useState(initialStatus);
  const [tripEnded, setTripEnded] = useState(false);

  // Init map once
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    let cancelled = false;
    ensurePulseCss();

    async function init() {
      const L = await import("leaflet");
      if (cancelled || !mapElRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapElRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
      }).setView([pickup.lat, pickup.lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      L.circleMarker([pickup.lat, pickup.lng], {
        color: "#14B8A6", fillColor: "#14B8A6", fillOpacity: 0.85, radius: 8, weight: 2,
      }).bindTooltip("Your pickup").addTo(map);

      L.circleMarker([destination.lat, destination.lng], {
        color: "#2563EB", fillColor: "#2563EB", fillOpacity: 0.85, radius: 8, weight: 2,
      }).bindTooltip("Destination").addTo(map);

      map.fitBounds(
        L.latLngBounds([pickup.lat, pickup.lng], [destination.lat, destination.lng]).pad(0.35)
      );

      mapRef.current = map;
    }

    void init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      driverMarkerRef.current = null;
      lastFitRef.current = null;
    };
  }, [pickup.lat, pickup.lng, destination.lat, destination.lng]);

  // Poll driver location every 10 s
  useEffect(() => {
    if (tripEnded) return;
    let active = true;

    async function poll() {
      if (!active) return;
      try {
        const res = await fetch(`/api/bookings/${bookingId}/driver-location`);
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          lat: number | null;
          lng: number | null;
          status: string;
        };

        setLiveStatus(data.status);

        if (["COMPLETED", "CANCELLED"].includes(data.status)) {
          setTripEnded(true);
          setDriverPos(null);
          return;
        }

        if (data.lat != null && data.lng != null) {
          setDriverPos({ lat: data.lat, lng: data.lng });
        }
      } catch {
        // ignore transient errors
      }
    }

    void poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => { active = false; clearInterval(interval); };
  }, [bookingId, tripEnded]);

  // Update animated driver marker and auto-fit bounds when driver moves >100 m
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (!driverPos) {
      if (driverMarkerRef.current) {
        map.removeLayer(driverMarkerRef.current);
        driverMarkerRef.current = null;
      }
      return;
    }

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
    } else {
      const icon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:24px;height:24px;">
          <div class="pasakja-driver-halo"></div>
          <div class="pasakja-driver-dot"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      driverMarkerRef.current = L.marker([driverPos.lat, driverPos.lng], { icon })
        .bindTooltip("Driver")
        .addTo(map);
    }

    // Re-fit bounds when driver first appears or moves >100 m from last fit
    const last = lastFitRef.current;
    if (!last || distanceM(last, driverPos) > 100) {
      lastFitRef.current = driverPos;
      map.fitBounds(
        L.latLngBounds([
          [driverPos.lat, driverPos.lng],
          [pickup.lat, pickup.lng],
        ]).pad(0.3)
      );
    }
  }, [driverPos, pickup.lat, pickup.lng]);

  const isNearby = driverPos != null && distanceM(driverPos, pickup) <= NEARBY_THRESHOLD_M;

  const chipText = tripEnded
    ? "Trip ended"
    : liveStatus === "IN_PROGRESS"
    ? "Ride in progress"
    : isNearby
    ? "Driver is nearby"
    : driverPos
    ? "Driver is on the way"
    : "Waiting for driver location…";

  const chipColor = tripEnded
    ? "bg-muted text-muted-foreground border-border"
    : liveStatus === "IN_PROGRESS"
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : isNearby
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

  const pingColor = liveStatus === "IN_PROGRESS"
    ? "bg-blue-500"
    : isNearby ? "bg-green-500" : "bg-amber-500";
  const dotColor = liveStatus === "IN_PROGRESS"
    ? "bg-blue-600"
    : isNearby ? "bg-green-600" : "bg-amber-600";

  return (
    <div className="space-y-2">
      {/* Proximity / status chip */}
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-1", chipColor)}>
          {!tripEnded && driverPos && (
            <span className="relative flex h-2 w-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pingColor)} />
              <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColor)} />
            </span>
          )}
          {chipText}
        </span>
      </div>

      <div ref={mapElRef} className={cn("rounded-xl border bg-card", heightClassName)} />

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-teal-500" /> Pickup
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> Destination
        </span>
        {driverPos && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> Driver
          </span>
        )}
        {tripEnded && <span className="ml-auto">Trip ended</span>}
      </div>
    </div>
  );
}
