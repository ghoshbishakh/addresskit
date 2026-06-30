"use client";

import { useState, useEffect } from "react";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { getCountries } from "@addresskit/data";
import type { Address, Field } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

// Lightweight country index from @addresskit/data — no per-country metadata
// is loaded just to populate this list.
const countries = getCountries();

export default function HeadlessPage() {
  const [country, setCountry] = useState("US");
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Partial<Address>>({ country: "US" });
  const [formatted, setFormatted] = useState("");
  const [validationResult, setValidationResult] = useState<string | null>(null);

  useEffect(() => {
    engine.getSchema(country).then((schema) => {
      setFields(schema.fields);
    });
  }, [country]);

  async function handleCountryChange(code: string) {
    setCountry(code);
    setValues({ country: code });
    setFormatted("");
    setValidationResult(null);
  }

  function handleFieldChange(id: string, val: string) {
    const next = { ...values, [id]: val || undefined };
    setValues(next);
  }

  async function handleValidate() {
    if (!values.country) return;
    const result = await engine.validate(values as Address);
    setValidationResult(result.valid ? "valid" : "invalid");
  }

  async function handleFormat() {
    if (!values.country || !values.line1) return;
    setFormatted(await engine.format(values as Address));
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Headless API</h1>
      <p className="text-muted-foreground mb-8">
        Uses <code>createEngine</code> directly, without the <code>{"<Address>"}</code> component.
      </p>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {countries.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          {fields.map((field) => (
            <div key={field.id}>
              <label htmlFor={`hl-${field.id}`} className="block text-sm font-medium mb-1">
                {field.label}
                {field.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
              <input
                id={`hl-${field.id}`}
                placeholder={field.placeholder}
                value={(values[field.id as keyof Address] as string) ?? ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 mt-4">
        <Button onClick={handleValidate}>Validate</Button>
        <Button variant="secondary" onClick={handleFormat}>Format</Button>
      </div>

      {validationResult && (
        <p className={`mt-3 text-sm ${validationResult === "valid" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
          Address is {validationResult === "valid" ? "valid" : "invalid"}
        </p>
      )}

      {formatted && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Formatted Address</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
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
          <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(values, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
