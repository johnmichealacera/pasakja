import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";
import { SAFE_USER_SELECT } from "@/lib/safe-select";
import { notifyAdmins } from "@/lib/notifications";

/** Admin-only listing — added for the mobile SOS-monitoring screen; the web admin page still queries Prisma directly server-side. */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const alerts = await prisma.sosAlert.findMany({
    include: { passenger: { include: { user: { select: SAFE_USER_SELECT } } } },
    orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Only passengers can send SOS alerts" }, { status: 403 });
  }

  try {
    const { lat, lng, message, bookingId } = await req.json();

    const passenger = await prisma.passenger.findUnique({
      where: { userId: user.id },
    });

    if (!passenger) {
      return NextResponse.json({ error: "Passenger not found" }, { status: 404 });
    }

    const alert = await prisma.sosAlert.create({
      data: {
        passengerId: passenger.id,
        lat: lat ?? 9.6234,
        lng: lng ?? 125.9685,
        message,
        bookingId,
      },
    });

    await notifyAdmins(
      "🚨 SOS Alert",
      message ? String(message) : "A passenger triggered an emergency alert.",
      { alertId: alert.id, type: "sos" }
    );

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error("SOS POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
