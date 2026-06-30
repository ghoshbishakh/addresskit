"use client";

import { useForm } from "react-hook-form";
import { AddressProviderContext } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressController } from "@addresskit/react-hook-form";
import type { Address } from "@addresskit/core";

const provider = createLibaddressinputProvider();

export default function RHFPage() {
  const { control, handleSubmit, formState } = useForm<{ address: Partial<Address> }>({
    defaultValues: { address: { country: "US" } },
  });

  function onSubmit(data: { address: Partial<Address> }) {
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <AddressProviderContext.Provider value={provider}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1>React Hook Form Integration</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AddressController
            name="address"
            control={control}
            rules={{
              validate: {
                requiredFields: (value) => {
                  const addr = value as Partial<Address>;
                  if (addr.country && !addr.line1) return "Street address is required";
                  return true;
                },
              },
            }}
          />

          {formState.errors.address?.message && (
            <p style={{ color: "red" }}>{formState.errors.address.message}</p>
          )}

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
        </form>
      </div>
    </AddressProviderContext.Provider>
  );
}
