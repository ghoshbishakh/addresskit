"use client";

import { useState } from "react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType, Field, FieldId } from "@addresskit/core";
import type { FieldComponents } from "@addresskit/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const provider = createLibaddressinputProvider();

const customComponents: FieldComponents = {
  Input: ({ field, value, error, onChange }: { field: Field; value: string; error?: string; onChange: (id: FieldId, value: string) => void }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        className={`w-full h-11 px-4 rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  ),
  Select: ({ field, value, error, onChange }: { field: Field; value: string; error?: string; onChange: (id: FieldId, value: string) => void }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Select {field.label.toLowerCase()}...</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
};

export default function CustomFieldsPage() {
  const [value, setValue] = useState<Partial<AddressType>>({});

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Custom Field Components</h1>
      <p className="text-muted-foreground mb-8">
        Override default inputs with your own styled components via the <code>components</code> prop.
      </p>

      <AddressProviderContext.Provider value={provider}>
        <Card>
          <CardHeader>
            <CardTitle>Styled Address</CardTitle>
          </CardHeader>
          <CardContent>
            <Address
              value={value}
              onChange={setValue}
              components={customComponents}
            />
          </CardContent>
        </Card>

        {value.country && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Value</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </AddressProviderContext.Provider>
    </div>
  );
}
