import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  try {
    const user = session.user as { id: string; role: string };

    if (user.role === "PASSENGER") {
      const passenger = await prisma.passenger.findUnique({
        where: { userId: user.id },
      });
      if (!passenger) return NextResponse.json({ bookings: [] });

      const bookings = await prisma.booking.findMany({
        where: {
          passengerId: passenger.id,
          ...(status ? { status: status as never } : {}),
        },
        include: {
          driver: { include: { user: true } },
          trip: true,
          rating: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ bookings });
    }

    if (user.role === "DRIVER") {
      const driver = await prisma.driver.findUnique({
        where: { userId: user.id },
      });
      if (!driver) return NextResponse.json({ bookings: [] });

      const bookings = await prisma.booking.findMany({
        where: {
          ...(status === "PENDING"
            ? { status: "PENDING", driverId: null }
            : { driverId: driver.id, ...(status ? { status: status as never } : {}) }),
        },
        include: {
          passenger: { include: { user: true } },
          trip: true,
          rating: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ bookings });
    }

    if (user.role === "ADMIN") {
      const bookings = await prisma.booking.findMany({
        where: status ? { status: status as never } : {},
        include: {
          passenger: { include: { user: true } },
          driver: { include: { user: true } },
          trip: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ bookings });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } catch (error) {
    console.error("Bookings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Only passengers can book rides" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      pickupLat, pickupLng, pickupAddress,
      dropoffLat, dropoffLng, dropoffAddress,
      paymentMethod, isShared, notes,
    } = body;

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: "Pickup and dropoff addresses are required" },
        { status: 400 }
      );
    }

    const passenger = await prisma.passenger.findUnique({
      where: { userId: user.id },
    });
    if (!passenger) {
      return NextResponse.json({ error: "Passenger profile not found" }, { status: 404 });
    }

    const booking = await prisma.booking.create({
      data: {
        passengerId: passenger.id,
        pickupLat: pickupLat ?? 9.6234,
        pickupLng: pickupLng ?? 125.9685,
        pickupAddress,
        dropoffLat: dropoffLat ?? 9.6234,
        dropoffLng: dropoffLng ?? 125.9685,
        dropoffAddress,
        paymentMethod: paymentMethod ?? "CASH",
        isShared: isShared ?? false,
        notes,
        fare: null,
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Booking POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
