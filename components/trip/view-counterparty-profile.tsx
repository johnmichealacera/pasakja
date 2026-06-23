"use client";

import { useState, type ComponentType } from "react";
import { Car, Calendar, Phone, Star, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { vehicleLabel } from "@/lib/vehicle-types";
import { formatPh } from "@/lib/datetime";
import { cn } from "@/lib/utils";

type DriverProfile = {
  role: "driver";
  name: string;
  profileImage: string | null;
  phone: string | null;
  vehicleType: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: string;
  avgRating: number | null;
  ratingCount: number;
  tripCount: number;
};

type PassengerProfile = {
  role: "passenger";
  name: string;
  profileImage: string | null;
  phone: string | null;
  memberSince: string;
  tripCount: number;
};

type CounterpartyProfile = DriverProfile | PassengerProfile;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function ProfileBody({ profile }: { profile: CounterpartyProfile }) {
  const inits = initials(profile.name);

  if (profile.role === "driver") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {profile.profileImage && (
              <AvatarImage src={profile.profileImage} alt={profile.name} />
            )}
            <AvatarFallback className="text-lg">{inits}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold truncate">{profile.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant={profile.status === "VERIFIED" ? "default" : "secondary"}>
                {profile.status === "VERIFIED" ? "Verified Driver" : profile.status}
              </Badge>
              {profile.avgRating != null && (
                <span className="text-xs flex items-center gap-1 text-yellow-600">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {profile.avgRating} ({profile.ratingCount})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {profile.phone && (
            <ProfileField icon={Phone} label="Phone" value={profile.phone} />
          )}
          <ProfileField
            icon={Car}
            label="Vehicle"
            value={`${vehicleLabel(profile.vehicleType)} · ${profile.vehicleModel}`}
          />
          <ProfileField icon={Car} label="Plate Number" value={profile.vehiclePlate} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xl font-bold">{profile.tripCount}</p>
            <p className="text-xs text-muted-foreground">Completed trips</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xl font-bold">{profile.ratingCount}</p>
            <p className="text-xs text-muted-foreground">Ratings received</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {profile.profileImage && (
            <AvatarImage src={profile.profileImage} alt={profile.name} />
          )}
          <AvatarFallback className="text-lg">{inits}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold truncate">{profile.name}</h3>
          <Badge variant="secondary" className="mt-1">
            Passenger
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {profile.phone && (
          <ProfileField icon={Phone} label="Phone" value={profile.phone} />
        )}
        <ProfileField
          icon={Calendar}
          label="Member since"
          value={formatPh(new Date(profile.memberSince), "MMMM d, yyyy")}
        />
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-center">
        <p className="text-xl font-bold">{profile.tripCount}</p>
        <p className="text-xs text-muted-foreground">Total bookings</p>
      </div>
    </div>
  );
}

export function ViewCounterpartyProfile({
  bookingId,
  label,
  className,
  size = "sm",
}: {
  bookingId: string;
  label: string;
  className?: string;
  size?: "sm" | "xs";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CounterpartyProfile | null>(null);

  async function handleOpen(next: boolean) {
    setOpen(next);
    if (!next) return;

    setLoading(true);
    setProfile(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/counterparty`);
      const data = (await res.json()) as CounterpartyProfile & { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not load profile");
        setOpen(false);
        return;
      }
      setProfile(data);
    } catch {
      toast.error("Could not load profile");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={size}
        className={cn("h-auto px-2 py-1 text-primary hover:text-primary", className)}
        onClick={() => handleOpen(true)}
      >
        <User className="h-3.5 w-3.5 mr-1" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Trip contact details for verification
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading profile…</p>
          )}
          {!loading && profile && <ProfileBody profile={profile} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
