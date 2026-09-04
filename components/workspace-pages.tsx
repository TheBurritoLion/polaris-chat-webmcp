"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  Eye,
  LockKeyhole,
  RadioTower,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { ActivityPanel, ChatPanel } from "@/components/feed-panels";
import { ProducerQueuePanel, heroPrompt, streamRecallPrompt } from "@/components/producer-queue-panel";
import { PlatformMark } from "@/components/polaris-brand";
import { ResetDemoButton } from "@/components/workspace-shell";
import { useDemoWorkspace } from "@/components/demo-workspace-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  activityEvents,
  chatMessages,
  platformKeys,
  platformMeta,
  type PlatformKey,
} from "@/lib/polaris-demo";

export function ChatWorkspacePage() {
  return (
    <div className="workspace-grid workspace-grid-chat">
      <ChatPanel />
      <ActivityPanel compact />
      <ProducerQueuePanel compact />
    </div>
  );
}

export function ActivityWorkspacePage() {
  return (
    <div className="workspace-grid workspace-grid-focus">
      <ActivityPanel />
      <ProducerQueuePanel compact />
    </div>
  );
}

export function QueueWorkspacePage() {
  return (
    <div className="queue-page-layout">
      <ProducerQueuePanel />
      <aside className="producer-guide" aria-labelledby="producer-guide-title">
        <p className="panel-kicker"><Bot aria-hidden="true" /> Producer workflow</p>
        <h2 id="producer-guide-title">Attention, organized in the open.</h2>
        <p>
          ChatGPT can inspect the same synthetic Chat and Activity you see. It can organize existing
          sources here, but it cannot reply, moderate, connect accounts, or control a broadcast.
        </p>
        <ol>
          <li><span>1</span><p><strong>Inspect</strong>Read recent Chat, Activity, and the current queue.</p></li>
          <li><span>2</span><p><strong>Organize</strong>Add existing source items with a reason and priority.</p></li>
          <li><span>3</span><p><strong>Focus</strong>Highlight the one thing the creator should handle first.</p></li>
          <li><span>4</span><p><strong>Hand back</strong>The human marks it handled or changes the decision.</p></li>
        </ol>
        <details className="guide-prompt">
          <summary>Show the challenge prompt</summary>
          <p>{heroPrompt}</p>
        </details>
        <details className="guide-prompt guide-recall">
          <summary>Try stream recall</summary>
          <p>{streamRecallPrompt}</p>
          <span>The synthetic feed contains four cross-platform Bobcat Blueprint callouts.</span>
        </details>
      </aside>
    </div>
  );
}

const platformDescriptions: Record<PlatformKey, string> = {
  twitch: "Livestream Chat, viewer questions, subscriptions, raids, and Hype Train moments.",
  youtube: "Live Chat, memberships, gifts, and broadcast state in one readable stream.",
  kick: "Livestream Chat, raids, and connection state without losing source identity.",
  "tiktok-live": "LIVE comments, audience momentum, gifts, and live state represented in Preview Mode.",
  "x-live": "Live-video conversation and broadcast state—not X Spaces or ordinary social mentions.",
};

export function PlatformHubPage() {
  const router = useRouter();
  const { setFilters } = useDemoWorkspace();

  const openPlatform = (platform: PlatformKey) => {
    setFilters({ platform, attention: "all" });
    router.push("/app/chat");
  };

  return (
    <section className="platform-hub" aria-labelledby="platform-hub-title">
      <header className="route-header">
        <div>
          <p className="panel-kicker"><RadioTower aria-hidden="true" /> Five first-class livestream targets</p>
          <h1 id="platform-hub-title">Platform Hub</h1>
          <p>Explore each source in the deterministic preview. No creator account is connected.</p>
        </div>
        <Badge className="preview-mode-badge" variant="outline"><Sparkles /> Preview Mode</Badge>
      </header>

      <div className="platform-card-grid">
        {platformKeys.map((platform) => {
          const messageCount = chatMessages.filter((message) => message.platform === platform).length;
          const activityCount = activityEvents.filter((event) => event.platform === platform).length;
          return (
            <article
              className="platform-card"
              key={platform}
              style={{ "--platform-accent": platformMeta[platform].color, "--platform-soft": platformMeta[platform].soft } as React.CSSProperties}
            >
              <div className="platform-card-heading">
                <PlatformMark platform={platform} />
                <span className="preview-available"><i aria-hidden="true" /> Preview available</span>
              </div>
              <h2>{platformMeta[platform].label}</h2>
              <p>{platformDescriptions[platform]}</p>
              <dl>
                <div><dt>Messages</dt><dd>{messageCount} synthetic</dd></div>
                <div><dt>Activity</dt><dd>{activityCount} preview {activityCount === 1 ? "event" : "events"}</dd></div>
                <div><dt>Connection</dt><dd>Simulated live</dd></div>
              </dl>
              <div className="platform-card-actions">
                <Button variant="outline" onClick={() => openPlatform(platform)}>Open preview <ArrowRight aria-hidden="true" /></Button>
                <Button className="coming-soon-button" variant="ghost" disabled><WifiOff aria-hidden="true" /> Live connection · Coming Soon</Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="platform-truth-note">
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>Truthful by design</strong>
          <p>This public challenge edition makes no OAuth requests and contains no provider tokens, client secrets, webhooks, captured payloads, or real viewer data.</p>
        </div>
      </div>
    </section>
  );
}

export function SettingsPage() {
  const { state } = useDemoWorkspace();
  const [registeredTools, setRegisteredTools] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setRegisteredTools(window.__polarisWebMcpToolCount ?? 0);
    update();
    window.addEventListener("polaris:webmcp-ready", update);
    return () => window.removeEventListener("polaris:webmcp-ready", update);
  }, []);

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <header className="route-header">
        <div>
          <p className="panel-kicker"><Sparkles aria-hidden="true" /> Interactive Preview</p>
          <h1 id="settings-title">Settings</h1>
          <p>Review the local demo boundary and return Producer Rush to its starting state.</p>
        </div>
      </header>

      <div className="settings-grid">
        <article>
          <Database aria-hidden="true" />
          <div><h2>Local preview state</h2><p>The Producer Queue and filters stay only in this browser using local storage.</p></div>
          <span>{state.queue.length} queue {state.queue.length === 1 ? "item" : "items"}</span>
        </article>
        <article>
          <Bot aria-hidden="true" />
          <div><h2>Producer collaboration</h2><p>Compatible ChatGPT browsers can inspect and update the same visible workspace.</p></div>
          <span>{registeredTools === 8 ? "8 tools ready" : "Compatible browser needed"}</span>
        </article>
        <article>
          <LockKeyhole aria-hidden="true" />
          <div><h2>Provider boundary</h2><p>No real accounts, OAuth flows, API requests, credentials, replies, or moderation actions.</p></div>
          <span>Preview only</span>
        </article>
        <article>
          <Eye aria-hidden="true" />
          <div><h2>Human control</h2><p>Agent changes are visible, reviewable, reversible, and share the same queue as human actions.</p></div>
          <span>Always on</span>
        </article>
      </div>

      <div className="reset-settings-card">
        <div className="reset-icon"><RotateCcw aria-hidden="true" /></div>
        <div>
          <h2>Reset Producer Rush</h2>
          <p>Clear the local queue, filters, and focus while keeping the deterministic synthetic scenario available.</p>
        </div>
        <ResetDemoButton />
      </div>

      <div className="safety-summary">
        <CheckCircle2 aria-hidden="true" />
        <div>
          <strong>Viewer messages stay inert.</strong>
          <p>Chat text is rendered as plain text and returned to agents as untrusted data. It cannot execute code, define tool parameters, or override the Producer boundary.</p>
        </div>
      </div>
    </section>
  );
}
