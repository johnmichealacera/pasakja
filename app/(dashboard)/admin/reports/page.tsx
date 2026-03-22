import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, DollarSign, TrendingUp, Users, Car, Star } from "lucide-react";
import { startOfMonth, subMonths, format } from "date-fns";

export default async function AdminReportsPage() {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const [
    thisMonthBookings,
    lastMonthBookings,
    thisMonthRevenue,
    lastMonthRevenue,
    topDrivers,
    avgRating,
  ] = await Promise.all([
    prisma.booking.count({
      where: { createdAt: { gte: thisMonthStart }, status: "COMPLETED" },
    }),
    prisma.booking.count({
      where: {
        createdAt: { gte: lastMonthStart, lt: thisMonthStart },
        status: "COMPLETED",
      },
    }),
    prisma.earning.aggregate({
      _sum: { amount: true },
      where: { date: { gte: thisMonthStart } },
    }),
    prisma.earning.aggregate({
      _sum: { amount: true },
      where: { date: { gte: lastMonthStart, lt: thisMonthStart } },
    }),
    prisma.driver.findMany({
      where: { status: "VERIFIED" },
      include: {
        user: { select: { name: true } },
        _count: { select: { bookings: true } },
        ratings: true,
        earnings: {
          where: { date: { gte: thisMonthStart } },
        },
      },
      take: 10,
    }),
    prisma.rating.aggregate({ _avg: { score: true } }),
  ]);

  const thisMonthRev = Number(thisMonthRevenue._sum.amount ?? 0);
  const lastMonthRev = Number(lastMonthRevenue._sum.amount ?? 0);
  const revenueChange = lastMonthRev > 0
    ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1)
    : null;

  const bookingsChange = lastMonthBookings > 0
    ? (((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100).toFixed(1)
    : null;

  const sortedDrivers = topDrivers
    .map((d) => ({
      ...d,
      monthlyEarnings: d.earnings.reduce((s, e) => s + Number(e.amount), 0),
      avgRating: d.ratings.length > 0
        ? (d.ratings.reduce((s, r) => s + r.score, 0) / d.ratings.length).toFixed(1)
        : null,
    }))
    .sort((a, b) => b._count.bookings - a._count.bookings);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-muted-foreground">System performance for {format(now, "MMMM yyyy")}</p>
      </div>

      {/* Monthly comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">This Month Revenue</p>
            </div>
            <p className="text-2xl font-bold">₱{thisMonthRev.toFixed(0)}</p>
            {revenueChange !== null && (
              <Badge
                variant={Number(revenueChange) >= 0 ? "default" : "destructive"}
                className="text-xs mt-1"
              >
                {Number(revenueChange) >= 0 ? "+" : ""}{revenueChange}% vs last month
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">This Month Trips</p>
            </div>
            <p className="text-2xl font-bold">{thisMonthBookings}</p>
            {bookingsChange !== null && (
              <Badge
                variant={Number(bookingsChange) >= 0 ? "default" : "destructive"}
                className="text-xs mt-1"
              >
                {Number(bookingsChange) >= 0 ? "+" : ""}{bookingsChange}% vs last month
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">Last Month Revenue</p>
            </div>
            <p className="text-2xl font-bold">₱{lastMonthRev.toFixed(0)}</p>
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

      {/* Top Drivers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="h-4 w-4" /> Top Performing Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDrivers.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              No driver data available
            </p>
          ) : (
            <div className="space-y-3">
              {sortedDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
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
                  <div className="text-right">
                    <p className="font-semibold text-sm text-green-600">
                      ₱{driver.monthlyEarnings.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">this month</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
