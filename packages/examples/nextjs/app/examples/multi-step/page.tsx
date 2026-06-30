"use client";

import { useState } from "react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

const provider = createLibaddressinputProvider();

export default function MultiStepPage() {
  const [step, setStep] = useState(1);
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });
  const [submitted, setSubmitted] = useState(false);

  function handleNext() {
    if (step === 1 && value.country) setStep(2);
    else if (step === 2 && value.line1) setStep(3);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleFinish() {
    setSubmitted(true);
  }

  function handleReset() {
    setStep(1);
    setValue({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Submitted!</h1>
        <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto text-left mb-6">
          {JSON.stringify(value, null, 2)}
        </pre>
        <Button onClick={handleReset} variant="outline">Start Over</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Multi-Step Form</h1>
      <p className="text-muted-foreground mb-6">
        Wizard-style address form across multiple steps.
      </p>

      <div className="flex items-center gap-2 mb-8">
        <Badge variant={step >= 1 ? "default" : "outline"}>1. Country</Badge>
        <div className="h-px flex-1 bg-border" />
        <Badge variant={step >= 2 ? "default" : "outline"}>2. Address</Badge>
        <div className="h-px flex-1 bg-border" />
        <Badge variant={step >= 3 ? "default" : "outline"}>3. Review</Badge>
      </div>

      <AddressProviderContext.Provider value={provider}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Country</CardTitle>
            </CardHeader>
            <CardContent>
              <Address value={value} onChange={setValue} />
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Address</CardTitle>
            </CardHeader>
            <CardContent>
              <Address value={value} onChange={setValue} />
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 mt-4">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>Back</Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} disabled={step === 1 && !value.country}>
              Next
            </Button>
          ) : (
            <Button onClick={handleFinish}>Finish</Button>
          )}
        </div>
      </AddressProviderContext.Provider>
    </div>
  );
}
