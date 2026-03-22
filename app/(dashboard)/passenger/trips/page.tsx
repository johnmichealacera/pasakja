import { auth } from "@/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Clock, CheckCircle, XCircle, Star, PlusCircle, Car } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  PENDING: { label: "Pending", variant: "secondary" as const, icon: Clock },
  ACCEPTED: { label: "Accepted", variant: "default" as const, icon: CheckCircle },
  PICKED_UP: { label: "Picked Up", variant: "default" as const, icon: MapPin },
  IN_PROGRESS: { label: "In Progress", variant: "default" as const, icon: Car },
  COMPLETED: { label: "Completed", variant: "secondary" as const, icon: CheckCircle },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
};

export default async function TripsPage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const passenger = await prisma.passenger.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        include: {
          driver: { include: { user: true } },
          rating: true,
          trip: true,
        },
      },
    },
  });

  const bookings = passenger?.bookings ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Trips</h2>
          <p className="text-muted-foreground">{bookings.length} total trips</p>
        </div>
        <Link href="/passenger/book">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> Book Ride
          </Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">No trips yet</p>
            <p className="text-muted-foreground mb-4">Start by booking your first ride!</p>
            <Link href="/passenger/book">
              <Button>Book Your First Ride</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status];
            const isActive = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"].includes(booking.status);
            return (
              <Card key={booking.id} className={isActive ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                        <config.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={config.variant} className="text-xs">
                            {config.label}
                          </Badge>
                          {isActive && (
                            <Badge variant="outline" className="text-xs text-primary border-primary">
                              Live
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm truncate">{booking.pickupAddress}</p>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm truncate">{booking.dropoffAddress}</p>
                          </div>
                        </div>
                        {booking.driver && (
                          <div className="mt-2 flex items-center gap-2">
                            <Car className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {booking.driver.user.name} · {booking.driver.vehiclePlate}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {booking.fare && (
                        <p className="font-semibold text-sm">₱{Number(booking.fare).toFixed(2)}</p>
                      )}
                      {booking.rating ? (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-medium">{booking.rating.score}/5</span>
                        </div>
                      ) : booking.status === "COMPLETED" ? (
                        <Badge variant="outline" className="text-xs">Rate trip</Badge>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
