import { COMPANY_INFO } from "@/lib/constant";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: COMPANY_INFO.companyName,
  description: `${COMPANY_INFO.companyName} offers premium services in chemicals, plastics, and wax refinement worldwide.`,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-1.png"  />
      </head>
      <body>{children}</body>
    </html>
  );
}
