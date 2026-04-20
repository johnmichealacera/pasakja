import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Car, Star } from "lucide-react";
import { DriverVerificationActions } from "@/components/admin/driver-verification-actions";
import { format } from "date-fns";

export default async function AdminDriversPage() {
  const drivers = await prisma.driver.findMany({
    include: {
      user: true,
      _count: { select: { bookings: true, ratings: true } },
      ratings: {
        include: { passenger: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusVariantMap = {
    PENDING: "secondary",
    VERIFIED: "default",
    SUSPENDED: "destructive",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Driver Management</h2>
        <p className="text-muted-foreground">{drivers.length} total drivers</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {["PENDING", "VERIFIED", "SUSPENDED"].map((status) => {
          const count = drivers.filter((d) => d.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{count}</p>
                <Badge variant={statusVariantMap[status as keyof typeof statusVariantMap]} className="mt-1">
                  {status}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Driver list */}
      <div className="space-y-3">
        {drivers.map((driver) => {
          const initials = driver.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <Card key={driver.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar>
                      {driver.user.profileImage && (
                        <AvatarImage src={driver.user.profileImage} alt={driver.user.name} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{driver.user.name}</p>
                        <Badge variant={statusVariantMap[driver.status]} className="text-xs">
                          {driver.status}
                        </Badge>
                        {driver.isAvailable && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            Online
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {driver.user.email}
                        </span>
                        {driver.user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {driver.user.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3" /> {driver.vehicleModel} ({driver.vehicleType})
                        </span>
                        <span>Plate: {driver.vehiclePlate}</span>
                        <span>{driver._count.bookings} trips</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registered: {format(new Date(driver.createdAt), "MMM d, yyyy")}
                      </p>
                      {driver.ratings.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {(driver.ratings.reduce((sum, r) => sum + r.score, 0) / driver.ratings.length).toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">
                              ({driver._count.ratings} {driver._count.ratings === 1 ? "rating" : "ratings"})
                            </span>
                          </div>
                          {driver.ratings.filter((r) => r.comment).map((r) => (
                            <div key={r.id} className="bg-muted/50 rounded-md px-2.5 py-1.5 text-xs">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="flex items-center gap-0.5">
                                  {Array.from({ length: r.score }).map((_, i) => (
                                    <Star key={i} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </span>
                                <span className="text-muted-foreground">{r.passenger.user.name}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground">{format(new Date(r.createdAt), "MMM d, yyyy")}</span>
                              </div>
                              <p className="italic text-muted-foreground">&ldquo;{r.comment}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DriverVerificationActions
                    driver={{ id: driver.id, status: driver.status }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {drivers.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Car className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No drivers registered yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
