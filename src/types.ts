export type InspectorOptions = {
  enabled?: boolean;
  hotkey?: string;
  dock?: "left" | "right" | "bottom";
  backgroundColor?: string;
  textColor?: string;
  trackPerformance?: boolean;
  highlightSelection?: boolean;
  pollInterval?: number;
};

export type InspectorHandle = {
  open(): void;
  close(): void;
  toggle(): void;
  rescan(): void;
  destroy(): void;
};

export type NodeSnapshot = {
  id: string;
  konvaId: number | string;
  type: string;
  name?: string;
  parentId?: string;
  children: NodeSnapshot[];
};

export type NodeDetails = {
  id: string;
  konvaId: number | string;
  type: string;
  name?: string;
  parentId?: string;
  childCount: number;
  attrs: Record<string, unknown>;
  meta: {
    visible: boolean;
    listening: boolean;
    opacity: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    cached?: boolean;
  };
};

export type PerfLayerStat = {
  layerId: string;
  layerName?: string;
  drawCalls: number;
  batchDrawCalls: number;
  avgDrawMs: number;
  maxDrawMs: number;
};

export type CanvasLayerInfo = {
  layerId: string;
  layerName?: string;
  cssWidth: number;
  cssHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  pixelRatio: number;
};

export type CachedNodeInfo = {
  konvaId: string;
  type: string;
  name?: string;
  cacheWidth: number;
  cacheHeight: number;
};

export type PerfSnapshot = {
  fps: number;
  drawCalls: number;
  batchDrawCalls: number;
  layerStats: PerfLayerStat[];
  canvasInfo: CanvasLayerInfo[];
  cachedNodes: CachedNodeInfo[];
  nodeCounts: {
    total: number;
    byType: Record<string, number>;
    listening: number;
    visible: number;
    cached: number;
    offscreen: number;
  };
  warnings: string[];
};

export type EventFrequency = {
  type: string;
  count: number;
  perSecond: number;
};
