import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim usage policy asks for identifying User-Agent.
        "User-Agent": "pasakja-community-transport/1.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Reverse geocoding provider error" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      display_name?: string;
      address?: {
        road?: string;
        neighbourhood?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
      };
    };

    const shortLabel = [
      data.address?.road,
      data.address?.neighbourhood ?? data.address?.suburb,
      data.address?.city ?? data.address?.town ?? data.address?.village,
      data.address?.state,
    ]
      .filter(Boolean)
      .join(", ");

    return NextResponse.json({
      address: shortLabel || data.display_name || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reverse geocode" },
      { status: 500 }
    );
  }
}

