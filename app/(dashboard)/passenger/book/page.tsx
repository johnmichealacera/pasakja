import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { passengerOpenBookingWhere } from "@/lib/booking-guards";
import { BookRideClient } from "./book-ride-client";

const statusLabels: Record<string, string> = {
  PENDING: "Waiting for a driver",
  ACCEPTED: "Driver accepted — on the way",
  PICKED_UP: "Picked up",
  IN_PROGRESS: "Trip in progress",
};

export default async function BookRidePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { id: string };
  const passenger = await prisma.passenger.findUnique({
    where: { userId: user.id },
  });

  if (passenger) {
    const openBooking = await prisma.booking.findFirst({
      where: passengerOpenBookingWhere(passenger.id),
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, pickupAddress: true, dropoffAddress: true },
    });

    if (openBooking) {
      return (
        <div className="space-y-6 max-w-lg">
          <div>
            <h2 className="text-2xl font-bold">Book a Ride</h2>
            <p className="text-muted-foreground">You already have an active trip</p>
          </div>
          <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                {statusLabels[openBooking.status] ?? "Active booking"}
              </CardTitle>
              <CardDescription>
                Finish or cancel your current ride before booking another one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>{openBooking.pickupAddress}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>{openBooking.dropoffAddress}</span>
              </div>
              <Link href="/passenger/trips" className="block mt-2">
                <Button className="w-full">View my trips</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <BookRideClient />;
}
