"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Clipboard,
  Eye,
  Focus,
  Inbox,
  MessageSquareText,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PlatformMark } from "@/components/polaris-brand";
import { getSourceLabel, useDemoWorkspace } from "@/components/demo-workspace-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSource,
  priorityRank,
  type Priority,
  type QueueItem,
  type QueueStatus,
} from "@/lib/polaris-demo";

const heroPrompt =
  "I’m live and Chat is moving too fast. Review the recent messages and community activity. Add the three things I should handle next to the Producer Queue. Prioritize technical problems and unanswered viewer questions above celebrations. Focus the workspace on the most urgent item. Do not send messages, reply, moderate anyone, or open an external service.";

const streamRecallPrompt = "Did I miss any Blueprints in today’s stream?";

function QueueItemCard({ item }: { item: QueueItem }) {
  const { state, updateQueueItem, setFocusedItem } = useDemoWorkspace();
  const router = useRouter();
  const source = getSource(item.sourceId);
  const focused = state.focusedItem?.kind === "queue" && state.focusedItem.id === item.id;

  const viewSource = () => {
    if (!source) return;
    setFocusedItem({ kind: source.kind, id: source.id });
    router.push(source.kind === "chat" ? "/app/chat" : "/app/activity");
  };

  return (
    <article
      className="queue-item-card"
      id={`workspace-${item.id}`}
      tabIndex={-1}
      data-priority={item.priority}
      data-status={item.status}
      data-focused={focused}
    >
      <div className="queue-item-topline">
        <Badge className={`priority-badge ${item.priority}`} variant="outline">{item.priority}</Badge>
        <PlatformMark platform={item.sourcePlatform} compact />
        <span>{item.createdAt}</span>
      </div>
      <h3>{item.summary}</h3>
      <p className="queue-reason">{item.reason}</p>
      <div className="queue-source-context">
        <span>Linked source</span>
        <strong>{getSourceLabel(item.sourceId)}</strong>
        {source ? <p>{source.kind === "chat" ? source.text : source.detail}</p> : null}
      </div>
      <div className="queue-edit-row">
        <label>
          <span>Priority</span>
          <Select
            value={item.priority}
            onValueChange={(value) => updateQueueItem(item.id, { priority: value as Priority }, "human")}
          >
            <SelectTrigger className="queue-select" aria-label={`Priority for ${item.summary}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="polaris-select-content">
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label>
          <span>Status</span>
          <Select
            value={item.status}
            onValueChange={(value) => updateQueueItem(item.id, { status: value as QueueStatus }, "human")}
          >
            <SelectTrigger className="queue-select" aria-label={`Status for ${item.summary}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="polaris-select-content">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="handled">Handled</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
      <div className="queue-item-actions">
        <Button variant="ghost" size="sm" onClick={viewSource}><Eye aria-hidden="true" /> View source</Button>
        {item.status !== "handled" ? (
          <Button className="handled-button" variant="ghost" size="sm" onClick={() => updateQueueItem(item.id, { status: "handled" }, "human")}>
            <Check aria-hidden="true" /> Handled
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => updateQueueItem(item.id, { status: "ready" }, "human")}>
            Reopen
          </Button>
        )}
        {item.status !== "dismissed" ? (
          <Button className="dismiss-button" variant="ghost" size="icon-sm" onClick={() => updateQueueItem(item.id, { status: "dismissed" }, "human")} aria-label={`Dismiss ${item.summary}`}>
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function QueueEmptyState({ compact }: { compact: boolean }) {
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(heroPrompt);
      toast.success("Demo prompt copied");
    } catch {
      toast.error("Could not copy automatically", { description: "Select the prompt text to copy it manually." });
    }
  };

  return (
    <Empty className={`queue-empty ${compact ? "compact" : ""}`}>
      <EmptyHeader>
        <EmptyMedia variant="icon"><Inbox aria-hidden="true" /></EmptyMedia>
        <EmptyTitle>The Producer Queue is clear</EmptyTitle>
        <EmptyDescription>
          Ask ChatGPT to review the current workspace, or queue any visible source yourself.
        </EmptyDescription>
      </EmptyHeader>
      {!compact ? (
        <EmptyContent>
          <div className="demo-prompt-card">
            <span><Sparkles aria-hidden="true" /> Suggested demo prompt</span>
            <p>{heroPrompt}</p>
          </div>
          <Button className="copy-prompt-button" variant="outline" onClick={copyPrompt}>
            <Clipboard aria-hidden="true" /> Copy prompt
          </Button>
        </EmptyContent>
      ) : (
        <p className="compact-empty-hint"><Sparkles aria-hidden="true" /> ChatGPT can add the three moments that matter most.</p>
      )}
    </Empty>
  );
}

export function ProducerQueuePanel({ compact = false }: { compact?: boolean }) {
  const { state } = useDemoWorkspace();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"all" | QueueStatus>("all");
  const counts = useMemo(
    () => ({
      open: state.queue.filter((item) => item.status !== "handled" && item.status !== "dismissed").length,
      handled: state.queue.filter((item) => item.status === "handled").length,
    }),
    [state.queue],
  );
  const items = useMemo(
    () =>
      [...state.queue]
        .filter((item) => statusFilter === "all" || item.status === statusFilter)
        .sort((a, b) => {
          const aClosed = a.status === "handled" || a.status === "dismissed" ? 1 : 0;
          const bClosed = b.status === "handled" || b.status === "dismissed" ? 1 : 0;
          return aClosed - bClosed || priorityRank(a.priority) - priorityRank(b.priority) || a.createdOrder - b.createdOrder;
        })
        .slice(0, compact ? 5 : undefined),
    [compact, state.queue, statusFilter],
  );

  return (
    <section className={`workspace-panel queue-panel ${compact ? "compact-panel" : "full-panel"}`} aria-labelledby={compact ? "adjacent-queue-title" : "queue-panel-title"}>
      <header className="panel-header queue-panel-header">
        <div>
          <p className="panel-kicker"><Sparkles aria-hidden="true" /> Human + agent workspace</p>
          <h1 id={compact ? "adjacent-queue-title" : "queue-panel-title"}>Producer Queue</h1>
        </div>
        <span className="panel-count">{counts.open}</span>
      </header>
      <div className="queue-summary-strip">
        <span><i className="new-dot" aria-hidden="true" /> {counts.open} open</span>
        <span><CheckCircle2 aria-hidden="true" /> {counts.handled} handled</span>
        <strong>Shared visible state</strong>
      </div>
      {!compact && state.queue.length > 0 ? (
        <div className="queue-filter-row">
          <label>
            <span className="sr-only">Filter Producer Queue by status</span>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | QueueStatus)}>
              <SelectTrigger className="polaris-select" aria-label="Filter Producer Queue by status"><SelectValue /></SelectTrigger>
              <SelectContent className="polaris-select-content">
                <SelectItem value="all">All queue items</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="handled">Handled</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      ) : null}
      <div className="queue-list" aria-live="polite">
        {state.queue.length === 0 ? <QueueEmptyState compact={compact} /> : items.length === 0 ? (
          <div className="small-empty-state"><Focus aria-hidden="true" /><strong>No queue items match</strong><p>Choose another status to inspect the shared queue.</p></div>
        ) : items.map((item) => <QueueItemCard item={item} key={item.id} />)}
      </div>
      {compact && state.queue.length > 0 ? (
        <Button className="panel-footer-link" variant="ghost" onClick={() => router.push("/app/queue")}>
          Open full Producer Queue
        </Button>
      ) : null}
      {!compact && state.queue.length > 0 ? (
        <div className="second-turn-note">
          <MessageSquareText aria-hidden="true" />
          <p><strong>Second-turn test</strong>After marking the urgent item handled, ask: “What still needs my attention? Reprioritize the remaining queue.”</p>
        </div>
      ) : null}
    </section>
  );
}

export { heroPrompt, streamRecallPrompt };
