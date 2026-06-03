import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, CheckCircle, Info } from "lucide-react";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { PLATFORM_COMMISSION_RATE } from "@/lib/commission";

export default async function DriverEarningsPage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
    include: {
      earnings: { orderBy: { date: "desc" }, take: 50 },
      _count: { select: { bookings: true } },
    },
  });

  if (!driver) return <div>Driver not found</div>;

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const weeklyNet = driver.earnings
    .filter((e) => new Date(e.date) >= weekStart)
    .reduce((s, e) => s + Number(e.amount), 0);

  const monthlyNet = driver.earnings
    .filter((e) => new Date(e.date) >= monthStart)
    .reduce((s, e) => s + Number(e.amount), 0);

  const totalGross = driver.earnings.reduce(
    (s, e) => s + Number(e.amount) + Number(e.platformFee), 0
  );
  const totalPlatformFees = driver.earnings.reduce(
    (s, e) => s + Number(e.platformFee), 0
  );

  const completedTrips = await prisma.booking.count({
    where: { driverId: driver.id, status: "COMPLETED" },
  });

  const commissionPct = Math.round(PLATFORM_COMMISSION_RATE * 100);
  const driverPct = 100 - commissionPct;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Earnings</h2>
        <p className="text-muted-foreground">Your income after platform commission</p>
      </div>

      {/* Commission info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800">
            Pasakja retains a <strong>{commissionPct}% platform fee</strong> from each fare.
            You receive <strong>{driverPct}%</strong> of the gross fare per completed trip.
          </p>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 text-xl font-bold">₱</div>
              <div>
                <p className="text-muted-foreground text-sm">Total Net Earnings</p>
                <p className="text-3xl font-bold">₱{Number(driver.totalEarnings).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  From ₱{totalGross.toFixed(2)} gross · ₱{totalPlatformFees.toFixed(2)} platform fees
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">₱{weeklyNet.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">This Week (Net)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-xl font-bold">₱{monthlyNet.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">This Month (Net)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-medium">{completedTrips} completed trips</p>
            <p className="text-sm text-muted-foreground">
              Average net per trip: ₱{completedTrips > 0
                ? (Number(driver.totalEarnings) / completedTrips).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Earnings history with per-trip breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {driver.earnings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No earnings yet.</p>
              <p className="text-xs text-muted-foreground">Complete trips to start earning.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {driver.earnings.map((earning) => {
                const gross = Number(earning.amount) + Number(earning.platformFee);
                const fee = Number(earning.platformFee);
                const net = Number(earning.amount);
                return (
                  <div key={earning.id} className="rounded-lg border p-3 hover:bg-accent/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">Trip Completed</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(earning.date), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      <p className="font-bold text-green-600 text-lg">+₱{net.toFixed(2)}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs bg-muted/40 rounded-md px-3 py-2">
                      <div>
                        <p className="text-muted-foreground">Gross Fare</p>
                        <p className="font-semibold">₱{gross.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Platform ({commissionPct}%)</p>
                        <p className="font-semibold text-destructive">−₱{fee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Your Earnings</p>
                        <p className="font-semibold text-green-600">₱{net.toFixed(2)}</p>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 mt-0.5">{driverPct}%</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
