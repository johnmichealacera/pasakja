import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrievePaymentIntent } from "@/lib/paymongo";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const piId = req.nextUrl.searchParams.get("pi");
  if (!piId) {
    return NextResponse.json({ error: "Missing pi" }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: { paymongoPaymentIntentId: piId },
      select: { id: true, paymentStatus: true },
    });

    const pi = await retrievePaymentIntent(piId);
    const piStatus = pi.data.attributes.status;

    if (
      piStatus === "succeeded" &&
      booking &&
      booking.paymentStatus !== "PAID"
    ) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "PAID" },
      });
      return NextResponse.json({ paymentStatus: "PAID", piStatus });
    }

    return NextResponse.json({
      paymentStatus: booking?.paymentStatus ?? "UNPAID",
      piStatus,
    });
  } catch (error) {
    console.error("PayMongo status error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 },
    );
  }
}
