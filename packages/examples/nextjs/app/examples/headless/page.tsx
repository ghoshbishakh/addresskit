"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { getCountries } from "@addresskit/data";
import type { Address as AddressType, Field, FieldId, ValidationResult } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, AlertCircle, RotateCcw, ChevronLeft, Cpu } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);
const countries = getCountries();

export default function HeadlessPage() {
  const [values, setValues] = useState<Partial<AddressType>>({
    country: "US",
    line1: "100 Universal City Plaza",
    locality: "Universal City",
    administrativeArea: "CA",
    postalCode: "91608",
  });
  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formatted, setFormatted] = useState(
    "100 Universal City Plaza\nUniversal City, CA 91608\nUnited States",
  );
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const prevCountryRef = useRef<string | null>(values.country ?? null);

  useEffect(() => {
    if (!values.country) {
      setFields([]);
      return;
    }

    engine.getSchema(values.country).then((schema) => {
      setFields(schema.fields);
    });
  }, [values.country]);

  function handleCountryChange(newCountry: string) {
    const oldCountry = prevCountryRef.current;
    prevCountryRef.current = newCountry;

    const cleaned = oldCountry
      ? engine.clearInvalidValues(values as AddressType, oldCountry, newCountry)
      : { country: newCountry };

    setValues(cleaned);
    setErrors({});
    setFormatted("");
    setValidationResult(null);
  }

  function handleFieldChange(id: FieldId, val: string) {
    const updated = { ...values, [id]: val || undefined };

    if (id === "administrativeArea") {
      const cleaned = engine.clearState(updated as AddressType);
      setValues({ ...cleaned, administrativeArea: val || undefined });
    } else {
      setValues(updated);
    }

    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  async function handleValidate() {
    if (!values.country) return;

    const result = await engine.validate(values as AddressType);
    setValidationResult(result);

    const errorMap: Record<string, string> = {};
    for (const err of result.errors) {
      errorMap[err.field] = err.message;
    }
    setErrors(errorMap);

    if (result.valid) {
      const formattedAddress = await engine.format(values as AddressType);
      setFormatted(formattedAddress);
    }
  }

  function handleReset() {
    setValues({ country: "US" });
    setErrors({});
    setFormatted("");
    setValidationResult(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/examples" className="hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examples
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Headless API</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Cpu className="h-3 w-3" /> Core Engine
          </Badge>
          <Badge variant="outline" className="text-xs">Headless API</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Headless Engine & Schema
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Build bespoke address forms with <code>createEngine</code> and <code>getSchema</code>. Pure logic, full rendering autonomy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <Card className="border-border/80">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Custom Form Markup</CardTitle>
                <Badge variant="outline" className="font-mono text-xs">{values.country ?? "No country"}</Badge>
              </div>
              <CardDescription className="text-xs">
                Rendered with plain HTML elements driven by dynamically loaded schema fields.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="hl-country" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Country Selection
                </label>
                <select
                  id="hl-country"
                  value={values.country ?? ""}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select country...</option>
                  {countries.map(({ code, name }) => (
                    <option key={code} value={code}>{name} ({code})</option>
                  ))}
                </select>
              </div>

              {fields.map((field) => {
                const val = (values[field.id as keyof AddressType] as string) ?? "";
                const err = errors[field.id];

                if (field.type === "select" && field.options) {
                  return (
                    <div key={field.id}>
                      <label htmlFor={`hl-${field.id}`} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </label>
                      <select
                        id={`hl-${field.id}`}
                        value={val}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`w-full h-10 px-3 rounded-lg border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          err ? "border-destructive ring-1 ring-destructive" : "border-input"
                        }`}
                      >
                        <option value="">Select {field.label.toLowerCase()}...</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
                    </div>
                  );
                }

                return (
                  <div key={field.id}>
                    <label htmlFor={`hl-${field.id}`} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {field.label} {field.required && <span className="text-destructive">*</span>}
                    </label>
                    <input
                      id={`hl-${field.id}`}
                      placeholder={field.placeholder}
                      value={val}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className={`w-full h-10 px-3 rounded-lg border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        err ? "border-destructive ring-1 ring-destructive" : "border-input"
                      }`}
                    />
                    {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
                  </div>
                );
              })}

              <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-border/60">
                <Button onClick={handleValidate}>Validate & Format</Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-5">
          {validationResult && (
            <div
              className={`rounded-xl p-4 text-sm border ${
                validationResult.valid
                  ? "border-green-600/30 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Schema validation passed
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Validation failed ({validationResult.errors.length} error{validationResult.errors.length === 1 ? "" : "s"})
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
                Generated Fields Array
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="font-mono text-[11px] text-muted-foreground p-3.5 rounded-lg bg-muted/50 border border-input overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(fields.map((f) => ({ id: f.id, label: f.label, type: f.type, required: f.required })), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
