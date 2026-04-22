import "./panel.css";
import { renderPanel } from "./renderPanel";

export function mountPanel(store: any, options: { dock: "left" | "right" | "bottom" }) {
  const root = document.createElement("div");
  root.className = `konva-inspector konva-inspector--${options.dock}`;
  document.body.appendChild(root);

  const unsubscribe = store.subscribe(() => {
    renderPanel(root, store);
  });

  renderPanel(root, store);

  return {
    show() {
      root.style.display = "block";
    },
    hide() {
      root.style.display = "none";
    },
    destroy() {
      unsubscribe();
      root.remove();
    }
  };
}
