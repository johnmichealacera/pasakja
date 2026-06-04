"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, XCircle, AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { LiveTrackingMap } from "@/components/maps/live-tracking-map";

interface TripsClientProps {
  bookingId: string;
  status: string;
  hasRating: boolean;
  pickup: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  paymentMethod?: string;
  paymentStatus?: string;
  disputeStatus?: string;
  /** ISO string of updatedAt — used to compute dispute window */
  updatedAt?: string;
}

export function TripsClient({
  bookingId,
  status,
  hasRating,
  pickup,
  destination,
  paymentMethod,
  paymentStatus,
  disputeStatus,
  updatedAt,
}: TripsClientProps) {
  const router = useRouter();
  const isActive = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"].includes(status);
  const canCancel = ["PENDING", "ACCEPTED"].includes(status);
  const canRate = status === "COMPLETED" && !hasRating;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Dispute state
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Can dispute: completed GCash trip, not yet disputed, within 2-hour window
  const isWithinDisputeWindow = updatedAt
    ? Date.now() - new Date(updatedAt).getTime() < 2 * 60 * 60 * 1000
    : false;
  const canDispute =
    status === "COMPLETED" &&
    paymentMethod === "ONLINE" &&
    paymentStatus === "PAID" &&
    (disputeStatus === "NONE" || disputeStatus === undefined) &&
    isWithinDisputeWindow;

  async function handleDispute() {
    if (!disputeReason.trim()) {
      toast.error("Please describe what went wrong");
      return;
    }
    setSubmittingDispute(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason }),
      });
      if (res.ok) {
        toast.success("Dispute submitted. The admin will review your request.");
        setShowDispute(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Failed to submit dispute");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingDispute(false);
    }
  }

  // Poll driver ETA while the booking is ACCEPTED (driver en route to pickup)
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "ACCEPTED") {
      setEtaMinutes(null);
      return;
    }
    let active = true;

    async function pollEta() {
      if (!active) return;
      try {
        const res = await fetch(`/api/bookings/${bookingId}/driver-location`);
        if (!res.ok || !active) return;
        const data = (await res.json()) as { etaMinutes?: number | null };
        setEtaMinutes(data.etaMinutes ?? null);
      } catch { /* ignore */ }
    }

    pollEta();
    const interval = setInterval(pollEta, 10_000);
    return () => { active = false; clearInterval(interval); };
  }, [bookingId, status]);

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
          {/* ETA chip — only shown while driver is en route to pickup */}
          {status === "ACCEPTED" && (
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
              etaMinutes !== null
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-muted border-border text-muted-foreground"
            }`}>
              <Clock className="h-3.5 w-3.5" />
              {etaMinutes !== null
                ? `Driver is ~${etaMinutes} min away`
                : "Driver is on the way…"}
              {etaMinutes !== null && (
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                </span>
              )}
            </div>
          )}

          {status === "PICKED_UP" && (
            <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium bg-blue-50 border-blue-200 text-blue-800">
              <Clock className="h-3.5 w-3.5" />
              Driver has arrived — heading to destination
            </div>
          )}

          {status === "IN_PROGRESS" && (
            <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium bg-green-50 border-green-200 text-green-800">
              <Clock className="h-3.5 w-3.5" />
              Ride in progress
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
              </span>
            </div>
          )}

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

      {/* ── Dispute / Refund section (GCash completed trips) ── */}
      {canDispute && !showDispute && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={() => setShowDispute(true)}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Dispute / Request Refund
          </Button>
        </div>
      )}

      {canDispute && showDispute && (
        <div className="mt-3 border border-amber-200 rounded-lg p-4 space-y-3 bg-amber-50/50">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Request a Refund</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Submit a dispute if your driver did not complete the trip as booked.
                The admin will review your request and issue a refund if approved.
              </p>
            </div>
          </div>
          <textarea
            className="w-full text-sm border border-amber-200 rounded-md p-2 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
            rows={3}
            placeholder="Describe what went wrong (e.g. driver marked trip complete but never picked me up)..."
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleDispute}
              disabled={submittingDispute}
            >
              {submittingDispute ? "Submitting…" : "Submit Dispute"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDispute(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Show dispute status if already submitted */}
      {status === "COMPLETED" && paymentMethod === "ONLINE" && disputeStatus && disputeStatus !== "NONE" && (
        <div className={`mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium border ${
          disputeStatus === "REQUESTED" ? "bg-amber-50 border-amber-200 text-amber-800" :
          disputeStatus === "REFUNDED"  ? "bg-green-50 border-green-200 text-green-800" :
          "bg-muted border-border text-muted-foreground"
        }`}>
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          {disputeStatus === "REQUESTED" && "Dispute under review — the admin has been notified."}
          {disputeStatus === "REFUNDED"  && "Refund approved and issued to your GCash account."}
          {disputeStatus === "DENIED"    && "Dispute was reviewed and denied by the admin."}
        </div>
      )}
    </>
  );
}
