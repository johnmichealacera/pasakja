import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Shield,
  CreditCard,
  Star,
  Users,
  ChevronRight,
  Navigation,
  Map,
  Route,
  AlertTriangle,
} from "lucide-react";

const features = [
  {
    icon: Map,
    title: "Interactive Map Booking",
    description:
      "Book on a Leaflet map with GPS pickup, destination search, and road snapping—scoped to Socorro.",
  },
  {
    icon: Route,
    title: "OSRM Fare Estimates",
    description:
      "See your quoted fare before you confirm, calculated from route distance and admin zone rates.",
  },
  {
    icon: Navigation,
    title: "Live Driver Tracking",
    description:
      "Follow your driver on a live map from accept through drop-off with pickup ETA updates.",
  },
  {
    icon: Users,
    title: "Preferred-Driver Dispatch",
    description:
      "View nearby online drivers on the map and optionally send your request to one driver first.",
  },
  {
    icon: Shield,
    title: "Verified Drivers",
    description:
      "Tricycle, Habal-habal, and Bao-bao operators are admin-verified with document review before going online.",
  },
  {
    icon: CreditCard,
    title: "Cash & GCash",
    description:
      "Pay cash after the ride or use GCash online checkout via PayMongo (test mode for demos).",
  },
  {
    icon: AlertTriangle,
    title: "Emergency SOS",
    description:
      "One-tap SOS sends your GPS location to administrators anytime from the passenger dashboard.",
  },
  {
    icon: Star,
    title: "Ratings & Fair Rules",
    description:
      "Rate drivers after each trip. One active ride per passenger and per driver—like real-world dispatch.",
  },
];

const stats = [
  { value: "3", label: "Vehicle Types" },
  { value: "24/7", label: "Web Access" },
  { value: "Live", label: "GPS Tracking" },
  { value: "4.6★", label: "User Evaluation" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Car className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-primary">Pasakja</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="relative z-10 rounded-3xl border border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6 py-10">
              <Badge
                className="mb-4 text-sm border-primary/25 bg-background/40 text-primary/90 dark:bg-background/20"
                variant="outline"
              >
              Serving Socorro, Surigao del Norte
            </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
                Your Community{" "}
                <span className="text-primary">Ride Booking</span>{" "}
                Platform
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 dark:text-foreground/75 mb-8 max-w-2xl mx-auto">
                Book rides on an interactive map, track your driver live, and pay with
                cash or GCash—built for Socorro&apos;s tricycles, Habal-habal, and
                Bao-bao operators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    Book a Ride <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register?role=DRIVER">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto gap-2 border-primary/30 text-foreground/90 hover:bg-primary/10"
                  >
                    <Car className="h-4 w-4" /> Drive with Pasakja
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-primary-foreground/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A complete transportation platform with powerful features for passengers,
            drivers, and administrators.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Getting a ride is simple and quick.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Map & Book",
                description:
                  "Register, set pickup on the map, choose a destination, and review your OSRM-based fare estimate.",
              },
              {
                step: "2",
                title: "Driver Accepts",
                description:
                  "A verified online driver accepts—or you send the request to a preferred nearby driver first.",
              },
              {
                step: "3",
                title: "Track & Pay",
                description:
                  "Watch live driver GPS on your trip, pay cash or GCash, then rate your driver when done.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-primary rounded-2xl p-10 text-primary-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to Ride?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Replace street hail and text-based booking with a digital system built
            for our community—passengers, drivers, and admins on one platform.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Free Account <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">Pasakja</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              A Web-Based Community Transportation Booking & Dispatching System
              <br />
              Socorro, Surigao del Norte · IT Capstone Project
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-primary transition-colors">
                Register
              </Link>
              <a
                href="/defense-demo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Defense Demo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
