import { auth } from "@/auth";


import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  AlertCircle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/passenger", icon: LayoutDashboard },
  { label: "Book a Ride", href: "/passenger/book", icon: PlusCircle },
  { label: "My Trips", href: "/passenger/trips", icon: History },
  { label: "SOS Alert", href: "/passenger/sos", icon: AlertCircle },
  { label: "Profile", href: "/passenger/profile", icon: User },
];

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

  return (
    <DashboardLayout navItems={navItems} title="Passenger Portal" role="passenger">
      {children}
    </DashboardLayout>
  );
}
