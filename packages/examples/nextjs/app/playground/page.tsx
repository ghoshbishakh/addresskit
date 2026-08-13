"use client";

import { useState, useCallback, useMemo } from "react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { createDr5hnProvider } from "@addresskit/providers-dr5hn";
import { createEngine } from "@addresskit/core";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType, ValidationResult } from "@addresskit/core";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  RotateCcw,
  Check,
  Globe,
  Database,
  SlidersHorizontal,
  FileCode,
  FileCheck,
} from "lucide-react";

const libinputProvider = createLibaddressinputProvider();
const dr5hnProvider = createDr5hnProvider();
const libinputEngine = createEngine(libinputProvider);
const dr5hnEngine = createEngine(dr5hnProvider);

const PRESET_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
];

type InspectorTab = "envelope" | "json" | "validation" | "metadata";

export default function PlaygroundPage() {
  const [value, setValue] = useState<Partial<AddressType>>({
    country: "US",
    line1: "1600 Amphitheatre Pkwy",
    locality: "Mountain View",
    administrativeArea: "CA",
    postalCode: "94043",
  });
  const [providerType, setProviderType] = useState<"libaddressinput" | "dr5hn">("libaddressinput");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [formatted, setFormatted] = useState<string | null>(
    "1600 Amphitheatre Pkwy\nMountain View, CA 94043\nUnited States",
  );
  const [activeTab, setActiveTab] = useState<InspectorTab>("envelope");
  const [copied, setCopied] = useState(false);

  const provider = useMemo(
    () => (providerType === "libaddressinput" ? libinputProvider : dr5hnProvider),
    [providerType],
  );

  const engine = useMemo(
    () => (providerType === "libaddressinput" ? libinputEngine : dr5hnEngine),
    [providerType],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  async function handleValidate() {
    if (!value.country) return;
    const result = await engine.validate(value as AddressType);
    setValidationResult(result);
    if (result.valid) {
      const formattedAddress = await engine.format(value as AddressType);
      setFormatted(formattedAddress);
    }
  }

  async function handleFormat() {
    if (!value.country) return;
    const formattedAddress = await engine.format(value as AddressType);
    setFormatted(formattedAddress);
  }

  async function handleCountryChip(code: string) {
    const oldCountry = value.country;
    const cleaned = oldCountry
      ? engine.clearInvalidValues(value as AddressType, oldCountry, code)
      : { country: code };

    setValue(cleaned);
    setValidationResult(null);
    const result = await engine.format(cleaned as AddressType);
    setFormatted(result);
  }

  function handleReset() {
    setValue({ country: "US" });
    setValidationResult(null);
    setFormatted("");
  }

  function handleProviderChange(type: "libaddressinput" | "dr5hn") {
    setProviderType(type);
    setValidationResult(null);
    setFormatted(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <SlidersHorizontal className="h-3 w-3" /> Interactive Console
          </Badge>
          <Badge variant="outline" className="text-xs">Live Workbench</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AddressKit Playground
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Test dynamic address generation, inspect validation rules, compare provider datasets, and format envelopes in real time.
        </p>

        {/* Quick Country Switcher Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 pt-4 border-t border-border/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
            Quick Countries:
          </span>
          {PRESET_COUNTRIES.map((c) => (
            <Button
              key={c.code}
              type="button"
              variant={value.country === c.code ? "default" : "outline"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => handleCountryChip(c.code)}
            >
              {c.code} <span className="hidden md:inline ml-1 text-[11px] text-muted-foreground">{c.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <AddressProviderContext.Provider value={provider}>
            <Card className="border-border/80">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Controlled Address Form</CardTitle>
                    <CardDescription className="text-xs">
                      Active metadata schema for {value.country ?? "None"}.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/80">
                    <button
                      type="button"
                      onClick={() => handleProviderChange("libaddressinput")}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all ${
                        providerType === "libaddressinput"
                          ? "bg-background text-foreground font-semibold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Globe className="h-3 w-3" /> libaddressinput
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProviderChange("dr5hn")}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all ${
                        providerType === "dr5hn"
                          ? "bg-background text-foreground font-semibold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Database className="h-3 w-3" /> dr5hn
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Address
                  value={value}
                  onChange={(updated) => {
                    setValue(updated);
                    if (validationResult) setValidationResult(null);
                  }}
                />

                <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-border/60">
                  <Button onClick={handleValidate} disabled={!value.country}>
                    Validate & Format
                  </Button>
                  <Button variant="secondary" onClick={handleFormat} disabled={!value.country}>
                    Format Only
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-1.5" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AddressProviderContext.Provider>
        </div>

        {/* Right Column: Tabbed Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("envelope")}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    activeTab === "envelope"
                      ? "bg-background text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Envelope
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    activeTab === "json"
                      ? "bg-background text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("validation")}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    activeTab === "validation"
                      ? "bg-background text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Validation
                </button>
              </div>

              {activeTab === "json" && (
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs gap-1">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </Button>
              )}
            </div>

            <CardContent className="p-4">
              {activeTab === "envelope" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Formatted Postal String
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {value.country} Template
                    </Badge>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs bg-muted/40 p-3.5 rounded-lg font-mono border border-input leading-relaxed text-foreground min-h-[140px]">
                    {formatted || "Click Validate & Format to render postal mailing envelope..."}
                  </pre>
                </div>
              )}

              {activeTab === "json" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Live State Object
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Address
                    </Badge>
                  </div>
                  <pre className="text-xs bg-muted/40 p-3.5 rounded-lg overflow-x-auto max-h-80 overflow-y-auto font-mono border border-input min-h-[140px]">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === "validation" && (
                <div className="space-y-3 min-h-[140px]">
                  {validationResult ? (
                    <div
                      className={`rounded-lg p-3.5 text-xs border ${
                        validationResult.valid
                          ? "border-green-600/30 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-medium mb-1">
                        {validationResult.valid ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            All address checks passed
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4" />
                            Validation failed ({validationResult.errors.length} issue{validationResult.errors.length === 1 ? "" : "s"})
                          </>
                        )}
                      </div>
                      {!validationResult.valid && (
                        <ul className="list-disc list-inside space-y-1 text-[11px] mt-2">
                          {validationResult.errors.map((err, idx) => (
                            <li key={idx}>
                              <strong className="capitalize">{err.field}:</strong> {err.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground p-3.5 bg-muted/30 rounded-lg border border-input">
                      Click Validate & Format to inspect validation rules.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider Card */}
          <Card className="border-border/80">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Provider Details
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">{providerType}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-xs text-muted-foreground space-y-1.5">
              {providerType === "libaddressinput" ? (
                <>
                  <p><strong className="text-foreground">Source:</strong> Google libaddressinput (Offline)</p>
                  <p><strong className="text-foreground">Country Coverage:</strong> 256 ISO territories</p>
                  <p><strong className="text-foreground">Features:</strong> Formatting templates, postal regex, subregions</p>
                </>
              ) : (
                <>
                  <p><strong className="text-foreground">Source:</strong> dr5hn countries-states-cities</p>
                  <p><strong className="text-foreground">Country Coverage:</strong> 250 ISO countries</p>
                  <p><strong className="text-foreground">Features:</strong> Granular state/province lists with fallback format</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
