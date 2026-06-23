import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PASSENGER_DOC_TYPE_KEYS } from "@/lib/verification-doc-types";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const passenger = await prisma.passenger.findUnique({
    where: { userId: user.id },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });

  if (!passenger) {
    return NextResponse.json({ error: "Passenger profile not found" }, { status: 404 });
  }

  return NextResponse.json({ documents: passenger.documents });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, url, filename } = body as {
    type?: string;
    url?: string;
    filename?: string;
  };

  if (!type || !url || !filename) {
    return NextResponse.json({ error: "type, url, and filename are required" }, { status: 400 });
  }

  if (!PASSENGER_DOC_TYPE_KEYS.includes(type as (typeof PASSENGER_DOC_TYPE_KEYS)[number])) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  const passenger = await prisma.passenger.findUnique({ where: { userId: user.id } });
  if (!passenger) {
    return NextResponse.json({ error: "Passenger profile not found" }, { status: 404 });
  }

  const document = await prisma.passengerDocument.create({
    data: { passengerId: passenger.id, type, url, filename },
  });

  return NextResponse.json({ document }, { status: 201 });
}
