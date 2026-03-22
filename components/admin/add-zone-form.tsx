"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function AddZoneForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    baseFare: "",
    perKmRate: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          baseFare: parseFloat(form.baseFare),
          perKmRate: parseFloat(form.perKmRate),
        }),
      });

      if (res.ok) {
        toast.success("Zone added successfully");
        setForm({ name: "", description: "", baseFare: "", perKmRate: "" });
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to add zone");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Zone Name</Label>
            <Input
              name="name"
              placeholder="e.g. Zone 1 - Town Center"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              name="description"
              placeholder="Zone coverage area..."
              value={form.description}
              onChange={handleChange}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Base Fare (₱)</Label>
              <Input
                name="baseFare"
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                value={form.baseFare}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Per Km Rate (₱)</Label>
              <Input
                name="perKmRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="10.00"
                value={form.perKmRate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Zone"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
