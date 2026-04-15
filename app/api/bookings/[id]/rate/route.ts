import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Only passengers can rate" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const score = Number(body.score);

  if (!score || score < 1 || score > 5) {
    return NextResponse.json({ error: "Score must be 1–5" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      passenger: { select: { id: true, userId: true } },
      rating: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.passenger.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "COMPLETED") {
    return NextResponse.json({ error: "Can only rate completed trips" }, { status: 400 });
  }

  if (booking.rating) {
    return NextResponse.json({ error: "Already rated" }, { status: 409 });
  }

  if (!booking.driverId) {
    return NextResponse.json({ error: "No driver assigned" }, { status: 400 });
  }

  const rating = await prisma.rating.create({
    data: {
      bookingId: id,
      passengerId: booking.passenger.id,
      driverId: booking.driverId,
      score,
      comment: body.comment || null,
    },
  });

  return NextResponse.json(rating, { status: 201 });
}
