"use client";

import { useState } from "react";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType, ValidationResult } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

export default function LibaddressPage() {
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [formatted, setFormatted] = useState<string>("");
  const [submitted, setSubmitted] = useState<Partial<AddressType> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.country) return;

    const result = await engine.validate(value as AddressType);
    setValidation(result);

    if (result.valid) {
      const formattedAddress = await engine.format(value as AddressType);
      setFormatted(formattedAddress);
      setSubmitted(value);
    } else {
      setFormatted("");
      setSubmitted(null);
    }
  }

  function handleReset() {
    setValue({ country: "US" });
    setValidation(null);
    setFormatted("");
    setSubmitted(null);
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">libaddressinput Provider</h1>
        <p className="text-muted-foreground">
          Uses Google libaddressinput metadata for 256 countries with accurate field labels, ordering, and postal code validation.
        </p>
      </div>

      <AddressProviderContext.Provider value={provider}>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Address Form</CardTitle>
                  <CardDescription>Select a country to load its address schema.</CardDescription>
                </div>
                <Badge variant="secondary">256 Countries</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Address
                value={value}
                onChange={(updated) => {
                  setValue(updated);
                  if (validation) setValidation(null);
                }}
              />
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-3">
            <Button type="submit">Validate & Submit</Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
            </Button>
          </div>

          {validation && !validation.valid && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <div className="flex items-center gap-2 font-medium mb-1.5">
                <AlertCircle className="h-4 w-4" /> Validation Failed
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {validation.errors.map((err, idx) => (
                  <li key={idx}>
                    <strong className="capitalize">{err.field}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {submitted && formatted && (
            <Card className="mt-6 border-green-600/30 bg-green-50/40 dark:bg-green-950/20">
              <CardHeader>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <CardTitle className="text-lg">Address Validated & Formatted</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Postal Format
                  </h2>
                  <pre className="whitespace-pre-wrap rounded-lg bg-background p-4 text-sm font-mono border border-input">
                    {formatted}
                  </pre>
                </div>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Address Object
                  </h2>
                  <pre className="text-xs bg-background p-4 rounded-lg overflow-x-auto font-mono border border-input">
                    {JSON.stringify(submitted, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </AddressProviderContext.Provider>
    </div>
  );
}
