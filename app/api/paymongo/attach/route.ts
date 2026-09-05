import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { paymongoRequest } from "@/lib/paymongo";

/** The mobile app's custom scheme (app.config.ts: `scheme: "pasakja"`) — the only non-web return_url allowed. */
const MOBILE_RETURN_URL_PREFIX = "pasakja://payment-return";

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
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paymentIntentId, clientKey, returnUrl: requestedReturnUrl } = (await req.json()) as {
      paymentIntentId: string;
      clientKey: string;
      returnUrl?: string;
    };

    if (!paymentIntentId || !clientKey) {
      return NextResponse.json(
        { error: "Missing paymentIntentId or clientKey" },
        { status: 400 },
      );
    }

    // PayMongo rejects a non-http(s) return_url outright, so the mobile app
    // can't hand its deep link straight through — it goes via this server's
    // own http(s) bridge route instead, which redirects on into the deep link.
    const origin = req.nextUrl.origin;
    const returnUrl = requestedReturnUrl?.startsWith(MOBILE_RETURN_URL_PREFIX)
      ? `${origin}/api/paymongo/mobile-bridge?pi=${paymentIntentId}`
      : `${origin}/passenger/payment/return?pi=${paymentIntentId}`;

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
