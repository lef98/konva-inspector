import type { EventFrequency } from "../types";

export function renderEvents(container: HTMLElement, frequencies: EventFrequency[]) {
  if (frequencies.length === 0) {
    container.innerHTML = `<div class="ki-empty">No events yet — interact with the canvas.</div>`;
    return;
  }

  const sorted = [...frequencies].sort((a, b) => b.count - a.count);

  const rows = sorted
    .map(
      (f) => `
      <div class="ki-event-row">
        <span class="ki-event-name">${f.type}</span>
        <span class="ki-event-count">${f.count}</span>
        <span class="ki-event-rate">${f.perSecond.toFixed(1)}/s</span>
      </div>`
    )
    .join("");

  container.innerHTML = `
    <div class="ki-event-header">
      <span>Event</span><span>Count (5s)</span><span>Rate</span>
    </div>
    ${rows}
  `;
}
