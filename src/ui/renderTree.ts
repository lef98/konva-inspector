import type { NodeSnapshot } from "../types";

export function renderTree(container: HTMLElement, tree: NodeSnapshot | null, store: any) {
  if (!tree) {
    container.innerHTML = `<div class="ki-empty">No stage data</div>`;
    return;
  }

  container.innerHTML = "";
  container.appendChild(renderNode(tree, store, 0));
}

function renderNode(node: NodeSnapshot, store: any, depth: number): HTMLElement {
  const wrapper = document.createElement("div");

  const row = document.createElement("div");
  row.className = "ki-tree-row";
  row.style.paddingLeft = `${depth * 12}px`;
  row.textContent = `${node.type}${node.id ? `#${node.id}` : ""}${node.name ? ` (${node.name})` : ""}`;

  row.onclick = () => {
    store.setSelectedNode(node);
  };

  wrapper.appendChild(row);

  for (const child of node.children) {
    wrapper.appendChild(renderNode(child, store, depth + 1));
  }

  return wrapper;
}
