import type { NodeSnapshot, NodeDetails, PerfSnapshot, EventFrequency, CanvasLayerInfo, CachedNodeInfo } from "../types";
import { buildWarnings } from "../perf/warnings";
import type Konva from "konva";
import { serializeNodeDetails } from "../tree/serializeNode";
import { findSnapshotByKonvaId, findSnapshotPathByKonvaId } from "../utils/treeSearch";

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
  selectedNode: NodeDetails | null;
  expandedNodeIds: Set<string>;
  fps: number;
  draws: DrawRecord[];
  events: EventRecord[];
  eventFrequencies: EventFrequency[];
  perf: PerfSnapshot;
};

export function createInspectorStore(stage: Konva.Stage) {
  const listeners = new Set<() => void>();
  const selectionListeners = new Set<(node: NodeDetails | null) => void>();

  const state: State = {
    tree: null,
    selectedNode: null,
    expandedNodeIds: new Set<string>(),
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

  let sceneSummary = {
    nodeCounts: {
      total: 0,
      byType: {} as Record<string, number>,
      listening: 0,
      visible: 0,
      cached: 0,
      offscreen: 0
    },
    canvasInfo: [] as CanvasLayerInfo[],
    cachedNodes: [] as CachedNodeInfo[]
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

    function walk(n: NodeSnapshot) {
      result.total += 1;
      result.byType[n.type] = (result.byType[n.type] || 0) + 1;
      n.children.forEach(walk);
    }

    walk(node);

    return result;
  }

  function findKonvaNodeById(konvaId: number | string) {
    return (
      stage.findOne((node: Konva.Node) => String((node as any)._id) === String(konvaId)) ?? null
    );
  }

  function getOffscreenCount() {
    const stageW = stage.width();
    const stageH = stage.height();
    const shapes = stage.find((node: Konva.Node) => node.getType() === "Shape");

    let offscreen = 0;

    for (const shape of shapes) {
      const anyShape = shape as any;
      const pos = shape.getAbsolutePosition();
      const width = typeof anyShape.width === "function" ? anyShape.width() : 0;
      const height = typeof anyShape.height === "function" ? anyShape.height() : 0;
      const right = pos.x + width;
      const bottom = pos.y + height;

      if (right < 0 || pos.x > stageW || bottom < 0 || pos.y > stageH) {
        offscreen += 1;
      }
    }

    return offscreen;
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

  function refreshSceneSummary() {
    const baseCounts = countNodes(state.tree);

    sceneSummary = {
      nodeCounts: {
        ...baseCounts,
        listening: stage.find((node: Konva.Node) => node.listening()).length,
        visible: stage.find((node: Konva.Node) => node.visible()).length,
        cached: stage.find((node: Konva.Node) => (node as any).isCached?.()).length,
        offscreen: getOffscreenCount()
      },
      canvasInfo: getCanvasInfo(),
      cachedNodes: getCachedNodeInfo()
    };
  }

  function setSelectedNodeDetails(node: NodeDetails | null) {
    state.selectedNode = node;
    selectionListeners.forEach((fn) => fn(node));
    emit();
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

    const warnings = buildWarnings({
      totalNodes: sceneSummary.nodeCounts.total,
      listeningNodes: sceneSummary.nodeCounts.listening,
      cachedNodes: sceneSummary.nodeCounts.cached,
      offscreenNodes: sceneSummary.nodeCounts.offscreen,
      canvasInfo: sceneSummary.canvasInfo,
      layerStats
    });

    state.perf = {
      fps: state.fps,
      drawCalls,
      batchDrawCalls,
      layerStats,
      canvasInfo: sceneSummary.canvasInfo,
      cachedNodes: sceneSummary.cachedNodes,
      nodeCounts: sceneSummary.nodeCounts,
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
    subscribeSelection(fn: (node: NodeDetails | null) => void) {
      selectionListeners.add(fn);
      return () => selectionListeners.delete(fn);
    },
    setTree(tree: NodeSnapshot) {
      state.tree = tree;
      if (state.expandedNodeIds.size === 0) {
        state.expandedNodeIds.add(String(tree.konvaId));
      }
      if (state.selectedNode) {
        const selectedNode = findKonvaNodeById(state.selectedNode.konvaId);
        state.selectedNode = selectedNode ? serializeNodeDetails(selectedNode) : null;
        if (!state.selectedNode) {
          selectionListeners.forEach((fn) => fn(null));
        }
      }
      refreshSceneSummary();
      refreshPerfSummary();
    },
    selectNode(konvaId: number | string) {
      if (!state.tree) return;

      const snapshot = findSnapshotByKonvaId(state.tree, konvaId);
      if (!snapshot) return;

      const path = findSnapshotPathByKonvaId(state.tree, konvaId) ?? [snapshot];
      path.forEach((entry) => state.expandedNodeIds.add(String(entry.konvaId)));

      const node = findKonvaNodeById(konvaId);
      setSelectedNodeDetails(node ? serializeNodeDetails(node) : null);
    },
    clearSelectedNode() {
      setSelectedNodeDetails(null);
    },
    toggleNodeExpanded(konvaId: number | string) {
      const key = String(konvaId);
      if (state.expandedNodeIds.has(key)) state.expandedNodeIds.delete(key);
      else state.expandedNodeIds.add(key);
      emit();
    },
    setFps(fps: number) {
      state.fps = fps;
    },
    recordDraw(draw: Omit<DrawRecord, "ts">) {
      state.draws.push({
        ...draw,
        ts: performance.now()
      });
    },
    recordEvent(type: string) {
      state.events.push({ type, ts: performance.now() });
    },
    refreshPerfSummary
  };
}
