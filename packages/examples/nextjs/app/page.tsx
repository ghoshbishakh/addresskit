"use client";

import { useState } from "react";
import Link from "next/link";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { AddressProviderContext, Address } from "@addresskit/react";
import type { Address as AddressType } from "@addresskit/core";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { MapPin, Globe, Package, Zap } from "lucide-react";

const provider = createLibaddressinputProvider();

const features = [
  {
    icon: Globe,
    title: "256 Countries",
    description:
      "Accurate address formats, field labels, and postal code validation from Google libaddressinput.",
  },
  {
    icon: Zap,
    title: "Lazy-Loaded",
    description:
      "Per-country data loaded on demand. No giant bundle. Each country is a separate chunk.",
  },
  {
    icon: Package,
    title: "Provider Pattern",
    description:
      "Swap data sources without changing your forms. libaddressinput, dr5hn, or custom.",
  },
  {
    icon: MapPin,
    title: "Headless Core",
    description:
      "Zero UI dependencies. Use the engine standalone or with React, Vue, Svelte.",
  },
];

export default function HomePage() {
  const [value, setValue] = useState<Partial<AddressType>>({ country: "US" });

  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-4">
          v0.0.1 - Alpha
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Headless Address Forms
          <br />
          <span className="text-primary">for React</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          256 countries, accurate field labels, postal code validation, lazy-loaded per country.
          Swap providers without changing your forms.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/docs">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/playground">
            <Button variant="outline" size="lg">
              Live Demo
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        <AddressProviderContext.Provider value={provider}>
          <Card className="overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold mb-4">Try it out</h2>
              <Address value={value} onChange={setValue} />
              {value.country && (
                <pre className="mt-4 p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </AddressProviderContext.Provider>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6">
                <feature.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl font-bold text-primary">256</p>
              <p className="text-sm text-muted-foreground">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">2</p>
              <p className="text-sm text-muted-foreground">Providers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">250+</p>
              <p className="text-sm text-muted-foreground">State Lists</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">MIT</p>
              <p className="text-sm text-muted-foreground">License</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
