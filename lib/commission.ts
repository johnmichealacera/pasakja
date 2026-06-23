/**
 * Pasakja platform commission — added on top of the trip fare (passenger pays).
 * The driver receives the full base trip fare; the platform fee is not deducted.
 */
export const PLATFORM_COMMISSION_RATE = 0.15;

export function platformFee(baseFare: number): number {
  return Math.round(baseFare * PLATFORM_COMMISSION_RATE * 100) / 100;
}

export function passengerTotal(baseFare: number): number {
  return Math.round((baseFare + platformFee(baseFare)) * 100) / 100;
}

/** Driver receives the full base trip fare. */
export function driverAmount(baseFare: number): number {
  return Math.round(baseFare * 100) / 100;
}

export function baseFareFromPassengerTotal(total: number): number {
  return Math.round((total / (1 + PLATFORM_COMMISSION_RATE)) * 100) / 100;
}

export type FareField = number | string | { toString(): string } | null | undefined;

function toFareNumber(value: FareField): number {
  if (value == null) return 0;
  return Number(value);
}

export function resolveBaseFare(booking: {
  fare?: FareField;
  quotedFare?: FareField;
}): number {
  const quoted = toFareNumber(booking.quotedFare);
  const fare = toFareNumber(booking.fare);

  // Legacy: passenger gross was stored in both fare and quotedFare (fee deducted from driver).
  if (quoted > 0 && fare > 0 && Math.abs(quoted - fare) < 0.02) {
    return Math.round(quoted * (1 - PLATFORM_COMMISSION_RATE) * 100) / 100;
  }

  if (quoted > 0) return quoted;

  if (fare > 0) return baseFareFromPassengerTotal(fare);

  return 15;
}

export function bookingFareParts(booking: {
  fare?: FareField;
  quotedFare?: FareField;
}) {
  const baseFare = resolveBaseFare(booking);
  const fee = platformFee(baseFare);
  const fareNum = toFareNumber(booking.fare);
  const passengerTotalAmount = fareNum > 0 ? fareNum : passengerTotal(baseFare);

  return {
    baseFare,
    platformFee: fee,
    passengerTotal: passengerTotalAmount,
    driverEarnings: baseFare,
  };
}
