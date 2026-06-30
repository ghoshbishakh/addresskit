"use client";

import { useState, useEffect } from "react";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import type { Address, Field } from "@addresskit/core";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

export default function HeadlessPage() {
  const [country, setCountry] = useState("US");
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Partial<Address>>({ country: "US" });
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    engine.getSchema(country).then((schema) => {
      setFields(schema.fields);
    });
  }, [country]);

  async function handleCountryChange(code: string) {
    setCountry(code);
    setValues({ country: code });
    setFormatted("");
  }

  function handleFieldChange(id: string, val: string) {
    const next = { ...values, [id]: val || undefined };
    setValues(next);

    if (next.country && next.line1) {
      setFormatted(engine.format(next as Address));
    }
  }

  async function handleValidate() {
    if (!values.country || !values.line1) return;
    const result = await engine.validate(values as Address);
    if (result.valid) {
      alert("Address is valid");
    } else {
      alert("Errors:\n" + result.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n"));
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1>Headless API Example</h1>
      <p style={{ color: "#666", fontSize: 14 }}>
        This example uses <code>createEngine</code> directly, without the <code>{"<Address>"}</code> component.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Country
        </label>
        <select
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            boxSizing: "border-box",
            background: "#fff",
          }}
        >
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="CA">Canada</option>
          <option value="DE">Germany</option>
          <option value="JP">Japan</option>
        </select>
      </div>

      {fields.map((field) => (
        <div key={field.id} style={{ marginBottom: 12 }}>
          <label
            htmlFor={`hl-${field.id}`}
            style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
          >
            {field.label}
            {field.required && <span style={{ color: "red" }}> *</span>}
          </label>
          <input
            id={`hl-${field.id}`}
            placeholder={field.placeholder}
            value={(values[field.id as keyof Address] as string) ?? ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 4,
              boxSizing: "border-box",
            }}
          />
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={handleValidate}
          style={{
            padding: "10px 24px",
            background: "#0066cc",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Validate
        </button>
      </div>

      {formatted && (
        <div style={{ marginTop: 16 }}>
          <h3>Formatted Address</h3>
          <pre
            style={{
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 4,
              fontSize: 14,
              whiteSpace: "pre-wrap",
            }}
          >
            {formatted}
          </pre>
        </div>
      )}
    </div>
  );
}
