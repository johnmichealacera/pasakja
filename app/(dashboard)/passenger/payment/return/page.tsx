"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "success" | "failed";

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const piId = searchParams.get("pi");

  useEffect(() => {
    if (!piId) {
      setStatus("failed");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    async function pollStatus() {
      try {
        const res = await fetch(`/api/paymongo/status?pi=${piId}`);
        const data = (await res.json()) as { paymentStatus?: string; piStatus?: string };

        if (data.paymentStatus === "PAID" || data.piStatus === "succeeded") {
          setStatus("success");
          return;
        }
        if (data.piStatus === "payment_failed") {
          setStatus("failed");
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setStatus("failed");
          return;
        }
        setTimeout(pollStatus, 2000);
      } catch {
        attempts++;
        if (attempts >= maxAttempts) {
          setStatus("failed");
          return;
        }
        setTimeout(pollStatus, 2000);
      }
    }

    pollStatus();
  }, [piId]);

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>
            {status === "loading" && "Verifying Payment..."}
            {status === "success" && "Payment Successful"}
            {status === "failed" && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Confirming your GCash payment. This may take a moment...
              </p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground text-center">
                Your GCash payment was received. Your ride has been booked and is waiting for a driver.
              </p>
              <Button className="w-full" onClick={() => router.push("/passenger/trips")}>
                View My Trips
              </Button>
            </>
          )}
          {status === "failed" && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-muted-foreground text-center">
                We could not confirm your payment. Please try booking again or contact support.
              </p>
              <Button className="w-full" onClick={() => router.push("/passenger/book")}>
                Try Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
