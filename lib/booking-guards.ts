import type { BookingStatus, Prisma } from "@prisma/client";

/** Passenger cannot create a new booking while any of these exist. */
export const PASSENGER_OPEN_BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PICKED_UP",
  "IN_PROGRESS",
];

/** Driver cannot accept another booking while one of these is assigned to them. */
export const DRIVER_ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "ACCEPTED",
  "PICKED_UP",
  "IN_PROGRESS",
];

export function passengerOpenBookingWhere(passengerId: string): Prisma.BookingWhereInput {
  return {
    passengerId,
    status: { in: PASSENGER_OPEN_BOOKING_STATUSES },
  };
}

export function driverActiveBookingWhere(driverId: string): Prisma.BookingWhereInput {
  return {
    driverId,
    status: { in: DRIVER_ACTIVE_BOOKING_STATUSES },
  };
}

export const PASSENGER_HAS_OPEN_BOOKING_MESSAGE =
  "You already have an active ride. Finish or cancel it before booking another.";

export const DRIVER_HAS_ACTIVE_BOOKING_MESSAGE =
  "Complete your current trip before accepting another booking.";
