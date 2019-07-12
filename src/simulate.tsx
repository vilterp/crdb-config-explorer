import { NodePath, SchemaPath, ZoneConfig } from "./model";

// TODO: leaseholders pinned
export type Allocation = { type: "NoData" } | { type: "Data" };

export function allocate(
  nodePath: NodePath,
  schemaPath: SchemaPath
): Allocation {
  // TODO: actual logic
  const zoneConfig = getZoneConfig(schemaPath);
  if (zoneConfig === undefined) {
    return { type: "Data" };
  }
  if (zoneConfig.dataRegion === nodePath.regionName) {
    return { type: "Data" };
  } else {
    return { type: "NoData" };
  }
}

function getZoneConfig(schemaPath: SchemaPath): ZoneConfig | undefined {
  if (schemaPath.partition.zoneConfig) {
    return schemaPath.partition.zoneConfig;
  } else {
    return schemaPath.index.zoneConfig;
  }
}
