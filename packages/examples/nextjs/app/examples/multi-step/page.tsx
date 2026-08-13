"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { getCountries, getCountryName } from "@addresskit/data";
import type { Address as AddressType, Field, FieldId } from "@addresskit/core";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, ChevronRight, ChevronLeft, RotateCcw, MapPin, Building, Globe, ListOrdered } from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);
const countries = getCountries();

export default function MultiStepPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });
  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formatted, setFormatted] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const prevCountryRef = useRef<string | null>(value.country ?? null);

  useEffect(() => {
    if (!value.country) {
      setFields([]);
      return;
    }

    engine.getSchema(value.country).then((schema) => {
      setFields(schema.fields);
    });
  }, [value.country]);

  function handleCountryChange(newCountry: string) {
    const oldCountry = prevCountryRef.current;
    prevCountryRef.current = newCountry;

    const cleaned = oldCountry
      ? engine.clearInvalidValues(value as AddressType, oldCountry, newCountry)
      : { country: newCountry };

    setValue(cleaned);
    setErrors({});
    setFormatted("");
  }

  function handleFieldChange(id: FieldId, val: string) {
    const updated = { ...value, [id]: val || undefined };

    if (id === "administrativeArea") {
      const cleaned = engine.clearState(updated as AddressType);
      setValue({ ...cleaned, administrativeArea: val || undefined });
    } else {
      setValue(updated);
    }

    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  function handleNextStep1() {
    if (!value.country) return;
    setStep(2);
  }

  async function handleNextStep2() {
    if (!value.country) return;

    const validation = await engine.validate(value as AddressType);
    if (!validation.valid) {
      const errorMap: Record<string, string> = {};
      for (const err of validation.errors) {
        errorMap[err.field] = err.message;
      }
      setErrors(errorMap);
      return;
    }

    setErrors({});
    const formattedResult = await engine.format(value as AddressType);
    setFormatted(formattedResult);
    setStep(3);
  }

  function handleBack() {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  }

  function handleFinish() {
    setSubmitted(true);
  }

  function handleReset() {
    setStep(1);
    setValue({ country: "US" });
    setErrors({});
    setFormatted("");
    setSubmitted(false);
  }

  const selectedCountryName = value.country ? getCountryName(value.country) : "";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/examples" className="hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examples
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Multi-Step Wizard</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <ListOrdered className="h-3 w-3" /> UI Pattern
          </Badge>
          <Badge variant="outline" className="text-xs">Wizard Workflow</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Multi-Step Address Wizard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Wizard flow splitting country selection, dynamic details, and review steps with validation gating.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8" aria-label="Form progress">
        <Badge variant={step === 1 ? "default" : step > 1 ? "secondary" : "outline"} className="gap-1 text-xs">
          <Globe className="h-3 w-3" /> 1. Country
        </Badge>
        <div className="h-px flex-1 bg-border" />
        <Badge variant={step === 2 ? "default" : step > 2 ? "secondary" : "outline"} className="gap-1 text-xs">
          <Building className="h-3 w-3" /> 2. Details
        </Badge>
        <div className="h-px flex-1 bg-border" />
        <Badge variant={step === 3 ? "default" : "outline"} className="gap-1 text-xs">
          <MapPin className="h-3 w-3" /> 3. Review
        </Badge>
      </div>

      {submitted ? (
        <Card className="border-green-600/30 bg-green-50/40 dark:bg-green-950/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Address Submitted Successfully</CardTitle>
            <CardDescription className="text-xs">
              The address validated and formatted per {selectedCountryName} standards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Formatted Mailing Label
              </h2>
              <pre className="whitespace-pre-wrap rounded-lg bg-background p-4 text-xs font-mono border border-input leading-relaxed">
                {formatted}
              </pre>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Payload
              </h2>
              <pre className="rounded-lg bg-background p-4 text-xs font-mono border border-input overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>

            <Button onClick={handleReset} variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" /> Start Over
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {step === 1 && (
            <Card className="border-border/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Step 1: Select Country & Region</CardTitle>
                <CardDescription className="text-xs">
                  Choose the destination country to load specific address schema requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="country-select" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Country or Region <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="country-select"
                    value={value.country ?? ""}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select country...</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {value.country && (
                  <div className="rounded-lg bg-muted/50 p-4 text-xs space-y-1 text-muted-foreground border border-input">
                    <p>
                      <strong className="text-foreground">Selected Destination:</strong> {selectedCountryName} ({value.country})
                    </p>
                    <p>
                      <strong className="text-foreground">Required Fields:</strong>{" "}
                      {fields.filter((f) => f.required).map((f) => f.label).join(", ") || "None"}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t border-border/60">
                  <Button onClick={handleNextStep1} disabled={!value.country}>
                    Next: Address Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-border/80">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Step 2: Enter Address Details</CardTitle>
                    <CardDescription className="text-xs">
                      Address structure configured for {selectedCountryName}.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">{value.country}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field) => {
                  const fieldValue = (value[field.id as keyof AddressType] as string) ?? "";
                  const fieldError = errors[field.id];

                  if (field.type === "select" && field.options) {
                    return (
                      <div key={field.id}>
                        <label htmlFor={`ms-${field.id}`} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </label>
                        <select
                          id={`ms-${field.id}`}
                          value={fieldValue}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className={`w-full h-10 px-3.5 rounded-lg border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            fieldError ? "border-destructive ring-1 ring-destructive" : "border-input"
                          }`}
                        >
                          <option value="">Select {field.label.toLowerCase()}...</option>
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {fieldError && (
                          <p className="mt-1 text-xs text-destructive">{fieldError}</p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={field.id}>
                      <label htmlFor={`ms-${field.id}`} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </label>
                      <input
                        id={`ms-${field.id}`}
                        placeholder={field.placeholder}
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`w-full h-10 px-3.5 rounded-lg border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          fieldError ? "border-destructive ring-1 ring-destructive" : "border-input"
                        }`}
                      />
                      {fieldError && (
                        <p className="mt-1 text-xs text-destructive">{fieldError}</p>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-between pt-4 border-t border-border/60">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Country
                  </Button>
                  <Button onClick={handleNextStep2}>
                    Next: Review <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-border/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Step 3: Review & Confirm</CardTitle>
                <CardDescription className="text-xs">
                  Verify formatted postal address before submitting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Formatted Mailing Address
                  </h2>
                  <div className="p-4 rounded-lg bg-muted/50 border border-input font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {formatted || "No formatted address available"}
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Field-by-Field Breakdown
                  </h2>
                  <div className="rounded-lg border border-input divide-y divide-border text-xs">
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">Country</span>
                      <span className="font-medium">{selectedCountryName} ({value.country})</span>
                    </div>
                    {value.line1 && (
                      <div className="flex justify-between p-2.5">
                        <span className="text-muted-foreground">Address Line 1</span>
                        <span className="font-medium">{value.line1}</span>
                      </div>
                    )}
                    {value.line2 && (
                      <div className="flex justify-between p-2.5">
                        <span className="text-muted-foreground">Address Line 2</span>
                        <span className="font-medium">{value.line2}</span>
                      </div>
                    )}
                    {value.locality && (
                      <div className="flex justify-between p-2.5">
                        <span className="text-muted-foreground">City / Locality</span>
                        <span className="font-medium">{value.locality}</span>
                      </div>
                    )}
                    {value.administrativeArea && (
                      <div className="flex justify-between p-2.5">
                        <span className="text-muted-foreground">State / Province</span>
                        <span className="font-medium">{value.administrativeArea}</span>
                      </div>
                    )}
                    {value.postalCode && (
                      <div className="flex justify-between p-2.5">
                        <span className="text-muted-foreground">Postal Code</span>
                        <span className="font-medium">{value.postalCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border/60">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Edit Details
                  </Button>
                  <Button onClick={handleFinish}>
                    Submit Address <CheckCircle2 className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
