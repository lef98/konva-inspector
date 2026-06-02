import "./panel.css";
import { renderPanel } from "./renderPanel";

type PanelOptions = {
  dock: "left" | "right" | "bottom";
  backgroundColor: string;
  textColor: string;
};

export function mountPanel(store: any, options: PanelOptions) {
  let root: HTMLDivElement | null = null;
  let unsubscribe: (() => void) | null = null;

  function ensureMounted() {
    if (root) return root;

    root = document.createElement("div");
    root.className = `konva-inspector konva-inspector--${options.dock}`;
    root.style.setProperty("--ki-background-color", options.backgroundColor);
    root.style.setProperty("--ki-text-color", options.textColor);
    document.body.appendChild(root);

    unsubscribe = store.subscribe(() => {
      if (root) {
        renderPanel(root, store);
      }
    });

    renderPanel(root, store);
    return root;
  }

  function unmount() {
    unsubscribe?.();
    unsubscribe = null;
    root?.remove();
    root = null;
  }

  return {
    show() {
      ensureMounted();
    },
    hide() {
      unmount();
    },
    destroy() {
      unmount();
    }
  };
}
