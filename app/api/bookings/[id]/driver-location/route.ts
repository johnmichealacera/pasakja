import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

const ACTIVE_STATUSES = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"];
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const AVG_SPEED_KMH = 20; // local tricycle/motorcycle speed

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      driver: { select: { userId: true } },
      passenger: { select: { userId: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (user.role === "PASSENGER" && booking.passenger.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "DRIVER" && booking.driver?.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!booking.driver || !ACTIVE_STATUSES.includes(booking.status)) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status, etaMinutes: null });
  }

  const driverLocation = await prisma.driverLocation.findUnique({
    where: { userId: booking.driver.userId },
  });

  if (!driverLocation) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status, etaMinutes: null });
  }

  if (driverLocation.bookingId && driverLocation.bookingId !== id) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status, etaMinutes: null });
  }

  const ageMs = Date.now() - new Date(driverLocation.updatedAt).getTime();
  if (ageMs > STALE_THRESHOLD_MS) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status, etaMinutes: null });
  }

  // ETA: driver → pickup (relevant when ACCEPTED — driver is still en route)
  let etaMinutes: number | null = null;
  if (booking.status === "ACCEPTED") {
    const distKm = haversineKm(
      driverLocation.latitude, driverLocation.longitude,
      booking.pickupLat, booking.pickupLng,
    );
    // Road distance ≈ straight-line × 1.35; speed ≈ 20 km/h
    etaMinutes = Math.max(1, Math.ceil((distKm * 1.35) / AVG_SPEED_KMH * 60));
  }

  return NextResponse.json({
    lat: driverLocation.latitude,
    lng: driverLocation.longitude,
    status: booking.status,
    etaMinutes,
    updatedAt: driverLocation.updatedAt,
  });
}
