import { auth } from "@/auth";


import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  LayoutDashboard,
  Users,
  Car,
  BookOpen,
  MapPin,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: BookOpen },
  { label: "Drivers", href: "/admin/drivers", icon: Car },
  { label: "Passengers", href: "/admin/passengers", icon: Users },
  { label: "Fare & Zones", href: "/admin/fares", icon: MapPin },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if ((session.user as { role: string }).role !== "ADMIN") {
    const role = (session.user as { role: string }).role.toLowerCase();
    redirect(`/${role}`);
  }

  return (
    <DashboardLayout navItems={navItems} title="Admin Panel" role="admin">
      {children}
    </DashboardLayout>
  );
}
