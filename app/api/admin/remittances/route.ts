import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" ? session : null;
}

/**
 * POST /api/admin/remittances
 * Body: { driverId, period, amount, status }
 *
 * Upserts a remittance record for a driver for a given period.
 * period format: "YYYY-MM"
 * status: "PENDING" | "PAID"
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { driverId, period, amount, status } = body as {
    driverId?: string;
    period?: string;
    amount?: number;
    status?: "PENDING" | "PAID";
  };

  if (!driverId || !period || amount === undefined || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["PENDING", "PAID"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const settledAt = status === "PAID" ? new Date() : null;

  const remittance = await prisma.driverRemittance.upsert({
    where: { driverId_period: { driverId, period } },
    update: { amount, status, settledAt, notes: body.notes ?? undefined },
    create: { driverId, period, amount, status, settledAt, notes: body.notes ?? undefined },
  });

  return NextResponse.json({ remittance });
}
