import { NextRequest, NextResponse } from "next/server";

import type { LatLng } from "@/components/maps/types";

function toOsrmLonLat(p: LatLng): [number, number] {
  return [p.lng, p.lat];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const fromLat = Number(searchParams.get("fromLat"));
  const fromLng = Number(searchParams.get("fromLng"));
  const toLat = Number(searchParams.get("toLat"));
  const toLng = Number(searchParams.get("toLng"));

  if (
    !Number.isFinite(fromLat) ||
    !Number.isFinite(fromLng) ||
    !Number.isFinite(toLat) ||
    !Number.isFinite(toLng)
  ) {
    return NextResponse.json(
      { error: "Missing/invalid coordinates" },
      { status: 400 }
    );
  }

  const from: LatLng = { lat: fromLat, lng: fromLng };
  const to: LatLng = { lat: toLat, lng: toLng };

  // Public OSRM endpoint (no API key). For production, consider hosting your own routing engine.
  const [fromLon, fromLatVal] = toOsrmLonLat(from);
  const [toLon, toLatVal] = toOsrmLonLat(to);

  const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLatVal};${toLon},${toLatVal}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Routing provider error" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      routes?: Array<{
        geometry?: { coordinates?: Array<[number, number]> };
        distance?: number;
        duration?: number;
      }>;
    };

    const route = data.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (!coords?.length) {
      return NextResponse.json({ polyline: [] as LatLng[], distanceKm: 0 });
    }

    const polyline: LatLng[] = coords.map(([lon, lat]) => ({ lat, lng: lon }));
    const distanceKm = Math.round(((route?.distance ?? 0) / 1000) * 100) / 100;

    return NextResponse.json({ polyline, distanceKm });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch route" },
      { status: 500 }
    );
  }
}

