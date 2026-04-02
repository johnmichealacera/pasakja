import { auth } from "@/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone } from "lucide-react";
import { TripMap } from "@/components/maps/trip-map";

export default async function DriverNavigatePage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
  });

  const activeBooking = driver
    ? await prisma.booking.findFirst({
        where: {
          driverId: driver.id,
          status: { in: ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"] },
        },
        include: { passenger: { include: { user: true } } },
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Navigation</h2>
        <p className="text-muted-foreground">GPS guidance for your active trip</p>
      </div>

      {!activeBooking ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Navigation className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">No Active Trip</p>
            <p className="text-muted-foreground text-sm">
              Accept a booking to see navigation guidance here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Trip</CardTitle>
                <Badge>
                  {activeBooking.status === "ACCEPTED"
                    ? "Going to Pickup"
                    : activeBooking.status === "PICKED_UP"
                    ? "Heading to Destination"
                    : "In Progress"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{activeBooking.passenger.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeBooking.passenger.user.phone ?? "No phone number"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <MapPin className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup Location</p>
                    <p className="font-medium">{activeBooking.pickupAddress}</p>
                    <p className="text-xs text-muted-foreground">
                      Lat: {activeBooking.pickupLat.toFixed(4)}, Lng: {activeBooking.pickupLng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Drop-off Location</p>
                    <p className="font-medium">{activeBooking.dropoffAddress}</p>
                    <p className="text-xs text-muted-foreground">
                      Lat: {activeBooking.dropoffLat.toFixed(4)}, Lng: {activeBooking.dropoffLng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <TripMap
                pickup={{ lat: activeBooking.pickupLat, lng: activeBooking.pickupLng }}
                destination={{
                  lat: activeBooking.dropoffLat,
                  lng: activeBooking.dropoffLng,
                }}
                driverId={driver!.id}
                driverOnline={driver!.isAvailable}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
