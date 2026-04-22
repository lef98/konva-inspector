import Konva from "konva";

const TRACKED_EVENTS = [
  "mousemove",
  "mousedown",
  "mouseup",
  "click",
  "dblclick",
  "dragstart",
  "dragmove",
  "dragend",
  "touchstart",
  "touchmove",
  "touchend",
  "wheel",
] as const;

export function createEventMonitor(stage: Konva.Stage, store: any) {
  const handlers: Array<{ event: string; fn: () => void }> = [];

  for (const event of TRACKED_EVENTS) {
    const fn = () => store.recordEvent(event);
    stage.on(event, fn);
    handlers.push({ event, fn });
  }

  return {
    destroy() {
      for (const { event, fn } of handlers) {
        stage.off(event, fn);
      }
    },
  };
}
