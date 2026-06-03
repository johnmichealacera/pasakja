"use client";

// NOTE: navigator.geolocation requires HTTPS in production.
// On HTTP origins the browser will silently deny permission.

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import type { LatLng } from "@/components/maps/types";
import { addMapTiles } from "@/lib/map-tiles";

function formatLatLng(p: LatLng) {
  return `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
}

type GpsStatus = "idle" | "sharing" | "denied" | "unavailable";

export function TripMap({
  heightClassName = "h-[520px]",
  pickup,
  destination,
  driverId,
  driverOnline,
  bookingId,
}: {
  heightClassName?: string;
  pickup: LatLng;
  destination: LatLng;
  driverId?: string;
  driverOnline?: boolean;
  bookingId?: string;
}) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletModuleRef = useRef<typeof import("leaflet") | null>(null);

  const [driverPos, setDriverPos] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");

  // Ref-based timestamp guard — throttle GPS posts to at most 1 per 10 seconds
  const lastPostRef = useRef(0);

  const center = useMemo(() => ({
    lat: (pickup.lat + destination.lat) / 2,
    lng: (pickup.lng + destination.lng) / 2,
  }), [pickup.lat, pickup.lng, destination.lat, destination.lng]);

  // Init Leaflet map once
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
        minZoom: 10,
        maxZoom: 19,
      }).setView([center.lat, center.lng], 13);

      addMapTiles(map, L);

      mapRef.current = map;
    }

    void initLeaflet();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletModuleRef.current = null;
    };
  }, [center.lat, center.lng]);

  // Draw pickup/destination markers and route polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const L = leafletModuleRef.current;
    if (!L) return;

    type AugMap = {
      __pasakja_pickup?: Leaflet.Layer;
      __pasakja_destination?: Leaflet.Layer;
      __pasakja_driver?: Leaflet.Layer;
      __pasakja_route?: Leaflet.Layer;
    };
    const am = map as unknown as AugMap;

    if (am.__pasakja_pickup) map.removeLayer(am.__pasakja_pickup);
    if (am.__pasakja_destination) map.removeLayer(am.__pasakja_destination);
    if (am.__pasakja_route) map.removeLayer(am.__pasakja_route);
    if (am.__pasakja_driver) map.removeLayer(am.__pasakja_driver);

    am.__pasakja_pickup = L.circleMarker([pickup.lat, pickup.lng], {
      color: "#14B8A6", fillColor: "#14B8A6", fillOpacity: 0.85, radius: 9, weight: 2,
    }).bindTooltip("Pickup").addTo(map);

    am.__pasakja_destination = L.circleMarker([destination.lat, destination.lng], {
      color: "#2563EB", fillColor: "#2563EB", fillOpacity: 0.85, radius: 9, weight: 2,
    }).bindTooltip("Destination").addTo(map);

    // Straight-line fallback while async route is loading
    am.__pasakja_route = L.polyline(
      [[pickup.lat, pickup.lng], [destination.lat, destination.lng]],
      { color: "#2563EB", weight: 4, opacity: 0.35 }
    ).addTo(map);

    let controller: AbortController | null = null;
    async function runRoute() {
      controller = new AbortController();
      try {
        const res = await fetch(
          `/api/maps/route?fromLat=${pickup.lat}&fromLng=${pickup.lng}&toLat=${destination.lat}&toLng=${destination.lng}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { polyline?: LatLng[] };
        if (!data.polyline?.length) return;
        setRoute(data.polyline);
      } catch {
        // ignore — straight-line fallback remains
      }
    }
    void runRoute();
    return () => controller?.abort();
  }, [pickup, destination]);

  // Replace straight-line with actual road route when available
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || route.length < 2) return;
    const L = leafletModuleRef.current;
    if (!L) return;

    type AugMap = { __pasakja_route?: Leaflet.Layer };
    const am = map as unknown as AugMap;
    if (am.__pasakja_route) map.removeLayer(am.__pasakja_route);
    am.__pasakja_route = L.polyline(
      route.map((p) => [p.lat, p.lng]),
      { color: "#2563EB", weight: 5, opacity: 0.85 }
    ).addTo(map);
  }, [route]);

  // GPS watchPosition — broadcast driver location, throttled to 10s
  useEffect(() => {
    if (!driverId) return;
    if (driverOnline === false) return;

    if (!navigator.geolocation) {
      setGpsStatus("unavailable");
      return;
    }

    setGpsStatus("sharing");

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDriverPos(next);

        const now = Date.now();
        if (now - lastPostRef.current < 10_000) return; // 10-second throttle
        lastPostRef.current = now;

        // Post to dedicated DriverLocation table (booking-scoped)
        fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: next.lat,
            longitude: next.lng,
            bookingId: bookingId ?? null,
          }),
        }).catch(() => {});

        // Also keep Driver.currentLat/Lng updated for backward compatibility
        fetch(`/api/drivers/${driverId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentLat: next.lat, currentLng: next.lng }),
        }).catch(() => {});
      },
      (err) => {
        // GeolocationPositionError codes: 1=PERMISSION_DENIED, 2=UNAVAILABLE, 3=TIMEOUT
        setGpsStatus(err.code === 1 ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setGpsStatus("idle");
    };
  }, [driverId, driverOnline, bookingId]);

  // Draw / update driver self-position marker (purple) and auto-fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !driverPos) return;
    const L = leafletModuleRef.current;
    if (!L) return;

    type AugMap = { __pasakja_driver?: Leaflet.Layer };
    const am = map as unknown as AugMap;
    if (am.__pasakja_driver) map.removeLayer(am.__pasakja_driver);

    am.__pasakja_driver = L.circleMarker([driverPos.lat, driverPos.lng], {
      color: "#A855F7", fillColor: "#A855F7", fillOpacity: 0.9, radius: 8, weight: 2,
    }).bindTooltip("You").addTo(map);

    // Auto-fit bounds to include driver, pickup, and destination
    map.fitBounds(
      L.latLngBounds([
        [driverPos.lat, driverPos.lng],
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng],
      ]).pad(0.25)
    );
  }, [driverPos, pickup, destination]);

  return (
    <div className="space-y-3">
      {/* GPS status badge — gives the driver real-time feedback */}
      {driverId && (
        <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
          {gpsStatus === "sharing" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
              </span>
              Sharing location
            </span>
          )}
          {gpsStatus === "denied" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
              ⚠ GPS permission denied — passenger cannot see your location
            </span>
          )}
          {gpsStatus === "unavailable" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted border rounded-full px-2.5 py-1">
              GPS unavailable on this device
            </span>
          )}
        </div>
      )}

      <div ref={mapElRef} className={`rounded-2xl border bg-card ${heightClassName}`} />

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="px-3 py-1 rounded-full border bg-background/50">
          Pickup: {formatLatLng(pickup)}
        </span>
        <span className="px-3 py-1 rounded-full border bg-background/50">
          Destination: {formatLatLng(destination)}
        </span>
        {driverPos && (
          <span className="px-3 py-1 rounded-full border bg-background/50">
            You: {formatLatLng(driverPos)}
          </span>
        )}
      </div>
    </div>
  );
}
