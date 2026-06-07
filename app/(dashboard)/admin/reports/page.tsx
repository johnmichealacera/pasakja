import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Star, Car, Printer } from "lucide-react";
import { formatPh, startOfMonthPh, subMonthsPh } from "@/lib/datetime";
import Link from "next/link";
import { PLATFORM_COMMISSION_RATE } from "@/lib/commission";
import { RemittanceToggle } from "@/components/admin/remittance-toggle";

export default async function AdminReportsPage() {
  const now = new Date();
  const thisMonthStart = startOfMonthPh(now);
  const lastMonthStart = startOfMonthPh(subMonthsPh(now, 1));

  const commissionPct = Math.round(PLATFORM_COMMISSION_RATE * 100);
  const currentPeriod = formatPh(now, "yyyy-MM"); // e.g. "2025-06"

  const [
    thisMonthBookings,
    lastMonthBookings,
    thisMonthEarnings,
    lastMonthEarnings,
    thisMonthPlatformFees,
    lastMonthPlatformFees,
    allTimePlatformFees,
    topDrivers,
    avgRating,
    monthRemittances,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: thisMonthStart }, status: "COMPLETED" } }),
    prisma.booking.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart }, status: "COMPLETED" } }),
    // Driver net payouts this month
    prisma.earning.aggregate({ _sum: { amount: true }, where: { date: { gte: thisMonthStart } } }),
    prisma.earning.aggregate({ _sum: { amount: true }, where: { date: { gte: lastMonthStart, lt: thisMonthStart } } }),
    // Platform profit this month
    prisma.earning.aggregate({ _sum: { platformFee: true }, where: { date: { gte: thisMonthStart } } }),
    prisma.earning.aggregate({ _sum: { platformFee: true }, where: { date: { gte: lastMonthStart, lt: thisMonthStart } } }),
    // All-time platform profit
    prisma.earning.aggregate({ _sum: { platformFee: true } }),
    prisma.driver.findMany({
      where: { status: "VERIFIED" },
      include: {
        user: { select: { name: true } },
        _count: { select: { bookings: true } },
        ratings: true,
        earnings: { where: { date: { gte: thisMonthStart } } },
      },
      take: 10,
    }),
    prisma.rating.aggregate({ _avg: { score: true } }),
    // Remittance records for current month
    prisma.driverRemittance.findMany({
      where: { period: currentPeriod },
    }),
  ]);

  const thisMonthDriverNet   = Number(thisMonthEarnings._sum.amount ?? 0);
  const lastMonthDriverNet   = Number(lastMonthEarnings._sum.amount ?? 0);
  const thisMonthProfit      = Number(thisMonthPlatformFees._sum.platformFee ?? 0);
  const lastMonthProfit      = Number(lastMonthPlatformFees._sum.platformFee ?? 0);
  const allTimeProfit        = Number(allTimePlatformFees._sum.platformFee ?? 0);

  // Gross = driver net + platform fee
  const thisMonthGross = thisMonthDriverNet + thisMonthProfit;
  const lastMonthGross = lastMonthDriverNet + lastMonthProfit;

  const grossChange  = lastMonthGross  > 0 ? (((thisMonthGross  - lastMonthGross)  / lastMonthGross)  * 100).toFixed(1) : null;
  const profitChange = lastMonthProfit > 0 ? (((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100).toFixed(1) : null;
  const tripsChange  = lastMonthBookings > 0 ? (((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100).toFixed(1) : null;

  // Map driverId → remittance status for the current month
  const remittanceMap = new Map(
    monthRemittances.map((r) => [r.driverId, r])
  );

  const sortedDrivers = topDrivers
    .map((d) => ({
      ...d,
      monthlyGross:   d.earnings.reduce((s, e) => s + Number(e.amount) + Number(e.platformFee), 0),
      monthlyNet:     d.earnings.reduce((s, e) => s + Number(e.amount), 0),
      monthlyFees:    d.earnings.reduce((s, e) => s + Number(e.platformFee), 0),
      avgRating:      d.ratings.length > 0
        ? (d.ratings.reduce((s, r) => s + r.score, 0) / d.ratings.length).toFixed(1)
        : null,
      remittance:     remittanceMap.get(d.id) ?? null,
    }))
    .sort((a, b) => b._count.bookings - a._count.bookings);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          System performance for {formatPh(now, "MMMM yyyy")} · {commissionPct}% platform commission
        </p>
      </div>

      {/* Platform Profit highlight */}
      <Card className="border-green-300 bg-green-50/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Pasakja Platform Profit — This Month</p>
              <p className="text-4xl font-bold text-green-700">₱{thisMonthProfit.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                From ₱{thisMonthGross.toFixed(2)} gross fares · {commissionPct}% commission rate
              </p>
            </div>
            <div className="space-y-1 text-sm text-right">
              <p>
                <span className="text-muted-foreground">Last month: </span>
                <span className="font-medium">₱{lastMonthProfit.toFixed(2)}</span>
                {profitChange && (
                  <Badge
                    variant={Number(profitChange) >= 0 ? "default" : "destructive"}
                    className="ml-2 text-xs"
                  >
                    {Number(profitChange) >= 0 ? "+" : ""}{profitChange}%
                  </Badge>
                )}
              </p>
              <p>
                <span className="text-muted-foreground">All-time profit: </span>
                <span className="font-bold text-green-700">₱{allTimeProfit.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-500 text-base font-bold leading-none">₱</span>
              <p className="text-xs text-muted-foreground">Gross Revenue</p>
            </div>
            <p className="text-2xl font-bold">₱{thisMonthGross.toFixed(0)}</p>
            {grossChange !== null && (
              <Badge variant={Number(grossChange) >= 0 ? "default" : "destructive"} className="text-xs mt-1">
                {Number(grossChange) >= 0 ? "+" : ""}{grossChange}% vs last month
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Completed Trips</p>
            </div>
            <p className="text-2xl font-bold">{thisMonthBookings}</p>
            {tripsChange !== null && (
              <Badge variant={Number(tripsChange) >= 0 ? "default" : "destructive"} className="text-xs mt-1">
                {Number(tripsChange) >= 0 ? "+" : ""}{tripsChange}% vs last month
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">Driver Payouts</p>
            </div>
            <p className="text-2xl font-bold">₱{thisMonthDriverNet.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{100 - commissionPct}% of gross</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Avg Driver Rating</p>
            </div>
            <p className="text-2xl font-bold">
              {avgRating._avg.score ? Number(avgRating._avg.score).toFixed(1) : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Driver earnings breakdown — with print report link */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="h-4 w-4" /> Driver Earnings Breakdown — {formatPh(now, "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDrivers.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No driver data available</p>
          ) : (
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 pb-1 border-b">
                <span className="col-span-2">Driver</span>
                <span className="text-right">Gross Fare</span>
                <span className="text-right">Platform ({commissionPct}%)</span>
                <span className="text-right">Driver Net</span>
                <span className="text-center">Remittance</span>
              </div>

              {sortedDrivers.map((driver, index) => (
                <div key={driver.id} className="grid grid-cols-6 items-center p-3 rounded-lg border hover:bg-accent/20 transition-colors gap-x-2">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{driver.user.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{driver._count.bookings} trips</span>
                        {driver.avgRating && (
                          <span className="flex items-center gap-0.5 text-yellow-600">
                            <Star className="h-3 w-3 fill-current" /> {driver.avgRating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-right text-sm font-medium">₱{driver.monthlyGross.toFixed(2)}</p>
                  <p className="text-right text-sm text-destructive">−₱{driver.monthlyFees.toFixed(2)}</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <p className="text-sm font-semibold text-green-600">₱{driver.monthlyNet.toFixed(2)}</p>
                    <Link href={`/admin/reports/driver/${driver.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Print earnings report">
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                  {/* Remittance status for this month */}
                  <div className="flex justify-center">
                    {driver.monthlyFees > 0 ? (
                      <RemittanceToggle
                        driverId={driver.id}
                        period={currentPeriod}
                        amount={driver.monthlyFees}
                        currentStatus={driver.remittance?.status ?? null}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No fees</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Totals row */}
              <div className="grid grid-cols-6 items-center p-3 rounded-lg bg-muted/40 font-bold text-sm border-t mt-2">
                <div className="col-span-2 text-muted-foreground">
                  TOTAL ({sortedDrivers.length} drivers)
                </div>
                <p className="text-right">₱{sortedDrivers.reduce((s, d) => s + d.monthlyGross, 0).toFixed(2)}</p>
                <p className="text-right text-destructive">
                  −₱{sortedDrivers.reduce((s, d) => s + d.monthlyFees, 0).toFixed(2)}
                </p>
                <p className="text-right text-green-600">
                  ₱{sortedDrivers.reduce((s, d) => s + d.monthlyNet, 0).toFixed(2)}
                </p>
                <div className="flex justify-center">
                  <span className="text-xs text-muted-foreground">
                    {sortedDrivers.filter(d => d.remittance?.status === "PAID").length}/
                    {sortedDrivers.filter(d => d.monthlyFees > 0).length} paid
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
