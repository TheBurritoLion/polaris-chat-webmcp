"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  activityEvents,
  chatMessages,
  defaultWorkspaceState,
  getQueueSummary,
  getSource,
  isPlatformKey,
  isPriority,
  isQueueStatus,
  platformMeta,
  storageKey,
  type AttentionFilter,
  type DemoWorkspaceState,
  type FocusedItem,
  type Priority,
  type QueueItem,
  type QueueStatus,
  type WorkspaceFilters,
} from "@/lib/polaris-demo";

type QueueMutationResult =
  | { ok: true; item: QueueItem; created?: boolean }
  | { ok: false; error: string };

type FilterPatch = Partial<WorkspaceFilters>;

interface DemoWorkspaceContextValue {
  state: DemoWorkspaceState;
  hydrated: boolean;
  getState: () => DemoWorkspaceState;
  addQueueItem: (
    sourceId: string,
    priority: Priority,
    reason: string,
    createdBy: "human" | "agent",
  ) => QueueMutationResult;
  updateQueueItem: (
    itemId: string,
    patch: { priority?: Priority; status?: QueueStatus; reason?: string },
    changedBy: "human" | "agent",
  ) => QueueMutationResult;
  setFocusedItem: (item: FocusedItem | null, changedBy?: "human" | "agent") => boolean;
  setFilters: (patch: FilterPatch, changedBy?: "human" | "agent") => WorkspaceFilters;
  resetDemo: () => void;
}

const DemoWorkspaceContext = createContext<DemoWorkspaceContextValue | null>(null);

function cloneDefaultState(): DemoWorkspaceState {
  return {
    ...defaultWorkspaceState,
    queue: [],
    filters: { ...defaultWorkspaceState.filters },
    focusedItem: null,
  };
}

function isAttentionFilter(value: unknown): value is AttentionFilter {
  return value === "all" || value === "attention" || value === "queued" || value === "unhandled";
}

function parseStoredState(raw: string | null): DemoWorkspaceState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DemoWorkspaceState>;
    if (parsed.version !== 1 || parsed.scenario !== "producer-rush") return null;
    if (!parsed.filters || !Array.isArray(parsed.queue)) return null;

    const platform = parsed.filters.platform;
    const activityScope = parsed.filters.activityScope;
    const attention = parsed.filters.attention;
    if (platform !== "all" && !isPlatformKey(platform)) return null;
    if (activityScope !== "all" && activityScope !== "community" && activityScope !== "system") return null;
    if (!isAttentionFilter(attention)) return null;

    const queue = parsed.queue.filter((candidate): candidate is QueueItem => {
      if (!candidate || typeof candidate !== "object") return false;
      const item = candidate as QueueItem;
      return (
        typeof item.id === "string" &&
        typeof item.sourceId === "string" &&
        getSource(item.sourceId) !== null &&
        (item.sourceKind === "chat" || item.sourceKind === "activity") &&
        typeof item.summary === "string" &&
        item.summary.length <= 180 &&
        isPriority(item.priority) &&
        isQueueStatus(item.status) &&
        typeof item.reason === "string" &&
        item.reason.length <= 160 &&
        Number.isInteger(item.createdOrder) &&
        (item.createdBy === "human" || item.createdBy === "agent")
      );
    });

    return {
      version: 1,
      scenario: "producer-rush",
      queue: queue.slice(0, 30),
      filters: { platform, activityScope, attention },
      focusedItem: null,
      revision: Number.isInteger(parsed.revision) ? Math.max(0, parsed.revision ?? 0) : 0,
    };
  } catch {
    return null;
  }
}

function boundedReason(reason: string) {
  return reason.trim().replace(/\s+/g, " ").slice(0, 160);
}

export function DemoWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoWorkspaceState>(cloneDefaultState);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);

  const commit = useCallback((next: DemoWorkspaceState) => {
    stateRef.current = next;
    setState(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("polaris:workspace-change", { detail: { revision: next.revision } }));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = parseStoredState(window.localStorage.getItem(storageKey));
      if (saved) commit(saved);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [commit]);

  useEffect(() => {
    if (!hydrated) return;
    const persisted: DemoWorkspaceState = { ...state, focusedItem: null };
    window.localStorage.setItem(storageKey, JSON.stringify(persisted));
  }, [hydrated, state]);

  const getState = useCallback(() => stateRef.current, []);

  const addQueueItem = useCallback<DemoWorkspaceContextValue["addQueueItem"]>(
    (sourceId, priority, reason, createdBy) => {
      const source = getSource(sourceId);
      if (!source) return { ok: false, error: "Source ID does not exist in the current preview workspace." };
      if (!isPriority(priority)) return { ok: false, error: "Priority must be urgent, high, or normal." };

      const safeReason = boundedReason(reason);
      if (!safeReason) return { ok: false, error: "Reason must contain between 1 and 160 characters." };

      const current = stateRef.current;
      const existing = current.queue.find((item) => item.sourceId === sourceId);
      if (existing) return { ok: true, item: existing, created: false };

      const createdOrder = current.queue.reduce((max, item) => Math.max(max, item.createdOrder), 0) + 1;
      const item: QueueItem = {
        id: `queue-${sourceId}`,
        sourceId,
        sourceKind: source.kind,
        sourcePlatform: source.platform,
        sourceType: source.kind === "chat" ? source.classification : source.type,
        summary: getQueueSummary(source).slice(0, 180),
        priority,
        reason: safeReason,
        status: "new",
        createdAt: `12:09:${String(createdOrder).padStart(2, "0")} PM`,
        createdOrder,
        createdBy,
      };
      commit({
        ...current,
        queue: [...current.queue, item],
        revision: current.revision + 1,
      });
      toast.success(createdBy === "agent" ? "Producer added an item" : "Added to Producer Queue", {
        description: item.summary,
      });
      return { ok: true, item, created: true };
    },
    [commit],
  );

  const updateQueueItem = useCallback<DemoWorkspaceContextValue["updateQueueItem"]>(
    (itemId, patch, changedBy) => {
      const current = stateRef.current;
      const existing = current.queue.find((item) => item.id === itemId);
      if (!existing) return { ok: false, error: "Queue item ID does not exist." };
      if (patch.priority !== undefined && !isPriority(patch.priority)) {
        return { ok: false, error: "Priority must be urgent, high, or normal." };
      }
      if (patch.status !== undefined && !isQueueStatus(patch.status)) {
        return { ok: false, error: "Status must be new, ready, handled, or dismissed." };
      }
      const safeReason = patch.reason === undefined ? undefined : boundedReason(patch.reason);
      if (patch.reason !== undefined && !safeReason) {
        return { ok: false, error: "Reason must contain between 1 and 160 characters." };
      }

      const item: QueueItem = {
        ...existing,
        ...(patch.priority ? { priority: patch.priority } : {}),
        ...(patch.status ? { status: patch.status } : {}),
        ...(safeReason ? { reason: safeReason } : {}),
      };
      commit({
        ...current,
        queue: current.queue.map((candidate) => (candidate.id === itemId ? item : candidate)),
        revision: current.revision + 1,
      });
      toast.success(changedBy === "agent" ? "Producer updated the queue" : "Queue item updated", {
        description: item.summary,
      });
      return { ok: true, item };
    },
    [commit],
  );

  const setFocusedItem = useCallback<DemoWorkspaceContextValue["setFocusedItem"]>(
    (item, changedBy = "human") => {
      if (item) {
        const exists =
          (item.kind === "chat" && chatMessages.some((message) => message.id === item.id)) ||
          (item.kind === "activity" && activityEvents.some((event) => event.id === item.id)) ||
          (item.kind === "queue" && stateRef.current.queue.some((queueItem) => queueItem.id === item.id));
        if (!exists) return false;
      }
      const current = stateRef.current;
      commit({ ...current, focusedItem: item, revision: current.revision + 1 });
      if (item && changedBy === "agent") {
        toast("Producer focused the workspace", { description: "The source item is highlighted in the shared view." });
      }
      return true;
    },
    [commit],
  );

  const setFilters = useCallback<DemoWorkspaceContextValue["setFilters"]>(
    (patch, changedBy = "human") => {
      const current = stateRef.current;
      const nextFilters: WorkspaceFilters = {
        platform:
          patch.platform === "all" || isPlatformKey(patch.platform)
            ? patch.platform
            : current.filters.platform,
        activityScope:
          patch.activityScope === "all" || patch.activityScope === "community" || patch.activityScope === "system"
            ? patch.activityScope
            : current.filters.activityScope,
        attention: isAttentionFilter(patch.attention) ? patch.attention : current.filters.attention,
      };
      commit({ ...current, filters: nextFilters, revision: current.revision + 1 });
      if (changedBy === "agent") toast("Producer adjusted the workspace filters");
      return nextFilters;
    },
    [commit],
  );

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    commit({ ...cloneDefaultState(), revision: stateRef.current.revision + 1 });
    toast.success("Producer Rush reset", { description: "Queue, filters, and focus returned to the starting state." });
  }, [commit]);

  const value = useMemo<DemoWorkspaceContextValue>(
    () => ({
      state,
      hydrated,
      getState,
      addQueueItem,
      updateQueueItem,
      setFocusedItem,
      setFilters,
      resetDemo,
    }),
    [state, hydrated, getState, addQueueItem, updateQueueItem, setFocusedItem, setFilters, resetDemo],
  );

  return <DemoWorkspaceContext.Provider value={value}>{children}</DemoWorkspaceContext.Provider>;
}

export function useDemoWorkspace() {
  const context = useContext(DemoWorkspaceContext);
  if (!context) throw new Error("useDemoWorkspace must be used inside DemoWorkspaceProvider");
  return context;
}

export function getSourceLabel(sourceId: string) {
  const source = getSource(sourceId);
  if (!source) return "Unknown preview source";
  if (source.kind === "chat") return `${platformMeta[source.platform].label} · ${source.author}`;
  return `${platformMeta[source.platform].label} · ${source.title}`;
}
