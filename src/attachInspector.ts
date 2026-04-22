import Konva from "konva";
import { createInspectorStore } from "./store/inspectorStore";
import { scanStage } from "./tree/scanStage";
import { patchDrawMethods } from "./perf/patchDraw";
import { createFpsMonitor } from "./perf/fpsMonitor";
import { createEventMonitor } from "./perf/eventMonitor";
import { createOverlay } from "./overlay/overlayLayer";
import { mountPanel } from "./ui/mountPanel";
import { findSnapshotByKonvaId } from "./utils/treeSearch";
import { isHotkeyPressed } from "./utils/keyboard";
import type { InspectorHandle, InspectorOptions } from "./types";

export function attachKonvaInspector(
  stage: Konva.Stage,
  options: InspectorOptions = {}
): InspectorHandle {
  const opts = {
    enabled: true,
    hotkey: "Ctrl+Shift+K",
    dock: "right" as const,
    trackPerformance: true,
    highlightSelection: true,
    pollInterval: 500,
    ...options
  };

  const store = createInspectorStore(stage);
  const overlay = opts.highlightSelection ? createOverlay(stage) : null;
  const fpsMonitor = opts.trackPerformance ? createFpsMonitor(store) : null;
  const unpatch = opts.trackPerformance ? patchDrawMethods(stage, store) : () => {};
  const eventMonitor = createEventMonitor(stage, store);
  const panel = mountPanel(store, { dock: opts.dock });

  let isOpen = !!opts.enabled;
  let intervalId: number | null = null;

  function rescan() {
    const tree = scanStage(stage);
    store.setTree(tree);
  }

  function open() {
    isOpen = true;
    panel.show();
    rescan();
  }

  function close() {
    isOpen = false;
    panel.hide();
    overlay?.clear();
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (isHotkeyPressed(e, opts.hotkey)) {
      e.preventDefault();
      toggle();
    }
  }

  function onStageClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const clicked = e.target;
    const tree = store.getState().tree;
    if (!tree) return;

    const snapshot = findSnapshotByKonvaId(tree, (clicked as any)._id);
    if (snapshot) {
      store.setSelectedNode(snapshot);
      overlay?.highlight(clicked);
    }
  }

  store.subscribeSelection((node) => {
    if (!node) {
      overlay?.clear();
      return;
    }

    const realNode = stage.findOne((n: any) => (n as any)._id === Number(node.konvaId));
    if (realNode) overlay?.highlight(realNode);
  });

  intervalId = window.setInterval(() => {
    if (!isOpen) return;
    rescan();
    store.refreshPerfSummary();
  }, opts.pollInterval);

  stage.on("click tap", onStageClick);
  window.addEventListener("keydown", onKeyDown);

  if (isOpen) open();
  else close();

  return {
    open,
    close,
    toggle,
    rescan,
    destroy() {
      if (intervalId !== null) window.clearInterval(intervalId);
      stage.off("click tap", onStageClick);
      window.removeEventListener("keydown", onKeyDown);
      fpsMonitor?.destroy();
      overlay?.destroy();
      unpatch();
      eventMonitor.destroy();
      panel.destroy();
    }
  };
}
