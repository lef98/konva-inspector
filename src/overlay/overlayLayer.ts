import Konva from "konva";

export function createOverlay(stage: Konva.Stage) {
  const layer = new Konva.Layer({
    listening: false,
    name: "__konva_inspector_overlay__"
  });

  const rect = new Konva.Rect({
    stroke: "#00A3FF",
    strokeWidth: 1,
    dash: [4, 4],
    visible: false,
    listening: false
  });

  layer.add(rect);
  stage.add(layer);

  return {
    highlight(node: Konva.Node) {
      const box = node.getClientRect({
        skipTransform: false,
        skipShadow: false,
        skipStroke: false
      });

      rect.setAttrs({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        visible: true
      });

      layer.batchDraw();
    },
    clear() {
      rect.visible(false);
      layer.batchDraw();
    },
    destroy() {
      layer.destroy();
    }
  };
}
