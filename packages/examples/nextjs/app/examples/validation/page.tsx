"use client";

import { useState } from "react";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType, Field, FieldId } from "@addresskit/core";
import type { FieldComponents } from "@addresskit/react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

export default function ValidationPage() {
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleValidate() {
    if (!value.country) return;
    const result = await engine.validate(value as AddressType);
    const errorMap: Record<string, string> = {};
    for (const err of result.errors) {
      if (!errorMap[err.field]) errorMap[err.field] = err.message;
    }
    setErrors(errorMap);
  }

  function clearError(id: string) {
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  const componentsWithErrors: FieldComponents = {
    Input: ({ field, value: val, error, onChange }: { field: Field; value: string; error?: string; onChange: (id: FieldId, value: string) => void }) => (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        <input
          value={val}
          onChange={(e) => {
            onChange(field.id, e.target.value);
            clearError(field.id);
          }}
          placeholder={field.placeholder}
          className={`w-full h-10 px-3 rounded-lg border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            error ? "border-destructive" : "border-input"
          }`}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    ),
    Select: ({ field, value: val, error, onChange }: { field: Field; value: string; error?: string; onChange: (id: FieldId, value: string) => void }) => (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        <select
          value={val}
          onChange={(e) => {
            onChange(field.id, e.target.value);
            clearError(field.id);
          }}
          className={`w-full h-10 px-3 rounded-lg border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            error ? "border-destructive" : "border-input"
          }`}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    ),
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Validation</h1>
      <p className="text-muted-foreground mb-8">
        Inline per-field errors with the engine&apos;s built-in validation.
      </p>

      <AddressProviderContext.Provider value={provider}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Address</CardTitle>
              {!hasErrors && Object.keys(errors).length > 0 && (
                <Badge variant="default">Valid</Badge>
              )}
              {hasErrors && <Badge variant="destructive">Has errors</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <Address
              value={value}
              onChange={(v) => {
                setValue(v);
                setErrors({});
              }}
              components={componentsWithErrors}
            />
          </CardContent>
        </Card>

        <div className="mt-4 flex gap-3">
          <Button onClick={handleValidate}>Validate</Button>
        </div>

        {!hasErrors && Object.keys(errors).length > 0 && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> All fields are valid
          </p>
        )}
      </AddressProviderContext.Provider>
    </div>
  );
}
