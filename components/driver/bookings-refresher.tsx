"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { formatPhTime } from "@/lib/datetime";

const POLL_INTERVAL_MS = 10_000;

export function BookingsRefresher() {
  const router = useRouter();
  const [lastRefreshLabel, setLastRefreshLabel] = useState("");

  useEffect(() => {
    const tick = () => setLastRefreshLabel(formatPhTime());

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
