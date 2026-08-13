"use client";

import { useState } from "react";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType, Field, FieldId, ValidationResult } from "@addresskit/core";
import type { FieldComponents } from "@addresskit/react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, RotateCcw, AlertCircle } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

const customComponents: FieldComponents = {
  Input: ({ field, value, error, onChange }: { field: Field; value: string; error?: string; onChange: (id: FieldId, value: string) => void }) => (
    <div className="mb-4">
      <label htmlFor={`custom-${field.id}`} className="block text-sm font-medium text-foreground mb-1.5">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        id={`custom-${field.id}`}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        className={`w-full h-11 px-4 rounded-lg border text-sm transition-colors bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          error ? "border-destructive ring-1 ring-destructive" : "border-input"
        }`}
      />
      {error && <p className="mt-1 text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  ),
  Select: ({ field, value, error, onChange }: { field: Field; value: string; error?: string; onChange: (id: FieldId, value: string) => void }) => (
    <div className="mb-4">
      <label htmlFor={`custom-${field.id}`} className="block text-sm font-medium text-foreground mb-1.5">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <select
        id={`custom-${field.id}`}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={`w-full h-11 px-4 rounded-lg border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          error ? "border-destructive ring-1 ring-destructive" : "border-input"
        }`}
      >
        <option value="">Select {field.label.toLowerCase()}...</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  ),
};

export default function CustomFieldsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Custom Field Components</h1>
        <p className="text-muted-foreground">
          Override input and select controls with design system components using the <code>components</code> prop.
        </p>
      </div>

      <AddressProviderContext.Provider value={provider}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Themed Form Inputs</CardTitle>
                <CardDescription>Custom rendered inputs with tailored styling and error states.</CardDescription>
              </div>
              <Badge variant="secondary">Slot Overrides</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Address
              value={value}
              onChange={(updated) => {
                setValue(updated);
                if (validation) setValidation(null);
              }}
              components={customComponents}
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
                  Address passed custom input validation
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
