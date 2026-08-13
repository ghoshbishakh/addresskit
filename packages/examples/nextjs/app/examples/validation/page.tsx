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
import { CheckCircle2, AlertCircle, RotateCcw, ChevronLeft, ShieldCheck } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

const TEST_SCENARIOS: { label: string; description: string; address: Partial<AddressType> }[] = [
  {
    label: "Valid US Address",
    description: "Conforms to US postal and state code rules.",
    address: {
      country: "US",
      line1: "1600 Amphitheatre Pkwy",
      locality: "Mountain View",
      administrativeArea: "CA",
      postalCode: "94043",
    },
  },
  {
    label: "Invalid Postal Pattern",
    description: "Postal code 'INVALID-ZIP' fails regex check.",
    address: {
      country: "US",
      line1: "1600 Amphitheatre Pkwy",
      locality: "Mountain View",
      administrativeArea: "CA",
      postalCode: "INVALID-ZIP",
    },
  },
  {
    label: "Missing Required Fields",
    description: "Omitted street line and postal code.",
    address: {
      country: "CA",
      locality: "Toronto",
      administrativeArea: "ON",
    },
  },
];

export default function ValidationPage() {
  const [value, setValue] = useState<Partial<AddressType>>(TEST_SCENARIOS[0]!.address);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [formatted, setFormatted] = useState<string>(
    "1600 Amphitheatre Pkwy\nMountain View, CA 94043\nUnited States",
  );

  async function handleValidate() {
    if (!value.country) return;
    const result = await engine.validate(value as AddressType);
    setValidationResult(result);

    if (result.valid) {
      const formattedAddress = await engine.format(value as AddressType);
      setFormatted(formattedAddress);
    } else {
      setFormatted("");
    }
  }

  function handleScenario(scenario: typeof TEST_SCENARIOS[0]) {
    setValue(scenario.address);
    setValidationResult(null);
    setFormatted("");
  }

  function handleReset() {
    setValue({ country: "US" });
    setValidationResult(null);
    setFormatted("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/examples" className="hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examples
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Validation</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <ShieldCheck className="h-3 w-3" /> Offline Engine
          </Badge>
          <Badge variant="outline" className="text-xs">Structured Errors</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Address Validation & Structured Errors
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Validate required fields, postal code regular expressions, and administrative subregions against local metadata with 0 network latency.
        </p>
      </div>

      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Test Scenarios (Click to test validation engine):
        </span>
        <div className="flex flex-wrap gap-2">
          {TEST_SCENARIOS.map((scen) => (
            <Button
              key={scen.label}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => handleScenario(scen)}
            >
              {scen.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <AddressProviderContext.Provider value={provider}>
            <Card className="border-border/80">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Address Form</CardTitle>
                  {validationResult?.valid && (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                      Valid
                    </Badge>
                  )}
                  {validationResult && !validationResult.valid && (
                    <Badge variant="destructive" className="text-xs">
                      Has Errors
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Inline field errors surface automatically as inputs change.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Address
                  value={value}
                  onChange={(updated) => {
                    setValue(updated);
                    if (validationResult) setValidationResult(null);
                  }}
                  onValidationChange={(result) => {
                    setValidationResult(result);
                  }}
                />
                <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-border/60">
                  <Button onClick={handleValidate}>Validate Now</Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AddressProviderContext.Provider>
        </div>

        <div className="lg:col-span-5 space-y-5">
          {validationResult && !validationResult.valid && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <div className="flex items-center gap-2 font-medium mb-1.5">
                <AlertCircle className="h-4 w-4" /> Validation Failed ({validationResult.errors.length} error{validationResult.errors.length === 1 ? "" : "s"})
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {validationResult.errors.map((err, idx) => (
                  <li key={idx}>
                    <strong className="capitalize">{err.field}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationResult?.valid && (
            <div className="rounded-xl border border-green-600/30 bg-green-50/50 dark:bg-green-950/20 p-4 text-sm text-green-700 dark:text-green-400">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                All fields conform to {value.country} address requirements
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
                {formatted || "Validate a valid address to render postal envelope..."}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Validation Result Object
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="font-mono text-xs text-muted-foreground p-3.5 rounded-lg bg-muted/50 border border-input overflow-x-auto max-h-56 overflow-y-auto">
                {JSON.stringify(validationResult ?? { status: "Awaiting validation" }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
