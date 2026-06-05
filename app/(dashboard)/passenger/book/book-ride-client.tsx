"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Banknote, Smartphone, Users, CheckCircle, Loader2, MapPin, Star, Navigation } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { MapPicker, type MapPickerValue, type DriverMarker } from "@/components/maps/map-picker";
import { type SocorroPlace } from "@/lib/socorro-places";
import { formatSocorroPlaceAddress } from "@/lib/trip-address";
import { DestinationSearch } from "@/components/passenger/destination-search";
import { vehicleLabel } from "@/lib/vehicle-types";

type PaymentMethod = "CASH" | "ONLINE";

interface FareEstimate {
  estimatedFare: number;
  centavos: number;
  distanceKm: number;
  zoneName?: string;
  baseFare?: number;
  perKmRate?: number;
}

export function BookRideClient() {
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
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const estimateAbort = useRef<AbortController | null>(null);

  // Selected destination from the quick-pick dropdown
  const [selectedPlace, setSelectedPlace] = useState<SocorroPlace | null>(null);

  // Nearby available drivers
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverMarker[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverMarker | null>(null);

  const handleMapChange = useCallback((v: MapPickerValue) => {
    setPicked((prev) => {
      const samePickup =
        prev.pickup?.lat === v.pickup?.lat && prev.pickup?.lng === v.pickup?.lng;
      const sameDestination =
        prev.destination?.lat === v.destination?.lat &&
        prev.destination?.lng === v.destination?.lng;
      const sameMeta =
        prev.pickupFromGps === v.pickupFromGps &&
        prev.destinationPlace?.name === v.destinationPlace?.name;
      if (samePickup && sameDestination && sameMeta) return prev;
      return v;
    });

    // Clear dropdown selection when the map destination no longer matches it.
    setSelectedPlace((place) => {
      if (!place || !v.destination) return place;
      const latMatch = Math.abs(place.lat - v.destination.lat) < 0.0001;
      const lngMatch = Math.abs(place.lng - v.destination.lng) < 0.0001;
      return latMatch && lngMatch ? place : null;
    });
  }, []);

  useEffect(() => {
    if (!picked.pickup || !picked.destination) {
      setFareEstimate(null);
      setEstimateError(null);
      return;
    }

    estimateAbort.current?.abort();
    const ctrl = new AbortController();
    estimateAbort.current = ctrl;
    setEstimateLoading(true);
    setEstimateError(null);

    const { pickup, destination } = picked;
    const routeUrl = `/api/maps/route?fromLat=${pickup.lat}&fromLng=${pickup.lng}&toLat=${destination.lat}&toLng=${destination.lng}`;

    fetch(routeUrl, { signal: ctrl.signal })
      .then(async (routeRes) => {
        const routeData = (await routeRes.json()) as {
          distanceKm?: number;
          error?: string;
        };
        if (ctrl.signal.aborted) return;

        if (!routeRes.ok) {
          setFareEstimate(null);
          setEstimateError(routeData.error ?? "Failed to fetch route");
          return;
        }

        const km = routeData.distanceKm ?? 0;
        if (km <= 0) {
          setFareEstimate(null);
          setEstimateError(
            "Unable to determine route distance. Try adjusting your pickup or destination."
          );
          return;
        }

        const fareRes = await fetch(`/api/fares/estimate?distanceKm=${km}`, {
          signal: ctrl.signal,
        });
        const est = (await fareRes.json()) as {
          estimatedFare?: number;
          centavos?: number;
          error?: string;
        };
        if (ctrl.signal.aborted) return;

        if (!fareRes.ok) {
          setFareEstimate(null);
          setEstimateError(est.error ?? "Could not estimate fare.");
          return;
        }

        setEstimateError(null);
        setFareEstimate({
          estimatedFare: est.estimatedFare ?? 0,
          centavos: est.centavos ?? 0,
          distanceKm: km,
          zoneName: (est as { zoneName?: string }).zoneName,
          baseFare: (est as { baseFare?: number }).baseFare,
          perKmRate: (est as { perKmRate?: number }).perKmRate,
        });
      })
      .catch((err: unknown) => {
        // Browsers sometimes throw TypeError instead of AbortError when the
        // signal fires mid-stream (e.g. while reading the response body).
        // Guard against both to prevent stale aborts showing the error banner.
        if (ctrl.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setFareEstimate(null);
        setEstimateError("Failed to fetch route");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setEstimateLoading(false);
      });

    return () => ctrl.abort();
  }, [picked.pickup?.lat, picked.pickup?.lng, picked.destination?.lat, picked.destination?.lng]);

  // Poll nearby available drivers every 15 s whenever a pickup is set
  useEffect(() => {
    if (!picked.pickup) {
      setNearbyDrivers([]);
      return;
    }
    let active = true;

    async function fetchDrivers() {
      if (!active || !picked.pickup) return;
      try {
        const res = await fetch(
          `/api/drivers/available?lat=${picked.pickup.lat}&lng=${picked.pickup.lng}`
        );
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          drivers: {
            driverId: string; name: string; vehicleType: string;
            vehicleModel: string; avgRating: number | null;
            lat: number; lng: number; etaMinutes: number | null; distanceKm: number | null;
          }[];
        };
        setNearbyDrivers(
          data.drivers.map((d) => ({
            driverId:    d.driverId,
            name:        d.name,
            vehicleType: d.vehicleType,
            lat:         d.lat,
            lng:         d.lng,
            etaMinutes:  d.etaMinutes,
          }))
        );
      } catch {
        // ignore — stale data is fine
      }
    }

    fetchDrivers();
    const interval = setInterval(fetchDrivers, 15_000);
    return () => { active = false; clearInterval(interval); };
  }, [picked.pickup?.lat, picked.pickup?.lng]);

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
      const destPlaceName = picked.destinationPlace?.name ?? selectedPlace?.name ?? null;

      const pickupParams = new URLSearchParams({
        lat: String(picked.pickup.lat),
        lng: String(picked.pickup.lng),
        role: "pickup",
      });
      if (picked.pickupFromGps) pickupParams.set("gps", "1");

      const [pickupGeoRes, destinationGeoRes] = await Promise.all([
        fetch(`/api/maps/reverse?${pickupParams}`),
        destPlaceName
          ? Promise.resolve<Response | null>(null)
          : fetch(
              `/api/maps/reverse?lat=${picked.destination.lat}&lng=${picked.destination.lng}&role=dropoff`,
            ),
      ]);

      const pickupGeoData = pickupGeoRes?.ok
        ? ((await pickupGeoRes.json()) as { address?: string | null })
        : null;

      const pickupAddress =
        pickupGeoData?.address?.trim() ||
        `Pickup location, Socorro, Surigao del Norte (${picked.pickup.lat.toFixed(4)}, ${picked.pickup.lng.toFixed(4)})`;

      let dropoffAddress: string;
      if (destPlaceName) {
        dropoffAddress = formatSocorroPlaceAddress({ name: destPlaceName });
      } else {
        const destData = destinationGeoRes?.ok
          ? ((await destinationGeoRes.json()) as { address?: string | null })
          : null;
        dropoffAddress =
          destData?.address?.trim() ||
          `Drop-off location, Socorro, Surigao del Norte (${picked.destination.lat.toFixed(4)}, ${picked.destination.lng.toFixed(4)})`;
      }

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
        quotedFare: fareEstimate?.estimatedFare ?? null,
        requestedDriverId: selectedDriver?.driverId ?? null,
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
    if (estimateError) {
      toast.error(estimateError);
      return;
    }
    if (!fareEstimate || fareEstimate.centavos < 1500) {
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
        requestedDriverId: selectedDriver?.driverId ?? null,
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
    (paymentMethod === "CASH" ||
      (!estimateError && fareEstimate && fareEstimate.centavos >= 1500));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Book a Ride</h2>
        <p className="text-muted-foreground">Enter your trip details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Two-column layout on desktop: map left, controls right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Map — takes 3/5 on desktop */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Trip Details</CardTitle>
              <CardDescription>Where are you going?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ── Destination searchable picker ── */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  Select Destination
                </label>
                <DestinationSearch
                  value={selectedPlace}
                  onSelect={setSelectedPlace}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Or click anywhere on the map below to set a custom destination.
                </p>
              </div>

              <MapPicker
                onChange={handleMapChange}
                heightClassName="h-[320px] lg:h-[440px]"
                destinationOverride={selectedPlace}
                driverMarkers={nearbyDrivers}
                onDriverSelect={(d) => {
                  setSelectedDriver((prev) =>
                    prev?.driverId === d.driverId ? null : d
                  );
                }}
              />

              {/* Nearby drivers list */}
              {nearbyDrivers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5" />
                    {nearbyDrivers.length} driver{nearbyDrivers.length !== 1 ? "s" : ""} nearby
                    {selectedDriver && (
                      <button
                        type="button"
                        onClick={() => setSelectedDriver(null)}
                        className="ml-auto text-muted-foreground hover:text-foreground text-xs normal-case tracking-normal"
                      >
                        Clear selection
                      </button>
                    )}
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {nearbyDrivers.map((d) => {
                      const isSelected = selectedDriver?.driverId === d.driverId;
                      return (
                        <button
                          key={d.driverId}
                          type="button"
                          onClick={() =>
                            setSelectedDriver((prev) =>
                              prev?.driverId === d.driverId ? null : d
                            )
                          }
                          className={cn(
                            "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors text-left",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-accent/40"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full animate-pulse",
                              isSelected ? "bg-primary" : "bg-amber-400"
                            )} />
                            <div>
                              <span className="font-medium">{d.name}</span>
                              <span className="text-muted-foreground ml-1.5 text-xs">{vehicleLabel(d.vehicleType)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {d.etaMinutes !== null && (
                              <Badge variant="secondary" className="text-xs">
                                ~{d.etaMinutes} min
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge className="text-xs">Selected</Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedDriver && (
                    <p className="text-xs text-primary font-medium">
                      ✓ Booking will be sent to {selectedDriver.name} first
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls — takes 2/5 on desktop */}
          <div className="lg:col-span-2 space-y-4">
            {/* Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="notes"
                  placeholder="Any special notes for the driver..."
                  value={form.notes}
                  onChange={handleNotesChange}
                  rows={2}
                  disabled={isLoading}
                />
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
                  ) : estimateError ? (
                    <span className="text-muted-foreground text-xs">—</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Set pickup & destination</span>
                  )}
                </div>
                {estimateError && (
                  <p className="text-sm text-destructive mt-2" role="alert">
                    {estimateError}
                  </p>
                )}
                {fareEstimate && !estimateError && (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      ~{fareEstimate.distanceKm.toFixed(1)} km &middot;{" "}
                      {paymentMethod === "ONLINE"
                        ? "Charged via GCash before ride"
                        : "Pay cash to driver after ride"}
                    </p>
                    {fareEstimate.zoneName && (
                      <p className="text-xs text-muted-foreground">
                        Rate: <span className="font-medium text-foreground">{fareEstimate.zoneName}</span>
                        {fareEstimate.baseFare !== undefined && fareEstimate.perKmRate !== undefined && (
                          <> &middot; ₱{fareEstimate.baseFare} base + ₱{fareEstimate.perKmRate}/km</>
                        )}
                      </p>
                    )}
                  </div>
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
          </div>
        </div>
      </form>
    </div>
  );
}
