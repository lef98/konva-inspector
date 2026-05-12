# konva-inspector

Inspector and performance panel for Konva stages.

## Install

```bash
npm install konva konva-inspector
```

The inspector injects its own styles automatically, so no separate CSS import is required.
The panel is mounted lazily and is only added to the DOM while the inspector is open.
Tree nodes are collapsible, and node attrs/meta are only loaded when you select a node.

## Usage

```ts
import Konva from "konva";
import { attachKonvaInspector } from "konva-inspector";

const inspector = attachKonvaInspector(stage, {
  hotkey: "Alt+I",
  trackPerformance: true
});
```

By default the inspector starts closed and mounts only after the hotkey is pressed.

## Features

- Stage/layer/node tree inspection
- Node detail panel
- Events panel aggregating stats for the past 5s
- On-canvas highlight overlay
- FPS tracking
- draw/batchDraw instrumentation
- Information on nodes in the stage
- warning signals for some likely performance issues
