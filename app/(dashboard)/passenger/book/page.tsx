"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Banknote, Smartphone, Users, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { MapPicker, type MapPickerValue } from "@/components/maps/map-picker";

type PaymentMethod = "CASH" | "ONLINE";

interface FareEstimate {
  estimatedFare: number;
  centavos: number;
  distanceKm: number;
}

export default function BookRidePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isShared, setIsShared] = useState(false);
  const [form, setForm] = useState({ notes: "" });
  const [picked, setPicked] = useState<MapPickerValue>({
    pickup: null,
    destination: null,
  });
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const estimateAbort = useRef<AbortController | null>(null);

  const handleMapChange = useCallback((v: MapPickerValue) => {
    setPicked((prev) => {
      const samePickup =
        prev.pickup?.lat === v.pickup?.lat && prev.pickup?.lng === v.pickup?.lng;
      const sameDestination =
        prev.destination?.lat === v.destination?.lat &&
        prev.destination?.lng === v.destination?.lng;
      if (samePickup && sameDestination) return prev;
      return v;
    });
  }, []);

  useEffect(() => {
    if (!picked.pickup || !picked.destination) {
      setFareEstimate(null);
      return;
    }

    estimateAbort.current?.abort();
    const ctrl = new AbortController();
    estimateAbort.current = ctrl;
    setEstimateLoading(true);

    const { pickup, destination } = picked;
    const routeUrl = `/api/maps/route?fromLat=${pickup.lat}&fromLng=${pickup.lng}&toLat=${destination.lat}&toLng=${destination.lng}`;

    fetch(routeUrl, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((routeData: { distanceKm?: number }) => {
        const km = routeData.distanceKm ?? 0;
        if (km <= 0) {
          setFareEstimate(null);
          setEstimateLoading(false);
          return;
        }
        return fetch(`/api/fares/estimate?distanceKm=${km}`, {
          signal: ctrl.signal,
        })
          .then((r) => r.json())
          .then((est: { estimatedFare?: number; centavos?: number }) => {
            setFareEstimate({
              estimatedFare: est.estimatedFare ?? 0,
              centavos: est.centavos ?? 0,
              distanceKm: km,
            });
          });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          setFareEstimate(null);
        }
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setEstimateLoading(false);
      });

    return () => ctrl.abort();
  }, [picked.pickup?.lat, picked.pickup?.lng, picked.destination?.lat, picked.destination?.lng]);

  function handleNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, notes: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked.pickup || !picked.destination) {
      toast.error("Please set both pickup and destination on the map.");
      return;
    }
    setIsLoading(true);

    try {
      const [pickupGeoRes, destinationGeoRes] = await Promise.all([
        fetch(`/api/maps/reverse?lat=${picked.pickup.lat}&lng=${picked.pickup.lng}`),
        fetch(`/api/maps/reverse?lat=${picked.destination.lat}&lng=${picked.destination.lng}`),
      ]);

      const pickupGeoData = pickupGeoRes.ok
        ? ((await pickupGeoRes.json()) as { address?: string | null })
        : null;
      const destinationGeoData = destinationGeoRes.ok
        ? ((await destinationGeoRes.json()) as { address?: string | null })
        : null;

      const pickupAddress = pickupGeoData?.address?.trim() || "GPS Pickup";
      const dropoffAddress = destinationGeoData?.address?.trim() || "Selected Destination";

      if (paymentMethod === "ONLINE") {
        await handleGcashCheckout(pickupAddress, dropoffAddress);
      } else {
        await handleCashBooking(pickupAddress, dropoffAddress);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCashBooking(pickupAddress: string, dropoffAddress: string) {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: form.notes,
        paymentMethod: "CASH",
        isShared,
        pickupLat: picked.pickup!.lat,
        pickupLng: picked.pickup!.lng,
        pickupAddress,
        dropoffLat: picked.destination!.lat,
        dropoffLng: picked.destination!.lng,
        dropoffAddress,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to book ride");
      return;
    }
    toast.success("Ride booked! Looking for nearby drivers...");
    router.push("/passenger/trips");
  }

  async function handleGcashCheckout(pickupAddress: string, dropoffAddress: string) {
    if (!fareEstimate || fareEstimate.centavos < 2000) {
      toast.error("Could not calculate fare. Please try again.");
      return;
    }

    const checkoutRes = await fetch("/api/paymongo/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickupLat: picked.pickup!.lat,
        pickupLng: picked.pickup!.lng,
        pickupAddress,
        dropoffLat: picked.destination!.lat,
        dropoffLng: picked.destination!.lng,
        dropoffAddress,
        isShared,
        notes: form.notes,
        estimatedFare: fareEstimate.estimatedFare,
        centavos: fareEstimate.centavos,
      }),
    });

    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok) {
      toast.error(checkoutData.error ?? "Failed to create payment");
      return;
    }

    const { paymentIntentId, clientKey } = checkoutData as {
      paymentIntentId: string;
      clientKey: string;
    };

    toast.info("Redirecting to GCash...");

    const attachRes = await fetch("/api/paymongo/attach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId, clientKey }),
    });

    const attachData = await attachRes.json();
    if (!attachRes.ok || !attachData.redirectUrl) {
      toast.error("Failed to start GCash payment. Please try again.");
      return;
    }

    window.location.href = attachData.redirectUrl;
  }

  const canSubmit =
    picked.pickup &&
    picked.destination &&
    (paymentMethod === "CASH" || (fareEstimate && fareEstimate.centavos >= 2000));

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Book a Ride</h2>
        <p className="text-muted-foreground">Enter your trip details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trip Details</CardTitle>
            <CardDescription>Where are you going?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Select your route on the map
              </p>
              <p className="text-xs text-muted-foreground">
                Pickup is taken from GPS. Click the map to set your destination.
              </p>

              <MapPicker
                onChange={handleMapChange}
                heightClassName="h-[360px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-muted-foreground">
                Special Instructions (optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Any special notes for the driver..."
                value={form.notes}
                onChange={handleNotesChange}
                rows={2}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "CASH" as const, label: "Cash", icon: Banknote },
                { value: "ONLINE" as const, label: "GCash", icon: Smartphone },
              ]).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    paymentMethod === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                  {paymentMethod === value && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
            {paymentMethod === "ONLINE" && (
              <p className="text-xs text-muted-foreground mt-3">
                You will be redirected to GCash to complete payment before the ride is confirmed.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Shared Ride */}
        <Card>
          <CardContent className="p-4">
            <button
              type="button"
              onClick={() => setIsShared(!isShared)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                isShared
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Users className={cn("h-5 w-5", isShared ? "text-primary" : "text-muted-foreground")} />
                <div className="text-left">
                  <p className="text-sm font-medium">Shared Ride</p>
                  <p className="text-xs text-muted-foreground">
                    Share the ride with others going the same way
                  </p>
                </div>
              </div>
              {isShared && <Badge className="text-xs">Selected</Badge>}
            </button>
          </CardContent>
        </Card>

        {/* Fare estimate */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated Fare</span>
              {estimateLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : fareEstimate ? (
                <span className="font-semibold">
                  ₱{fareEstimate.estimatedFare.toFixed(2)}
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">Set pickup & destination</span>
              )}
            </div>
            {fareEstimate && (
              <p className="text-xs text-muted-foreground mt-1">
                ~{fareEstimate.distanceKm.toFixed(1)} km &middot;{" "}
                {paymentMethod === "ONLINE"
                  ? "Charged via GCash before ride"
                  : "Pay cash to driver after ride"}
              </p>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !canSubmit}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {paymentMethod === "ONLINE" ? "Processing..." : "Booking..."}
            </>
          ) : paymentMethod === "ONLINE" ? (
            "Pay with GCash & Book"
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </form>
    </div>
  );
}
