"use client";

import { useState } from "react";
import Link from "next/link";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType, Field, FieldId, ValidationResult } from "@addresskit/core";
import type { FieldComponents } from "@addresskit/react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, RotateCcw, AlertCircle, ChevronLeft, Paintbrush } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

const customComponents: FieldComponents = {
  Input: ({ field, value, error, onChange }: { field: Field; value: string; error?: string; onChange: (id: FieldId, value: string) => void }) => (
    <div className="mb-3.5">
      <label htmlFor={`custom-${field.id}`} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={`custom-${field.id}`}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        className={`w-full h-10 px-3.5 rounded-lg border text-sm transition-all bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          error ? "border-destructive ring-1 ring-destructive" : "border-input"
        }`}
      />
      {error && <p className="mt-1 text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  ),
  Select: ({ field, value, error, onChange }: { field: Field; value: string; error?: string; onChange: (id: FieldId, value: string) => void }) => (
    <div className="mb-3.5">
      <label htmlFor={`custom-${field.id}`} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <select
        id={`custom-${field.id}`}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={`w-full h-10 px-3.5 rounded-lg border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
  const [value, setValue] = useState<Partial<AddressType>>({
    country: "US",
    line1: "742 Evergreen Terrace",
    locality: "Springfield",
    administrativeArea: "OR",
    postalCode: "97477",
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [formatted, setFormatted] = useState<string>(
    "742 Evergreen Terrace\nSpringfield, OR 97477\nUnited States",
  );

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/examples" className="hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examples
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Custom Components</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Paintbrush className="h-3 w-3" /> Component Slots
          </Badge>
          <Badge variant="outline" className="text-xs">components Prop</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Custom Field Components
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Override default inputs with design system controls using the <code>components</code> prop on <code>&lt;Address&gt;</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <AddressProviderContext.Provider value={provider}>
            <Card className="border-border/80">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Custom Themed Inputs</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">{value.country ?? "No country"}</Badge>
                </div>
                <CardDescription className="text-xs">
                  Inputs and selects rendered via custom component overrides.
                </CardDescription>
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
                    Validation passed
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
                Current Values
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
