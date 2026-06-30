import { Layout, Footer, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import { Head } from "nextra/components";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ThemeToggle } from "../components/theme-toggle";
import { Button } from "../components/ui/button";
import { MapPin } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AddressKit - Headless Address Forms for React",
  description:
    "256 countries, lazy-loaded, provider-agnostic. Build address forms with accurate field labels, ordering, and postal code validation.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" suppressHydrationWarning dir="ltr">
      <Head />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>AddressKit</span>
                </div>
              }
              projectLink="https://github.com/bishakhghosh/addresskit"
            >
              <ThemeToggle />
              <a
                href="https://github.com/bishakhghosh/addresskit"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm">
                  GitHub
                </Button>
              </a>
            </Navbar>
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/bishakhghosh/addresskit/tree/main/packages/examples/nextjs"
          footer={
            <Footer>
              <span>
                MIT {new Date().getFullYear()} © AddressKit.
              </span>
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
