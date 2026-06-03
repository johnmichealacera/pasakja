/**
 * Pasakja platform commission configuration.
 *
 * Change PLATFORM_COMMISSION_RATE to adjust the system's cut.
 * 0.15 = 15% goes to Pasakja, 85% goes to the driver.
 */
export const PLATFORM_COMMISSION_RATE = 0.15;

/** Driver's net payout for a given gross fare. */
export function driverAmount(grossFare: number): number {
  return Math.round(grossFare * (1 - PLATFORM_COMMISSION_RATE) * 100) / 100;
}

/** Platform fee (Pasakja's profit) for a given gross fare. */
export function platformFee(grossFare: number): number {
  return Math.round(grossFare * PLATFORM_COMMISSION_RATE * 100) / 100;
}
