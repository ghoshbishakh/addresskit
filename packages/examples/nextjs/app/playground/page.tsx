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
import { CheckCircle2, AlertCircle, Copy, RotateCcw, Check } from "lucide-react";

const libinputProvider = createLibaddressinputProvider();
const dr5hnProvider = createDr5hnProvider();
const libinputEngine = createEngine(libinputProvider);
const dr5hnEngine = createEngine(dr5hnProvider);

export default function PlaygroundPage() {
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });
  const [providerType, setProviderType] = useState<"libaddressinput" | "dr5hn">("libaddressinput");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [formatted, setFormatted] = useState<string | null>(null);
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
  }

  async function handleFormat() {
    if (!value.country || !value.line1) return;
    const formattedAddress = await engine.format(value as AddressType);
    setFormatted(formattedAddress);
  }

  function handleReset() {
    setValue({ country: "US" });
    setValidationResult(null);
    setFormatted(null);
  }

  function handleProviderChange(type: "libaddressinput" | "dr5hn") {
    setProviderType(type);
    setValidationResult(null);
    setFormatted(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
        <p className="mt-2 text-muted-foreground">
          Interactive workbench. Toggle data providers, test address validation, and format postal strings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <AddressProviderContext.Provider value={provider}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Address Form</CardTitle>
                    <CardDescription>Live controlled form connected to active provider.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={providerType === "libaddressinput" ? "default" : "outline"}
                      onClick={() => handleProviderChange("libaddressinput")}
                    >
                      libaddressinput
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={providerType === "dr5hn" ? "default" : "outline"}
                      onClick={() => handleProviderChange("dr5hn")}
                    >
                      dr5hn
                    </Button>
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
              </CardContent>
            </Card>
          </AddressProviderContext.Provider>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleValidate} disabled={!value.country}>
              Validate
            </Button>
            <Button variant="secondary" onClick={handleFormat} disabled={!value.country || !value.line1}>
              Format
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
          </div>

          {validationResult && (
            <div
              className={`rounded-lg p-4 text-sm border ${
                validationResult.valid
                  ? "border-green-600/30 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              <div className="flex items-center gap-2 font-medium mb-1">
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Address is valid for {value.country}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Validation failed ({validationResult.errors.length} error{validationResult.errors.length === 1 ? "" : "s"})
                  </>
                )}
              </div>
              {!validationResult.valid && (
                <ul className="list-disc list-inside space-y-1 text-xs mt-2">
                  {validationResult.errors.map((err, idx) => (
                    <li key={idx}>
                      <strong className="capitalize">{err.field}:</strong> {err.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {formatted && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Formatted Postal String
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg font-mono border border-input">
                  {formatted}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">JSON Output</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-green-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-80 overflow-y-auto font-mono border border-input">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Provider</CardTitle>
                <Badge variant="outline">{providerType}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              {providerType === "libaddressinput" ? (
                <>
                  <p><strong className="text-foreground">Source:</strong> Google libaddressinput</p>
                  <p><strong className="text-foreground">Coverage:</strong> 256 countries & territories</p>
                  <p><strong className="text-foreground">Capabilities:</strong> Dynamic schemas, postal regex, subregions</p>
                </>
              ) : (
                <>
                  <p><strong className="text-foreground">Source:</strong> dr5hn countries-states-cities</p>
                  <p><strong className="text-foreground">Coverage:</strong> 250 countries</p>
                  <p><strong className="text-foreground">Capabilities:</strong> Detailed state lists, country index</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
