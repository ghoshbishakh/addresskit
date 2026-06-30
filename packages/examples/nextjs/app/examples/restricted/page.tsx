"use client";

import { useState } from "react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

const provider = createLibaddressinputProvider();

export default function RestrictedPage() {
  const [value, setValue] = useState<Partial<AddressType>>({});

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Country-Restricted Address</h1>
      <p className="text-muted-foreground mb-8">
        Only US, GB, and CA are allowed. The country dropdown shows only these options.
      </p>

      <AddressProviderContext.Provider value={provider}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Address</CardTitle>
              <Badge variant="secondary">Restricted</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Address
              value={value}
              onChange={setValue}
              allowedCountries={["US", "GB", "CA"]}
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
