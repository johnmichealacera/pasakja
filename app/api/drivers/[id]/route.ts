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

  try {
    const body = await req.json();

    if (user.role === "ADMIN") {
      const driver = await prisma.driver.update({
        where: { id },
        data: {
          ...(body.status ? { status: body.status } : {}),
          ...(typeof body.isAvailable === "boolean" ? { isAvailable: body.isAvailable } : {}),
        },
        include: { user: true },
      });
      return NextResponse.json({ driver });
    }

    if (user.role === "DRIVER") {
      const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
      if (!driver || driver.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const updated = await prisma.driver.update({
        where: { id },
        data: {
          ...(typeof body.isAvailable === "boolean" ? { isAvailable: body.isAvailable } : {}),
          ...(body.currentLat !== undefined ? { currentLat: body.currentLat } : {}),
          ...(body.currentLng !== undefined ? { currentLng: body.currentLng } : {}),
        },
      });
      return NextResponse.json({ driver: updated });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Driver PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
