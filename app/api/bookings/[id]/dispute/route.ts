import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentIdFromIntent, issueRefund } from "@/lib/paymongo";

const DISPUTE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2-hour window after completion

/**
 * POST /api/bookings/[id]/dispute
 * Passenger requests a refund for a completed GCash booking.
 * Body: { reason: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as { id: string; role: string };

  if (user.role !== "PASSENGER") {
    return NextResponse.json({ error: "Only passengers can dispute a booking" }, { status: 403 });
  }

  const { reason } = (await req.json()) as { reason?: string };
  if (!reason?.trim()) {
    return NextResponse.json({ error: "A reason is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { passenger: { select: { userId: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.passenger.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.paymentMethod !== "ONLINE" || booking.paymentStatus !== "PAID") {
    return NextResponse.json(
      { error: "Only paid GCash bookings can be disputed" },
      { status: 400 },
    );
  }
  if (booking.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Only completed trips can be disputed" },
      { status: 400 },
    );
  }
  if (booking.disputeStatus !== "NONE") {
    return NextResponse.json(
      { error: "A dispute has already been submitted for this booking" },
      { status: 409 },
    );
  }

  // Enforce the 2-hour dispute window from when the booking was last updated (completion time)
  const ageMs = Date.now() - new Date(booking.updatedAt).getTime();
  if (ageMs > DISPUTE_WINDOW_MS) {
    return NextResponse.json(
      { error: "The 2-hour dispute window for this trip has expired" },
      { status: 400 },
    );
  }

  await prisma.booking.update({
    where: { id },
    data: {
      disputeStatus: "REQUESTED",
      disputeReason: reason.trim(),
      disputeAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}

/**
 * PATCH /api/bookings/[id]/dispute
 * Admin approves or denies a refund request.
 * Body: { action: "approve" | "deny" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = (await req.json()) as { action?: "approve" | "deny" };

  if (!action || !["approve", "deny"].includes(action)) {
    return NextResponse.json({ error: "action must be 'approve' or 'deny'" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.disputeStatus !== "REQUESTED") {
    return NextResponse.json({ error: "No pending dispute for this booking" }, { status: 400 });
  }

  if (action === "deny") {
    await prisma.booking.update({
      where: { id },
      data: { disputeStatus: "DENIED" },
    });
    return NextResponse.json({ success: true, action: "denied" });
  }

  // Approve: issue PayMongo refund
  if (!booking.paymongoPaymentIntentId) {
    return NextResponse.json({ error: "No payment intent found" }, { status: 400 });
  }

  try {
    const payId = await getPaymentIdFromIntent(booking.paymongoPaymentIntentId);
    if (!payId) {
      return NextResponse.json({ error: "Could not find PayMongo payment to refund" }, { status: 400 });
    }

    const amountCentavos = Math.round(Number(booking.fare ?? booking.quotedFare ?? 0) * 100);
    if (amountCentavos <= 0) {
      return NextResponse.json({ error: "Invalid refund amount" }, { status: 400 });
    }

    const refund = await issueRefund(payId, amountCentavos, "fraudulent");

    await prisma.booking.update({
      where: { id },
      data: {
        disputeStatus: "REFUNDED",
        paymentStatus: "REFUNDED",
        refundId: refund.data.id,
      },
    });

    return NextResponse.json({ success: true, action: "refunded", refundId: refund.data.id });
  } catch (err) {
    console.error("Refund error:", err);
    return NextResponse.json({ error: "PayMongo refund failed. Try again or issue manually." }, { status: 500 });
  }
}
