import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function renderPath(worker, pathname) {
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the public preview with truthful synthetic-data disclosure", async () => {
  const worker = await loadWorker();
  const response = await renderPath(worker, "/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /Polaris Chat — Public Preview/);
  assert.match(html, /Every community/);
  assert.match(html, /Every message, event, identity, metric, and connection state[^<]*simulated/i);
  assert.match(html, /Launch Interactive Preview/);
});

test("renders every requested workspace route without authentication", async () => {
  const worker = await loadWorker();
  for (const pathname of ["/app/chat", "/app/activity", "/app/queue", "/app/platforms", "/app/settings"]) {
    const response = await renderPath(worker, pathname);
    const html = await response.text();
    assert.equal(response.status, 200, pathname);
    assert.match(html, /Interactive Preview/i, pathname);
  }
});

