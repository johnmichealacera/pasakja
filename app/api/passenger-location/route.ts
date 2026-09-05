import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";
import { DRIVER_ACTIVE_BOOKING_STATUSES } from "@/lib/booking-guards";

const ACTIVE_STATUSES = DRIVER_ACTIVE_BOOKING_STATUSES;

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Forbidden — passengers only" }, { status: 403 });
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

  if (typeof bookingId !== "string") {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const passenger = await prisma.passenger.findUnique({ where: { userId: user.id } });
  if (!passenger) {
    return NextResponse.json({ error: "Passenger profile not found" }, { status: 404 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { passengerId: true, status: true },
  });

  if (!booking || booking.passengerId !== passenger.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!ACTIVE_STATUSES.includes(booking.status as (typeof ACTIVE_STATUSES)[number])) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await prisma.passengerLocation.upsert({
    where: { userId: user.id },
    update: { latitude, longitude, bookingId },
    create: { userId: user.id, latitude, longitude, bookingId },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.passengerLocation.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
