import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYMONGO_MIN_CENTAVOS = 2000;

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
    const estimatedPHP = baseFare + distanceKm * perKmRate;
    const roundedPHP = Math.round(estimatedPHP * 100) / 100;
    let centavos = Math.round(roundedPHP * 100);

    if (centavos < PAYMONGO_MIN_CENTAVOS) {
      centavos = PAYMONGO_MIN_CENTAVOS;
    }

    return NextResponse.json({
      estimatedFare: roundedPHP,
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
