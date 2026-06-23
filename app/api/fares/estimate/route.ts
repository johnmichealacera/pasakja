import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { passengerTotal, platformFee } from "@/lib/commission";

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
      include: { zone: true },
    });

    if (!fare) {
      return NextResponse.json(
        { error: "No active fare rate configured. Please ask the admin to set an active fare." },
        { status: 404 },
      );
    }

    const zoneBaseRate = Number(fare.baseFare);
    const perKmRate = Number(fare.perKmRate);
    const rawPHP = zoneBaseRate + distanceKm * perKmRate;
    const tripFare = Math.max(Math.round(rawPHP * 100) / 100, MINIMUM_FARE_PHP);
    const fee = platformFee(tripFare);
    const total = passengerTotal(tripFare);
    const centavos = Math.round(total * 100);

    return NextResponse.json({
      estimatedFare: tripFare,
      baseFare: tripFare,
      platformFee: fee,
      passengerTotal: total,
      centavos,
      zoneBaseFare: zoneBaseRate,
      perKmRate,
      distanceKm,
      zoneName: fare.zone.name,
    });
  } catch (error) {
    console.error("Fare estimate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
