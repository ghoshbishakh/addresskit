"use client";

import { useState } from "react";
import { createDr5hnProvider } from "@addresskit/providers-dr5hn";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const provider = createDr5hnProvider();

export default function Dr5hnPage() {
  const [value, setValue] = useState<Partial<AddressType>>({});
  const [submitted, setSubmitted] = useState<Partial<AddressType> | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(value);
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">dr5hn Provider</h1>
      <p className="text-muted-foreground mb-8">
        Uses the dr5hn Countries-States-Cities database. Supports 250 countries with per-country state/region lists.
      </p>

      <AddressProviderContext.Provider value={provider}>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <Address value={value} onChange={setValue} />
            </CardContent>
          </Card>

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
