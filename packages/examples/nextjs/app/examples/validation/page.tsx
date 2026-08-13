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

export default function ValidationPage() {
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [formatted, setFormatted] = useState<string>("");

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

  function handleReset() {
    setValue({ country: "US" });
    setValidationResult(null);
    setFormatted("");
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Address Validation</h1>
        <p className="text-muted-foreground">
          Real-time and manual address validation against country-specific rules, required fields, and postal patterns.
        </p>
      </div>

      <AddressProviderContext.Provider value={provider}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Validation Demo</CardTitle>
                <CardDescription>Test invalid postal codes or missing subregions.</CardDescription>
              </div>
              {validationResult?.valid && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Valid</Badge>
              )}
              {validationResult && !validationResult.valid && (
                <Badge variant="destructive">Has Errors</Badge>
              )}
            </div>
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
          </CardContent>
        </Card>

        <div className="mt-4 flex gap-3">
          <Button onClick={handleValidate}>Validate Manually</Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
          </Button>
        </div>

        {validationResult && !validationResult.valid && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
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
          <div className="mt-4 rounded-lg border border-green-600/30 bg-green-50/50 dark:bg-green-950/20 p-4 text-sm text-green-700 dark:text-green-400">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              All fields conform to {value.country} address requirements
            </div>
          </div>
        )}

        {formatted && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Formatted Address</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg font-mono border border-input">
                {formatted}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Address Payload</CardTitle>
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
