const PAYMONGO_BASE = "https://api.paymongo.com/v1";

function authHeader() {
  const secret = process.env.PAYMONGO_SECRET_KEY;
  if (!secret) throw new Error("PAYMONGO_SECRET_KEY is not set");
  return "Basic " + Buffer.from(secret + ":").toString("base64");
}

export async function paymongoRequest<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${PAYMONGO_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const json = await res.json();
  if (!res.ok) {
    const errMsg =
      json?.errors?.[0]?.detail ?? json?.errors?.[0]?.code ?? res.statusText;
    throw new Error(`PayMongo ${res.status}: ${errMsg}`);
  }
  return json as T;
}

export interface PaymongoPaymentIntent {
  data: {
    id: string;
    attributes: {
      amount: number;
      currency: string;
      status: string;
      client_key: string;
      payments: Array<{ id: string; attributes: { status: string } }>;
    };
  };
}

export async function createPaymentIntent(
  amountCentavos: number,
  metadata: Record<string, string>,
) {
  return paymongoRequest<PaymongoPaymentIntent>("/payment_intents", {
    method: "POST",
    body: {
      data: {
        attributes: {
          amount: amountCentavos,
          payment_method_allowed: ["gcash"],
          currency: "PHP",
          capture_type: "automatic",
          description: `Pasakja ride booking`,
          metadata,
        },
      },
    },
  });
}

export async function retrievePaymentIntent(id: string) {
  return paymongoRequest<PaymongoPaymentIntent>(`/payment_intents/${id}`);
}

/** Get the first succeeded payment ID from a payment intent. */
export async function getPaymentIdFromIntent(piId: string): Promise<string | null> {
  const pi = await retrievePaymentIntent(piId);
  const payments = pi.data.attributes.payments ?? [];
  const paid = payments.find((p) => p.attributes.status === "paid" || p.attributes.status === "chargeable");
  return paid?.id ?? null;
}

export interface PaymongoRefund {
  data: { id: string; attributes: { amount: number; status: string; reason: string } };
}

/**
 * Issue a refund via PayMongo.
 * @param paymentId  The pay_xxx ID (from the payment intent's payments array)
 * @param amountCentavos  Amount to refund in Philippine centavos (100 = ₱1)
 * @param reason  PayMongo reason: "others" | "duplicate" | "fraudulent"
 */
export async function issueRefund(
  paymentId: string,
  amountCentavos: number,
  reason: "others" | "duplicate" | "fraudulent" = "others",
): Promise<PaymongoRefund> {
  return paymongoRequest<PaymongoRefund>("/refunds", {
    method: "POST",
    body: {
      data: {
        attributes: {
          amount: amountCentavos,
          payment_id: paymentId,
          reason,
          notes: "Pasakja ride refund",
        },
      },
    },
  });
}
