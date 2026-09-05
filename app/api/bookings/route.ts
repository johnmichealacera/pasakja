import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";
import {
  PASSENGER_HAS_OPEN_BOOKING_MESSAGE,
  passengerOpenBookingWhere,
} from "@/lib/booking-guards";
import { SAFE_USER_SELECT } from "@/lib/safe-select";
import { notifyEligibleDrivers } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const disputeStatus = searchParams.get("disputeStatus");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  try {

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
          driver: { include: { user: { select: SAFE_USER_SELECT } } },
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
          passenger: { include: { user: { select: SAFE_USER_SELECT } } },
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
        where: {
          ...(status ? { status: status as never } : {}),
          ...(disputeStatus ? { disputeStatus: disputeStatus as never } : {}),
        },
        include: {
          passenger: { include: { user: { select: SAFE_USER_SELECT } } },
          driver: { include: { user: { select: SAFE_USER_SELECT } } },
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
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Only passengers can book rides" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      pickupLat, pickupLng, pickupAddress,
      dropoffLat, dropoffLng, dropoffAddress,
      paymentMethod, isShared, notes, quotedFare,
      requestedDriverId,
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

    const openBooking = await prisma.booking.findFirst({
      where: passengerOpenBookingWhere(passenger.id),
      select: { id: true },
    });
    if (openBooking) {
      return NextResponse.json(
        { error: PASSENGER_HAS_OPEN_BOOKING_MESSAGE },
        { status: 409 },
      );
    }

    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
        const existing = await tx.booking.findFirst({
          where: passengerOpenBookingWhere(passenger.id),
          select: { id: true },
        });
        if (existing) {
          throw new Error("PASSENGER_BUSY");
        }

        return tx.booking.create({
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
            quotedFare: quotedFare ?? null,
            fare: null,
            requestedDriverId: requestedDriverId ?? null,
          },
        });
      });
    } catch (err) {
      if (err instanceof Error && err.message === "PASSENGER_BUSY") {
        return NextResponse.json(
          { error: PASSENGER_HAS_OPEN_BOOKING_MESSAGE },
          { status: 409 },
        );
      }
      throw err;
    }

    await notifyEligibleDrivers(booking);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Booking POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
