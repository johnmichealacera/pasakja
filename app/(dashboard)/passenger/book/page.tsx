"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, CreditCard, Banknote, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PaymentMethod = "CASH" | "ONLINE";

export default function BookRidePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isShared, setIsShared] = useState(false);
  const [form, setForm] = useState({
    pickupAddress: "",
    dropoffAddress: "",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pickupAddress.trim() || !form.dropoffAddress.trim()) {
      toast.error("Please enter both pickup and drop-off locations.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          isShared,
          pickupLat: 9.6234,
          pickupLng: 125.9685,
          dropoffLat: 9.6234,
          dropoffLng: 125.9685,
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
              <Label htmlFor="pickupAddress" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" /> Pickup Location
              </Label>
              <Input
                id="pickupAddress"
                name="pickupAddress"
                placeholder="e.g. Socorro Town Hall, Surigao del Norte"
                value={form.pickupAddress}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-l-2 border-dashed border-muted-foreground/30 h-4 absolute left-3.5" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoffAddress" className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-red-500" /> Drop-off Location
              </Label>
              <Input
                id="dropoffAddress"
                name="dropoffAddress"
                placeholder="e.g. Socorro Market, Surigao del Norte"
                value={form.dropoffAddress}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any special notes for the driver..."
                value={form.notes}
                onChange={handleChange}
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
