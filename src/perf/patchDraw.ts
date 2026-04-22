import Konva from "konva";

export function patchDrawMethods(stage: Konva.Stage, store: any) {
  const patched = new Set<Konva.Layer>();
  const restoreFns: Array<() => void> = [];

  function patchLayer(layer: Konva.Layer) {
    if (patched.has(layer)) return;
    patched.add(layer);

    const originalDraw = layer.draw;
    const originalBatchDraw = layer.batchDraw;

    layer.draw = function (...args: any[]) {
      const start = performance.now();
      const result = originalDraw.apply(this, args as any);
      const duration = performance.now() - start;

      store.recordDraw({
        layerId: layer.id() || `layer-${(layer as any)._id}`,
        layerName: layer.name() || undefined,
        duration,
        kind: "draw"
      });

      return result;
    } as any;

    layer.batchDraw = function (...args: any[]) {
      const start = performance.now();
      const result = originalBatchDraw.apply(this, args as any);
      const duration = performance.now() - start;

      store.recordDraw({
        layerId: layer.id() || `layer-${(layer as any)._id}`,
        layerName: layer.name() || undefined,
        duration,
        kind: "batchDraw"
      });

      return result;
    } as any;

    restoreFns.push(() => {
      layer.draw = originalDraw;
      layer.batchDraw = originalBatchDraw;
    });
  }

  function patchExistingLayers() {
    stage.find("Layer").forEach((node) => patchLayer(node as Konva.Layer));
  }

  patchExistingLayers();
  const intervalId = window.setInterval(patchExistingLayers, 1000);

  return function unpatch() {
    window.clearInterval(intervalId);
    restoreFns.forEach((fn) => fn());
  };
}
