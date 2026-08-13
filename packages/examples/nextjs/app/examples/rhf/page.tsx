"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext } from "@addresskit/react";
import { AddressController, addressValidationRule } from "@addresskit/react-hook-form";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, RotateCcw, ChevronLeft, Layers } from "lucide-react";

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
      recipientName: "Jane Doe",
      address: {
        country: "US",
        line1: "1600 Amphitheatre Pkwy",
        locality: "Mountain View",
        administrativeArea: "CA",
        postalCode: "94043",
      },
    },
  });

  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [formatted, setFormatted] = useState<string>(
    "1600 Amphitheatre Pkwy\nMountain View, CA 94043\nUnited States",
  );

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/examples" className="hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examples
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">React Hook Form</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Layers className="h-3 w-3" /> Form Integration
          </Badge>
          <Badge variant="outline" className="text-xs">RHF Adapter</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          React Hook Form Controller
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Connect address forms directly into <code>react-hook-form</code> with <code>&lt;AddressController&gt;</code> and <code>addressValidationRule</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <AddressProviderContext.Provider value={provider}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="border-border/80">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Checkout Shipping Details</CardTitle>
                    <Badge variant="secondary" className="text-xs">Controller</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Controlled form values and asynchronous validation managed by React Hook Form.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="rhf-name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Recipient Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="rhf-name"
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

                  <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-border/60">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Validating..." : "Submit Shipping Form"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleReset}>
                      <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </AddressProviderContext.Provider>
        </div>

        <div className="lg:col-span-5 space-y-5">
          {submittedData && (
            <div className="rounded-xl p-4 text-sm border border-green-600/30 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Submitted successfully to React Hook Form
              </div>
            </div>
          )}

          <Card className="border-border/80">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Formatted Mailing Label
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-foreground p-3.5 rounded-lg bg-muted/50 border border-input leading-relaxed">
                {formatted || "Submit the form to generate postal label..."}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Form State Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="font-mono text-xs text-muted-foreground p-3.5 rounded-lg bg-muted/50 border border-input overflow-x-auto max-h-56 overflow-y-auto">
                {JSON.stringify(submittedData ?? { status: "Awaiting submission" }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
