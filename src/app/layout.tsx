import type { Metadata } from "next";
import { AppProviders } from "@/shared/lib/providers/app-providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Notification & Subscriptions Platform",
  description: "Production-ready frontend for BFF-driven event platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
