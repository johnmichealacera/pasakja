import { auth } from "@/auth";
import { NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      activeDrivers,
      totalPassengers,
      totalDrivers,
      revenueResult,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.driver.count({ where: { isAvailable: true } }),
      prisma.passenger.count(),
      prisma.driver.count({ where: { status: "VERIFIED" } }),
      prisma.earning.aggregate({ _sum: { amount: true } }),
    ]);

    const totalRevenue = Number(revenueResult._sum.amount ?? 0);

    return NextResponse.json({
      stats: {
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        activeDrivers,
        totalPassengers,
        totalDrivers,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
