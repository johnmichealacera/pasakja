import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { AddZoneForm } from "@/components/admin/add-zone-form";

export default async function AdminFaresPage() {
  const zones = await prisma.zone.findMany({
    include: { fares: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fare & Zones</h2>
          <p className="text-muted-foreground">Manage service zones and fare rates</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Zone list */}
        <div className="space-y-3">
          <h3 className="font-semibold">Service Zones</h3>
          {zones.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No zones configured yet</p>
              </CardContent>
            </Card>
          ) : (
            zones.map((zone) => (
              <Card key={zone.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{zone.name}</p>
                        <Badge variant={zone.isActive ? "default" : "secondary"} className="text-xs">
                          {zone.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {zone.description && (
                        <p className="text-xs text-muted-foreground mt-1">{zone.description}</p>
                      )}
                      {zone.fares.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="text-sm leading-none">₱</span>
                            Base fare: ₱{Number(zone.fares[0].baseFare).toFixed(2)} · ₱{Number(zone.fares[0].perKmRate).toFixed(2)}/km
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Zone Form */}
        <div>
          <h3 className="font-semibold mb-3">Add New Zone</h3>
          <AddZoneForm />
        </div>
      </div>

      {/* Default Fare Info */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Fare Calculation Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <strong>Total Fare = Base Fare + (Distance in km × Per Km Rate)</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The system automatically calculates fares based on zone rates and GPS distance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
