import type { PerfSnapshot } from "../types";

export function renderPerf(container: HTMLElement, perf: PerfSnapshot) {
  const warnings = perf.warnings.length
    ? `<ul>${perf.warnings.map((w) => `<li>${w}</li>`).join("")}</ul>`
    : `<div class="ki-empty">No warnings</div>`;

  const canvasRows = perf.canvasInfo.length
    ? perf.canvasInfo
        .map(
          (c) => `
        <div class="ki-canvas-row">
          <span class="ki-canvas-label">Layer ${c.layerName ?? c.layerId}</span>
          <span class="ki-canvas-val">${c.cssWidth}×${c.cssHeight} CSS</span>
          <span class="ki-canvas-val">${c.pixelWidth}×${c.pixelHeight} px</span>
          <span class="ki-canvas-ratio${Math.abs(c.pixelRatio - window.devicePixelRatio) > 0.1 ? " ki-canvas-ratio--warn" : ""}">×${c.pixelRatio.toFixed(2)}</span>
        </div>`
        )
        .join("")
    : `<div class="ki-empty">No layers</div>`;

  const cachedRows = perf.cachedNodes.length
    ? perf.cachedNodes
        .map(
          (n) => `
        <div class="ki-cached-row">
          <span class="ki-cached-type">${n.type}${n.name ? ` (${n.name})` : ""}</span>
          <span class="ki-cached-id">#${n.konvaId}</span>
          <span class="ki-cached-size">${n.cacheWidth > 0 ? `${n.cacheWidth}×${n.cacheHeight}px` : "—"}</span>
        </div>`
        )
        .join("")
    : `<div class="ki-empty">No cached nodes</div>`;

  container.innerHTML = `
    <div class="ki-section">
      <strong>Overview</strong>
      <div class="ki-metrics">
        <div><strong>FPS:</strong> ${perf.fps}</div>
        <div><strong>Draw calls:</strong> ${perf.drawCalls}</div>
        <div><strong>BatchDraw calls:</strong> ${perf.batchDrawCalls}</div>
        <div><strong>Total nodes:</strong> ${perf.nodeCounts.total}</div>
        <div><strong>Off-screen shapes:</strong> ${perf.nodeCounts.offscreen}</div>
        <div><strong>Cached nodes:</strong> ${perf.nodeCounts.cached}</div>
      </div>
    </div>
    <div class="ki-section">
      <strong>Cached Nodes</strong>
      <div class="ki-cached-header">
        <span>Node</span><span>ID</span><span>Buffer size</span>
      </div>
      ${cachedRows}
    </div>
    <div class="ki-section">
      <strong>Canvas Layers</strong>
      <div class="ki-canvas-header">
        <span>Layer</span><span>CSS size</span><span>Pixel size</span><span>Ratio</span>
      </div>
      ${canvasRows}
    </div>
    <div class="ki-section">
      <strong>Warnings</strong>
      ${warnings}
    </div>
  `;
}
