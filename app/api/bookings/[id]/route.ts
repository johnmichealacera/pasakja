import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as { id: string; role: string };

  try {
    const body = await req.json();
    const { status, driverId } = body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (user.role === "DRIVER") {
      const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
      if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });

      if (status === "ACCEPTED") {
        const updated = await prisma.booking.update({
          where: { id },
          data: { status: "ACCEPTED", driverId: driver.id },
        });
        return NextResponse.json({ booking: updated });
      }

      if (status === "PICKED_UP" || status === "IN_PROGRESS") {
        if (booking.driverId !== driver.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (status === "IN_PROGRESS") {
          await prisma.trip.upsert({
            where: { bookingId: id },
            update: { startTime: new Date() },
            create: { bookingId: id, startTime: new Date() },
          });
        }
        const updated = await prisma.booking.update({
          where: { id },
          data: { status },
        });
        return NextResponse.json({ booking: updated });
      }

      if (status === "COMPLETED") {
        if (booking.driverId !== driver.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const fare = body.fare ?? 50;
        await prisma.trip.upsert({
          where: { bookingId: id },
          update: { endTime: new Date(), distance: body.distance ?? null },
          create: { bookingId: id, endTime: new Date(), distance: body.distance ?? null },
        });
        await prisma.earning.create({
          data: { driverId: driver.id, bookingId: id, amount: fare },
        });
        await prisma.driver.update({
          where: { id: driver.id },
          data: { totalEarnings: { increment: fare } },
        });
        const updated = await prisma.booking.update({
          where: { id },
          data: { status: "COMPLETED", fare, paymentStatus: booking.paymentMethod === "CASH" ? "PAID" : "UNPAID" },
        });
        return NextResponse.json({ booking: updated });
      }
    }

    if (user.role === "PASSENGER") {
      const passenger = await prisma.passenger.findUnique({ where: { userId: user.id } });
      if (!passenger || booking.passengerId !== passenger.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (status === "CANCELLED") {
        const updated = await prisma.booking.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json({ booking: updated });
      }
    }

    if (user.role === "ADMIN") {
      const updated = await prisma.booking.update({
        where: { id },
        data: { status, ...(driverId ? { driverId } : {}) },
      });
      return NextResponse.json({ booking: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
