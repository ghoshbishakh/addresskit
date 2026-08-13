"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Globe,
  Zap,
  Package,
  Cpu,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Terminal,
} from "lucide-react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

const COUNTRY_PRESETS = [
  { code: "US", name: "United States", flag: "US" },
  { code: "CA", name: "Canada", flag: "CA" },
  { code: "GB", name: "United Kingdom", flag: "GB" },
  { code: "DE", name: "Germany", flag: "DE" },
  { code: "JP", name: "Japan", flag: "JP" },
  { code: "AU", name: "Australia", flag: "AU" },
];

const CODE_EXAMPLES = {
  react: `import { useState } from "react";
import { Address, AddressProviderContext } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";

const provider = createLibaddressinputProvider();

export function CheckoutForm() {
  const [address, setAddress] = useState({ country: "US" });

  return (
    <AddressProviderContext.Provider value={provider}>
      <Address value={address} onChange={setAddress} />
    </AddressProviderContext.Provider>
  );
}`,
  headless: `import { useAddressForm } from "@addresskit/react";

export function CustomAddressUI() {
  const { address, setCountry, setFieldValue, fields, errors } = useAddressForm({
    initialAddress: { country: "US" },
  });

  return (
    <form>
      {fields.map((field) => (
        <div key={field.id}>
          <label>{field.label}</label>
          <input
            value={address[field.id] ?? ""}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
          />
          {errors[field.id] && <span>{errors[field.id]}</span>}
        </div>
      ))}
    </form>
  );
}`,
  backend: `import { validateAddress, normalizeAddress, formatAddress } from "@addresskit/validation";

// Server Actions / Express / Hono / Edge runtime
export async function processShipping(input: unknown) {
  // 1. Normalize input (trim, uppercase codes)
  const normalized = await normalizeAddress(input);

  // 2. Validate required fields, postal patterns, and states
  const validation = await validateAddress(normalized);
  if (!validation.valid) {
    throw new Error("Address validation failed: " + JSON.stringify(validation.errors));
  }

  // 3. Format into postal mailing string
  const postalLabel = await formatAddress(normalized);
  return { success: true, postalLabel };
}`,
  zod: `import { createAddressSchema } from "@addresskit/zod";
import { z } from "zod";

// Build a dynamic Zod schema from country metadata
const schema = await createAddressSchema("US");

const OrderSchema = z.object({
  customerName: z.string().min(1),
  shippingAddress: schema,
});`,
};

const FEATURES = [
  {
    icon: Globe,
    title: "256 Countries & Territories",
    metric: "256",
    description: "Country-specific address ordering, dynamic subregion labels, and postal patterns from Google libaddressinput.",
  },
  {
    icon: Zap,
    title: "Zero API Keys / 100% Offline",
    metric: "0 Keys",
    description: "Operates entirely offline without external HTTP calls, rate limits, geocoding fees, or network waterfalls.",
  },
  {
    icon: Package,
    title: "Lazy-Loaded Dynamic Chunks",
    metric: "<2kB",
    description: "Country metadata loads on demand via dynamic imports. Ship minimal JavaScript without giant JSON bundles.",
  },
  {
    icon: Cpu,
    title: "Headless Core Engine",
    metric: "0 DOM",
    description: "Zero UI dependencies in @addresskit/core. Pure validation, normalization, and formatting algorithms run anywhere.",
  },
  {
    icon: ShieldCheck,
    title: "Edge & Server Validation",
    metric: "100%",
    description: "Validate addresses in Node.js, Deno, Bun, Cloudflare Workers, Next.js Server Actions, or Express pipelines.",
  },
  {
    icon: Code2,
    title: "React & React Hook Form",
    metric: "RHF Ready",
    description: "Includes controlled <Address>, compound primitives, headless hooks, and first-class React Hook Form controllers.",
  },
];

export default function HomePage() {
  const [address, setAddress] = useState<Partial<AddressType>>({
    country: "US",
    line1: "1600 Amphitheatre Pkwy",
    locality: "Mountain View",
    administrativeArea: "CA",
    postalCode: "94043",
  });
  const [formatted, setFormatted] = useState(
    "1600 Amphitheatre Pkwy\nMountain View, CA 94043\nUnited States",
  );
  const [activeCodeTab, setActiveCodeTab] = useState<keyof typeof CODE_EXAMPLES>("react");
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [, startTransition] = useTransition();

  async function handleCountrySelect(code: string) {
    const oldCountry = address.country;
    const cleaned = oldCountry
      ? engine.clearInvalidValues(address as AddressType, oldCountry, code)
      : { country: code };

    setAddress(cleaned);
    const result = await engine.format(cleaned as AddressType);
    setFormatted(result);
  }

  function handleAddressChange(updated: Partial<AddressType>) {
    setAddress(updated);
    startTransition(async () => {
      if (updated.country) {
        const result = await engine.format(updated as AddressType);
        setFormatted(result);
      }
    });
  }

  function copyInstall() {
    navigator.clipboard.writeText("npm install addresskit");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  }

  function copyCode() {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>v0.0.1 Alpha - Modern Address Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
            Dynamic Address Forms <br className="hidden sm:inline" />
            <span className="text-primary">and Offline Validation</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Render country-specific address fields, validate postal patterns, and format postal strings across 256 countries with zero external API dependencies.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/docs">
              <Button size="lg" className="w-full sm:w-auto font-semibold gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/playground">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium">
                Live Playground
              </Button>
            </Link>
            <div
              onClick={copyInstall}
              className="group flex items-center gap-2 rounded-lg border border-input bg-card/80 px-4 py-2.5 text-xs font-mono text-foreground cursor-pointer hover:border-primary/50 transition-colors"
              title="Click to copy"
            >
              <Terminal className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>npm install addresskit</span>
              {copiedInstall ? (
                <Check className="h-3.5 w-3.5 text-green-600 ml-1" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground ml-1" />
              )}
            </div>
          </div>
        </div>

        {/* Live Hero Interactive Workbench */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-14">
          <div className="rounded-2xl border border-border/80 bg-card shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border/60">
              <div>
                <h2 className="text-base font-semibold text-foreground">Interactive Country Preview</h2>
                <p className="text-xs text-muted-foreground">
                  Select a preset country to observe instant schema transformation and postal formatting.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRY_PRESETS.map((p) => (
                  <Button
                    key={p.code}
                    type="button"
                    variant={address.country === p.code ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8 px-2.5"
                    onClick={() => handleCountrySelect(p.code)}
                  >
                    <span className="font-semibold">{p.flag}</span>
                    <span className="ml-1 hidden md:inline">{p.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <AddressProviderContext.Provider value={provider}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 bg-background/50 rounded-xl p-4 sm:p-6 border border-input/60">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dynamic Form ({address.country})
                    </span>
                    <Badge variant="secondary" className="text-[11px] font-mono">
                      Controlled UI
                    </Badge>
                  </div>
                  <Address value={address} onChange={handleAddressChange} />
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border/80 bg-muted/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Formatted Postal Envelope
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-background">
                        formatAddress()
                      </Badge>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-foreground p-3.5 rounded-lg bg-background border border-input leading-relaxed">
                      {formatted || "Enter address details above to format..."}
                    </pre>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-muted/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Normalized Address State
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-background">
                        State JSON
                      </Badge>
                    </div>
                    <pre className="font-mono text-[11px] text-muted-foreground p-3.5 rounded-lg bg-background border border-input overflow-x-auto max-h-40 overflow-y-auto">
                      {JSON.stringify(address, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </AddressProviderContext.Provider>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-muted/30 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Engineered for Real-World Address Complexity
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Address fields vary dramatically worldwide. AddressKit handles layout orders, localized labels, and validation rules automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => (
              <Card key={feat.title} className="hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feat.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs font-semibold">
                      {feat.metric}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold">{feat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {feat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tabbed Code Showcase */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Simple, Intuitive Developer APIs
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Designed for flexibility. Use drop-in React components, headless hooks, backend validators, or Zod schemas.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/60 border-b border-border">
              <div className="flex items-center gap-1">
                {(["react", "headless", "backend", "zod"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      activeCodeTab === tab
                        ? "bg-background text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "react" && "React Component"}
                    {tab === "headless" && "Headless Hook"}
                    {tab === "backend" && "Server Validation"}
                    {tab === "zod" && "Zod Schema"}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={copyCode} className="h-7 text-xs gap-1">
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Code
                  </>
                )}
              </Button>
            </div>
            <pre className="p-5 font-mono text-xs sm:text-sm bg-card text-foreground overflow-x-auto leading-relaxed">
              <code>{CODE_EXAMPLES[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-14 border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">256</p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">Countries & Territories</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">0 Keys</p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">100% Offline & Free</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">&lt;2kB</p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">Initial Chunk Size</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">MIT</p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">Open Source License</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
