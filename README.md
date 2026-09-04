# Polaris Chat — Public Preview

**Every community. One North Star.**

This repository contains the isolated OpenAI WebMCP Challenge edition of Polaris Chat. It is a polished, deterministic browser preview of a future creator workspace for Twitch, YouTube, Kick, TikTok LIVE, and X Live.

The challenge edition does not connect to creator accounts or provider APIs. Every visible identity, message, event, metric, connection state, and timestamp is synthetic.

## Product foundations and challenge work

Polaris Chat existed as a private product concept and development project before the OpenAI WebMCP Challenge. Its pre-existing foundations include the **Polaris Chat** name, **Every community. One North Star.** tagline, luminous North Star identity, premium dark navy creator-workspace direction, five-platform product vision, and the core Chat, Activity, Platform Hub, and Settings navigation concepts.

This public repository contains the separately authored challenge edition. Challenge-specific work includes the deterministic **Producer Rush** scenario, a steady-to-busy near-Partner preview pace, synthetic five-platform fixtures, ARC Raiders stream-recall signals, a pauseable motion preview, the shared **Producer Queue**, all eight browser-registered WebMCP tools, local persistence and Reset Demo, the public-preview disclosure and landing experience, and the explicit untrusted-content and human-control boundaries.

The private production repository, its Git history, runtime configuration, credentials, provider implementations, and real data are not included here. This repository is an isolated public challenge implementation, not a publication or fork of the private production codebase.

## Challenge story

A multistream creator cannot perform, follow several fast-moving chats, catch technical problems, notice viewer questions, and remember every community moment at the same time.

Polaris adds a shared **Producer Queue**. ChatGPT can inspect the same preview workspace the creator sees, organize existing Chat and Activity sources, and visibly focus the highest-priority item. The creator can inspect every suggestion, change its priority, mark it handled, dismiss it, or reopen it.

The agent cannot send messages, reply, moderate viewers, connect accounts, authorize OAuth, open arbitrary links, or control a broadcast.

## Setup

Requirements: Node.js 22.13 or newer.

```bash
npm ci
```

No environment variables, database, provider token, OAuth application, webhook listener, Docker service, or background worker is required.

## Run locally

```bash
npm run dev
```

Open the local URL printed by the development server, then launch the Interactive Preview.

## Build

```bash
npm run build
```

The production build emits the Cloudflare Workers-compatible application and client assets under `dist/`.

## Test

```bash
npm run lint
npm test
```

`npm test` performs a fresh production build and verifies the public disclosure, all workspace routes, the complete WebMCP tool family, simulated platform fixtures, responsive/accessibility safeguards, and the inert viewer-content boundary.

## WebMCP tools

The application progressively registers eight imperative tools from the top-level page with `document.modelContext.registerTool(...)`:

| Tool | Effect |
| --- | --- |
| `get_live_workspace_snapshot` | Read the current scenario, filters, counts, focus, queue totals, and simulated connection state. |
| `list_recent_chat_messages` | Read bounded synthetic Chat rows that have visibly arrived. Viewer text is explicitly untrusted content. |
| `list_recent_community_events` | Read bounded synthetic Community and System Activity. |
| `get_producer_queue` | Read the same queue visible to the creator. |
| `add_producer_queue_item` | Add an existing Chat or Activity source to the visible local queue. |
| `update_producer_queue_item` | Change only priority, status, or a bounded reason on an existing queue item. |
| `focus_workspace_item` | Switch to and visibly focus an existing local Chat, Activity, or queue item. |
| `set_workspace_filter` | Change strict-enum workspace filters and lanes. |

Polaris remains fully usable when WebMCP is unavailable.

## Using WebMCP

1. Open the deployed Site in a ChatGPT browser that supports Site tools.
2. Launch **Interactive Preview**. Chat starts at zero and deterministic messages visibly enter the main feed.
3. Ask ChatGPT to inspect recent Chat and Activity or use the challenge prompt below.
4. Review every resulting queue mutation in the visible **Producer Queue**.
5. Mark, dismiss, reopen, or reprioritize items yourself; the agent reads the same shared local state on the next turn.

WebMCP is progressive enhancement. A normal browser can use every human-facing preview control without WebMCP support.

## Demo workflow

Start with the empty Producer Queue and ask:

> I’m live and Chat is moving too fast. Review the recent messages and community activity. Add the three things I should handle next to the Producer Queue. Prioritize technical problems and unanswered viewer questions above celebrations. Focus the workspace on the most urgent item. Do not send messages, reply, moderate anyone, or open an external service.

The intended result is:

1. **Urgent:** three viewers across YouTube, Kick, and TikTok LIVE report microphone dropouts.
2. **High:** a Twitch viewer asks what capture card and microphone the creator uses.
3. **Normal:** a notable community celebration such as the Level 4 Hype Train.

Mark the urgent item **Handled**, then ask:

> What still needs my attention? Reprioritize the remaining queue.

The handled item remains visible as evidence that the human and agent share persistent state.

The same deterministic scenario also supports stream recall. Ask:

> Did I miss any Blueprints in today’s stream?

The grounded answer is **yes: the Bobcat Blueprint**. Four synthetic viewers across Twitch, YouTube, Kick, and TikTok LIVE call out the yellow-workbench pickup and confirm that it was left behind before extraction. A separate isolated “game is lagging” comment is paired with a viewer who says stream playback remained smooth, preserving the distinction between a gameplay hitch and the higher-priority cross-platform microphone problem.

## Safety boundary

- React renders viewer text as inert text; the application never injects viewer HTML.
- Chat tool results label viewer content as untrusted data, not instructions.
- Tool inputs use narrow JSON Schemas, strict enums, bounded strings, and `additionalProperties: false`.
- Queue mutations accept only stable source IDs already present in the deterministic fixture set.
- State is stored only in browser `localStorage` and can be reset from the interface.
- Interactive Chat starts blank, receives deterministic messages at the displayed cadence, and restarts from blank with Reset Demo. The WebMCP read tool sees only messages that have visibly arrived.
- Preview movement uses deterministic local timers, pauses while the tab is hidden or when the viewer pauses it, and honors the operating system's reduced-motion preference.
- No real Polaris provider implementation, credential, payload, private user data, or production runtime is included.

WebMCP implementation follows the current [OpenAI Site tools documentation](https://learn.chatgpt.com/docs/webmcp).

## Deployment

The challenge edition is hosted at [polaris-chat-webmcp.theburritolion.chatgpt.site](https://polaris-chat-webmcp.theburritolion.chatgpt.site).

The checked-in `.openai/hosting.json` associates this isolated project with ChatGPT Sites. To publish an update:

1. Install dependencies with `npm ci`.
2. Run `npm run lint` and `npm test`.
3. Commit the exact validated source revision.
4. Use the ChatGPT Sites publishing workflow to build, save, and deploy that revision.
5. Recheck the public URL in a logged-out browser after deployment.

Do not add provider credentials or production account configuration to this preview. Hosted configuration, if ever needed, should be managed outside source control.

## License

This challenge edition is available under the [MIT License](LICENSE).
