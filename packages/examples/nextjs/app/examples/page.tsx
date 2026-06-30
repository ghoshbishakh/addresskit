import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const examples = [
  {
    href: "/examples/libaddress",
    title: "libaddressinput Provider",
    desc: "Basic address form with Google libaddressinput metadata. All 256 countries.",
    badge: "Basic",
  },
  {
    href: "/examples/dr5hn",
    title: "dr5hn Provider",
    desc: "Address form using dr5hn state lists with fallback format.",
    badge: "Provider",
  },
  {
    href: "/examples/headless",
    title: "Headless API",
    desc: "Use createEngine directly without the Address component.",
    badge: "Advanced",
  },
  {
    href: "/examples/rhf",
    title: "React Hook Form",
    desc: "Integration with react-hook-form via AddressController.",
    badge: "Integration",
  },
  {
    href: "/examples/restricted",
    title: "Country Restricted",
    desc: "Limit the country dropdown to specific countries.",
    badge: "Feature",
  },
  {
    href: "/examples/custom-fields",
    title: "Custom Field Components",
    desc: "Override default inputs with your own styled components.",
    badge: "Feature",
  },
  {
    href: "/examples/multi-step",
    title: "Multi-Step Form",
    desc: "Wizard-style address form across multiple steps.",
    badge: "Pattern",
  },
  {
    href: "/examples/validation",
    title: "Validation",
    desc: "Inline per-field errors with async validation support.",
    badge: "Feature",
  },
  {
    href: "/examples/cascading",
    title: "Cascade Clear",
    desc: "Country and state change cascade behavior.",
    badge: "Behavior",
  },
];

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Examples</h1>
        <p className="mt-2 text-muted-foreground">
          Live examples showing different AddressKit features and patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example) => (
          <Link key={example.href} href={example.href}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{example.title}</CardTitle>
                  <Badge variant="secondary">{example.badge}</Badge>
                </div>
                <CardDescription>{example.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
