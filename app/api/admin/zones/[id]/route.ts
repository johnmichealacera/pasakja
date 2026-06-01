import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" ? session : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { name, description, isActive, baseFare, perKmRate } = await req.json();

    if (!name || baseFare === undefined || perKmRate === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const zone = await prisma.zone.update({
      where: { id },
      data: { name, description: description ?? null, isActive: isActive ?? true },
      include: { fares: true },
    });

    if (zone.fares.length > 0) {
      await prisma.fare.update({
        where: { id: zone.fares[0].id },
        data: { baseFare: parseFloat(baseFare), perKmRate: parseFloat(perKmRate) },
      });
    } else {
      await prisma.fare.create({
        data: { zoneId: id, baseFare: parseFloat(baseFare), perKmRate: parseFloat(perKmRate) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Zone PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.fare.deleteMany({ where: { zoneId: id } });
    await prisma.zone.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Zone DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
