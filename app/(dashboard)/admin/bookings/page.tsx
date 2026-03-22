import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Banknote, CreditCard } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  PENDING: { label: "Pending", variant: "secondary" as const },
  ACCEPTED: { label: "Accepted", variant: "default" as const },
  PICKED_UP: { label: "Picked Up", variant: "default" as const },
  IN_PROGRESS: { label: "In Progress", variant: "default" as const },
  COMPLETED: { label: "Completed", variant: "secondary" as const },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const },
};

const bookingInclude = {
  passenger: { include: { user: { select: { name: true } } } },
  driver: { include: { user: { select: { name: true } } } },
} as const;

type AdminBookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

export default async function AdminBookingsPage() {
  const bookings: AdminBookingRow[] = await prisma.booking.findMany({
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">All Bookings</h2>
        <p className="text-muted-foreground">{bookings.length} total bookings</p>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No bookings yet</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking: AdminBookingRow) => {
            const config = statusConfig[booking.status];
            return (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={config.variant} className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-sm font-medium">
                          {booking.passenger.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="text-sm text-muted-foreground">
                          {booking.driver?.user.name ?? "Unassigned"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3 w-3 text-green-500 mt-0.5" />
                          <p className="text-xs text-muted-foreground">{booking.pickupAddress}</p>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3 w-3 text-red-500 mt-0.5" />
                          <p className="text-xs text-muted-foreground">{booking.dropoffAddress}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {booking.fare ? (
                        <p className="font-semibold text-sm">₱{Number(booking.fare).toFixed(2)}</p>
                      ) : null}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {booking.paymentMethod === "CASH" ? (
                          <><Banknote className="h-3 w-3" /> Cash</>
                        ) : (
                          <><CreditCard className="h-3 w-3" /> Online</>
                        )}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
