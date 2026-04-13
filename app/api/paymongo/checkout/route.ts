import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent } from "@/lib/paymongo";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
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

    const booking = await prisma.booking.create({
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
        fare: estimatedFare,
        quotedFare: estimatedFare,
      },
    });

    const pi = await createPaymentIntent(centavos, {
      bookingId: booking.id,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymongoPaymentIntentId: pi.data.id },
    });

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
