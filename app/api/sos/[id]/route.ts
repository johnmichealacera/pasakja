import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";
import { notifyUser } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const alert = await prisma.sosAlert.findUnique({ where: { id } });
  if (!alert) {
    return NextResponse.json({ error: "SOS alert not found" }, { status: 404 });
  }

  const updated = await prisma.sosAlert.update({
    where: { id },
    data: { isResolved: body.isResolved ?? true },
  });

  if (updated.isResolved) {
    const passenger = await prisma.passenger.findUnique({
      where: { id: updated.passengerId },
      select: { userId: true },
    });
    if (passenger) {
      await notifyUser(
        passenger.userId,
        "SOS resolved",
        "An admin has marked your emergency alert as resolved.",
        { alertId: id, type: "sos_resolved" }
      );
    }
  }

  return NextResponse.json(updated);
}
