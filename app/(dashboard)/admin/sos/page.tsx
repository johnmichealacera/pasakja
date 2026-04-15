import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, MapPin, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { SosActions } from "./sos-actions";

export default async function AdminSosPage() {
  const alerts = await prisma.sosAlert.findMany({
    orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
    include: {
      passenger: {
        include: { user: { select: { name: true, phone: true, email: true } } },
      },
    },
  });

  const unresolvedCount = alerts.filter((a) => !a.isResolved).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">SOS Alerts</h2>
        <p className="text-muted-foreground">
          {unresolvedCount} unresolved · {alerts.length} total
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium mb-1">No SOS alerts</p>
            <p className="text-muted-foreground">All clear — no emergency alerts have been reported.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={alert.isResolved ? "opacity-70" : "border-destructive"}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.isResolved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    <CardTitle className="text-base">
                      {alert.isResolved ? "Resolved" : "Active Emergency"}
                    </CardTitle>
                    <Badge variant={alert.isResolved ? "secondary" : "destructive"}>
                      {alert.isResolved ? "Resolved" : "Unresolved"}
                    </Badge>
                  </div>
                  <SosActions alertId={alert.id} isResolved={alert.isResolved} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{alert.passenger.user.name}</span>
                    </div>
                    {alert.passenger.user.phone && (
                      <p className="text-sm text-muted-foreground ml-6">
                        Phone: {alert.passenger.user.phone}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground ml-6">
                      Email: {alert.passenger.user.email}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(alert.createdAt), "MMM d, yyyy h:mm:ss a")}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-destructive" />
                      <span>
                        {alert.lat.toFixed(6)}, {alert.lng.toFixed(6)}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline ml-6"
                    >
                      Open in Google Maps
                    </a>
                    {alert.message && (
                      <div className="text-sm bg-muted rounded-md p-2 mt-1">
                        <span className="font-medium">Message:</span> {alert.message}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
