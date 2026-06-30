"use client";

import { useState, useCallback } from "react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { createDr5hnProvider } from "@addresskit/providers-dr5hn";
import { createEngine } from "@addresskit/core";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs } from "../../components/ui/tabs";
import { CheckCircle, XCircle, Copy, RotateCcw } from "lucide-react";

const libinputProvider = createLibaddressinputProvider();
const dr5hnProvider = createDr5hnProvider();
const engine = createEngine(libinputProvider);

export default function PlaygroundPage() {
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });
  const [providerType, setProviderType] = useState<"libaddressinput" | "dr5hn">("libaddressinput");
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [formatted, setFormatted] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const provider = providerType === "libaddressinput" ? libinputProvider : dr5hnProvider;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  async function handleValidate() {
    if (!value.country) return;
    const result = await engine.validate(value as AddressType);
    setValidationResult(result.valid ? "valid" : "invalid");
    setFormatted(null);
  }

  async function handleFormat() {
    if (!value.country || !value.line1) return;
    setFormatted(await engine.format(value as AddressType));
    setValidationResult(null);
  }

  function handleReset() {
    setValue({ country: "US" });
    setValidationResult(null);
    setFormatted(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
        <p className="mt-2 text-muted-foreground">
          Interactive address form. Toggle providers, validate, and format.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <AddressProviderContext.Provider value={provider}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Address Form</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={providerType === "libaddressinput" ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setProviderType("libaddressinput")}
                    >
                      libaddressinput
                    </Badge>
                    <Badge
                      variant={providerType === "dr5hn" ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setProviderType("dr5hn")}
                    >
                      dr5hn
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Address value={value} onChange={setValue} />
              </CardContent>
            </Card>
          </AddressProviderContext.Provider>

          <div className="flex flex-wrap gap-3 mt-4">
            <Button onClick={handleValidate} disabled={!value.country}>
              {validationResult === "valid" && <CheckCircle className="h-4 w-4 mr-1" />}
              {validationResult === "invalid" && <XCircle className="h-4 w-4 mr-1" />}
              Validate
            </Button>
            <Button variant="secondary" onClick={handleFormat} disabled={!value.country}>
              Format
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>

          {validationResult === "valid" && (
            <p className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Address is valid
            </p>
          )}
          {validationResult === "invalid" && (
            <p className="mt-3 text-sm text-destructive flex items-center gap-1">
              <XCircle className="h-4 w-4" /> Address is invalid
            </p>
          )}

          {formatted && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Formatted Address</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {formatted}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>JSON Output</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Provider Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {providerType === "libaddressinput" ? (
                <>
                  <p><strong>Source:</strong> Google libaddressinput</p>
                  <p><strong>Countries:</strong> 256</p>
                  <p><strong>Metadata:</strong> Format, required fields, postal patterns, sub-regions</p>
                </>
              ) : (
                <>
                  <p><strong>Source:</strong> dr5hn countries-states-cities</p>
                  <p><strong>Countries:</strong> 250</p>
                  <p><strong>States:</strong> Per-country state lists</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
