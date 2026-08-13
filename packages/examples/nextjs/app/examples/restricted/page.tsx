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
const ALLOWED = ["US", "GB", "CA"];

export default function RestrictedPage() {
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [formatted, setFormatted] = useState<string>("");

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
    setValue({ country: "US" });
    setValidation(null);
    setFormatted("");
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Country-Restricted Address</h1>
        <p className="text-muted-foreground">
          Restrict selectable countries with the <code>allowedCountries</code> prop. The dropdown only lists allowed territories.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-muted-foreground">Allowed Countries:</span>
        {ALLOWED.map((code) => (
          <Badge key={code} variant={value.country === code ? "default" : "secondary"}>
            {code}
          </Badge>
        ))}
      </div>

      <AddressProviderContext.Provider value={provider}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Regional Form</CardTitle>
                <CardDescription>Only United States, United Kingdom, and Canada enabled.</CardDescription>
              </div>
              <Badge variant="outline">Restricted</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Address
              value={value}
              onChange={(updated) => {
                setValue(updated);
                if (validation) setValidation(null);
              }}
              allowedCountries={ALLOWED}
            />
          </CardContent>
        </Card>

        <div className="mt-4 flex gap-3">
          <Button onClick={handleValidate}>Validate & Format</Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
          </Button>
        </div>

        {validation && (
          <div
            className={`mt-4 rounded-lg p-4 text-sm border ${
              validation.valid
                ? "border-green-600/30 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {validation.valid ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Address is valid for {value.country}
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Validation failed with {validation.errors.length} error(s)
                </>
              )}
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
            <CardTitle>Current Values</CardTitle>
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
