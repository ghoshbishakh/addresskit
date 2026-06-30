import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 24, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
