"use client";

import { useState } from "react";
import { AddressProviderContext, Address } from "@addresskit/react";
import { createDr5hnProvider } from "@addresskit/providers-dr5hn";
import type { Address as AddressType } from "@addresskit/core";

const provider = createDr5hnProvider();

export default function Dr5hnPage() {
  const [value, setValue] = useState<Partial<AddressType>>({});
  const [submitted, setSubmitted] = useState<Partial<AddressType> | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(value);
  }

  return (
    <AddressProviderContext.Provider value={provider}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1>dr5hn Provider</h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          Uses the dr5hn Countries-States-Cities database. Supports 250 countries with per-country state/region lists. Falls back to a generic address format for countries without libaddressinput metadata.
        </p>

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
