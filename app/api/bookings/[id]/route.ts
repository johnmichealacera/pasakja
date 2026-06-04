import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { driverAmount, platformFee } from "@/lib/commission";
import {
  DRIVER_HAS_ACTIVE_BOOKING_MESSAGE,
  driverActiveBookingWhere,
} from "@/lib/booking-guards";

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

      // Driver rejects a booking that was specifically requested for them.
      // This clears requestedDriverId so the booking becomes visible to all drivers.
      if (body.action === "reject_request") {
        if (booking.requestedDriverId !== driver.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (booking.status !== "PENDING" || booking.driverId !== null) {
          return NextResponse.json({ error: "Booking is no longer in a rejectable state" }, { status: 400 });
        }
        const updated = await prisma.booking.update({
          where: { id },
          data: { requestedDriverId: null }, // open to all drivers now
        });
        return NextResponse.json({ booking: updated });
      }

      if (status === "ACCEPTED") {
        if (booking.status !== "PENDING" || booking.driverId !== null) {
          return NextResponse.json(
            { error: "This booking is no longer available" },
            { status: 409 },
          );
        }
        if (
          booking.requestedDriverId &&
          booking.requestedDriverId !== driver.id
        ) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let accepted;
        try {
          accepted = await prisma.$transaction(async (tx) => {
            const activeForDriver = await tx.booking.findFirst({
              where: driverActiveBookingWhere(driver.id),
              select: { id: true },
            });
            if (activeForDriver) {
              throw new Error("DRIVER_BUSY");
            }

            const result = await tx.booking.updateMany({
              where: {
                id,
                status: "PENDING",
                driverId: null,
              },
              data: { status: "ACCEPTED", driverId: driver.id },
            });
            if (result.count === 0) {
              throw new Error("BOOKING_UNAVAILABLE");
            }

            return tx.booking.findUnique({ where: { id } });
          });
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === "DRIVER_BUSY") {
              return NextResponse.json(
                { error: DRIVER_HAS_ACTIVE_BOOKING_MESSAGE },
                { status: 409 },
              );
            }
            if (err.message === "BOOKING_UNAVAILABLE") {
              return NextResponse.json(
                { error: "This booking was just taken by another driver" },
                { status: 409 },
              );
            }
          }
          throw err;
        }

        return NextResponse.json({ booking: accepted });
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
        const grossFare = body.fare ?? (Number(booking.quotedFare) || 15);
        const netDriver = driverAmount(grossFare);   // driver's 85%
        const sysFee   = platformFee(grossFare);     // Pasakja's 15%

        await prisma.trip.upsert({
          where: { bookingId: id },
          update: { endTime: new Date(), distance: body.distance ?? null },
          create: { bookingId: id, endTime: new Date(), distance: body.distance ?? null },
        });
        await prisma.earning.create({
          data: {
            driverId:    driver.id,
            bookingId:   id,
            amount:      netDriver,   // what the driver receives
            platformFee: sysFee,      // what Pasakja retains
          },
        });
        await prisma.driver.update({
          where: { id: driver.id },
          data: { totalEarnings: { increment: netDriver } },
        });
        const paymentStatus =
          booking.paymentMethod === "CASH"
            ? "PAID"
            : booking.paymentStatus === "PAID"
              ? "PAID"
              : "UNPAID";
        const updated = await prisma.booking.update({
          where: { id },
          data: { status: "COMPLETED", fare: grossFare, paymentStatus },
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
