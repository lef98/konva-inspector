import Konva from "konva";
import { attachKonvaInspector } from "../src";

const width = window.innerWidth;
const height = window.innerHeight;

const stage = new Konva.Stage({
  container: "app",
  width,
  height
});

const layer = new Konva.Layer({ id: "main-layer" });
stage.add(layer);

const rect = new Konva.Rect({
  id: "player",
  name: "playerRect",
  x: 80,
  y: 80,
  width: 120,
  height: 80,
  fill: "tomato",
  draggable: true
});

const circle = new Konva.Circle({
  id: "enemy",
  x: 280,
  y: 160,
  radius: 40,
  fill: "skyblue",
  draggable: true
});

layer.add(rect);
layer.add(circle);
layer.draw();

attachKonvaInspector(stage, {
  trackPerformance: true,
  highlightSelection: true
});
