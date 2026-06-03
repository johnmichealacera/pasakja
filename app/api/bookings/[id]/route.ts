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

  // Helper: delete the driver's live location row when a ride ends
  async function clearDriverLocation(driverId: string) {
    try {
      const d = await prisma.driver.findUnique({ where: { id: driverId }, select: { userId: true } });
      if (d) await prisma.driverLocation.deleteMany({ where: { userId: d.userId } });
    } catch {
      // Non-critical — ignore cleanup errors
    }
  }

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
        const fare = body.fare ?? (Number(booking.quotedFare) || 15);
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
        const paymentStatus =
          booking.paymentMethod === "CASH"
            ? "PAID"
            : booking.paymentStatus === "PAID"
              ? "PAID"
              : "UNPAID";
        const updated = await prisma.booking.update({
          where: { id },
          data: { status: "COMPLETED", fare, paymentStatus },
        });
        // Clear live location — ride is done, location must not leak to future rides
        await clearDriverLocation(driver.id);
        return NextResponse.json({ booking: updated });
      }

      // Driver "releases" a booking — puts it back to PENDING so another driver
      // can accept it. Only the passenger can truly cancel (status → CANCELLED).
      if (status === "PENDING") {
        if (booking.driverId !== driver.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (booking.status !== "ACCEPTED") {
          return NextResponse.json(
            { error: "Cannot release after the passenger has been picked up" },
            { status: 400 }
          );
        }
        const updated = await prisma.booking.update({
          where: { id },
          // Remove the driver assignment and reset to open PENDING
          data: { status: "PENDING", driverId: null },
        });
        await clearDriverLocation(driver.id);
        return NextResponse.json({ booking: updated });
      }
    }

    if (user.role === "PASSENGER") {
      const passenger = await prisma.passenger.findUnique({ where: { userId: user.id } });
      if (!passenger || booking.passengerId !== passenger.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (status === "CANCELLED") {
        // Passengers may only cancel before the driver has picked them up
        if (!["PENDING", "ACCEPTED"].includes(booking.status)) {
          return NextResponse.json(
            { error: "Cannot cancel after the driver has picked you up" },
            { status: 400 }
          );
        }
        const updated = await prisma.booking.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
        // Clear any live location the driver may have posted
        if (booking.driverId) await clearDriverLocation(booking.driverId);
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
