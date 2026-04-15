import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
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

  return NextResponse.json(updated);
}
