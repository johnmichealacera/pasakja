"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

const POLL_INTERVAL_MS = 10_000;

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function BookingsRefresher() {
  const router = useRouter();
  const [lastRefreshLabel, setLastRefreshLabel] = useState("");

  useEffect(() => {
    const tick = () => setLastRefreshLabel(formatTime(new Date()));

    tick();
    const interval = setInterval(() => {
      router.refresh();
      tick();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <Badge variant="outline" className="gap-1.5 text-xs font-normal text-muted-foreground">
      <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />
      Auto-refresh
      {lastRefreshLabel ? ` · ${lastRefreshLabel}` : ""}
    </Badge>
  );
}
