import { auth } from "@/auth";


import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  LayoutDashboard,
  List,
  DollarSign,
  User,
  Navigation,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/driver", icon: LayoutDashboard },
  { label: "Booking Requests", href: "/driver/bookings", icon: List },
  { label: "Navigation", href: "/driver/navigate", icon: Navigation },
  { label: "My Earnings", href: "/driver/earnings", icon: DollarSign },
  { label: "Profile", href: "/driver/profile", icon: User },
];

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if ((session.user as { role: string }).role !== "DRIVER") {
    const role = (session.user as { role: string }).role.toLowerCase();
    redirect(`/${role}`);
  }

  return (
    <DashboardLayout navItems={navItems} title="Driver Portal" role="driver">
      {children}
    </DashboardLayout>
  );
}
