import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const available = searchParams.get("available");

  try {
    const drivers = await prisma.driver.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(available === "true" ? { isAvailable: true } : {}),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { bookings: true, ratings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("Drivers GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
