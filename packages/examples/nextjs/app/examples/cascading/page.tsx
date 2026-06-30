"use client";

import { useState } from "react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

const provider = createLibaddressinputProvider();

export default function CascadingPage() {
  const [value, setValue] = useState<Partial<AddressType>>({});

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Cascade Clear</h1>
      <p className="text-muted-foreground mb-4">
        Changing country clears state, city, and invalid fields. Changing state clears city.
        Try it: fill in fields, then switch countries.
      </p>

      <AddressProviderContext.Provider value={provider}>
        <Card>
          <CardContent className="pt-6">
            <Address value={value} onChange={setValue} />
          </CardContent>
        </Card>

        {value.country && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </AddressProviderContext.Provider>
    </div>
  );
}
