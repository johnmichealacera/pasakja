"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, MapPin, ChevronDown } from "lucide-react";
import { SOCORRO_PLACES, type SocorroPlace } from "@/lib/socorro-places";

interface Props {
  value: SocorroPlace | null;
  onSelect: (place: SocorroPlace | null) => void;
  disabled?: boolean;
  variant?: "pickup" | "destination";
}

const VARIANT_COPY = {
  pickup: {
    placeholder: "Search pickup areas in Socorro…",
    empty: "Search pickup areas in Socorro…",
  },
  destination: {
    placeholder: "Search destinations in Socorro…",
    empty: "Search destinations in Socorro…",
  },
} as const;

export function DestinationSearch({ value, onSelect, disabled, variant = "destination" }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Filter places across all barangays based on query
  const q = query.trim().toLowerCase();
  const filteredGroups = SOCORRO_PLACES.map((brgy) => ({
    barangay: brgy.barangay,
    places: brgy.places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        brgy.barangay.toLowerCase().includes(q)
    ),
  })).filter((brgy) => brgy.places.length > 0);

  const totalMatches = filteredGroups.reduce((n, g) => n + g.places.length, 0);

  function handleSelect(place: SocorroPlace) {
    onSelect(place);
    setQuery("");
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onSelect(null);
    setQuery("");
    inputRef.current?.focus();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
  }

  function handleFocus() {
    setOpen(true);
  }

  /** Highlight the matching portion of a string */
  function Highlight({ text }: { text: string }) {
    if (!q) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-primary rounded-sm px-0.5 font-semibold">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  const copy = VARIANT_COPY[variant];

  return (
    <div ref={containerRef} className="relative">
      {/* Input trigger */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder={value ? value.name : copy.placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="w-full pl-9 pr-16 py-2.5 rounded-lg border border-input bg-background text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && !query && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Selected place badge */}
      {value && !open && (
        <div className="mt-1.5 flex items-center justify-between text-xs bg-primary/5 border border-primary/20 rounded-md px-2.5 py-1.5">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <MapPin className="h-3 w-3 text-primary" />
            {value.name}
          </span>
          <span className="font-mono text-muted-foreground">
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[9999] mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
          {/* Result count */}
          {q && (
            <div className="sticky top-0 bg-background border-b px-3 py-1.5 text-xs text-muted-foreground">
              {totalMatches === 0
                ? "No results"
                : `${totalMatches} place${totalMatches !== 1 ? "s" : ""} found`}
            </div>
          )}

          {filteredGroups.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
              No places matched &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredGroups.map((brgy) => (
              <div key={brgy.barangay}>
                {/* Barangay group header */}
                <div className="sticky top-0 px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/60 border-y border-border/50 flex items-center gap-1.5">
                  <span>📍</span>
                  <Highlight text={brgy.barangay} />
                </div>
                {/* Places in this barangay */}
                {brgy.places.map((place) => {
                  const isSelected =
                    value?.lat === place.lat && value?.lng === place.lng;
                  return (
                    <button
                      key={`${place.lat},${place.lng}`}
                      type="button"
                      onPointerDown={(e) => e.preventDefault()} // prevent blur before click
                      onClick={() => handleSelect(place)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 transition-colors hover:bg-accent ${
                        isSelected ? "bg-primary/10 text-primary font-medium" : ""
                      }`}
                    >
                      <MapPin
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <Highlight text={place.name} />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
