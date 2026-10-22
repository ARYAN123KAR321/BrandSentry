import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "BrandSentry",
  description:
    "Pre-publication brand governance with evidence-backed, human-controlled review."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <AppProvider>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}