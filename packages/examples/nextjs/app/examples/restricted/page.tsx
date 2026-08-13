"use client";

import { useState } from "react";
import Link from "next/link";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType, ValidationResult } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, AlertCircle, RotateCcw, ChevronLeft, ShieldAlert } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);
const ALLOWED_SETS: { label: string; countries: string[] }[] = [
  { label: "North America (US, CA, MX)", countries: ["US", "CA", "MX"] },
  { label: "DACH Region (DE, AT, CH)", countries: ["DE", "AT", "CH"] },
  { label: "Commonwealth (GB, CA, AU, NZ)", countries: ["GB", "CA", "AU", "NZ"] },
];

export default function RestrictedPage() {
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const allowed = ALLOWED_SETS[activeSetIndex]!.countries;
  const [value, setValue] = useState<Partial<AddressType>>({ country: allowed[0] });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [formatted, setFormatted] = useState<string>("");

  function handleSetChange(index: number) {
    setActiveSetIndex(index);
    const firstCountry = ALLOWED_SETS[index]!.countries[0]!;
    setValue({ country: firstCountry });
    setValidation(null);
    setFormatted("");
  }

  async function handleValidate() {
    if (!value.country) return;
    const result = await engine.validate(value as AddressType);
    setValidation(result);

    if (result.valid) {
      const formattedAddress = await engine.format(value as AddressType);
      setFormatted(formattedAddress);
    } else {
      setFormatted("");
    }
  }

  function handleReset() {
    setValue({ country: allowed[0] });
    setValidation(null);
    setFormatted("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/examples" className="hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examples
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Restricted Countries</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <ShieldAlert className="h-3 w-3" /> Regional Scope
          </Badge>
          <Badge variant="outline" className="text-xs">allowedCountries</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Country-Restricted Forms
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Limit selectable countries using the <code>allowedCountries</code> prop. Ideal for region-locked deliveries, domestic stores, or restricted tax regions.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
          Regional Presets:
        </span>
        {ALLOWED_SETS.map((set, idx) => (
          <Button
            key={set.label}
            type="button"
            variant={activeSetIndex === idx ? "default" : "outline"}
            size="sm"
            className="text-xs h-8"
            onClick={() => handleSetChange(idx)}
          >
            {set.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <AddressProviderContext.Provider value={provider}>
            <Card className="border-border/80">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Restricted Form</CardTitle>
                  <div className="flex gap-1">
                    {allowed.map((c) => (
                      <Badge key={c} variant="secondary" className="font-mono text-[10px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardDescription className="text-xs">
                  Dropdown options are restricted to: {allowed.join(", ")}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Address
                  value={value}
                  onChange={(updated) => {
                    setValue(updated);
                    if (validation) setValidation(null);
                  }}
                  allowedCountries={allowed}
                />
                <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-border/60">
                  <Button onClick={handleValidate}>Validate & Format</Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AddressProviderContext.Provider>
        </div>

        <div className="lg:col-span-5 space-y-5">
          {validation && (
            <div
              className={`rounded-xl p-4 text-sm border ${
                validation.valid
                  ? "border-green-600/30 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {validation.valid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Valid address for {value.country}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Validation failed ({validation.errors.length} error{validation.errors.length === 1 ? "" : "s"})
                  </>
                )}
              </div>
            </div>
          )}

          <Card className="border-border/80">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Formatted Envelope View
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-foreground p-3.5 rounded-lg bg-muted/50 border border-input leading-relaxed">
                {formatted || "Click Validate & Format to render postal envelope..."}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Allowed Countries Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="font-mono text-xs text-muted-foreground p-3.5 rounded-lg bg-muted/50 border border-input overflow-x-auto max-h-56 overflow-y-auto">
                {JSON.stringify({ allowedCountries: allowed, activeCountry: value.country }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
