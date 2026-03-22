import { auth } from "@/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { format, startOfWeek, startOfMonth } from "date-fns";

export default async function DriverEarningsPage() {
  const session = await auth();
  const user = session!.user as { id: string };

  const driver = await prisma.driver.findUnique({
    where: { userId: user.id },
    include: {
      earnings: {
        orderBy: { date: "desc" },
        take: 30,
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!driver) return <div>Driver not found</div>;

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const weeklyEarnings = driver.earnings
    .filter((e) => new Date(e.date) >= weekStart)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthlyEarnings = driver.earnings
    .filter((e) => new Date(e.date) >= monthStart)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const completedTrips = await prisma.booking.count({
    where: { driverId: driver.id, status: "COMPLETED" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Earnings</h2>
        <p className="text-muted-foreground">Track your income and trip statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Earnings</p>
                <p className="text-3xl font-bold">₱{Number(driver.totalEarnings).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">₱{weeklyEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-xl font-bold">₱{monthlyEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">{completedTrips} completed trips</p>
            <p className="text-sm text-muted-foreground">
              Average: ₱{completedTrips > 0 ? (Number(driver.totalEarnings) / completedTrips).toFixed(2) : "0.00"} per trip
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {driver.earnings.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No earnings yet.</p>
              <p className="text-xs text-muted-foreground">
                Complete trips to start earning.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {driver.earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Trip Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(earning.date), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    +₱{Number(earning.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
