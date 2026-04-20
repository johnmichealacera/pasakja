import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { Mail, Phone, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export default async function PassengerProfilePage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      passenger: {
        include: {
          _count: { select: { bookings: true, ratings: true } },
        },
      },
    },
  });

  if (!userData) return <div>User not found</div>;

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
        <p className="text-muted-foreground">Your account information</p>
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
              <Badge variant="secondary">Passenger</Badge>
            </div>
          </div>

          <div className="space-y-4">
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
              <Calendar className="h-4 w-4 text-muted-foreground" />
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

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{userData.passenger?._count.bookings ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{userData.passenger?._count.ratings ?? 0}</p>
            <p className="text-sm text-muted-foreground">Ratings Given</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
