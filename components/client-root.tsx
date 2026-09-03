"use client";

import { ThemeProvider } from "next-themes";
import { DemoWorkspaceProvider } from "@/components/demo-workspace-provider";
import { WebMcpBridge } from "@/components/webmcp-bridge";
import { Toaster } from "@/components/ui/sonner";

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
      <DemoWorkspaceProvider>
        <WebMcpBridge />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </DemoWorkspaceProvider>
    </ThemeProvider>
  );
}

