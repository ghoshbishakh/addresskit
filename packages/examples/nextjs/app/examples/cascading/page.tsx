"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { RotateCcw, ArrowRight, ChevronLeft, Workflow } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

const PRESETS: { label: string; address: Partial<AddressType> }[] = [
  {
    label: "US (California)",
    address: {
      country: "US",
      line1: "1600 Amphitheatre Pkwy",
      locality: "Mountain View",
      administrativeArea: "CA",
      postalCode: "94043",
    },
  },
  {
    label: "Canada (Ontario)",
    address: {
      country: "CA",
      line1: "100 Queen St W",
      locality: "Toronto",
      administrativeArea: "ON",
      postalCode: "M5H 2N2",
    },
  },
  {
    label: "UK (London)",
    address: {
      country: "GB",
      line1: "10 Downing Street",
      locality: "London",
      postalCode: "SW1A 2AA",
    },
  },
];

export default function CascadingPage() {
  const [value, setValue] = useState<Partial<AddressType>>(PRESETS[0]!.address);
  const [log, setLog] = useState<string[]>([
    "Initialized with US (California) address.",
  ]);
  const prevCountryRef = useRef<string | null>(value.country ?? null);

  function handleCountryPreset(preset: typeof PRESETS[0]) {
    const oldCountry = prevCountryRef.current;
    const newCountry = preset.address.country!;
    prevCountryRef.current = newCountry;

    const cleaned = oldCountry
      ? engine.clearInvalidValues(value as AddressType, oldCountry, newCountry)
      : { country: newCountry };

    setValue({ ...cleaned, ...preset.address });
    setLog((prev) => [
      `Preset loaded: ${preset.label}. Cleared invalid subregions for ${oldCountry ?? "none"} -> ${newCountry}.`,
      ...prev.slice(0, 6),
    ]);
  }

  function handleReset() {
    setValue({ country: "US" });
    setLog(["Reset form to default empty state."]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/examples" className="hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examples
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Cascade Clear</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Workflow className="h-3 w-3" /> Form Engine
          </Badge>
          <Badge variant="outline" className="text-xs">Cascading Clears</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Cascade Clearing Behavior
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          AddressKit protects data integrity by automatically preserving valid street lines while resetting incompatible states, provinces, and postal codes upon country change.
        </p>
      </div>

      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Test Presets (Click to switch countries and observe cascading):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant={value.country === preset.address.country ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleCountryPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" className="text-xs h-8" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <AddressProviderContext.Provider value={provider}>
            <Card className="border-border/80">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Interactive Address Form</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">{value.country ?? "No country"}</Badge>
                </div>
                <CardDescription className="text-xs">
                  Changing country resets invalid state selections and regex-dependent postal values.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Address
                  value={value}
                  onChange={(updated) => {
                    if (updated.country !== value.country) {
                      setLog((prev) => [
                        `Country changed: ${value.country ?? "None"} -> ${updated.country}. Ran clearInvalidValues().`,
                        ...prev.slice(0, 6),
                      ]);
                    }
                    setValue(updated);
                  }}
                />
              </CardContent>
            </Card>
          </AddressProviderContext.Provider>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <Card className="border-border/80">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cascade Event Log
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="text-xs space-y-2 font-mono text-muted-foreground">
                {log.map((entry, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current State Payload
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="font-mono text-xs text-muted-foreground p-3.5 rounded-lg bg-muted/50 border border-input overflow-x-auto max-h-56 overflow-y-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
