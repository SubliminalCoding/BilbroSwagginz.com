import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BilbroSwagginz — Building AI-Powered Products in Public",
  description:
    "Apps, tools, and experiments around AI workflows, coding agents, automation, and product execution.",
  openGraph: {
    title: "BilbroSwagginz — Building AI-Powered Products in Public",
    description:
      "Apps, tools, and experiments around AI workflows, coding agents, automation, and product execution.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BilbroSwagginz — Building AI-Powered Products in Public",
    description:
      "Apps, tools, and experiments around AI workflows, coding agents, automation, and product execution.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
