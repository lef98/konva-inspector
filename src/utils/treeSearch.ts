import type { NodeSnapshot } from "../types";

export function findSnapshotByKonvaId(
  node: NodeSnapshot,
  konvaId: number | string
): NodeSnapshot | null {
  if (String(node.konvaId) === String(konvaId)) return node;

  for (const child of node.children) {
    const result = findSnapshotByKonvaId(child, konvaId);
    if (result) return result;
  }

  return null;
}

export function findSnapshotPathByKonvaId(
  node: NodeSnapshot,
  konvaId: number | string
): NodeSnapshot[] | null {
  if (String(node.konvaId) === String(konvaId)) return [node];

  for (const child of node.children) {
    const result = findSnapshotPathByKonvaId(child, konvaId);
    if (result) return [node, ...result];
  }

  return null;
}
