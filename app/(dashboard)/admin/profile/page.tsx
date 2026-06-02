import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { Mail, Phone, Calendar, BookOpen, Car, Users } from "lucide-react";
import { format } from "date-fns";

export default async function AdminProfilePage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const [userData, totalBookings, totalDrivers, totalPassengers] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.booking.count(),
    prisma.driver.count({ where: { status: "VERIFIED" } }),
    prisma.passenger.count(),
  ]);

  if (!userData) return <div>User not found</div>;

  const initials = userData.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Your administrator account</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <ProfileImageUpload
              currentImage={userData.profileImage ?? null}
              initials={initials}
            />
            <div>
              <h3 className="text-xl font-semibold">{userData.name}</h3>
              <Badge variant="destructive">Administrator</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{userData.email}</p>
              </div>
            </div>
            {userData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{userData.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Admin Since</p>
                <p className="text-sm font-medium">
                  {format(new Date(userData.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{totalBookings}</p>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Car className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold">{totalDrivers}</p>
            <p className="text-xs text-muted-foreground">Verified Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{totalPassengers}</p>
            <p className="text-xs text-muted-foreground">Passengers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
