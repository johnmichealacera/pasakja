import { ALL_SOCORRO_PLACES, type SocorroPlace } from "@/lib/socorro-places";

const SOCORRO_SUFFIX = "Socorro, Surigao del Norte";

/** Max distance (m) to snap a coordinate to a known Socorro landmark name. */
export const LANDMARK_MATCH_METERS = 280;

export type TripAddressRole = "pickup" | "dropoff";

export type ResolveTripAddressOptions = {
  lat: number;
  lng: number;
  role: TripAddressRole;
  /** When set (dropdown or map landmark), use this name directly. */
  explicitPlaceName?: string | null;
  /** Pickup was set from device GPS — prefer human label over OSM road names. */
  fromGps?: boolean;
  /** Nominatim / reverse-geocode result when available. */
  nominatimAddress?: string | null;
  /** OSRM nearest road name when available. */
  roadName?: string | null;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Haversine distance in meters between two WGS84 points. */
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestSocorroPlace(
  lat: number,
  lng: number,
  maxMeters = LANDMARK_MATCH_METERS,
): (SocorroPlace & { barangay: string; distanceMeters: number }) | null {
  let best: (SocorroPlace & { barangay: string; distanceMeters: number }) | null =
    null;

  for (const place of ALL_SOCORRO_PLACES) {
    const d = distanceMeters(lat, lng, place.lat, place.lng);
    if (d <= maxMeters && (!best || d < best.distanceMeters)) {
      best = { ...place, distanceMeters: d };
    }
  }

  return best;
}

export function formatSocorroPlaceAddress(
  place: Pick<SocorroPlace, "name">,
): string {
  return `${place.name}, ${SOCORRO_SUFFIX}`;
}

function genericFallback(role: TripAddressRole, lat: number, lng: number): string {
  const label = role === "pickup" ? "Pickup location" : "Drop-off location";
  return `${label}, ${SOCORRO_SUFFIX} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

function gpsPickupLabel(
  landmark: (SocorroPlace & { barangay: string }) | null,
): string {
  if (landmark) {
    return `My location near ${landmark.name}, ${SOCORRO_SUFFIX}`;
  }
  return `My current location, ${SOCORRO_SUFFIX}`;
}

/** OSM road names that dominate reverse results in Socorro but are not useful labels. */
const VAGUE_ROAD_NAMES = new Set(
  ["navarro", "navarro street", "national highway", "highway", "unclassified"].map(
    (s) => s.toLowerCase(),
  ),
);

function isVagueRoadLabel(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (!n) return true;
  if (VAGUE_ROAD_NAMES.has(n)) return true;
  // Single-word road names in town proper are often misleading snap targets.
  if (n.split(/\s+/).length === 1 && n.length < 12) return true;
  return false;
}

function buildFromNominatim(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase().includes("socorro")) return trimmed;
  return `${trimmed}, ${SOCORRO_SUFFIX}`;
}

function buildFromRoadName(roadName: string): string | null {
  const trimmed = roadName.trim();
  if (!trimmed || isVagueRoadLabel(trimmed)) return null;
  return `${trimmed}, ${SOCORRO_SUFFIX}`;
}

/**
 * Resolve a human-readable trip address for bookings and trip history.
 * Priority: explicit place name → nearby landmark → GPS label → road name →
 * Nominatim → generic fallback with coordinates.
 */
export function resolveTripAddress(options: ResolveTripAddressOptions): string {
  const { lat, lng, role, explicitPlaceName, fromGps, nominatimAddress, roadName } =
    options;

  if (explicitPlaceName?.trim()) {
    return formatSocorroPlaceAddress({ name: explicitPlaceName.trim() });
  }

  const landmark = findNearestSocorroPlace(lat, lng);
  if (landmark) {
    return formatSocorroPlaceAddress(landmark);
  }

  if (fromGps && role === "pickup") {
    return gpsPickupLabel(null);
  }

  const fromRoad = roadName ? buildFromRoadName(roadName) : null;
  if (fromRoad) return fromRoad;

  const fromNominatim = nominatimAddress
    ? buildFromNominatim(nominatimAddress)
    : null;
  if (fromNominatim && !isVagueRoadLabel(fromNominatim.split(",")[0] ?? "")) {
    return fromNominatim;
  }

  return genericFallback(role, lat, lng);
}
