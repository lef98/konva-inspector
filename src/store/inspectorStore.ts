import type { NodeSnapshot, PerfSnapshot, EventFrequency, CanvasLayerInfo, CachedNodeInfo } from "../types";
import { buildWarnings } from "../perf/warnings";
import type Konva from "konva";

type EventRecord = {
  type: string;
  ts: number;
};

type DrawRecord = {
  layerId: string;
  layerName?: string;
  duration: number;
  kind: "draw" | "batchDraw";
  ts: number;
};

type State = {
  tree: NodeSnapshot | null;
  selectedNode: NodeSnapshot | null;
  fps: number;
  draws: DrawRecord[];
  events: EventRecord[];
  eventFrequencies: EventFrequency[];
  perf: PerfSnapshot;
};

export function createInspectorStore(stage: Konva.Stage) {
  const listeners = new Set<() => void>();
  const selectionListeners = new Set<(node: NodeSnapshot | null) => void>();

  const state: State = {
    tree: null,
    selectedNode: null,
    fps: 0,
    draws: [],
    events: [],
    eventFrequencies: [],
    perf: {
      fps: 0,
      drawCalls: 0,
      batchDrawCalls: 0,
      layerStats: [],
      canvasInfo: [],
      cachedNodes: [],
      nodeCounts: {
        total: 0,
        byType: {},
        listening: 0,
        visible: 0,
        cached: 0,
        offscreen: 0
      },
      warnings: []
    }
  };

  function emit() {
    listeners.forEach((fn) => fn());
  }

  function countNodes(node: NodeSnapshot | null) {
    const result = {
      total: 0,
      byType: {} as Record<string, number>,
      listening: 0,
      visible: 0,
      cached: 0,
      offscreen: 0
    };

    if (!node) return result;

    const stageW = stage.width();
    const stageH = stage.height();

    function walk(n: NodeSnapshot) {
      result.total += 1;
      result.byType[n.type] = (result.byType[n.type] || 0) + 1;
      if (n.meta.listening) result.listening += 1;
      if (n.meta.visible) result.visible += 1;
      if (n.meta.cached) result.cached += 1;
      n.children.forEach(walk);
    }

    walk(node);

    // Offscreen count: check all visible shapes using Konva absolute positions.
    const shapes = stage.find((n: Konva.Node) => n.getType() === "Shape");
    for (const shape of shapes) {
      const pos = shape.getAbsolutePosition();
      const w = (shape as any).width ? (shape as any).width() : 0;
      const h = (shape as any).height ? (shape as any).height() : 0;
      const right = pos.x + w;
      const bottom = pos.y + h;
      if (right < 0 || pos.x > stageW || bottom < 0 || pos.y > stageH) {
        result.offscreen += 1;
      }
    }

    return result;
  }

  function getCanvasInfo(): CanvasLayerInfo[] {
    return stage.getLayers().map((layer: any) => {
      const domCanvas = layer.getCanvas()._canvas as HTMLCanvasElement;
      const cssWidth = layer.width();
      const cssHeight = layer.height();
      const pixelWidth = domCanvas.width;
      const pixelHeight = domCanvas.height;
      return {
        layerId: String(layer._id),
        layerName: layer.name() || undefined,
        cssWidth,
        cssHeight,
        pixelWidth,
        pixelHeight,
        pixelRatio: cssWidth > 0 ? pixelWidth / cssWidth : window.devicePixelRatio
      };
    });
  }

  function getCachedNodeInfo(): CachedNodeInfo[] {
    const results: CachedNodeInfo[] = [];
    const nodes = stage.find((n: Konva.Node) => (n as any).isCached?.());
    for (const node of nodes) {
      const anyNode = node as any;
      const cacheCanvas: HTMLCanvasElement | undefined =
        anyNode._cache?.get("canvas")?._canvas ??
        anyNode._cache?.get("canvas");
      results.push({
        konvaId: String(anyNode._id),
        type: node.getClassName(),
        name: node.name() || undefined,
        cacheWidth: cacheCanvas?.width ?? 0,
        cacheHeight: cacheCanvas?.height ?? 0
      });
    }
    return results;
  }

  function refreshPerfSummary() {
    const now = performance.now();
    const cutoff = now - 5000;
    state.draws = state.draws.filter((d) => d.ts >= cutoff);
    state.events = state.events.filter((e) => e.ts >= cutoff);

    const eventCounts = new Map<string, number>();
    for (const e of state.events) {
      eventCounts.set(e.type, (eventCounts.get(e.type) ?? 0) + 1);
    }
    const windowSec = Math.min((now - cutoff) / 1000, 5);
    state.eventFrequencies = Array.from(eventCounts.entries()).map(([type, count]) => ({
      type,
      count,
      perSecond: windowSec > 0 ? count / windowSec : 0
    }));

    const drawCalls = state.draws.filter((d) => d.kind === "draw").length;
    const batchDrawCalls = state.draws.filter((d) => d.kind === "batchDraw").length;

    const grouped = new Map<
      string,
      { layerId: string; layerName?: string; drawDurations: number[]; batchDrawCalls: number; drawCalls: number }
    >();

    for (const d of state.draws) {
      const current = grouped.get(d.layerId) ?? {
        layerId: d.layerId,
        layerName: d.layerName,
        drawDurations: [],
        batchDrawCalls: 0,
        drawCalls: 0
      };

      if (d.kind === "draw") {
        current.drawCalls += 1;
        current.drawDurations.push(d.duration);
      } else {
        current.batchDrawCalls += 1;
      }

      grouped.set(d.layerId, current);
    }

    const layerStats = Array.from(grouped.values()).map((g) => {
      const avgDrawMs =
        g.drawDurations.length > 0
          ? g.drawDurations.reduce((a, b) => a + b, 0) / g.drawDurations.length
          : 0;

      const maxDrawMs = g.drawDurations.length > 0 ? Math.max(...g.drawDurations) : 0;

      return {
        layerId: g.layerId,
        layerName: g.layerName,
        drawCalls: g.drawCalls,
        batchDrawCalls: g.batchDrawCalls,
        avgDrawMs,
        maxDrawMs
      };
    });

    const nodeCounts = countNodes(state.tree);
    const canvasInfo = getCanvasInfo();
    const cachedNodes = getCachedNodeInfo();
    const warnings = buildWarnings({
      totalNodes: nodeCounts.total,
      listeningNodes: nodeCounts.listening,
      cachedNodes: nodeCounts.cached,
      offscreenNodes: nodeCounts.offscreen,
      canvasInfo,
      layerStats
    });

    state.perf = {
      fps: state.fps,
      drawCalls,
      batchDrawCalls,
      layerStats,
      canvasInfo,
      cachedNodes,
      nodeCounts,
      warnings
    };

    emit();
  }

  return {
    getState() {
      return state;
    },
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    subscribeSelection(fn: (node: NodeSnapshot | null) => void) {
      selectionListeners.add(fn);
      return () => selectionListeners.delete(fn);
    },
    setTree(tree: NodeSnapshot) {
      state.tree = tree;
      refreshPerfSummary();
    },
    setSelectedNode(node: NodeSnapshot | null) {
      state.selectedNode = node;
      selectionListeners.forEach((fn) => fn(node));
      emit();
    },
    setFps(fps: number) {
      state.fps = fps;
      refreshPerfSummary();
    },
    recordDraw(draw: Omit<DrawRecord, "ts">) {
      state.draws.push({
        ...draw,
        ts: performance.now()
      });
      refreshPerfSummary();
    },
    recordEvent(type: string) {
      state.events.push({ type, ts: performance.now() });
    },
    refreshPerfSummary
  };
}
