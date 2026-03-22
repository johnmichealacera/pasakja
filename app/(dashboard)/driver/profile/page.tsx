import { auth } from "@/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Car, Star } from "lucide-react";
import { format } from "date-fns";

const statusVariantMap = {
  PENDING: "secondary",
  VERIFIED: "default",
  SUSPENDED: "destructive",
} as const;

export default async function DriverProfilePage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      driver: {
        include: {
          ratings: true,
          _count: { select: { bookings: true } },
        },
      },
    },
  });

  if (!userData?.driver) return <div>Driver profile not found</div>;

  const driver = userData.driver;
  const avgRating =
    driver.ratings.length > 0
      ? (driver.ratings.reduce((s, r) => s + r.score, 0) / driver.ratings.length).toFixed(1)
      : null;

  const initials = userData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Your driver account</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{userData.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusVariantMap[driver.status]}>
                  {driver.status === "VERIFIED" ? "Verified Driver" : driver.status}
                </Badge>
                {avgRating && (
                  <span className="text-xs flex items-center gap-1 text-yellow-600">
                    <Star className="h-3 w-3 fill-current" /> {avgRating}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{userData.email}</p>
              </div>
            </div>
            {userData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{userData.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">
                  {format(new Date(userData.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Vehicle Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Type</p>
              <p className="font-medium">{driver.vehicleType}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Model</p>
              <p className="font-medium">{driver.vehicleModel}</p>
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

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{driver._count.bookings}</p>
            <p className="text-xs text-muted-foreground">Total Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{driver.ratings.length}</p>
            <p className="text-xs text-muted-foreground">Ratings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{avgRating ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
