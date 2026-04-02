"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Car,
  Menu,
  LogOut,
  User,
  ChevronRight,
  LayoutDashboard,
  PlusCircle,
  History,
  AlertCircle,
  List,
  Navigation,
  BookOpen,
  Users,
  MapPin,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_NAV_ITEMS: Record<
  "passenger" | "driver" | "admin",
  { title: string; navItems: NavItem[] }
> = {
  passenger: {
    title: "Passenger Portal",
    navItems: [
      { label: "Dashboard", href: "/passenger", icon: LayoutDashboard },
      { label: "Book a Ride", href: "/passenger/book", icon: PlusCircle },
      { label: "My Trips", href: "/passenger/trips", icon: History },
      { label: "SOS Alert", href: "/passenger/sos", icon: AlertCircle },
      { label: "Profile", href: "/passenger/profile", icon: User },
    ],
  },
  driver: {
    title: "Driver Portal",
    navItems: [
      { label: "Dashboard", href: "/driver", icon: LayoutDashboard },
      { label: "Booking Requests", href: "/driver/bookings", icon: List },
      { label: "Navigation", href: "/driver/navigate", icon: Navigation },
      { label: "My Earnings", href: "/driver/earnings", icon: PesoIcon },
      { label: "Profile", href: "/driver/profile", icon: User },
    ],
  },
  admin: {
    title: "Admin Panel",
    navItems: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Bookings", href: "/admin/bookings", icon: BookOpen },
      { label: "Drivers", href: "/admin/drivers", icon: Car },
      { label: "Passengers", href: "/admin/passengers", icon: Users },
      { label: "Fare & Zones", href: "/admin/fares", icon: MapPin },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
};

function PesoIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center leading-none",
        className
      )}
    >
      ₱
    </span>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  role: "passenger" | "driver" | "admin";
}

const roleBadgeVariant = {
  passenger: "secondary",
  driver: "default",
  admin: "destructive",
} as const;

const roleLabel = {
  passenger: "Passenger",
  driver: "Driver",
  admin: "Administrator",
};

function NavContent({
  navItems,
  pathname,
  onClose,
}: {
  navItems: NavItem[];
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
            {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardLayout({
  children,
  title: titleProp,
  role,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { title, navItems } = ROLE_NAV_ITEMS[role];
  const displayTitle = titleProp ?? title;

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Car className="h-6 w-6" />
            <span className="font-bold text-lg">Pasakja</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">{displayTitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavContent navItems={navItems} pathname={pathname} />
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <Badge variant={roleBadgeVariant[role]} className="text-[10px] px-1.5 py-0">
                {roleLabel[role]}
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-64">
              <div className="p-4 border-b">
                <Link href="/" className="flex items-center gap-2 text-primary">
                  <Car className="h-6 w-6" />
                  <span className="font-bold text-lg">Pasakja</span>
                </Link>
              </div>
              <NavContent
                navItems={navItems}
                pathname={pathname}
                onClose={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <h1 className="font-semibold text-base md:text-lg hidden md:block">
            {navItems.find((item) => item.href === pathname)?.label ?? displayTitle}
          </h1>
          <h1 className="font-semibold text-base md:hidden">
            {navItems.find((item) => item.href === pathname)?.label ?? displayTitle}
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm">{session?.user?.name}</span>
              </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">
                    {session?.user?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/${role}/profile`}
                      className="cursor-pointer flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" /> Profile
                    </Link>
                  }
                />
                <Separator className="my-1" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
