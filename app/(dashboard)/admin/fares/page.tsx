import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { AddZoneForm } from "@/components/admin/add-zone-form";
import { ZoneActions } from "@/components/admin/zone-actions";

export default async function AdminFaresPage() {
  const zones = await prisma.zone.findMany({
    include: { fares: true },
    orderBy: { createdAt: "desc" },
  });

  // The active zone used for fare calculation: most recently created active zone
  const activeZone = zones.find((z) => z.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Fare & Rates</h2>
        <p className="text-muted-foreground">
          Control which fare rate is used for all ride bookings
        </p>
      </div>

      {/* How it works */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">How Fare Calculation Works</p>
          <p className="text-sm text-blue-800">
            <strong>Total Fare = Base Fare + (Distance in km × Per-km Rate)</strong>
          </p>
          <p className="text-xs text-blue-700">
            Only the <strong>Active Rate</strong> is used when a passenger books a ride.
            All other rates are inactive and will not affect fare estimates.
            To change the rate in use, click <strong>"Set Active"</strong> on any rate below.
          </p>
        </CardContent>
      </Card>

      {/* No active zone warning */}
      {!activeZone && zones.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">No Active Fare Rate</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Passengers will not be able to get a fare estimate until you set one of the
                rates below as active.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Zone list */}
        <div className="space-y-3">
          <h3 className="font-semibold">Fare Rate Configurations</h3>
          {zones.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No fare rates configured yet</p>
              </CardContent>
            </Card>
          ) : (
            zones.map((zone) => {
              const isInUse = zone.isActive;
              return (
                <Card
                  key={zone.id}
                  className={isInUse ? "border-green-400 ring-1 ring-green-300" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{zone.name}</p>
                          {isInUse ? (
                            <Badge className="text-xs bg-green-600 hover:bg-green-600 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              In Use
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {zone.description && (
                          <p className="text-xs text-muted-foreground mt-1">{zone.description}</p>
                        )}
                        {zone.fares.length > 0 ? (
                          <div className="mt-2 space-y-0.5">
                            <p className="text-sm font-medium">
                              ₱{Number(zone.fares[0].baseFare).toFixed(2)} base fare
                              <span className="text-muted-foreground font-normal">
                                {" "}+ ₱{Number(zone.fares[0].perKmRate).toFixed(2)}/km
                              </span>
                            </p>
                            {isInUse && (
                              <p className="text-xs text-green-700">
                                Example: 3 km trip = ₱{(
                                  Number(zone.fares[0].baseFare) +
                                  3 * Number(zone.fares[0].perKmRate)
                                ).toFixed(2)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 mt-1">No fare rates set — edit to add rates</p>
                        )}
                      </div>
                      <ZoneActions
                        zone={{
                          ...zone,
                          fares: zone.fares.map((f) => ({
                            ...f,
                            baseFare: Number(f.baseFare),
                            perKmRate: Number(f.perKmRate),
                          })),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Add Zone Form */}
        <div>
          <h3 className="font-semibold mb-3">Add New Rate Configuration</h3>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-4">
                New rates are added as <strong>inactive</strong> by default. Click{" "}
                <strong>"Set Active"</strong> to start using a rate for bookings.
              </p>
              <AddZoneForm />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Worked example */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Step-by-Step Fare Calculation Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeZone && activeZone.fares.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Using the current active rate: <strong>{activeZone.name}</strong>
              </p>
              <div className="bg-background rounded-lg border p-3 text-sm space-y-1 font-mono">
                <p>Base Fare      = ₱{Number(activeZone.fares[0].baseFare).toFixed(2)}</p>
                <p>Per-km Rate    = ₱{Number(activeZone.fares[0].perKmRate).toFixed(2)}</p>
                <p className="text-muted-foreground">---</p>
                <p>2 km trip: ₱{Number(activeZone.fares[0].baseFare).toFixed(2)} + (2 × ₱{Number(activeZone.fares[0].perKmRate).toFixed(2)}) = <strong>₱{(Number(activeZone.fares[0].baseFare) + 2 * Number(activeZone.fares[0].perKmRate)).toFixed(2)}</strong></p>
                <p>5 km trip: ₱{Number(activeZone.fares[0].baseFare).toFixed(2)} + (5 × ₱{Number(activeZone.fares[0].perKmRate).toFixed(2)}) = <strong>₱{(Number(activeZone.fares[0].baseFare) + 5 * Number(activeZone.fares[0].perKmRate)).toFixed(2)}</strong></p>
                <p>10 km trip: ₱{Number(activeZone.fares[0].baseFare).toFixed(2)} + (10 × ₱{Number(activeZone.fares[0].perKmRate).toFixed(2)}) = <strong>₱{(Number(activeZone.fares[0].baseFare) + 10 * Number(activeZone.fares[0].perKmRate)).toFixed(2)}</strong></p>
                <p className="text-muted-foreground text-xs mt-1">Minimum fare is ₱15.00. Distance is measured by GPS route.</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              <strong>Formula:</strong> Total Fare = Base Fare + (Distance in km × Per-km Rate)
              <br />
              <span className="text-xs">Set an active rate above to see a live example.</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
