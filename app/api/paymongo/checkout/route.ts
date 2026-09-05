import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";
import { createPaymentIntent } from "@/lib/paymongo";
import {
  PASSENGER_HAS_OPEN_BOOKING_MESSAGE,
  passengerOpenBookingWhere,
} from "@/lib/booking-guards";
import { passengerTotal } from "@/lib/commission";
import { notifyEligibleDrivers } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PASSENGER") {
    return NextResponse.json(
      { error: "Only passengers can pay online" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const {
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      isShared,
      notes,
      estimatedFare,
      centavos,
    } = body as {
      pickupLat: number;
      pickupLng: number;
      pickupAddress: string;
      dropoffLat: number;
      dropoffLng: number;
      dropoffAddress: string;
      isShared?: boolean;
      notes?: string;
      estimatedFare: number;
      centavos: number;
    };

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: "Pickup and dropoff addresses are required" },
        { status: 400 },
      );
    }
    if (!centavos || centavos < 2000) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 },
      );
    }

    const passenger = await prisma.passenger.findUnique({
      where: { userId: user.id },
    });
    if (!passenger) {
      return NextResponse.json(
        { error: "Passenger profile not found" },
        { status: 404 },
      );
    }

    const baseFare = estimatedFare;
    const totalCharge = passengerTotal(baseFare);

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
            pickupLat,
            pickupLng,
            pickupAddress,
            dropoffLat,
            dropoffLng,
            dropoffAddress,
            paymentMethod: "ONLINE",
            paymentStatus: "UNPAID",
            isShared: isShared ?? false,
            notes: notes ?? null,
            fare: totalCharge,
            quotedFare: baseFare,
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

    const pi = await createPaymentIntent(centavos, {
      bookingId: booking.id,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymongoPaymentIntentId: pi.data.id },
    });

    await notifyEligibleDrivers(booking);

    return NextResponse.json({
      booking: { ...booking, paymongoPaymentIntentId: pi.data.id },
      clientKey: pi.data.attributes.client_key,
      paymentIntentId: pi.data.id,
    });
  } catch (error) {
    console.error("PayMongo checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}
