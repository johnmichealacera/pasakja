"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { LiveTrackingMap } from "@/components/maps/live-tracking-map";

interface TripsClientProps {
  bookingId: string;
  status: string;
  hasRating: boolean;
  pickup: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

export function TripsClient({
  bookingId,
  status,
  hasRating,
  pickup,
  destination,
}: TripsClientProps) {
  const router = useRouter();
  const isActive = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"].includes(status);
  const canCancel = ["PENDING", "ACCEPTED"].includes(status);
  const canRate = status === "COMPLETED" && !hasRating;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [showRating, setShowRating] = useState(false);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        toast.success("Booking cancelled.");
        setConfirmCancel(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Failed to cancel booking");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCancelling(false);
    }
  }
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRate() {
    if (selectedStar === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: selectedStar, comment: comment || undefined }),
      });
      if (res.ok) {
        toast.success("Rating submitted!");
        setShowRating(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to submit rating");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {isActive && (
        <div className="mt-3 space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin className="h-3.5 w-3.5" />
            {showMap ? "Hide Tracking" : "Track Driver"}
          </Button>
          {showMap && (
            <LiveTrackingMap
              bookingId={bookingId}
              pickup={pickup}
              destination={destination}
            />
          )}
        </div>
      )}

      {canCancel && (
        <div className="mt-3">
          {confirmCancel ? (
            <div className="flex flex-col gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <p className="text-sm flex items-center gap-1.5 text-destructive font-medium">
                <AlertTriangle className="h-4 w-4" />
                Cancel this booking?
              </p>
              <p className="text-xs text-muted-foreground">
                {status === "ACCEPTED"
                  ? "The assigned driver will be notified."
                  : "Your booking request will be removed."}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling…" : "Yes, cancel"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelling}
                >
                  Keep booking
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmCancel(true)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Booking
            </Button>
          )}
        </div>
      )}

      {canRate && !showRating && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowRating(true)}
          >
            <Star className="h-3.5 w-3.5" />
            Rate this trip
          </Button>
        </div>
      )}

      {showRating && (
        <div className="mt-3 border rounded-lg p-4 space-y-3 bg-muted/30">
          <p className="text-sm font-medium">How was your trip?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-0.5"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setSelectedStar(star)}
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= (hoveredStar || selectedStar)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            {selectedStar > 0 && (
              <Badge variant="secondary" className="ml-2 self-center">
                {selectedStar}/5
              </Badge>
            )}
          </div>
          <textarea
            className="w-full text-sm border rounded-md p-2 bg-background resize-none"
            rows={2}
            placeholder="Optional comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleRate} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowRating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
