import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MINIMUM_FARE_PHP = 15;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const distanceKm = Number(searchParams.get("distanceKm"));

  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return NextResponse.json(
      { error: "Missing or invalid distanceKm" },
      { status: 400 },
    );
  }

  try {
    const fare = await prisma.fare.findFirst({
      where: { zone: { isActive: true } },
      orderBy: { createdAt: "desc" },
    });

    if (!fare) {
      return NextResponse.json(
        { error: "No active fare configuration found" },
        { status: 404 },
      );
    }

    const baseFare = Number(fare.baseFare);
    const perKmRate = Number(fare.perKmRate);
    const rawPHP = baseFare + distanceKm * perKmRate;
    const estimatedFare = Math.max(Math.round(rawPHP * 100) / 100, MINIMUM_FARE_PHP);
    const centavos = Math.round(estimatedFare * 100);

    return NextResponse.json({
      estimatedFare,
      centavos,
      baseFare,
      perKmRate,
      distanceKm,
    });
  } catch (error) {
    console.error("Fare estimate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
