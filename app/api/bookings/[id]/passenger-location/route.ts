import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"];
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

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

  if (user.role === "DRIVER" && booking.driver?.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "PASSENGER" && booking.passenger.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!ACTIVE_STATUSES.includes(booking.status)) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  const passengerLocation = await prisma.passengerLocation.findUnique({
    where: { userId: booking.passenger.userId },
  });

  if (!passengerLocation) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  if (passengerLocation.bookingId && passengerLocation.bookingId !== id) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  const ageMs = Date.now() - new Date(passengerLocation.updatedAt).getTime();
  if (ageMs > STALE_THRESHOLD_MS) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  return NextResponse.json({
    lat: passengerLocation.latitude,
    lng: passengerLocation.longitude,
    status: booking.status,
    updatedAt: passengerLocation.updatedAt,
  });
}
