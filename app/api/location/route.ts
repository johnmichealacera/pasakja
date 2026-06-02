import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"] as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden — drivers only" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { latitude, longitude, bookingId } = body as {
    latitude?: unknown;
    longitude?: unknown;
    bookingId?: unknown;
  };

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "latitude and longitude must be numbers" }, { status: 400 });
  }

  if (
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180
  ) {
    return NextResponse.json({ error: "Coordinates out of valid range" }, { status: 400 });
  }

  // Verify the bookingId belongs to this driver and is active
  if (bookingId && typeof bookingId === "string") {
    const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
    if (!driver) {
      return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { driverId: true, status: true },
    });

    if (!booking || booking.driverId !== driver.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!ACTIVE_STATUSES.includes(booking.status as (typeof ACTIVE_STATUSES)[number])) {
      // Silently ignore — ride may have just ended; don't broadcast stale location
      return NextResponse.json({ ok: true, skipped: true });
    }
  }

  // Upsert one row per driver (keyed by userId)
  await prisma.driverLocation.upsert({
    where: { userId: user.id },
    update: {
      latitude,
      longitude,
      bookingId: typeof bookingId === "string" ? bookingId : null,
    },
    create: {
      userId: user.id,
      latitude,
      longitude,
      bookingId: typeof bookingId === "string" ? bookingId : null,
    },
  });

  return NextResponse.json({ ok: true });
}
