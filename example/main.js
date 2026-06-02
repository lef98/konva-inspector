import Konva from 'konva';
import { attachKonvaInspector } from '../src/index';

const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

const shapes = ['rect', 'circle', 'ellipse'];
const colors = ['#4f8ef7', '#f74f4f', '#4ff77a', '#f7c94f', '#c34ff7', '#4ff0f7'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnNode() {
  const type = shapes[Math.floor(Math.random() * shapes.length)];
  const fill = colors[Math.floor(Math.random() * colors.length)];
  const x = randomBetween(50, stage.width() - 50);
  const y = randomBetween(50, stage.height() - 50);

  let shape;
  if (type === 'rect') {
    shape = new Konva.Rect({
      x,
      y,
      width: randomBetween(40, 160),
      height: randomBetween(30, 120),
      fill,
      cornerRadius: randomBetween(0, 16),
      draggable: true,
    });
  } else if (type === 'circle') {
    shape = new Konva.Circle({
      x,
      y,
      radius: randomBetween(20, 80),
      fill,
      draggable: true,
    });
  } else {
    shape = new Konva.Ellipse({
      x,
      y,
      radiusX: randomBetween(30, 100),
      radiusY: randomBetween(20, 60),
      fill,
      draggable: true,
    });
  }

  layer.add(shape);
}

document.getElementById('spawn-btn').addEventListener('click', spawnNode);

document.getElementById('spawn-offscreen-btn').addEventListener('click', () => {
  const offscreenPositions = [
    { x: -200, y: randomBetween(0, stage.height()) },
    { x: stage.width() + 100, y: randomBetween(0, stage.height()) },
    { x: randomBetween(0, stage.width()), y: -200 },
    { x: randomBetween(0, stage.width()), y: stage.height() + 100 },
  ];
  const pos = offscreenPositions[Math.floor(Math.random() * offscreenPositions.length)];
  const fill = colors[Math.floor(Math.random() * colors.length)];
  const shape = new Konva.Rect({
    x: pos.x,
    y: pos.y,
    width: randomBetween(40, 120),
    height: randomBetween(40, 120),
    fill,
    draggable: true,
  });
  layer.add(shape);
});

// Spawn a few nodes on load
for (let i = 0; i < 3; i++) spawnNode();

attachKonvaInspector(stage, {
  backgroundColor: 'rgba(17, 17, 17, 0.92)',
  textColor: '#f5f5f5',
});
