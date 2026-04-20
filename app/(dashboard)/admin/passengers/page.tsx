import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Users } from "lucide-react";
import { format } from "date-fns";

export default async function AdminPassengersPage() {
  const passengers = await prisma.passenger.findMany({
    include: {
      user: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Passengers</h2>
        <p className="text-muted-foreground">{passengers.length} registered passengers</p>
      </div>

      {passengers.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No passengers registered yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {passengers.map((passenger) => {
            const initials = passenger.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={passenger.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {passenger.user.profileImage && (
                        <AvatarImage src={passenger.user.profileImage} alt={passenger.user.name} />
                      )}
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{passenger.user.name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {passenger.user.email}
                        </span>
                        {passenger.user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {passenger.user.phone}
                          </span>
                        )}
                        <span>{passenger._count.bookings} trips</span>
                        <span>
                          Since {format(new Date(passenger.user.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
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
