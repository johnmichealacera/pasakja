import { auth } from "@/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Clock, CheckCircle, XCircle, PlusCircle, Star } from "lucide-react";

const statusConfig = {
  PENDING: { label: "Pending", variant: "secondary" as const, icon: Clock },
  ACCEPTED: { label: "Accepted", variant: "default" as const, icon: CheckCircle },
  PICKED_UP: { label: "Picked Up", variant: "default" as const, icon: MapPin },
  IN_PROGRESS: { label: "In Progress", variant: "default" as const, icon: MapPin },
  COMPLETED: { label: "Completed", variant: "secondary" as const, icon: CheckCircle },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
};

export default async function PassengerDashboard() {
  const session = await auth();
  const user = session!.user as { id: string; name: string };

  const passenger = await prisma.passenger.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { driver: { include: { user: true } }, rating: true },
      },
    },
  });

  const bookings = passenger?.bookings ?? [];
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const pendingCount = bookings.filter((b) =>
    ["PENDING", "ACCEPTED", "PICKED_UP", "IN_PROGRESS"].includes(b.status)
  ).length;

  const activeBooking = bookings.find((b) =>
    ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"].includes(b.status)
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold">Hello, {user.name?.split(" ")[0]}! 👋</h2>
        <p className="text-muted-foreground">Where are you heading today?</p>
      </div>

      {/* Active booking alert */}
      {activeBooking && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-sm">Active Ride</p>
                <p className="text-xs text-muted-foreground">
                  {activeBooking.pickupAddress} → {activeBooking.dropoffAddress}
                </p>
              </div>
            </div>
            <Badge>{statusConfig[activeBooking.status].label}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Trips</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Book Now CTA */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">Need a ride?</h3>
            <p className="text-muted-foreground text-sm">Book a trip with just a few taps.</p>
          </div>
          <Link href="/passenger/book">
            <Button className="gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" /> Book a Ride
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Trips */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Trips</CardTitle>
            <Link href="/passenger/trips">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No trips yet. Book your first ride!</p>
              <Link href="/passenger/book" className="mt-3 inline-block">
                <Button variant="outline" size="sm">Book Now</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const config = statusConfig[booking.status];
                return (
                  <div
                    key={booking.id}
                    className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <config.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{booking.pickupAddress}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          → {booking.dropoffAddress}
                        </p>
                        {booking.driver && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Driver: {booking.driver.user.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                      <Badge variant={config.variant} className="text-xs">
                        {config.label}
                      </Badge>
                      {booking.fare && (
                        <span className="text-xs font-medium">₱{Number(booking.fare).toFixed(2)}</span>
                      )}
                      {booking.rating && (
                        <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-current" />
                          {booking.rating.score}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
