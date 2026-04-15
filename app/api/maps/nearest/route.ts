import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Missing/invalid coordinates" },
      { status: 400 },
    );
  }

  const url = `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?number=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Road snapping service unavailable" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      code?: string;
      waypoints?: Array<{
        location: [number, number];
        distance: number;
        name: string;
      }>;
    };

    const wp = data.waypoints?.[0];
    if (!wp || data.code !== "Ok") {
      return NextResponse.json(
        { error: "No road found near this location" },
        { status: 404 },
      );
    }

    const MAX_SNAP_DISTANCE_METERS = 500;
    if (wp.distance > MAX_SNAP_DISTANCE_METERS) {
      return NextResponse.json(
        {
          error: "No road nearby — please tap closer to a road",
          distance: wp.distance,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      lat: wp.location[1],
      lng: wp.location[0],
      roadName: wp.name || null,
      snapDistance: Math.round(wp.distance),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to snap to nearest road" },
      { status: 500 },
    );
  }
}
