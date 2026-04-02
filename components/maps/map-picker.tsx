"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";

import type { LatLng } from "@/components/maps/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type PickMode = "pickup" | "destination";

export type MapPickerValue = {
  pickup: LatLng | null;
  destination: LatLng | null;
};

export function MapPicker({
  heightClassName = "h-[420px]",
  initialCenter,
  onChange,
}: {
  heightClassName?: string;
  initialCenter?: LatLng;
  onChange?: (value: MapPickerValue) => void;
}) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletModuleRef = useRef<typeof import("leaflet") | null>(null);
  const onChangeRef = useRef(onChange);

  const [pickMode, setPickMode] = useState<PickMode>("destination");
  const pickModeRef = useRef<PickMode>(pickMode);
  const gpsAppliedRef = useRef(false);
  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const lastEmittedRef = useRef<MapPickerValue>({
    pickup: null,
    destination: null,
  });

  const center = useMemo<LatLng>(() => {
    return initialCenter ?? pickup ?? destination ?? { lat: 9.6234, lng: 125.9685 };
  }, [destination, initialCenter, pickup]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Notify parent only when pickup/destination actually changed.
  useEffect(() => {
    const prev = lastEmittedRef.current;
    const pickupChanged =
      prev.pickup?.lat !== pickup?.lat || prev.pickup?.lng !== pickup?.lng;
    const destinationChanged =
      prev.destination?.lat !== destination?.lat ||
      prev.destination?.lng !== destination?.lng;

    if (!pickupChanged && !destinationChanged) return;

    const next = { pickup, destination };
    lastEmittedRef.current = next;
    onChangeRef.current?.(next);
  }, [destination, pickup]);

  // GPS: set pickup from current location (once).
  useEffect(() => {
    let cancelled = false;

    async function getGpsOnce() {
      if (!navigator.geolocation) return;
      if (pickup) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          setPickup({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          gpsAppliedRef.current = true;
          setPickMode("destination");
        },
        () => {
          // Ignore GPS errors; user can still manually pick on the map.
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10_000 }
      );
    }

    getGpsOnce();

    return () => {
      cancelled = true;
    };
  }, [pickup]);

  // After GPS sets pickup for the first time, center the map on pickup.
  useEffect(() => {
    if (!pickup) return;
    if (!gpsAppliedRef.current) return;
    if (!mapRef.current) return;

    mapRef.current.setView([pickup.lat, pickup.lng], 14);
    gpsAppliedRef.current = false;
  }, [pickup]);

  // Initialize Leaflet map once.
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

      map.on("click", (e) => {
        const clicked: LatLng = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };
        if (pickModeRef.current === "pickup") setPickup(clicked);
        else setDestination(clicked);
      });

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

  useEffect(() => {
    pickModeRef.current = pickMode;
  }, [pickMode]);

  // Update map view when center changes initially (avoid jitter after selection).
  useEffect(() => {
    if (!mapRef.current) return;
    if (!pickup && !destination) mapRef.current.setView([center.lat, center.lng], 13);
  }, [center, destination, pickup]);

  // Draw markers + polyline.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const L = leafletModuleRef.current;
    if (!L) return;

    // Keep layer references on the map instance.
    const anyMap = map as unknown as {
      __pasakja_pickup?: L.Layer;
      __pasakja_destination?: L.Layer;
      __pasakja_straight_line?: L.Layer;
      __pasakja_route_line?: L.Layer;
    };

    if (anyMap.__pasakja_pickup) map.removeLayer(anyMap.__pasakja_pickup);
    if (anyMap.__pasakja_destination)
      map.removeLayer(anyMap.__pasakja_destination);
    if (anyMap.__pasakja_straight_line)
      map.removeLayer(anyMap.__pasakja_straight_line);
    if (anyMap.__pasakja_route_line)
      map.removeLayer(anyMap.__pasakja_route_line);

    if (pickup) {
      const marker = L.circleMarker([pickup.lat, pickup.lng], {
        color: "#14B8A6",
        fillColor: "#14B8A6",
        fillOpacity: 0.85,
        radius: 9,
        weight: 2,
      }).addTo(map);
      anyMap.__pasakja_pickup = marker;
    }

    if (destination) {
      const marker = L.circleMarker([destination.lat, destination.lng], {
        color: "#2563EB",
        fillColor: "#2563EB",
        fillOpacity: 0.85,
        radius: 9,
        weight: 2,
      }).addTo(map);
      anyMap.__pasakja_destination = marker;
    }

    if (pickup && destination) {
      // Straight line preview.
      const line = L.polyline(
        [
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng],
        ],
        { color: "#2563EB", weight: 3, opacity: 0.35 }
      ).addTo(map);
      anyMap.__pasakja_straight_line = line;

      // Route line (best effort).
      const controller = new AbortController();
      const run = async () => {
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
      run();
      return () => controller.abort();
    }
  }, [destination, pickup]);

  // Route line rendering when route changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const L = leafletModuleRef.current;
    if (!L) return;
    const anyMap = map as unknown as {
      __pasakja_route_line?: L.Layer;
    };

    if (anyMap.__pasakja_route_line) map.removeLayer(anyMap.__pasakja_route_line);
    anyMap.__pasakja_route_line = undefined;

    if (route && route.length >= 2) {
      const line = L.polyline(
        route.map((p) => [p.lat, p.lng]),
        { color: "#2563EB", weight: 4, opacity: 0.85 }
      ).addTo(map);
      anyMap.__pasakja_route_line = line;
    }
  }, [route]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Badge
          variant={pickMode === "pickup" ? "default" : "secondary"}
          className={cn("cursor-pointer")}
          onClick={() => setPickMode("pickup")}
        >
          Click to set Pickup
        </Badge>
        <Badge
          variant={pickMode === "destination" ? "default" : "secondary"}
          className={cn("cursor-pointer")}
          onClick={() => setPickMode("destination")}
        >
          Click to set Destination
        </Badge>
      </div>

      <div ref={mapElRef} className={cn("rounded-2xl border bg-card", heightClassName)} />

      <div className="flex flex-wrap gap-2 text-xs">
        <div className="px-3 py-1 rounded-full border bg-background/50">
          <span className="text-muted-foreground">Pickup: </span>
          {pickup ? `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}` : "Not set"}
        </div>
        <div className="px-3 py-1 rounded-full border bg-background/50">
          <span className="text-muted-foreground">Destination: </span>
          {destination ? `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}` : "Not set"}
        </div>
      </div>
    </div>
  );
}

