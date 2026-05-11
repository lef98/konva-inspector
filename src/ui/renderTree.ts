import type { NodeSnapshot } from "../types";

export function renderTree(
  container: HTMLElement,
  tree: NodeSnapshot | null,
  selectedKonvaId: number | string | null,
  expandedNodeIds: Set<string>,
  store: any
) {
  if (!tree) {
    container.innerHTML = `<div class="ki-empty">No stage data</div>`;
    return;
  }

  container.innerHTML = "";
  container.appendChild(renderNode(tree, selectedKonvaId, expandedNodeIds, store, 0));
}

function renderNode(
  node: NodeSnapshot,
  selectedKonvaId: number | string | null,
  expandedNodeIds: Set<string>,
  store: any,
  depth: number
): HTMLElement {
  const wrapper = document.createElement("div");
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodeIds.has(String(node.konvaId));
  const row = document.createElement("div");
  row.className = "ki-tree-row";
  if (String(selectedKonvaId) === String(node.konvaId)) {
    row.classList.add("ki-tree-row--selected");
  }
  row.style.paddingLeft = `${depth * 12}px`;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "ki-tree-toggle";
  toggle.textContent = hasChildren ? (isExpanded ? "▾" : "▸") : "";
  toggle.disabled = !hasChildren;
  toggle.onclick = (event) => {
    event.stopPropagation();
    if (hasChildren) {
      store.toggleNodeExpanded(node.konvaId);
    }
  };

  const label = document.createElement("span");
  label.className = "ki-tree-label";
  label.textContent = `${node.type}${node.id ? `#${node.id}` : ""}${node.name ? ` (${node.name})` : ""}`;

  row.appendChild(toggle);
  row.appendChild(label);

  row.onclick = () => {
    store.selectNode(node.konvaId);
  };

  wrapper.appendChild(row);

  if (hasChildren && isExpanded) {
    for (const child of node.children) {
      wrapper.appendChild(renderNode(child, selectedKonvaId, expandedNodeIds, store, depth + 1));
    }
  }

  return wrapper;
}
