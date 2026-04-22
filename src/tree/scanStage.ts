import Konva from "konva";
import { serializeNode } from "./serializeNode";

export function scanStage(stage: Konva.Stage) {
  return serializeNode(stage);
}
