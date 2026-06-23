import {
  PLATFORM_COMMISSION_RATE,
  platformFee,
  passengerTotal,
  bookingFareParts,
  type FareField,
} from "@/lib/commission";
import { cn } from "@/lib/utils";

const commissionPct = Math.round(PLATFORM_COMMISSION_RATE * 100);

export function FareBreakdown({
  baseFare,
  className,
  compact = false,
  showDriverNote = false,
}: {
  baseFare: number;
  className?: string;
  compact?: boolean;
  showDriverNote?: boolean;
}) {
  if (baseFare <= 0) return null;

  const fee = platformFee(baseFare);
  const total = passengerTotal(baseFare);

  if (compact) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Trip ₱{baseFare.toFixed(2)} + platform fee ({commissionPct}%) ₱{fee.toFixed(2)} ={" "}
        <span className="font-medium text-foreground">₱{total.toFixed(2)}</span>
      </p>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-muted/30 px-3 py-2 text-xs space-y-1", className)}>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Trip fare</span>
        <span className="font-medium">₱{baseFare.toFixed(2)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Platform fee ({commissionPct}%)</span>
        <span className="font-medium">₱{fee.toFixed(2)}</span>
      </div>
      <div className="flex justify-between gap-4 border-t border-border/60 pt-1 font-semibold">
        <span>Total</span>
        <span>₱{total.toFixed(2)}</span>
      </div>
      {showDriverNote && (
        <p className="text-muted-foreground pt-0.5 border-t border-border/40">
          You earn the full trip fare (₱{baseFare.toFixed(2)}).
        </p>
      )}
    </div>
  );
}

export function BookingFareBreakdown({
  booking,
  className,
  compact = false,
  showDriverNote = false,
}: {
  booking: { fare?: FareField; quotedFare?: FareField };
  className?: string;
  compact?: boolean;
  showDriverNote?: boolean;
}) {
  const { baseFare } = bookingFareParts(booking);
  return (
    <FareBreakdown
      baseFare={baseFare}
      className={className}
      compact={compact}
      showDriverNote={showDriverNote}
    />
  );
}
