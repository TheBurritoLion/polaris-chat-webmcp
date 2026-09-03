import type { Metadata } from "next";
import "./globals.css";
import { ClientRoot } from "@/components/client-root";

export const metadata: Metadata = {
  title: {
    default: "Polaris Chat — Public Preview",
    template: "%s · Polaris Chat",
  },
  description:
    "Explore Polaris Chat through a deterministic five-platform livestream preview with a shared WebMCP-powered Producer Queue.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><ClientRoot>{children}</ClientRoot></body>
    </html>
  );
}
