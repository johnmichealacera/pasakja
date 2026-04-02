"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { MapPicker, type MapPickerValue } from "@/components/maps/map-picker";

type PaymentMethod = "CASH" | "ONLINE";

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
        fetch(
          `/api/maps/reverse?lat=${picked.pickup.lat}&lng=${picked.pickup.lng}`
        ),
        fetch(
          `/api/maps/reverse?lat=${picked.destination.lat}&lng=${picked.destination.lng}`
        ),
      ]);

      const pickupGeoData = pickupGeoRes.ok
        ? ((await pickupGeoRes.json()) as { address?: string | null })
        : null;
      const destinationGeoData = destinationGeoRes.ok
        ? ((await destinationGeoRes.json()) as { address?: string | null })
        : null;

      const pickupAddress =
        pickupGeoData?.address?.trim() || "GPS Pickup";
      const dropoffAddress =
        destinationGeoData?.address?.trim() || "Selected Destination";

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: form.notes,
          paymentMethod,
          isShared,
          pickupLat: picked.pickup.lat,
          pickupLng: picked.pickup.lng,
          pickupAddress,
          dropoffLat: picked.destination.lat,
          dropoffLng: picked.destination.lng,
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
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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
                { value: "CASH", label: "Cash", icon: Banknote },
                { value: "ONLINE", label: "Online", icon: CreditCard },
              ] as const).map(({ value, label, icon: Icon }) => (
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
              <span className="font-semibold">₱25 – ₱80</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Final fare will be calculated based on distance and zone rates.
            </p>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? "Booking..." : "Confirm Booking"}
        </Button>
      </form>
    </div>
  );
}
