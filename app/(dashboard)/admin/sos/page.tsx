import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, MapPin, Clock, User, ShieldAlert } from "lucide-react";
import { formatPh } from "@/lib/datetime";
import { SosActions } from "./sos-actions";
import { DisputeActions } from "@/components/admin/dispute-actions";

export default async function AdminSosPage() {
  const [alerts, disputes] = await Promise.all([
    prisma.sosAlert.findMany({
      orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
      include: {
        passenger: {
          include: { user: { select: { name: true, phone: true, email: true } } },
        },
      },
    }),
    prisma.booking.findMany({
      where: { disputeStatus: { in: ["REQUESTED", "REFUNDED", "DENIED"] } },
      orderBy: [{ disputeAt: "desc" }],
      include: {
        passenger: { include: { user: { select: { name: true, phone: true } } } },
        driver: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  const unresolvedCount = alerts.filter((a) => !a.isResolved).length;
  const pendingDisputes = disputes.filter((d) => d.disputeStatus === "REQUESTED").length;

  return (
    <div className="space-y-8">
      {/* ── Payment Disputes ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <h2 className="text-2xl font-bold">Payment Disputes</h2>
          {pendingDisputes > 0 && (
            <Badge variant="destructive" className="ml-1">{pendingDisputes} pending</Badge>
          )}
        </div>
        <p className="text-muted-foreground mb-4">
          GCash trip refund requests from passengers. Review and approve or deny.
        </p>

        {disputes.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-3" />
              <p className="text-muted-foreground">No payment disputes.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {disputes.map((d) => (
              <Card
                key={d.id}
                className={d.disputeStatus === "REQUESTED" ? "border-amber-400" : "opacity-70"}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            d.disputeStatus === "REQUESTED" ? "destructive" :
                            d.disputeStatus === "REFUNDED" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {d.disputeStatus === "REQUESTED" && "⏳ Pending Review"}
                          {d.disputeStatus === "REFUNDED"  && "✓ Refunded"}
                          {d.disputeStatus === "DENIED"    && "✗ Denied"}
                        </Badge>
                        <span className="text-sm font-medium">{d.passenger.user.name}</span>
                        {d.driver && (
                          <span className="text-xs text-muted-foreground">
                            vs driver {d.driver.user.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Fare: <strong>₱{Number(d.fare ?? d.quotedFare ?? 0).toFixed(2)}</strong>
                        {" · "}
                        {d.pickupAddress} → {d.dropoffAddress}
                      </p>
                      {d.disputeReason && (
                        <div className="text-xs bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 text-amber-800 mt-1">
                          <span className="font-semibold">Reason: </span>{d.disputeReason}
                        </div>
                      )}
                      {d.disputeAt && (
                        <p className="text-xs text-muted-foreground">
                          Submitted: {formatPh(new Date(d.disputeAt), "MMM d, yyyy h:mm a")}
                        </p>
                      )}
                      {d.refundId && (
                        <p className="text-xs text-green-700">
                          Refund ID: <span className="font-mono">{d.refundId}</span>
                        </p>
                      )}
                    </div>
                    {d.disputeStatus === "REQUESTED" && (
                      <DisputeActions bookingId={d.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── SOS Alerts ── */}
      <div>
        <h2 className="text-2xl font-bold">SOS Alerts</h2>
        <p className="text-muted-foreground mb-4">
          {unresolvedCount} unresolved · {alerts.length} total
        </p>

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
                      <span>{formatPh(new Date(alert.createdAt), "MMM d, yyyy h:mm:ss a")}</span>
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
    </div>
  );
}
