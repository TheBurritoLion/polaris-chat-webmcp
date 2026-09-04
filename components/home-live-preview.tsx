"use client";

import { Focus, MessageSquareText, Pause, Play } from "lucide-react";
import { BrandMark, PlatformMark } from "@/components/polaris-brand";
import { usePreviewMotion } from "@/hooks/use-preview-motion";
import {
  chatMessages,
  previewMetrics,
  type ChatMessage,
  type Priority,
} from "@/lib/polaris-demo";

const homeMessageIds = [
  "chat-youtube-route-01",
  "chat-tiktok-celebrate-01",
  "chat-x-laugh-02",
  "chat-twitch-arc-hold-03",
  "chat-youtube-bobcat-callout-01",
  "chat-kick-bobcat-missed-02",
  "chat-tiktok-bobcat-confirm-03",
  "chat-x-game-lag-03",
  "chat-twitch-stream-smooth-04",
  "chat-youtube-anvil-04",
  "chat-tiktok-partner-energy-04",
  "chat-twitch-blueprint-echo-05",
  "chat-twitch-setup-question",
  "chat-youtube-audio-01",
  "chat-kick-audio-02",
  "chat-tiktok-audio-03",
  "chat-kick-raid-02",
] as const;

const homeMessages = homeMessageIds.map(
  (id) => chatMessages.find((message) => message.id === id) as ChatMessage,
);

interface PreviewSignal {
  priority: Priority;
  title: string;
  detail: string;
  meta: string;
}

function getPreviewSignal(message: ChatMessage): PreviewSignal {
  if (message.id === "chat-youtube-bobcat-callout-01") {
    return {
      priority: "normal",
      title: "Loot callout detected",
      detail: "Chat spots a Bobcat Blueprint on the yellow workbench.",
      meta: "ARC Raiders · 1 callout",
    };
  }
  if (message.id === "chat-kick-bobcat-missed-02") {
    return {
      priority: "high",
      title: "Blueprint miss forming",
      detail: "A second platform says the Bobcat Blueprint was left behind.",
      meta: "2 matching callouts",
    };
  }
  if (message.id === "chat-tiktok-bobcat-confirm-03" || message.id === "chat-twitch-blueprint-echo-05") {
    return {
      priority: "normal",
      title: "Bobcat Blueprint missed",
      detail: "Cross-platform Chat confirms the blueprint was left before extraction.",
      meta: "4 linked callouts · Recall ready",
    };
  }
  if (message.id === "chat-x-game-lag-03") {
    return {
      priority: "normal",
      title: "Gameplay hitch mentioned",
      detail: "One viewer flags in-game lag during an ARC encounter.",
      meta: "Isolated gameplay report",
    };
  }
  if (message.id === "chat-twitch-stream-smooth-04") {
    return {
      priority: "normal",
      title: "Stream signal cross-checked",
      detail: "A second viewer says playback stayed smooth during the game hitch.",
      meta: "Context preserved",
    };
  }
  if (message.id === "chat-twitch-setup-question") {
    return {
      priority: "high",
      title: "Viewer setup question",
      detail: "A meaningful creator question surfaced from Twitch.",
      meta: "Question detected · New",
    };
  }
  if (message.id === "chat-youtube-audio-01") {
    return {
      priority: "urgent",
      title: "Microphone report detected",
      detail: "A YouTube viewer says the microphone keeps cutting out.",
      meta: "1 matching report",
    };
  }
  if (message.id === "chat-kick-audio-02") {
    return {
      priority: "urgent",
      title: "Audio pattern forming",
      detail: "A second platform independently reports the same problem.",
      meta: "2 matching reports",
    };
  }
  if (message.id === "chat-tiktok-audio-03") {
    return {
      priority: "urgent",
      title: "Microphone reports rising",
      detail: "YouTube, Kick, and TikTok LIVE viewers report audio dropouts.",
      meta: "3 linked reports · Ready",
    };
  }
  if (message.id === "chat-kick-raid-02") {
    return {
      priority: "normal",
      title: "Raid crew arrived",
      detail: "A community celebration joins the unified conversation.",
      meta: "Community moment",
    };
  }
  return {
    priority: "normal",
    title: "Conversation moving",
    detail: "Polaris keeps each synthetic message tied to its source.",
    meta: "Monitoring five previews",
  };
}

export function HomeLivePreview() {
  const motion = usePreviewMotion({ itemCount: homeMessages.length, intervalMs: 1850 });
  const visibleMessages = Array.from({ length: 5 }, (_, offset) => (
    homeMessages[(motion.index + offset) % homeMessages.length]
  ));
  const newestMessage = visibleMessages[visibleMessages.length - 1];
  const signal = getPreviewSignal(newestMessage);
  const motionState = motion.reducedMotion ? "reduced" : motion.paused ? "paused" : "playing";

  return (
    <div className="hero-product-frame" aria-label="Moving preview of the Polaris Chat creator workspace">
      <div className="mini-app-bar">
        <div><BrandMark size={25} /><strong>Producer Rush</strong></div>
        <div className="mini-live-controls" data-motion={motionState}>
          <span><i aria-hidden="true" /> {motion.reducedMotion ? "Motion reduced" : motion.paused ? "Preview paused" : `${previewMetrics.messagesPerMinute} msg/min · Preview moving`}</span>
          <button
            type="button"
            onClick={motion.togglePaused}
            disabled={motion.reducedMotion}
            aria-label={motion.paused ? "Resume homepage preview motion" : "Pause homepage preview motion"}
          >
            {motion.paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div className="mini-workspace">
        <section aria-labelledby="mini-chat-title">
          <div className="mini-panel-heading"><span id="mini-chat-title"><MessageSquareText size={14} /> Chat</span><small>{chatMessages.length} synthetic · ARC Raiders</small></div>
          <div className="mini-message-list" aria-live="off">
            {visibleMessages.map((message, index) => (
              <article
                className={index === visibleMessages.length - 1 ? "mini-message-entering" : undefined}
                key={message.id}
              >
                <PlatformMark platform={message.platform} compact />
                <p><strong>{message.author}</strong><span>{message.text}</span></p>
              </article>
            ))}
          </div>
        </section>
        <aside aria-labelledby="mini-queue-title">
          <div className="mini-panel-heading"><span id="mini-queue-title"><Focus size={14} /> Producer Queue</span><small>Shared</small></div>
          <article className="mini-attention-card mini-signal-card" data-priority={signal.priority} key={`${newestMessage.id}-${motion.index}`}>
            <em>{signal.priority}</em>
            <strong>{signal.title}</strong>
            <p>{signal.detail}</p>
            <span>{signal.meta}</span>
          </article>
          <article className="mini-queue-card">
            <em>Normal</em><strong>Hype Train reached Level 4</strong><span>Twitch · Community moment</span>
          </article>
        </aside>
      </div>
    </div>
  );
}
