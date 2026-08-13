"use client";

import { useState, useEffect, useRef } from "react";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { getCountries } from "@addresskit/data";
import type { Address as AddressType, Field, FieldId, ValidationResult } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);
const countries = getCountries();

export default function HeadlessPage() {
  const [values, setValues] = useState<Partial<AddressType>>({ country: "US" });
  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formatted, setFormatted] = useState("");
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
  }

  async function handleFormat() {
    if (!values.country || !values.line1) return;
    const formattedAddress = await engine.format(values as AddressType);
    setFormatted(formattedAddress);
  }

  function handleReset() {
    setValues({ country: "US" });
    setErrors({});
    setFormatted("");
    setValidationResult(null);
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Headless API</h1>
        <p className="text-muted-foreground">
          Uses <code>createEngine</code> and <code>getSchema</code> directly to build custom forms with complete control over rendering.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Rendered Form</CardTitle>
              <CardDescription>Schema generated per country without UI component dependencies.</CardDescription>
            </div>
            <Badge variant="secondary">Headless Core</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="headless-country" className="block text-sm font-medium mb-1.5">
              Country <span className="text-destructive ml-0.5">*</span>
            </label>
            <select
              id="headless-country"
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
                  <label htmlFor={`hl-${field.id}`} className="block text-sm font-medium mb-1.5">
                    {field.label}
                    {field.required && <span className="text-destructive ml-0.5">*</span>}
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
                <label htmlFor={`hl-${field.id}`} className="block text-sm font-medium mb-1.5">
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
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
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 mt-4">
        <Button onClick={handleValidate}>Validate</Button>
        <Button variant="secondary" onClick={handleFormat}>Format</Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
        </Button>
      </div>

      {validationResult && (
        <div
          className={`mt-4 rounded-lg p-4 text-sm border ${
            validationResult.valid
              ? "border-green-600/30 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {validationResult.valid ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Address is valid
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                Address validation failed with {validationResult.errors.length} error(s)
              </>
            )}
          </div>
        </div>
      )}

      {formatted && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Formatted Postal String</CardTitle>
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
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono border border-input">
            {JSON.stringify(values, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
