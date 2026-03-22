import type { UserRole, DriverStatus, BookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export type { UserRole, DriverStatus, BookingStatus, PaymentMethod, PaymentStatus };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface BookingWithDetails {
  id: string;
  passengerId: string;
  driverId: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  status: BookingStatus;
  fare: number | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  isShared: boolean;
  notes: string | null;
  createdAt: Date;
  passenger: {
    user: { name: string; phone: string | null };
  };
  driver: {
    user: { name: string };
    vehiclePlate: string;
    vehicleModel: string;
  } | null;
}

export interface DriverWithDetails {
  id: string;
  userId: string;
  licenseNo: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleModel: string;
  status: DriverStatus;
  isAvailable: boolean;
  currentLat: number | null;
  currentLng: number | null;
  totalEarnings: number;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  _count?: {
    bookings: number;
    ratings: number;
  };
}

export interface DashboardStats {
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  activeDrivers: number;
  pendingBookings: number;
}
