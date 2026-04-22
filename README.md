# konva-inspector

Inspector and performance panel for Konva stages.

## Install

```bash
npm install konva konva-inspector
```

## Usage

```ts
import Konva from "konva";
import { attachKonvaInspector } from "konva-inspector";

const inspector = attachKonvaInspector(stage, {
  enabled: true,
  hotkey: "Alt+I",
  trackPerformance: true
});
```

## Features

- Stage/layer/node tree inspection
- Node detail panel
- Events panel aggregating stats for the past 5s
- On-canvas highlight overlay
- FPS tracking
- draw/batchDraw instrumentation
- Information on nodes in the stage
- warning signals for some likely performance issues
