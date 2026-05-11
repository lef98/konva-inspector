import "./panel.css";
import { renderPanel } from "./renderPanel";

export function mountPanel(store: any, options: { dock: "left" | "right" | "bottom" }) {
  let root: HTMLDivElement | null = null;
  let unsubscribe: (() => void) | null = null;

  function ensureMounted() {
    if (root) return root;

    root = document.createElement("div");
    root.className = `konva-inspector konva-inspector--${options.dock}`;
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
