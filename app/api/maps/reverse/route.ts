import { NextRequest, NextResponse } from "next/server";
import {
  findNearestSocorroPlace,
  resolveTripAddress,
  type TripAddressRole,
} from "@/lib/trip-address";

async function fetchNominatimAddress(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "pasakja-community-transport/1.0",
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    display_name?: string;
    address?: {
      road?: string;
      path?: string;
      pedestrian?: string;
      hamlet?: string;
      neighbourhood?: string;
      suburb?: string;
      village?: string;
      town?: string;
      city?: string;
      municipality?: string;
      state?: string;
    };
  };

  const a = data.address ?? {};
  const streetPart = a.road ?? a.path ?? a.pedestrian ?? null;
  const localPart = a.hamlet ?? a.neighbourhood ?? a.suburb ?? null;
  const municipalPart =
    a.village ?? a.town ?? a.city ?? a.municipality ?? "Socorro";
  const provincePart = a.state ?? "Surigao del Norte";

  const parts = [streetPart, localPart, municipalPart, provincePart].filter(Boolean);

  if (streetPart) return parts.join(", ");
  if (data.display_name) {
    return data.display_name.split(",").slice(0, 4).join(",").trim();
  }
  return [municipalPart, provincePart].join(", ");
}

async function fetchOsrmRoadName(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?number=1`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      code?: string;
      waypoints?: Array<{ name: string; distance: number }>;
    };
    const wp = data.waypoints?.[0];
    if (!wp || data.code !== "Ok" || wp.distance > 500) return null;
    return wp.name || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const role = (searchParams.get("role") ?? "dropoff") as TripAddressRole;
  const fromGps = searchParams.get("gps") === "1";
  const explicitPlaceName = searchParams.get("placeName");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  if (role !== "pickup" && role !== "dropoff") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const landmark = findNearestSocorroPlace(lat, lng);

    const [nominatimAddress, roadName] = await Promise.all([
      fetchNominatimAddress(lat, lng),
      fetchOsrmRoadName(lat, lng),
    ]);

    const address = resolveTripAddress({
      lat,
      lng,
      role,
      explicitPlaceName,
      fromGps,
      nominatimAddress,
      roadName,
    });

    return NextResponse.json({
      address,
      landmark: landmark?.name ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reverse geocode" },
      { status: 500 },
    );
  }
}
