"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ZoneFare {
  baseFare: { toString(): string } | number | string;
  perKmRate: { toString(): string } | number | string;
}

interface Zone {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  fares: ZoneFare[];
}

export function ZoneActions({ zone }: { zone: Zone }) {
  const router = useRouter();
  const fare = zone.fares[0];

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: zone.name,
    description: zone.description ?? "",
    isActive: zone.isActive,
    baseFare: fare ? Number(fare.baseFare).toFixed(2) : "",
    perKmRate: fare ? Number(fare.perKmRate).toFixed(2) : "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/zones/${zone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          isActive: form.isActive,
          baseFare: parseFloat(form.baseFare),
          perKmRate: parseFloat(form.perKmRate),
        }),
      });
      if (res.ok) {
        toast.success("Zone updated successfully");
        setEditOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to update zone");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/zones/${zone.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Zone deleted");
        setDeleteOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete zone");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Zone Name</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                name="description"
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
                  value={form.perKmRate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete &quot;{zone.name}&quot;?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the zone and its fare configuration. This action
            cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
