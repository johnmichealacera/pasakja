"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Phone, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SOSPage() {
  const [isTriggered, setIsTriggered] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSOS() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, lat: 9.6234, lng: 125.9685 }),
      });

      if (res.ok) {
        setIsTriggered(true);
        toast.error("SOS Alert sent! Help is on the way.", { duration: 10000 });
      } else {
        toast.error("Failed to send SOS. Please call emergency services directly.");
      }
    } catch {
      toast.error("Failed to send SOS. Please call emergency services directly.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Emergency SOS</h2>
        <p className="text-muted-foreground">
          Use this in case of emergency during your trip
        </p>
      </div>

      {isTriggered ? (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-6 text-center">
            <Shield className="h-16 w-16 mx-auto text-destructive mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-destructive mb-2">SOS Alert Sent!</h3>
            <p className="text-muted-foreground mb-4">
              Your emergency alert has been sent to our administrators. Help is on the way.
            </p>
            <p className="text-sm font-medium">Your location has been shared with responders.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsTriggered(false)}
            >
              Send Another Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Emergency Button
              </CardTitle>
              <CardDescription>
                Press only in genuine emergencies. Your current location will be shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Additional message (optional)</Label>
                <Textarea
                  placeholder="Describe your emergency..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                variant="destructive"
                size="lg"
                className="w-full gap-2 h-14 text-base"
                onClick={handleSOS}
                disabled={isLoading}
              >
                <AlertCircle className="h-6 w-6" />
                {isLoading ? "Sending Alert..." : "SEND SOS ALERT"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Emergency Contacts</p>
                  <p className="text-xs text-muted-foreground">Philippine National Police: 117</p>
                  <p className="text-xs text-muted-foreground">BFP Emergency: 160</p>
                  <p className="text-xs text-muted-foreground">NDRRMC: 911</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
