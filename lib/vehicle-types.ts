/** The three allowed vehicle types in the Pasakja system. */
export const VEHICLE_TYPES = ["Tricycle", "Habal-habal", "Bao-bao"] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

/** Emoji icon for each vehicle type for quick visual identification. */
export const VEHICLE_ICONS: Record<VehicleType, string> = {
  "Habal-habal":"🏍",
  "Tricycle":   "🛺",
  "Bao-bao":    "🛺",
};

export function vehicleLabel(type: string): string {
  const icon = VEHICLE_ICONS[type as VehicleType];
  return icon ? `${icon} ${type}` : type;
}
