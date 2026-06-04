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
        path?: string;
        pedestrian?: string;
        hamlet?: string;
        neighbourhood?: string;
        suburb?: string;
        village?: string;
        town?: string;
        city?: string;
        municipality?: string;
        county?: string;
        state?: string;
      };
    };

    const a = data.address ?? {};

    // Build a descriptive label from most-to-least specific parts.
    // Always append "Socorro, Surigao del Norte" so every address is fully
    // identifiable even when Nominatim returns only a road name.
    const streetPart  = a.road ?? a.path ?? a.pedestrian ?? null;
    const localPart   = a.hamlet ?? a.neighbourhood ?? a.suburb ?? null;
    const municipalPart = a.village ?? a.town ?? a.city ?? a.municipality ?? "Socorro";
    const provincePart  = a.state ?? "Surigao del Norte";

    const parts = [streetPart, localPart, municipalPart, provincePart].filter(Boolean);

    // If Nominatim gave us at least a road, use our constructed label.
    // Otherwise fall back to display_name but still append the province.
    let address: string;
    if (streetPart) {
      address = parts.join(", ");
    } else if (data.display_name) {
      // display_name already contains full context; trim to keep it readable
      address = data.display_name.split(",").slice(0, 4).join(",").trim();
    } else {
      address = [municipalPart, provincePart].join(", ");
    }

    return NextResponse.json({ address });
  } catch {
    return NextResponse.json(
      { error: "Failed to reverse geocode" },
      { status: 500 }
    );
  }
}

