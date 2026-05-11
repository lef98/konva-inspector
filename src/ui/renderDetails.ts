import type { NodeDetails } from "../types";

export function renderDetails(container: HTMLElement, node: NodeDetails | null) {
  if (!node) {
    container.innerHTML = `<div class="ki-empty">Select a node</div>`;
    return;
  }

  container.innerHTML = `
    <div class="ki-section">
      <div><strong>Type:</strong> ${node.type}</div>
      <div><strong>ID:</strong> ${node.id}</div>
      <div><strong>Name:</strong> ${node.name ?? "-"}</div>
      <div><strong>Children:</strong> ${node.childCount}</div>
      <div><strong>Visible:</strong> ${String(node.meta.visible)}</div>
      <div><strong>Listening:</strong> ${String(node.meta.listening)}</div>
      <div><strong>Cached:</strong> ${String(node.meta.cached)}</div>
    </div>
    <div class="ki-section">
      <strong>Attrs</strong>
      <pre>${escapeHtml(JSON.stringify(node.attrs, null, 2))}</pre>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
