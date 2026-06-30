"use client";

import { useState } from "react";
import { AddressProviderContext, Address } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import type { Address as AddressType } from "@addresskit/core";

const provider = createLibaddressinputProvider();

export default function BasicPage() {
  const [value, setValue] = useState<Partial<AddressType>>({});
  const [submitted, setSubmitted] = useState<Partial<AddressType> | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(value);
  }

  return (
    <AddressProviderContext.Provider value={provider}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1>Basic Address Form</h1>

        <form onSubmit={handleSubmit}>
          <Address value={value} onChange={setValue} />

          <button
            type="submit"
            style={{
              marginTop: 16,
              padding: "10px 24px",
              background: "#0066cc",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Submit
          </button>

          {submitted && (
            <pre
              style={{
                marginTop: 16,
                padding: 12,
                background: "#f5f5f5",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              {JSON.stringify(submitted, null, 2)}
            </pre>
          )}
        </form>
      </div>
    </AddressProviderContext.Provider>
  );
}
