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
  backgroundColor: "rgba(17, 17, 17, 0.92)",
  textColor: "#f5f5f5",
  trackPerformance: true
});
```

By default the inspector starts closed and mounts only after the hotkey is pressed.
`backgroundColor` and `textColor` are applied directly to the inspector root as inline CSS variables, and the panel stylesheet explicitly uses those values so the panel does not inherit conflicting colors from the inspected page.

## Run the example in Windows WSL

From a WSL shell in this repository:

```bash
npm install
npm run example
```

Vite prints a local URL such as `http://localhost:5173/`. Open that URL in your Windows browser. The example starts with the inspector closed; press `Ctrl+Shift+K` to open it.

## Features

- Stage/layer/node tree inspection
- Node detail panel
- Events panel aggregating stats for the past 5s
- On-canvas highlight overlay
- FPS tracking
- draw/batchDraw instrumentation
- Information on nodes in the stage
- warning signals for some likely performance issues
