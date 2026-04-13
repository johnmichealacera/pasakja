import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

function verifySignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) return true; // skip verification if no secret configured (dev convenience)

  const parts = signatureHeader.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const tePart = parts.find((p) => p.startsWith("te="));
  const liPart = parts.find((p) => p.startsWith("li="));

  const timestamp = tPart?.slice(2);
  if (!timestamp) return false;

  const sigToVerify = tePart?.slice(3) || liPart?.slice(3);
  if (!sigToVerify) return false;

  const payload = `${timestamp}.${rawBody}`;
  const computed = createHmac("sha256", secret).update(payload).digest("hex");

  return computed === sigToVerify;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paymongo-signature") ?? "";

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(rawBody) as {
      data: {
        id: string;
        attributes: {
          type: string;
          data: {
            id: string;
            attributes: {
              payment_intent_id?: string;
              status?: string;
              amount?: number;
            };
          };
        };
      };
    };

    const eventType = event.data.attributes.type;
    const paymentData = event.data.attributes.data;

    if (eventType === "payment.paid") {
      const piId = paymentData.attributes.payment_intent_id;
      if (!piId) {
        return NextResponse.json({ received: true });
      }

      const booking = await prisma.booking.findFirst({
        where: { paymongoPaymentIntentId: piId },
      });

      if (booking && booking.paymentStatus !== "PAID") {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: "PAID" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayMongo webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
