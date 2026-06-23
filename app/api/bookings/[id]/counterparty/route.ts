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
  const user = session.user as { id: string; role: string };

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      driver: {
        include: {
          user: true,
          ratings: true,
          _count: {
            select: {
              bookings: { where: { status: "COMPLETED" } },
            },
          },
        },
      },
      passenger: {
        include: {
          user: true,
          _count: { select: { bookings: true } },
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (user.role === "PASSENGER") {
    const passenger = await prisma.passenger.findUnique({ where: { userId: user.id } });
    if (!passenger || booking.passengerId !== passenger.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!booking.driver) {
      return NextResponse.json({ error: "No driver assigned yet" }, { status: 404 });
    }

    const driver = booking.driver;
    const driverUser = driver.user;
    const avgRating =
      driver.ratings.length > 0
        ? Math.round(
            (driver.ratings.reduce((sum, r) => sum + r.score, 0) / driver.ratings.length) * 10,
          ) / 10
        : null;

    return NextResponse.json({
      role: "driver" as const,
      name: driverUser.name,
      profileImage: driverUser.profileImage,
      phone: driverUser.phone,
      vehicleType: driver.vehicleType,
      vehicleModel: driver.vehicleModel,
      vehiclePlate: driver.vehiclePlate,
      status: driver.status,
      avgRating,
      ratingCount: driver.ratings.length,
      tripCount: driver._count.bookings,
    });
  }

  if (user.role === "DRIVER") {
    const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
    if (!driver) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const canView =
      booking.driverId === driver.id ||
      (booking.status === "PENDING" &&
        booking.driverId === null &&
        (booking.requestedDriverId === null || booking.requestedDriverId === driver.id));

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const passengerUser = booking.passenger.user;

    return NextResponse.json({
      role: "passenger" as const,
      name: passengerUser.name,
      profileImage: passengerUser.profileImage,
      phone: passengerUser.phone,
      memberSince: passengerUser.createdAt,
      tripCount: booking.passenger._count.bookings,
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
