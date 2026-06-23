import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { prisma } from "@/lib/prisma";
import { PassengerLocationSharer } from "@/components/passenger/passenger-location-sharer";
import { DRIVER_ACTIVE_BOOKING_STATUSES } from "@/lib/booking-guards";

export default async function PassengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if ((session.user as { role: string }).role !== "PASSENGER") {
    const role = (session.user as { role: string }).role.toLowerCase();
    redirect(`/${role}`);
  }

  const user = session.user as { id: string };
  const [userData, activeBooking] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImage: true },
    }),
    prisma.booking.findFirst({
      where: {
        passenger: { userId: user.id },
        status: { in: DRIVER_ACTIVE_BOOKING_STATUSES },
      },
      select: { id: true },
    }),
  ]);

  return (
    <DashboardLayout role="passenger" profileImage={userData?.profileImage ?? null}>
      {activeBooking && <PassengerLocationSharer bookingId={activeBooking.id} />}
      {children}
    </DashboardLayout>
  );
}
