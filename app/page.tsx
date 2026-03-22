import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Car,
  Shield,
  Clock,
  CreditCard,
  Star,
  Users,
  ChevronRight,
  Navigation,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "GPS-Based Booking",
    description:
      "Book rides easily using real-time GPS location services from your browser.",
  },
  {
    icon: Navigation,
    title: "Real-Time Tracking",
    description:
      "Track your driver's location in real time for complete transparency and safety.",
  },
  {
    icon: CreditCard,
    title: "Auto Fare Calculation",
    description:
      "Fares are automatically calculated with support for cash and online payments.",
  },
  {
    icon: Shield,
    title: "Driver Verification",
    description:
      "All drivers go through a rigorous verification process before they can operate.",
  },
  {
    icon: Clock,
    title: "Quick Dispatching",
    description:
      "Our smart dispatching system connects you with the nearest available driver instantly.",
  },
  {
    icon: Star,
    title: "Trip Ratings",
    description:
      "Rate your driver after each trip to help maintain service quality standards.",
  },
];

const stats = [
  { value: "100+", label: "Active Drivers" },
  { value: "500+", label: "Happy Passengers" },
  { value: "1,000+", label: "Completed Trips" },
  { value: "4.8★", label: "Average Rating" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 text-sm" variant="secondary">
              Serving Socorro, Surigao del Norte
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Your Community{" "}
              <span className="text-primary">Ride Booking</span>{" "}
              Platform
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Pasakja connects passengers, drivers, and administrators through a
              smart, real-time transportation system designed for our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Book a Ride <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?role=DRIVER">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <Car className="h-4 w-4" /> Drive with Pasakja
                </Button>
              </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                title: "Register & Book",
                description: "Create an account and enter your pickup and destination.",
              },
              {
                step: "2",
                title: "Driver Accepts",
                description: "A nearby verified driver accepts your booking request.",
              },
              {
                step: "3",
                title: "Ride & Pay",
                description: "Track your driver, complete the trip, and pay conveniently.",
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
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Join hundreds of passengers and drivers already using Pasakja every day.
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
