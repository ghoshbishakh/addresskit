"use client";

import { useState, useRef } from "react";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { RotateCcw, ArrowRight } from "lucide-react";

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
  const [log, setLog] = useState<string[]>([]);
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
      `Loaded preset: ${preset.label} (cleared invalid fields for ${oldCountry ?? "none"} -> ${newCountry})`,
      ...prev.slice(0, 5),
    ]);
  }

  function handleReset() {
    setValue({ country: "US" });
    setLog(["Reset form to default US state."]);
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Cascade Clear</h1>
        <p className="text-muted-foreground">
          Switching countries automatically preserves valid street lines while clearing invalid states, provinces, and postal codes.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Test Presets (Click to switch and test cascading)
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant={value.country === preset.address.country ? "default" : "outline"}
              size="sm"
              onClick={() => handleCountryPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
        </div>
      </div>

      <AddressProviderContext.Provider value={provider}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Interactive Cascade Form</CardTitle>
                <CardDescription>Change country in the dropdown below to observe field reset rules.</CardDescription>
              </div>
              <Badge variant="secondary">{value.country ?? "No country"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Address
              value={value}
              onChange={(updated) => {
                if (updated.country !== value.country) {
                  setLog((prev) => [
                    `Country changed: ${value.country ?? "None"} -> ${updated.country}. Cascaded invalid values.`,
                    ...prev.slice(0, 5),
                  ]);
                }
                setValue(updated);
              }}
            />
          </CardContent>
        </Card>

        {log.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Cascade Event Log</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <ul className="text-xs space-y-1 font-mono text-muted-foreground">
                {log.map((entry, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Current State Values</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono border border-input">
              {JSON.stringify(value, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </AddressProviderContext.Provider>
    </div>
  );
}
