import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"];
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as { id: string; role: string };

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

  // Only the assigned passenger (or the driver, or admin) may query driver location
  if (user.role === "PASSENGER" && booking.passenger.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "DRIVER" && booking.driver?.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // No driver assigned yet, or ride is not in an active phase
  if (!booking.driver || !ACTIVE_STATUSES.includes(booking.status)) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  const driverLocation = await prisma.driverLocation.findUnique({
    where: { userId: booking.driver.userId },
  });

  // No location row at all
  if (!driverLocation) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  // Location belongs to a different booking — stale from a previous ride
  if (driverLocation.bookingId && driverLocation.bookingId !== id) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  // Freshness check: reject rows older than 5 minutes
  const ageMs = Date.now() - new Date(driverLocation.updatedAt).getTime();
  if (ageMs > STALE_THRESHOLD_MS) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  return NextResponse.json({
    lat: driverLocation.latitude,
    lng: driverLocation.longitude,
    status: booking.status,
    updatedAt: driverLocation.updatedAt,
  });
}
