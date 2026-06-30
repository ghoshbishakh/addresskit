"use client";

import { useState } from "react";
import { AddressProviderContext, Address } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import type { Address as AddressType } from "@addresskit/core";

const provider = createLibaddressinputProvider();

export default function CountryRestrictedPage() {
  const [value, setValue] = useState<Partial<AddressType>>({});

  return (
    <AddressProviderContext.Provider value={provider}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1>Country-Restricted Address</h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          Only US, GB, and CA are allowed. The country dropdown shows only these options.
        </p>

        <Address
          value={value}
          onChange={setValue}
          allowedCountries={["US", "GB", "CA"]}
        />

        {value.country && (
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            {JSON.stringify(value, null, 2)}
          </pre>
        )}
      </div>
    </AddressProviderContext.Provider>
  );
}
