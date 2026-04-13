import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { paymongoRequest } from "@/lib/paymongo";

interface AttachResponse {
  data: {
    id: string;
    attributes: {
      status: string;
      next_action?: {
        type: string;
        redirect?: { url: string; return_url: string };
      };
    };
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paymentIntentId, clientKey } = (await req.json()) as {
      paymentIntentId: string;
      clientKey: string;
    };

    if (!paymentIntentId || !clientKey) {
      return NextResponse.json(
        { error: "Missing paymentIntentId or clientKey" },
        { status: 400 },
      );
    }

    const origin = req.nextUrl.origin;
    const returnUrl = `${origin}/passenger/payment/return?pi=${paymentIntentId}`;

    const pmRes = await paymongoRequest<{ data: { id: string } }>(
      "/payment_methods",
      {
        method: "POST",
        body: {
          data: {
            attributes: {
              type: "gcash",
            },
          },
        },
      },
    );

    const attachRes = await paymongoRequest<AttachResponse>(
      `/payment_intents/${paymentIntentId}/attach`,
      {
        method: "POST",
        body: {
          data: {
            attributes: {
              payment_method: pmRes.data.id,
              client_key: clientKey,
              return_url: returnUrl,
            },
          },
        },
      },
    );

    const redirectUrl =
      attachRes.data.attributes.next_action?.redirect?.url ?? null;

    return NextResponse.json({
      status: attachRes.data.attributes.status,
      redirectUrl,
    });
  } catch (error) {
    console.error("PayMongo attach error:", error);
    return NextResponse.json(
      { error: "Failed to attach payment method" },
      { status: 500 },
    );
  }
}
