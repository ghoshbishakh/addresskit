import { Layout, Footer, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import { Head } from "nextra/components";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../components/theme-toggle";
import { Button } from "../components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AddressKit - Headless Address Forms & Validation",
  description:
    "Dynamic country-specific address forms, offline validation, and formatting for 256 countries with zero external API dependencies.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" suppressHydrationWarning dir="ltr">
      <Head />
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary">
        <Layout
          navbar={
            <Navbar
              logo={
                <div className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-base font-semibold">AddressKit</span>
                </div>
              }
              projectLink="https://github.com/bishakhghosh/addresskit"
            >
              <div className="hidden md:flex items-center gap-1 text-sm font-medium mr-2">
                <Link
                  href="/docs"
                  className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  Docs
                </Link>
                <Link
                  href="/examples"
                  className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  Examples
                </Link>
                <Link
                  href="/playground"
                  className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  Playground
                </Link>
              </div>
              <ThemeToggle />
              <a
                href="https://github.com/bishakhghosh/addresskit"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex"
              >
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </Button>
              </a>
            </Navbar>
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/bishakhghosh/addresskit/tree/main/packages/examples/nextjs"
          footer={
            <Footer className="border-t border-border/60 py-12 bg-card/40">
              <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Product</h3>
                    <ul className="space-y-2 text-muted-foreground text-xs">
                      <li>
                        <Link href="/docs" className="hover:text-foreground transition-colors">
                          Documentation
                        </Link>
                      </li>
                      <li>
                        <Link href="/examples" className="hover:text-foreground transition-colors">
                          Example Gallery
                        </Link>
                      </li>
                      <li>
                        <Link href="/playground" className="hover:text-foreground transition-colors">
                          Interactive Playground
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Ecosystem</h3>
                    <ul className="space-y-2 text-muted-foreground text-xs">
                      <li>
                        <Link href="/docs/components" className="hover:text-foreground transition-colors">
                          React Component
                        </Link>
                      </li>
                      <li>
                        <Link href="/docs/headless-api" className="hover:text-foreground transition-colors">
                          Headless Hooks
                        </Link>
                      </li>
                      <li>
                        <Link href="/docs/validation" className="hover:text-foreground transition-colors">
                          Validation Engine
                        </Link>
                      </li>
                      <li>
                        <Link href="/docs/zod" className="hover:text-foreground transition-colors">
                          Zod Integration
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Providers</h3>
                    <ul className="space-y-2 text-muted-foreground text-xs">
                      <li>
                        <Link href="/examples/libaddress" className="hover:text-foreground transition-colors">
                          Google libaddressinput
                        </Link>
                      </li>
                      <li>
                        <Link href="/examples/dr5hn" className="hover:text-foreground transition-colors">
                          dr5hn Global Database
                        </Link>
                      </li>
                      <li>
                        <Link href="/docs/providers" className="hover:text-foreground transition-colors">
                          Custom Provider Guide
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Open Source</h3>
                    <ul className="space-y-2 text-muted-foreground text-xs">
                      <li>
                        <a
                          href="https://github.com/bishakhghosh/addresskit"
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                          GitHub Repository <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.npmjs.com/package/@addresskit/core"
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                          npm Registry <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li className="text-muted-foreground/80">MIT License</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/40 pt-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>AddressKit open source project. Built for high-performance address forms.</span>
                  </div>
                  <p>MIT {new Date().getFullYear()} © AddressKit contributors.</p>
                </div>
              </div>
            </Footer>
          }
          darkMode={false}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
