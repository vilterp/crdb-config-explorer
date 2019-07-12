import { NodePath, SchemaPath } from "./model";

// TODO: leaseholders pinned
export type Allocation = { type: "NoData" } | { type: "Data" };

export function allocate(
  nodePath: NodePath,
  schemaPath: SchemaPath
): Allocation {
  // TODO: actual logic
  return { type: "Data" };
}
