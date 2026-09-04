"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Check,
  CircleHelp,
  Focus,
  Gamepad2,
  MessageSquareText,
  Pause,
  Play,
  Radio,
  ShieldAlert,
} from "lucide-react";
import { PlatformMark } from "@/components/polaris-brand";
import { useDemoWorkspace } from "@/components/demo-workspace-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activityEvents,
  platformKeys,
  platformMeta,
  previewMetrics,
  type ActivityEvent,
  type AttentionFilter,
  type ChatMessage,
  type PlatformKey,
  type Priority,
} from "@/lib/polaris-demo";

function messageNeedsAttention(message: ChatMessage) {
  return message.classification === "technical_report" || message.classification === "viewer_question";
}

function eventNeedsAttention(event: ActivityEvent) {
  return event.attentionLevel === "urgent" || event.attentionLevel === "high";
}

function attentionMatches(
  sourceId: string,
  inherentAttention: boolean,
  filter: AttentionFilter,
  queue: ReturnType<typeof useDemoWorkspace>["state"]["queue"],
) {
  const queued = queue.find((item) => item.sourceId === sourceId);
  if (filter === "all") return true;
  if (filter === "attention") return inherentAttention;
  if (filter === "queued") return Boolean(queued);
  return inherentAttention && (!queued || (queued.status !== "handled" && queued.status !== "dismissed"));
}

function sourcePriority(source: ChatMessage | ActivityEvent): Priority {
  if (source.kind === "chat") {
    if (source.classification === "technical_report") return "urgent";
    if (source.classification === "viewer_question") return "high";
    return "normal";
  }
  if (source.attentionLevel === "urgent") return "urgent";
  if (source.attentionLevel === "high") return "high";
  return "normal";
}

function sourceReason(source: ChatMessage | ActivityEvent) {
  if (source.id === "activity-audio-cluster") {
    return "Multiple viewers independently reported a live microphone problem across three platforms.";
  }
  if (source.kind === "chat" && source.classification === "viewer_question") {
    return "Meaningful unanswered viewer question for the creator.";
  }
  if (source.kind === "chat" && source.classification === "technical_report") {
    return "Viewer reports a live technical problem that could affect the audience.";
  }
  if (source.kind === "chat" && source.classification === "gameplay_signal") {
    return "ARC Raiders gameplay context that the creator may want to recall after the moment passes.";
  }
  if (source.kind === "activity") return "Notable community or system moment worth creator review.";
  return "Creator may want to review this live moment.";
}

function SourceQueueButton({ source }: { source: ChatMessage | ActivityEvent }) {
  const { state, addQueueItem, setFocusedItem } = useDemoWorkspace();
  const router = useRouter();
  const queued = state.queue.find((item) => item.sourceId === source.id);

  if (queued) {
    return (
      <Button
        className="source-queue-button queued"
        variant="ghost"
        size="sm"
        onClick={() => {
          setFocusedItem({ kind: "queue", id: queued.id });
          router.push("/app/queue");
        }}
        aria-label={`View ${source.kind} in Producer Queue`}
      >
        <Check aria-hidden="true" /> Queued
      </Button>
    );
  }

  return (
    <Button
      className="source-queue-button"
      variant="ghost"
      size="sm"
      onClick={() => addQueueItem(source.id, sourcePriority(source), sourceReason(source), "human")}
      aria-label={`Add ${source.kind} to Producer Queue`}
    >
      <Focus aria-hidden="true" /> Queue
    </Button>
  );
}

function FilterSelects({ kind }: { kind: "chat" | "activity" }) {
  const { state, setFilters } = useDemoWorkspace();
  return (
    <div className="filter-selects">
      <label>
        <span className="sr-only">Filter by platform</span>
        <Select
          value={state.filters.platform}
          onValueChange={(value) => setFilters({ platform: value as "all" | PlatformKey })}
        >
          <SelectTrigger className="polaris-select" aria-label="Filter by platform">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent className="polaris-select-content">
            <SelectItem value="all">All platforms</SelectItem>
            {platformKeys.map((platform) => (
              <SelectItem value={platform} key={platform}>{platformMeta[platform].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label>
        <span className="sr-only">Filter by attention state</span>
        <Select
          value={state.filters.attention}
          onValueChange={(value) => setFilters({ attention: value as AttentionFilter })}
        >
          <SelectTrigger className="polaris-select" aria-label="Filter by attention state">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="polaris-select-content">
            <SelectItem value="all">All {kind === "chat" ? "messages" : "activity"}</SelectItem>
            <SelectItem value="attention">Needs attention</SelectItem>
            <SelectItem value="queued">In Producer Queue</SelectItem>
            <SelectItem value="unhandled">Still unhandled</SelectItem>
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}

export function ChatPanel({ full = false }: { full?: boolean }) {
  const {
    state,
    chatFlow,
    getVisibleChatMessages,
    startChatFlow,
    toggleChatFlow,
  } = useDemoWorkspace();
  const receivedChatMessages = getVisibleChatMessages();

  useEffect(() => {
    startChatFlow();
  }, [startChatFlow]);

  const messages = useMemo(
    () =>
      [...receivedChatMessages]
        .sort((a, b) => b.order - a.order)
        .filter((message) => state.filters.platform === "all" || message.platform === state.filters.platform)
        .filter((message) =>
          attentionMatches(message.id, messageNeedsAttention(message), state.filters.attention, state.queue),
        ),
    [receivedChatMessages, state.filters.attention, state.filters.platform, state.queue],
  );
  const liveMessage = messages.find((message) => message.id === chatFlow.currentMessageId);
  const flowingMessages = useMemo(
    () =>
      !liveMessage || chatFlow.reducedMotion
        ? messages
        : [liveMessage, ...messages.filter((message) => message.id !== liveMessage.id)],
    [chatFlow.reducedMotion, liveMessage, messages],
  );
  const motionState = chatFlow.reducedMotion
    ? "reduced"
    : chatFlow.paused
      ? "paused"
      : chatFlow.visibleCount === 0
        ? "starting"
        : "playing";

  return (
    <section className={`workspace-panel chat-panel ${full ? "full-panel" : ""}`} aria-labelledby="chat-panel-title">
      <header className="panel-header">
        <div>
          <p className="panel-kicker"><Radio aria-hidden="true" /> Live conversation</p>
          <h1 id="chat-panel-title">Chat</h1>
        </div>
        <span className="panel-count" title={`${messages.length} messages currently visible`}>{messages.length}</span>
      </header>
      <div className="panel-filters"><FilterSelects kind="chat" /></div>
      {chatFlow.totalCount > 0 ? (
        <div className="live-preview-strip" data-motion={motionState} aria-label="Moving simulated livestream preview" aria-live="off">
          <span className="live-preview-label"><i aria-hidden="true" /> {previewMetrics.messagesPerMinute}/min simulated</span>
          {liveMessage ? <PlatformMark platform={liveMessage.platform} compact /> : <span className="live-preview-platform-placeholder" aria-hidden="true" />}
          {liveMessage ? (
            <span className="live-preview-copy" key={`${liveMessage.id}-${chatFlow.visibleCount}`}>
              <strong>{liveMessage.author}</strong>
              <span>{liveMessage.text}</span>
            </span>
          ) : (
            <span className="live-preview-copy live-preview-waiting">
              <strong>{chatFlow.paused ? "Feed paused" : chatFlow.reducedMotion ? "Static fixture" : "Starting Chat…"}</strong>
              <span>{chatFlow.reducedMotion ? "Full deterministic feed shown below." : "The first simulated message is on its way."}</span>
            </span>
          )}
          <Button
            className="live-preview-toggle"
            variant="ghost"
            size="icon-sm"
            onClick={toggleChatFlow}
            disabled={chatFlow.reducedMotion || chatFlow.totalCount < 2}
            aria-label={chatFlow.paused ? "Resume simulated Chat movement" : "Pause simulated Chat movement"}
          >
            {chatFlow.paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </Button>
        </div>
      ) : null}
      <div className="message-list" aria-live="off">
        {chatFlow.visibleCount === 0 && !chatFlow.reducedMotion ? null : messages.length === 0 ? (
          <div className="small-empty-state"><MessageSquareText aria-hidden="true" /><strong>No messages match</strong><p>Clear or change a filter to return to the conversation.</p></div>
        ) : (
          flowingMessages.map((message) => {
            const queued = state.queue.some((item) => item.sourceId === message.id);
            const focused = state.focusedItem?.kind === "chat" && state.focusedItem.id === message.id;
            return (
              <article
                className="chat-message"
                id={`workspace-${message.id}`}
                key={message.id}
                tabIndex={-1}
                data-focused={focused}
                data-attention={messageNeedsAttention(message)}
                data-queued={queued}
                data-preview-active={liveMessage?.id === message.id}
              >
                <div className="message-avatar" data-platform={message.platform}>{message.initials}</div>
                <div className="message-body">
                  <div className="message-meta">
                    <strong>{message.author}</strong>
                    <PlatformMark platform={message.platform} compact />
                    {message.badge ? <span className="viewer-badge">{message.badge}</span> : null}
                    <time>{message.timestamp}</time>
                  </div>
                  {message.replyContext ? <p className="reply-context">{message.replyContext}</p> : null}
                  <p className="message-text">{message.text}</p>
                  {message.classification === "technical_report" ? (
                    <Badge className="attention-label technical" variant="outline"><AlertTriangle /> Viewer reports audio issue</Badge>
                  ) : message.classification === "viewer_question" ? (
                    <Badge className="attention-label question" variant="outline"><CircleHelp /> Unanswered question</Badge>
                  ) : message.classification === "gameplay_signal" ? (
                    <Badge className="attention-label gameplay" variant="outline"><Gamepad2 /> ARC Raiders signal</Badge>
                  ) : message.classification === "untrusted_instruction_attempt" ? (
                    <Badge className="attention-label untrusted" variant="outline"><ShieldAlert /> Viewer text · inert data</Badge>
                  ) : null}
                </div>
                <SourceQueueButton source={message} />
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export function ActivityPanel({ compact = false }: { compact?: boolean }) {
  const { state, setFilters, setFocusedItem } = useDemoWorkspace();
  const router = useRouter();
  const events = useMemo(
    () =>
      [...activityEvents]
        .sort((a, b) => b.order - a.order)
        .filter((event) => state.filters.platform === "all" || event.platform === state.filters.platform)
        .filter((event) => state.filters.activityScope === "all" || event.lane === state.filters.activityScope)
        .filter((event) =>
          attentionMatches(event.id, eventNeedsAttention(event), state.filters.attention, state.queue),
        )
        .slice(0, compact ? 8 : undefined),
    [compact, state.filters.activityScope, state.filters.attention, state.filters.platform, state.queue],
  );

  return (
    <section className={`workspace-panel activity-panel ${compact ? "compact-panel" : "full-panel"}`} aria-labelledby={compact ? "adjacent-activity-title" : "activity-panel-title"}>
      <header className="panel-header">
        <div>
          <p className="panel-kicker"><Activity aria-hidden="true" /> Community + system</p>
          <h1 id={compact ? "adjacent-activity-title" : "activity-panel-title"}>Activity</h1>
        </div>
        <span className="panel-count">{events.length}</span>
      </header>
      {!compact ? (
        <div className="activity-controls">
          <Tabs
            value={state.filters.activityScope}
            onValueChange={(value) => setFilters({ activityScope: value as "all" | "community" | "system" })}
          >
            <TabsList className="polaris-tabs">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </Tabs>
          <FilterSelects kind="activity" />
        </div>
      ) : null}
      <div className="activity-list" aria-live="polite">
        {events.length === 0 ? (
          <div className="small-empty-state"><Activity aria-hidden="true" /><strong>No activity matches</strong><p>Clear or change a filter to see the full timeline.</p></div>
        ) : (
          events.map((event) => {
            const focused = state.focusedItem?.kind === "activity" && state.focusedItem.id === event.id;
            return (
              <article
                className="activity-card"
                id={`workspace-${event.id}`}
                key={event.id}
                tabIndex={-1}
                data-focused={focused}
                data-level={event.attentionLevel}
              >
                <div className="activity-card-top">
                  <PlatformMark platform={event.platform} />
                  <time>{event.timestamp}</time>
                </div>
                <div className="activity-card-title">
                  {event.attentionLevel === "urgent" ? <AlertTriangle aria-hidden="true" /> : null}
                  <strong>{event.title}</strong>
                </div>
                <p>{event.detail}</p>
                {event.linkedSourceIds ? (
                  <button
                    className="linked-reports"
                    type="button"
                    onClick={() => {
                      setFilters({ platform: "all", attention: "attention" });
                      const first = event.linkedSourceIds?.[0];
                      if (first) setFocusedItem({ kind: "chat", id: first });
                      router.push("/app/chat");
                    }}
                  >
                    <MessageSquareText aria-hidden="true" /> View {event.linkedSourceIds.length} linked viewer reports
                  </button>
                ) : null}
                <div className="activity-card-footer">
                  <span>{event.lane === "community" ? "Community Activity" : "System Activity"}</span>
                  <SourceQueueButton source={event} />
                </div>
              </article>
            );
          })
        )}
      </div>
      {compact ? <LinkToFullActivity /> : null}
    </section>
  );
}

function LinkToFullActivity() {
  const router = useRouter();
  return (
    <Button className="panel-footer-link" variant="ghost" onClick={() => router.push("/app/activity")}>
      Open all Activity
    </Button>
  );
}
