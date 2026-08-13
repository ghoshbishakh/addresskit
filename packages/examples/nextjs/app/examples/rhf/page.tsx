"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext } from "@addresskit/react";
import { AddressController, addressValidationRule } from "@addresskit/react-hook-form";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, RotateCcw } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

interface FormData {
  recipientName: string;
  address: Partial<AddressType>;
}

export default function RHFPage() {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      recipientName: "",
      address: { country: "US" },
    },
  });

  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [formatted, setFormatted] = useState<string>("");

  async function onSubmit(data: FormData) {
    const formattedAddress = await engine.format(data.address as AddressType);
    setFormatted(formattedAddress);
    setSubmittedData(data);
  }

  function handleReset() {
    reset({
      recipientName: "",
      address: { country: "US" },
    });
    setSubmittedData(null);
    setFormatted("");
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">React Hook Form</h1>
        <p className="text-muted-foreground">
          Integrates <code>&lt;AddressController&gt;</code> and <code>addressValidationRule</code> with React Hook Form validation pipelines.
        </p>
      </div>

      <AddressProviderContext.Provider value={provider}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Checkout Shipping Address</CardTitle>
                  <CardDescription>Controlled form state managed by React Hook Form.</CardDescription>
                </div>
                <Badge variant="secondary">RHF Integration</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="recipient-name" className="block text-sm font-medium mb-1.5">
                  Recipient Name <span className="text-destructive ml-0.5">*</span>
                </label>
                <input
                  id="recipient-name"
                  placeholder="Jane Doe"
                  {...register("recipientName", { required: "Recipient name is required" })}
                  className={`w-full h-10 px-3 rounded-lg border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    errors.recipientName ? "border-destructive ring-1 ring-destructive" : "border-input"
                  }`}
                />
                {errors.recipientName && (
                  <p className="mt-1 text-xs text-destructive">{errors.recipientName.message}</p>
                )}
              </div>

              <div className="pt-2">
                <AddressController
                  name="address"
                  control={control}
                  rules={{
                    validate: addressValidationRule(provider),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Validating..." : "Submit Order Address"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
            </Button>
          </div>

          {submittedData && formatted && (
            <Card className="mt-6 border-green-600/30 bg-green-50/40 dark:bg-green-950/20">
              <CardHeader>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <CardTitle className="text-lg">Form Submitted Successfully</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Recipient & Address
                  </h2>
                  <div className="p-4 rounded-lg bg-background border border-input text-sm">
                    <p className="font-semibold text-foreground mb-1">{submittedData.recipientName}</p>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                      {formatted}
                    </pre>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Form State Payload
                  </h2>
                  <pre className="text-xs bg-background p-4 rounded-lg overflow-x-auto font-mono border border-input">
                    {JSON.stringify(submittedData, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </AddressProviderContext.Provider>
    </div>
  );
}
