import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Car,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

export default async function AdminDashboard() {
  const [
    totalBookings,
    completedBookings,
    pendingBookings,
    cancelledBookings,
    activeDrivers,
    totalPassengers,
    totalDrivers,
    pendingDrivers,
    revenueResult,
    recentBookings,
    sosAlerts,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.driver.count({ where: { isAvailable: true, status: "VERIFIED" } }),
    prisma.passenger.count(),
    prisma.driver.count({ where: { status: "VERIFIED" } }),
    prisma.driver.count({ where: { status: "PENDING" } }),
    prisma.earning.aggregate({ _sum: { amount: true } }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        passenger: { include: { user: { select: { name: true } } } },
        driver: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.sosAlert.count({ where: { isResolved: false } }),
  ]);

  const totalRevenue = Number(revenueResult._sum.amount ?? 0);

  const statusConfig = {
    PENDING: { label: "Pending", variant: "secondary" as const },
    ACCEPTED: { label: "Accepted", variant: "default" as const },
    PICKED_UP: { label: "Picked Up", variant: "default" as const },
    IN_PROGRESS: { label: "In Progress", variant: "default" as const },
    COMPLETED: { label: "Completed", variant: "secondary" as const },
    CANCELLED: { label: "Cancelled", variant: "destructive" as const },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      {/* Alerts */}
      {(sosAlerts > 0 || pendingDrivers > 0) && (
        <div className="space-y-2">
          {sosAlerts > 0 && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">{sosAlerts} unresolved SOS alert{sosAlerts > 1 ? "s" : ""}</span>
                </div>
                <Link href="/admin/sos">
                  <Button size="sm" variant="destructive">View Alerts</Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {pendingDrivers > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">{pendingDrivers} driver{pendingDrivers > 1 ? "s" : ""} awaiting verification</span>
                </div>
                <Link href="/admin/drivers">
                  <Button size="sm" variant="outline">Review</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₱{totalRevenue.toFixed(0)}</p>
              </div>
              <span className="h-8 w-8 inline-flex items-center justify-center text-green-500 opacity-70 text-2xl leading-none">
                ₱
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drivers Online</p>
                <p className="text-2xl font-bold">{activeDrivers}</p>
              </div>
              <Car className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passengers</p>
                <p className="text-2xl font-bold">{totalPassengers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-xl font-bold">{completedBookings}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xs text-muted-foreground">
                {totalBookings > 0
                  ? `${Math.round((completedBookings / totalBookings) * 100)}% completion rate`
                  : "No bookings yet"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-xl font-bold">{pendingBookings}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xs text-muted-foreground">Awaiting driver</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-xl font-bold">{cancelledBookings}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-xs text-muted-foreground">
                {totalBookings > 0
                  ? `${Math.round((cancelledBookings / totalBookings) * 100)}% cancellation rate`
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <p className="text-lg font-bold">{totalDrivers}</p>
              <p className="text-sm text-muted-foreground">Verified Drivers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-lg font-bold">{totalPassengers}</p>
              <p className="text-sm text-muted-foreground">Registered Passengers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2 font-medium">Passenger</th>
                    <th className="pb-2 font-medium hidden md:table-cell">Route</th>
                    <th className="pb-2 font-medium">Driver</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => {
                    const config = statusConfig[booking.status];
                    return (
                      <tr key={booking.id} className="border-b last:border-0 hover:bg-accent/20">
                        <td className="py-2.5 pr-4">{booking.passenger.user.name}</td>
                        <td className="py-2.5 pr-4 hidden md:table-cell max-w-xs">
                          <p className="truncate text-xs text-muted-foreground">
                            {booking.pickupAddress} → {booking.dropoffAddress}
                          </p>
                        </td>
                        <td className="py-2.5 pr-4">
                          {booking.driver?.user.name ?? (
                            <span className="text-muted-foreground text-xs">Unassigned</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant={config.variant} className="text-xs">
                            {config.label}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                          {format(new Date(booking.createdAt), "MMM d, h:mm a")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
