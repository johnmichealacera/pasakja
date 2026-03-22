import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, description, baseFare, perKmRate } = await req.json();

    if (!name || !baseFare || !perKmRate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const zone = await prisma.zone.create({
      data: { name, description },
    });

    await prisma.fare.create({
      data: { zoneId: zone.id, baseFare, perKmRate },
    });

    return NextResponse.json({ zone }, { status: 201 });
  } catch (error) {
    console.error("Zone POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
