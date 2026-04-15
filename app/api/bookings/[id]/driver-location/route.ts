import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      driver: { select: { currentLat: true, currentLng: true } },
      passenger: { select: { userId: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role === "PASSENGER" && booking.passenger.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    !booking.driver ||
    booking.driver.currentLat == null ||
    booking.driver.currentLng == null
  ) {
    return NextResponse.json({ lat: null, lng: null, status: booking.status });
  }

  return NextResponse.json({
    lat: booking.driver.currentLat,
    lng: booking.driver.currentLng,
    status: booking.status,
  });
}
