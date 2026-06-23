import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const passenger = await prisma.passenger.findUnique({ where: { userId: user.id } });
  if (!passenger) {
    return NextResponse.json({ error: "Passenger profile not found" }, { status: 404 });
  }

  const document = await prisma.passengerDocument.findUnique({ where: { id } });
  if (!document || document.passengerId !== passenger.id) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await prisma.passengerDocument.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
