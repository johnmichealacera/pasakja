import { auth } from "@/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Banknote, CreditCard } from "lucide-react";
import { BookingActions } from "@/components/driver/booking-actions";
import Link from "next/link";
import { TripMap } from "@/components/maps/trip-map";

export default async function DriverBookingsPage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
  });

  if (!driver) return <div>Driver not found</div>;

  const [pendingBookings, myBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { status: "PENDING", driverId: null },
      include: { passenger: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Booking Requests</h2>
        <p className="text-muted-foreground">
          {pendingBookings.length} available · {myBookings.length} active
        </p>
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
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>
                          {booking.status === "ACCEPTED"
                            ? "Accepted"
                            : booking.status === "PICKED_UP"
                            ? "Picked Up"
                            : "In Progress"}
                        </Badge>
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
                    </div>
                    <BookingActions booking={booking} driverId={driver.id} />
                  </div>
                  <div className="mt-4 space-y-3">
                    <TripMap
                      heightClassName="h-[240px]"
                      pickup={{ lat: booking.pickupLat, lng: booking.pickupLng }}
                      destination={{
                        lat: booking.dropoffLat,
                        lng: booking.dropoffLng,
                      }}
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

      {/* Available Bookings */}
      <div>
        <h3 className="font-semibold mb-3">Available Requests</h3>
        {pendingBookings.length === 0 ? (
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
            {pendingBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-2">
                        {booking.passenger.user.name}
                      </p>
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
                    </div>
                    <BookingActions booking={booking} driverId={driver.id} isPending />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
