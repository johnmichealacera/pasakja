import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";
import { startOfMonthPh, startOfWeekPh } from "@/lib/datetime";

/**
 * JSON counterpart to the web's app/(dashboard)/driver/earnings/page.tsx,
 * which computes this directly in a server component. Same aggregates,
 * same PH-timezone week/month boundaries.
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
    include: {
      earnings: { orderBy: { date: "desc" }, take: 50 },
    },
  });
  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }

  const now = new Date();
  const weekStart = startOfWeekPh(now);
  const monthStart = startOfMonthPh(now);

  const weeklyNet = driver.earnings
    .filter((e) => new Date(e.date) >= weekStart)
    .reduce((s, e) => s + Number(e.amount), 0);

  const monthlyNet = driver.earnings
    .filter((e) => new Date(e.date) >= monthStart)
    .reduce((s, e) => s + Number(e.amount), 0);

  const totalGross = driver.earnings.reduce((s, e) => s + Number(e.amount) + Number(e.platformFee), 0);
  const totalPlatformFees = driver.earnings.reduce((s, e) => s + Number(e.platformFee), 0);

  const completedTrips = await prisma.booking.count({
    where: { driverId: driver.id, status: "COMPLETED" },
  });

  return NextResponse.json({
    totalEarnings: Number(driver.totalEarnings),
    weeklyNet,
    monthlyNet,
    totalGross,
    totalPlatformFees,
    completedTrips,
    history: driver.earnings.map((e) => ({
      id: e.id,
      amount: Number(e.amount),
      platformFee: Number(e.platformFee),
      date: e.date,
    })),
  });
}
