"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext } from "@addresskit/react";
import { AddressController } from "@addresskit/react-hook-form";
import type { Address } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const provider = createLibaddressinputProvider();

export default function RHFPage() {
  const { control, handleSubmit, formState } = useForm<{ address: Partial<Address> }>({
    defaultValues: { address: { country: "US" } },
  });

  const [submitted, setSubmitted] = useState<{ address: Partial<Address> } | null>(null);

  function onSubmit(data: { address: Partial<Address> }) {
    setSubmitted(data);
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">React Hook Form</h1>
      <p className="text-muted-foreground mb-8">
        Integration with react-hook-form using AddressController.
      </p>

      <AddressProviderContext.Provider value={provider}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>

          {formState.errors.address?.message && (
            <p className="text-sm text-destructive mt-2">{formState.errors.address.message}</p>
          )}

          <div className="mt-4 flex gap-3">
            <Button type="submit">Submit</Button>
          </div>

          {submitted && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(submitted, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </form>
      </AddressProviderContext.Provider>
    </div>
  );
}
