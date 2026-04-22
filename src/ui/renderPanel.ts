import { renderTree } from "./renderTree";
import { renderDetails } from "./renderDetails";
import { renderPerf } from "./renderPerf";
import { renderEvents } from "./renderEvents";

type Tab = "tree" | "perf" | "events";

export function renderPanel(root: HTMLElement, store: any) {
  const state = store.getState();

  // Bootstrap the shell once.
  if (!root.querySelector(".ki-tab-bar")) {
    root.innerHTML = `
      <div class="ki-header">Konva Inspector</div>
      <div class="ki-tab-bar">
        <button class="ki-tab" data-tab="tree">Tree</button>
        <button class="ki-tab" data-tab="perf">Performance</button>
        <button class="ki-tab" data-tab="events">Events</button>
      </div>
      <div class="ki-tab-panel" data-panel="tree">
        <div class="ki-body">
          <div class="ki-tree"></div>
          <div class="ki-details"></div>
        </div>
      </div>
      <div class="ki-tab-panel" data-panel="perf">
        <div class="ki-perf"></div>
      </div>
      <div class="ki-tab-panel" data-panel="events">
        <div class="ki-events"></div>
      </div>
    `;

    if (!root.dataset.activeTab) root.dataset.activeTab = "tree";

    root.querySelectorAll<HTMLButtonElement>(".ki-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.dataset.activeTab = btn.dataset.tab!;
        syncActiveTab(root);
      });
    });
  }

  syncActiveTab(root);

  const activeTab = (root.dataset.activeTab ?? "tree") as Tab;

  if (activeTab === "tree") {
    const treeEl = root.querySelector(".ki-tree") as HTMLElement;
    const detailsEl = root.querySelector(".ki-details") as HTMLElement;
    const treeScroll = treeEl.scrollTop;
    const detailsScroll = detailsEl.scrollTop;
    renderTree(treeEl, state.tree, store);
    renderDetails(detailsEl, state.selectedNode);
    treeEl.scrollTop = treeScroll;
    detailsEl.scrollTop = detailsScroll;
  } else if (activeTab === "perf") {
    const perfEl = root.querySelector(".ki-perf") as HTMLElement;
    renderPerf(perfEl, state.perf);
  } else if (activeTab === "events") {
    const eventsEl = root.querySelector(".ki-events") as HTMLElement;
    const scroll = eventsEl.scrollTop;
    renderEvents(eventsEl, state.eventFrequencies ?? []);
    eventsEl.scrollTop = scroll;
  }
}

function syncActiveTab(root: HTMLElement) {
  const active = root.dataset.activeTab ?? "tree";

  root.querySelectorAll<HTMLElement>(".ki-tab").forEach((btn) => {
    btn.classList.toggle("ki-tab--active", btn.dataset.tab === active);
  });

  root.querySelectorAll<HTMLElement>(".ki-tab-panel").forEach((panel) => {
    panel.classList.toggle("ki-tab-panel--active", panel.dataset.panel === active);
  });
}
