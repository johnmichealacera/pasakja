import { auth } from "@/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Banknote, CreditCard, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingActions } from "@/components/driver/booking-actions";
import { BookingsRefresher } from "@/components/driver/bookings-refresher";
import Link from "next/link";
import { TripMap } from "@/components/maps/trip-map";
import { PickupEtaChip } from "@/components/driver/pickup-eta-chip";

function bookingActionsPayload(booking: {
  id: string;
  status: string;
  fare: { toString(): string } | number | string | null;
  quotedFare: { toString(): string } | number | string | null;
}) {
  return {
    id: booking.id,
    status: booking.status,
    fare: booking.fare == null ? null : Number(booking.fare),
    quotedFare: booking.quotedFare == null ? null : Number(booking.quotedFare),
  };
}

/** Shared card component for both requested and open pending bookings. */
function PendingBookingCard({
  booking,
  driverId,
  isRequested,
}: {
  booking: {
    id: string;
    status: string;
    fare: { toString(): string } | number | string | null;
    quotedFare: { toString(): string } | number | string | null;
    pickupAddress: string;
    dropoffAddress: string;
    isShared: boolean;
    paymentMethod: string;
    notes: string | null;
    passenger: { user: { name: string; profileImage: string | null } };
  };
  driverId: string;
  isRequested: boolean;
}) {
  return (
    <Card className={isRequested
      ? "border-amber-400 ring-1 ring-amber-300 hover:shadow-md transition-shadow"
      : "hover:shadow-md transition-shadow"}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                {booking.passenger.user.profileImage && (
                  <AvatarImage src={booking.passenger.user.profileImage} alt={booking.passenger.user.name} />
                )}
                <AvatarFallback className="text-xs">
                  {booking.passenger.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-sm">{booking.passenger.user.name}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3 w-3 text-green-500 mt-0.5" />
                <p className="text-sm">{booking.pickupAddress}</p>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3 w-3 text-red-500 mt-0.5" />
                <p className="text-sm">{booking.dropoffAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {booking.isShared && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> Shared Ride
                </span>
              )}
              {booking.paymentMethod === "CASH" ? (
                <span className="flex items-center gap-1">
                  <Banknote className="h-3 w-3" /> Cash
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> GCash
                </span>
              )}
            </div>
            {booking.notes && (
              <div className="flex items-start gap-1.5 mt-2 text-xs bg-muted/50 rounded-md px-2.5 py-1.5">
                <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-muted-foreground">{booking.notes}</p>
              </div>
            )}
          </div>
          <BookingActions
            booking={bookingActionsPayload(booking)}
            driverId={driverId}
            isPending
            isRequested={isRequested}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DriverBookingsPage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
  });

  if (!driver) return <div>Driver not found</div>;

  const [pendingBookings, myBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: "PENDING",
        driverId: null,
        // Only show: open bookings (no specific driver requested)
        // OR bookings specifically requested for THIS driver.
        // Bookings requested for another driver are hidden until that driver rejects.
        OR: [
          { requestedDriverId: null },
          { requestedDriverId: driver.id },
        ],
      },
      include: { passenger: { include: { user: true } } },
      orderBy: [
        { createdAt: "desc" },
      ],
    }),
    prisma.booking.findMany({
      where: {
        driverId: driver.id,
        status: { in: ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"] },
      },
      include: { passenger: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Split pending into requested-for-me and open-to-all
  const requestedBookings = pendingBookings.filter(
    (b) => b.requestedDriverId === driver.id
  );
  const openBookings = pendingBookings.filter(
    (b) => b.requestedDriverId === null
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Booking Requests</h2>
          <p className="text-muted-foreground">
            {requestedBookings.length > 0 && `${requestedBookings.length} requested · `}
            {openBookings.length} available · {myBookings.length} active
          </p>
        </div>
        <BookingsRefresher />
      </div>

      {/* Active Bookings */}
      {myBookings.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
              {myBookings.length}
            </Badge>
            Active Trips
          </h3>
          <div className="space-y-3">
            {myBookings.map((booking) => (
              <Card key={booking.id} className="border-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge>
                          {booking.status === "ACCEPTED"
                            ? "Accepted"
                            : booking.status === "PICKED_UP"
                            ? "Picked Up"
                            : "In Progress"}
                        </Badge>
                        <PickupEtaChip
                          pickupLat={booking.pickupLat}
                          pickupLng={booking.pickupLng}
                          status={booking.status}
                        />
                        <Avatar className="h-6 w-6">
                          {booking.passenger.user.profileImage && (
                            <AvatarImage src={booking.passenger.user.profileImage} alt={booking.passenger.user.name} />
                          )}
                          <AvatarFallback className="text-xs">
                            {booking.passenger.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {booking.passenger.user.name}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3 w-3 text-green-500 mt-0.5" />
                          <p className="text-sm">{booking.pickupAddress}</p>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3 w-3 text-red-500 mt-0.5" />
                          <p className="text-sm">{booking.dropoffAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {booking.isShared && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> Shared
                          </span>
                        )}
                        {booking.paymentMethod === "CASH" ? (
                          <span className="flex items-center gap-1">
                            <Banknote className="h-3 w-3" /> Cash
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> GCash
                          </span>
                        )}
                        {booking.passenger.user.phone && (
                          <span>📞 {booking.passenger.user.phone}</span>
                        )}
                      </div>
                      {booking.notes && (
                        <div className="flex items-start gap-1.5 mt-2 text-xs bg-muted/50 rounded-md px-2.5 py-1.5">
                          <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                    <BookingActions
                      booking={bookingActionsPayload(booking)}
                      driverId={driver.id}
                    />
                  </div>
                  <div className="mt-4 space-y-3">
                    <TripMap
                      heightClassName="h-[240px]"
                      pickup={{ lat: booking.pickupLat, lng: booking.pickupLng }}
                      destination={{
                        lat: booking.dropoffLat,
                        lng: booking.dropoffLng,
                      }}
                      driverId={driver.id}
                      driverOnline={driver.isAvailable}
                      bookingId={booking.id}
                    />
                    <div className="flex justify-end">
                      <Link href="/driver/navigate">
                        <Button size="sm" variant="outline">
                          Open Full Navigation
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Requested specifically for this driver ── */}
      {requestedBookings.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-700">
            <span>⭐</span> Requested for You
            <span className="ml-1 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
              {requestedBookings.length}
            </span>
          </h3>
          <div className="space-y-3">
            {requestedBookings.map((booking) => (
              <PendingBookingCard
                key={booking.id}
                booking={booking}
                driverId={driver.id}
                isRequested
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Open bookings (available to all drivers) ── */}
      <div>
        <h3 className="font-semibold mb-3">Available Requests</h3>
        {openBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No booking requests at the moment.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Make sure you are set to online to receive requests.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {openBookings.map((booking) => (
              <PendingBookingCard
                key={booking.id}
                booking={booking}
                driverId={driver.id}
                isRequested={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
