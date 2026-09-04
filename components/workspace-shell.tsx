"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Focus,
  Home,
  MessageSquareText,
  RadioTower,
  RotateCcw,
  Settings,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/polaris-brand";
import { useDemoWorkspace } from "@/components/demo-workspace-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { previewMetrics } from "@/lib/polaris-demo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navigation = [
  { href: "/app/chat", label: "Chat", icon: MessageSquareText },
  { href: "/app/activity", label: "Activity", icon: Activity },
  { href: "/app/queue", label: "Producer Queue", shortLabel: "Queue", icon: Focus },
  { href: "/app/platforms", label: "Platform Hub", shortLabel: "Platforms", icon: RadioTower },
];

function ResetDemoButton({ compact = false }: { compact?: boolean }) {
  const { resetDemo } = useDemoWorkspace();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className={compact ? "reset-button compact" : "reset-button"} variant="ghost" size={compact ? "icon-sm" : "sm"}>
          <RotateCcw aria-hidden="true" />
          {!compact ? <span>Reset demo</span> : <span className="sr-only">Reset demo</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="polaris-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Producer Rush?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears the local Producer Queue, filters, and focused item. Synthetic preview messages and Activity remain unchanged.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep current state</AlertDialogCancel>
          <AlertDialogAction onClick={resetDemo}>Reset preview</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useDemoWorkspace();
  const openQueueCount = state.queue.filter((item) => item.status !== "handled" && item.status !== "dismissed").length;

  return (
    <SidebarProvider
      className="workspace-shell"
      style={{ "--sidebar-width": "14.5rem" } as React.CSSProperties}
    >
      <Sidebar className="polaris-sidebar" collapsible="offcanvas">
        <SidebarHeader className="sidebar-brand-area">
          <Link className="brand-link" href="/" aria-label="Polaris Chat public home">
            <BrandMark size={34} />
            <span><strong>Polaris Chat</strong><small>Public Preview</small></span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Creator workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === href}
                      size="lg"
                      className="workspace-nav-button"
                    >
                      <Link href={href}>
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {href === "/app/queue" && openQueueCount > 0 ? (
                      <SidebarMenuBadge className="queue-nav-count">{openQueueCount}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Preview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/app/settings"} size="lg" className="workspace-nav-button">
                    <Link href="/app/settings"><Settings aria-hidden="true" /><span>Settings</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild size="lg" className="workspace-nav-button">
                    <Link href="/"><Home aria-hidden="true" /><span>Public home</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="sidebar-footer-area">
          <div className="sidebar-preview-state">
            <span aria-hidden="true" />
            <p><strong>Producer Rush</strong>Deterministic simulated activity</p>
          </div>
          <p className="sidebar-boundary">No real accounts, messages, or provider actions.</p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="workspace-main">
        <header className="workspace-header">
          <div className="workspace-header-primary">
            <SidebarTrigger className="sidebar-trigger" aria-label="Open workspace navigation" />
            <div>
              <p>Creator workspace</p>
              <strong>Busy Multistream · Producer Rush</strong>
            </div>
          </div>
          <div className="workspace-header-actions">
            <span className="simulated-live">
              <i aria-hidden="true" />
              <span className="live-scale-full">{previewMetrics.combinedViewers} simulated · {previewMetrics.messagesPerMinute} msg/min</span>
              <span className="live-scale-compact">{previewMetrics.messagesPerMinute}/min</span>
            </span>
            <span className="webmcp-ready"><Sparkles aria-hidden="true" /> Producer ready</span>
            <ResetDemoButton compact />
          </div>
        </header>

        <div className="workspace-disclosure" role="note">
          <strong>Interactive Preview</strong>
          <span>Every message, event, identity, metric, and connection state is simulated. Live creator connections are coming soon.</span>
        </div>

        <div className="workspace-content">{children}</div>

        <nav className="mobile-bottom-nav" aria-label="Mobile workspace navigation">
          {navigation.map(({ href, label, shortLabel, icon: Icon }) => (
            <Link key={href} href={href} data-active={pathname === href}>
              <span className="mobile-nav-icon">
                <Icon aria-hidden="true" />
                {href === "/app/queue" && openQueueCount > 0 ? <i>{openQueueCount}</i> : null}
              </span>
              <span>{shortLabel ?? label}</span>
            </Link>
          ))}
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { ResetDemoButton };
