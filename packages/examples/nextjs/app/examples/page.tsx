"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Globe,
  Database,
  Cpu,
  Layers,
  ShieldAlert,
  Paintbrush,
  ListOrdered,
  CheckCircle2,
  Workflow,
  ArrowUpRight,
} from "lucide-react";

type Category = "all" | "core" | "providers" | "integrations" | "patterns";

interface ExampleItem {
  href: string;
  title: string;
  desc: string;
  badge: string;
  category: "core" | "providers" | "integrations" | "patterns";
  icon: typeof Globe;
}

const EXAMPLES: ExampleItem[] = [
  {
    href: "/examples/libaddress",
    title: "libaddressinput Provider",
    desc: "Standard form using Google libaddressinput metadata across 256 countries.",
    badge: "Provider",
    category: "providers",
    icon: Globe,
  },
  {
    href: "/examples/dr5hn",
    title: "dr5hn Dataset Provider",
    desc: "Address form with extensive state and province lists from the dr5hn database.",
    badge: "Provider",
    category: "providers",
    icon: Database,
  },
  {
    href: "/examples/headless",
    title: "Headless Engine API",
    desc: "Build custom form layouts using createEngine without UI component dependencies.",
    badge: "Advanced",
    category: "core",
    icon: Cpu,
  },
  {
    href: "/examples/rhf",
    title: "React Hook Form",
    desc: "Direct integration using AddressController and addressValidationRule.",
    badge: "Integration",
    category: "integrations",
    icon: Layers,
  },
  {
    href: "/examples/restricted",
    title: "Country Restricted",
    desc: "Restrict available destinations to specific ISO-3166-1 country codes.",
    badge: "Feature",
    category: "core",
    icon: ShieldAlert,
  },
  {
    href: "/examples/custom-fields",
    title: "Custom Field Inputs",
    desc: "Override default inputs with your own styled design system components.",
    badge: "Customization",
    category: "core",
    icon: Paintbrush,
  },
  {
    href: "/examples/multi-step",
    title: "Multi-Step Wizard",
    desc: "Wizard form splitting country selection, dynamic details, and review steps.",
    badge: "Pattern",
    category: "patterns",
    icon: ListOrdered,
  },
  {
    href: "/examples/validation",
    title: "Validation & Errors",
    desc: "Real-time and manual validation with per-field error messages.",
    badge: "Validation",
    category: "core",
    icon: CheckCircle2,
  },
  {
    href: "/examples/cascading",
    title: "Cascade Clearing",
    desc: "Observe how switching countries preserves valid lines while resetting invalid states.",
    badge: "Behavior",
    category: "patterns",
    icon: Workflow,
  },
];

export default function ExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const filtered = selectedCategory === "all"
    ? EXAMPLES
    : EXAMPLES.filter((ex) => ex.category === selectedCategory);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Example Gallery</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Explore production-ready patterns, custom provider integrations, headless workflows, and validation examples.
        </p>

        <div className="flex flex-wrap gap-2 mt-6">
          {(
            [
              { key: "all", label: "All Examples" },
              { key: "core", label: "Core Features" },
              { key: "providers", label: "Data Providers" },
              { key: "integrations", label: "Integrations" },
              { key: "patterns", label: "UI Patterns" },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.key}
              type="button"
              variant={selectedCategory === tab.key ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setSelectedCategory(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((example) => {
          const Icon = example.icon;
          return (
            <Link key={example.href} href={example.href} className="group block">
              <Card className="h-full border-border/80 hover:border-primary/50 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-medium">
                      {example.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{example.title}</span>
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {example.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
