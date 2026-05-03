import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { getSessionUser } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = {
  title: "PulsePass",
  description: "A full-stack booking and event management application built with Next.js and MySQL."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body>
        <div className="page-background" />
        <SiteHeader user={user} />
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
