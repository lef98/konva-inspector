import type { CanvasLayerInfo } from "../types";

type LayerStat = {
  layerId: string;
  drawCalls: number;
  avgDrawMs: number;
};

export function buildWarnings(input: {
  totalNodes: number;
  listeningNodes: number;
  cachedNodes: number;
  offscreenNodes: number;
  canvasInfo: CanvasLayerInfo[];
  layerStats: LayerStat[];
}): string[] {
  const warnings: string[] = [];

  if (input.totalNodes > 2000) {
    warnings.push(`High node count detected: ${input.totalNodes}`);
  }

  if (input.listeningNodes > 1000) {
    warnings.push(`Large number of listening nodes: ${input.listeningNodes}`);
  }

  if (input.cachedNodes > 500) {
    warnings.push(`Large number of cached nodes: ${input.cachedNodes}`);
  }

  if (input.offscreenNodes > 0) {
    warnings.push(`${input.offscreenNodes} shape(s) are off-screen but still rendered`);
  }

  for (const layer of input.canvasInfo) {
    const expectedPixelRatio = window.devicePixelRatio || 1;
    if (Math.abs(layer.pixelRatio - expectedPixelRatio) > 0.1) {
      warnings.push(
        `Layer ${layer.layerId}: pixel ratio ${layer.pixelRatio.toFixed(2)} differs from device ratio ${expectedPixelRatio.toFixed(2)}`
      );
    }
  }

  for (const layer of input.layerStats) {
    if (layer.drawCalls > 120) {
      warnings.push(`Layer ${layer.layerId} redraws very frequently`);
    }
    if (layer.avgDrawMs > 8) {
      warnings.push(`Layer ${layer.layerId} has expensive redraws`);
    }
  }

  return warnings;
}
