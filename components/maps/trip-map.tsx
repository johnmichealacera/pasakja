"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";

import type { LatLng } from "@/components/maps/types";

function formatLatLng(p: LatLng) {
  return `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
}

export function TripMap({
  heightClassName = "h-[520px]",
  pickup,
  destination,
  driverId,
  driverOnline,
}: {
  heightClassName?: string;
  pickup: LatLng;
  destination: LatLng;
  driverId?: string;
  driverOnline?: boolean;
}) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletModuleRef = useRef<typeof import("leaflet") | null>(null);

  const [driverPos, setDriverPos] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null);

  const center = useMemo(() => {
    return {
      lat: (pickup.lat + destination.lat) / 2,
      lng: (pickup.lng + destination.lng) / 2,
    };
  }, [pickup, destination]);

  // Init map once.
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    let cancelled = false;

    async function initLeaflet() {
      const L = await import("leaflet");
      if (cancelled) return;

      leafletModuleRef.current = L;

      const map = L.map(mapElRef.current as HTMLDivElement, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([center.lat, center.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
    }

    void initLeaflet();

    return () => {
      cancelled = true;
      const map = mapRef.current;
      if (map) map.remove();
      mapRef.current = null;
      leafletModuleRef.current = null;
    };
  }, [center.lat, center.lng]);

  // Draw markers + route whenever inputs change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const L = leafletModuleRef.current;
    if (!L) return;

    const anyMap = map as unknown as {
      __pasakja_pickup?: L.Layer;
      __pasakja_destination?: L.Layer;
      __pasakja_driver?: L.Layer;
      __pasakja_route?: L.Layer;
    };

    if (anyMap.__pasakja_pickup) map.removeLayer(anyMap.__pasakja_pickup);
    if (anyMap.__pasakja_destination)
      map.removeLayer(anyMap.__pasakja_destination);
    if (anyMap.__pasakja_route) map.removeLayer(anyMap.__pasakja_route);
    if (anyMap.__pasakja_driver) map.removeLayer(anyMap.__pasakja_driver);

    anyMap.__pasakja_pickup = L.circleMarker([pickup.lat, pickup.lng], {
      color: "#14B8A6",
      fillColor: "#14B8A6",
      fillOpacity: 0.85,
      radius: 9,
      weight: 2,
    }).addTo(map);

    anyMap.__pasakja_destination = L.circleMarker(
      [destination.lat, destination.lng],
      {
        color: "#2563EB",
        fillColor: "#2563EB",
        fillOpacity: 0.85,
        radius: 9,
        weight: 2,
      }
    ).addTo(map);

    const drawStraight = () => {
      anyMap.__pasakja_route = L.polyline(
        [
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng],
        ],
        { color: "#2563EB", weight: 4, opacity: 0.35 }
      ).addTo(map);
    };

    drawStraight();

    let controller: AbortController | null = null;
    const runRoute = async () => {
      controller = new AbortController();
      try {
        setRoute(null);
        const res = await fetch(
          `/api/maps/route?fromLat=${pickup.lat}&fromLng=${pickup.lng}&toLat=${destination.lat}&toLng=${destination.lng}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { polyline: LatLng[] };
        if (!data.polyline?.length) return;
        setRoute(data.polyline);
      } catch {
        // ignore
      }
    };

    // Route best-effort. If it fails, straight line remains.
    if (pickup && destination) void runRoute();

    return () => controller?.abort();
  }, [pickup, destination]);

  // When route is available, replace route polyline with best one.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!route || route.length < 2) return;

    const L = leafletModuleRef.current;
    if (!L) return;

    const anyMap = map as unknown as {
      __pasakja_route?: Leaflet.Layer;
    };

    if (anyMap.__pasakja_route) map.removeLayer(anyMap.__pasakja_route);

    anyMap.__pasakja_route = L.polyline(
      route.map((p) => [p.lat, p.lng]),
      { color: "#2563EB", weight: 5, opacity: 0.85 }
    ).addTo(map);
  }, [route]);

  // Driver GPS: watch position and patch to backend (throttled).
  useEffect(() => {
    if (!driverId) return;
    if (!navigator.geolocation) return;
    if (driverOnline === false) return;

    let watchId: number | null = null;
    let lastPatch = 0;

    const patchDriver = async (pos: LatLng) => {
      const now = Date.now();
      // Throttle updates to reduce server load.
      if (now - lastPatch < 5000) return;
      lastPatch = now;

      try {
        await fetch(`/api/drivers/${driverId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentLat: pos.lat,
            currentLng: pos.lng,
          }),
        });
      } catch {
        // ignore network errors for map UI
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDriverPos(next);
        void patchDriver(next);
      },
      () => {
        // ignore GPS errors
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 }
    );

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [driverId, driverOnline]);

  // Draw/update driver marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const L = leafletModuleRef.current;
    if (!L) return;

    const anyMap = map as unknown as {
      __pasakja_driver?: L.Layer;
    };

    if (!driverPos) return;

    if (anyMap.__pasakja_driver) map.removeLayer(anyMap.__pasakja_driver);

    anyMap.__pasakja_driver = L.circleMarker(
      [driverPos.lat, driverPos.lng],
      {
      color: "#A855F7",
      fillColor: "#A855F7",
      fillOpacity: 0.85,
      radius: 8,
      weight: 2,
      }
    ).addTo(map);
  }, [driverPos]);

  return (
    <div className="space-y-3">
      <div
        ref={mapElRef}
        className={`rounded-2xl border bg-card ${heightClassName}`}
      />

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="px-3 py-1 rounded-full border bg-background/50">
          Pickup: {formatLatLng(pickup)}
        </span>
        <span className="px-3 py-1 rounded-full border bg-background/50">
          Destination: {formatLatLng(destination)}
        </span>
        {driverPos && (
          <span className="px-3 py-1 rounded-full border bg-background/50">
            Driver: {formatLatLng(driverPos)}
          </span>
        )}
      </div>
    </div>
  );
}

