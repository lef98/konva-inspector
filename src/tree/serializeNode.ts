import Konva from "konva";
import type { NodeSnapshot } from "../types";

export function serializeNode(node: Konva.Node): NodeSnapshot {
  const anyNode = node as any;

  const children =
    typeof anyNode.getChildren === "function"
      ? (anyNode.getChildren() as Konva.Node[]).map(serializeNode)
      : [];

  return {
    id: node.id() || `anon-${anyNode._id}`,
    konvaId: anyNode._id,
    type: node.getClassName(),
    name: node.name() || undefined,
    parentId: node.getParent()?.id() || undefined,
    children,
    attrs: { ...node.getAttrs() },
    meta: {
      visible: node.visible(),
      listening: node.listening(),
      opacity: node.opacity(),
      x: typeof anyNode.x === "function" ? anyNode.x() : undefined,
      y: typeof anyNode.y === "function" ? anyNode.y() : undefined,
      width: typeof anyNode.width === "function" ? anyNode.width() : undefined,
      height: typeof anyNode.height === "function" ? anyNode.height() : undefined,
      rotation: typeof anyNode.rotation === "function" ? anyNode.rotation() : undefined,
      scaleX: typeof anyNode.scaleX === "function" ? anyNode.scaleX() : undefined,
      scaleY: typeof anyNode.scaleY === "function" ? anyNode.scaleY() : undefined,
      cached: typeof anyNode.isCached === "function" ? anyNode.isCached() : false
    }
  };
}
