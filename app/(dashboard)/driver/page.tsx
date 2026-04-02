import { auth } from "@/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Star,
  CheckCircle,
  Clock,
  List,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { DriverAvailabilityToggle } from "@/components/driver/availability-toggle";

export default async function DriverDashboard() {
  const session = await auth();
  const user = session!.user as { id: string; name: string };

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { passenger: { include: { user: true } } },
      },
      ratings: true,
      _count: { select: { bookings: true } },
    },
  });

  if (!driver) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">
          Your driver profile could not be loaded. Please contact support.
        </p>
      </div>
    );
  }

  const completedTrips = driver.bookings.filter((b) => b.status === "COMPLETED").length;
  const avgRating =
    driver.ratings.length > 0
      ? driver.ratings.reduce((sum, r) => sum + r.score, 0) / driver.ratings.length
      : 0;

  const pendingBookings = await prisma.booking.count({
    where: { status: "PENDING", driverId: null },
  });

  const statusVariantMap = {
    PENDING: "secondary",
    VERIFIED: "default",
    SUSPENDED: "destructive",
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hello, {user.name?.split(" ")[0]}! 👋</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusVariantMap[driver.status]}>
              {driver.status === "VERIFIED" ? "Verified Driver" : driver.status}
            </Badge>
            {driver.status === "PENDING" && (
              <span className="text-xs text-muted-foreground">
                Awaiting admin verification
              </span>
            )}
          </div>
        </div>
        {driver.status === "VERIFIED" && (
          <DriverAvailabilityToggle
            driverId={driver.id}
            initialAvailability={driver.isAvailable}
          />
        )}
      </div>

      {driver.status !== "VERIFIED" && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Account Pending Verification</p>
              <p className="text-xs text-muted-foreground">
                Your driver account is currently being reviewed by an administrator.
                You will be notified once verified.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <span className="mx-auto mb-1 inline-flex h-6 w-6 items-center justify-center text-green-500 text-xl leading-none">
              ₱
            </span>
            <p className="text-xl font-bold">₱{Number(driver.totalEarnings).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">{completedTrips}</p>
            <p className="text-xs text-muted-foreground">Trips Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-orange-500 mb-1" />
            <p className="text-xl font-bold">{pendingBookings}</p>
            <p className="text-xs text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Available bookings alert */}
      {pendingBookings > 0 && driver.status === "VERIFIED" && driver.isAvailable && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary animate-pulse" />
              <div>
                <p className="font-semibold text-sm">{pendingBookings} ride{pendingBookings > 1 ? "s" : ""} available nearby</p>
                <p className="text-xs text-muted-foreground">Accept a booking to start earning</p>
              </div>
            </div>
            <Link href="/driver/bookings">
              <Button size="sm" className="gap-2">
                <List className="h-4 w-4" /> View
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Vehicle</p>
              <p className="font-medium">{driver.vehicleModel}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Type</p>
              <p className="font-medium">{driver.vehicleType}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Plate Number</p>
              <p className="font-medium">{driver.vehiclePlate}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">License No.</p>
              <p className="font-medium">{driver.licenseNo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Trips</CardTitle>
            <Link href="/driver/bookings">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {driver.bookings.length === 0 ? (
            <div className="text-center py-6">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No trips yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {driver.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between p-3 rounded-lg border"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {booking.passenger.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.pickupAddress} → {booking.dropoffAddress}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs">
                      {booking.status}
                    </Badge>
                    {booking.fare && (
                      <span className="text-xs font-medium text-green-600">
                        ₱{Number(booking.fare).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
