import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
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

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error("SOS POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
