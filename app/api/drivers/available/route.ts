import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STALE_MS = 5 * 60 * 1000; // hide drivers not seen in the last 5 minutes
const AVG_SPEED_KMH = 20;       // conservative local tricycle/motorcycle speed

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pickupLat = Number(searchParams.get("lat"));
  const pickupLng = Number(searchParams.get("lng"));
  const hasPickup = Number.isFinite(pickupLat) && Number.isFinite(pickupLng);

  const cutoff = new Date(Date.now() - STALE_MS);

  // Drivers who are: verified, online, not on an active booking, location fresh
  const locations = await prisma.driverLocation.findMany({
    where: {
      updatedAt: { gte: cutoff },
      bookingId: null, // not currently on a trip
      user: {
        driver: {
          status: "VERIFIED",
          isAvailable: true,
        },
      },
    },
    include: {
      user: {
        include: {
          driver: {
            include: { ratings: { select: { score: true } } },
          },
        },
      },
    },
  });

  const drivers = locations
    .map((loc) => {
      const driver = loc.user.driver!;
      const avgRating =
        driver.ratings.length > 0
          ? driver.ratings.reduce((s, r) => s + r.score, 0) / driver.ratings.length
          : null;

      const distKm = hasPickup
        ? haversineKm(loc.latitude, loc.longitude, pickupLat, pickupLng)
        : null;

      // ETA: road distance ≈ straight-line × 1.35; time at AVG_SPEED_KMH
      const etaMinutes =
        distKm !== null
          ? Math.max(1, Math.ceil((distKm * 1.35) / AVG_SPEED_KMH * 60))
          : null;

      return {
        driverId:    driver.id,
        userId:      loc.userId,
        name:        loc.user.name,
        vehicleType: driver.vehicleType,
        vehicleModel:driver.vehicleModel,
        vehiclePlate:driver.vehiclePlate,
        avgRating:   avgRating !== null ? Math.round(avgRating * 10) / 10 : null,
        lat:         loc.latitude,
        lng:         loc.longitude,
        distanceKm:  distKm !== null ? Math.round(distKm * 10) / 10 : null,
        etaMinutes,
        updatedAt:   loc.updatedAt,
      };
    })
    // Sort by ETA ascending when pickup is known; else no ordering
    .sort((a, b) =>
      a.etaMinutes !== null && b.etaMinutes !== null
        ? a.etaMinutes - b.etaMinutes
        : 0
    );

  return NextResponse.json({ drivers });
}
